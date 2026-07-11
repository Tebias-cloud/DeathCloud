import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './views/Dashboard';
import Login from './Login';
import AdminDashboard from './views/AdminDashboard';
import AnalyticsDashboard from './views/AnalyticsDashboard';
import Profile from './views/Profile';
import SupportTickets from './views/SupportTickets';
import Ranking from './views/Ranking';
import Comunidad from './views/Comunidad';
import Tienda from './views/Tienda';
import { useGame } from './context/GameContext';
import { useAuth } from './hooks/useAuth';
import { useInventory } from './hooks/useInventory';

// Wrapper so useNavigate works inside Router
function AppInner() {
  const { gameInfo } = useGame();
  const navigate = useNavigate();
  
  const { 
    user, 
    loading, 
    handleLoginSuccess, 
    updateUserSession, 
    handleLogout 
  } = useAuth();

  const { 
    credits, 
    purchasedSkins, 
    buySkin 
  } = useInventory(user, gameInfo?.id);

  // Single login trigger — always navigate to /login
  const goToLogin = () => navigate('/login');

  if (loading) return null;

  return (
    <Routes>
      {/* Login — standalone, no hub/header */}
      <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />

      {/* All other routes — inside MainLayout (hub) */}
      <Route path="/*" element={
        <MainLayout
          user={user}
          onLogout={handleLogout}
          credits={credits}
          onLoginTrigger={goToLogin}
        >
          <Routes>
            <Route path="/" element={<Dashboard user={user} credits={credits} purchasedSkins={purchasedSkins} buySkin={buySkin} onLoginTrigger={goToLogin} />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/comunidad" element={<Comunidad user={user} onLoginTrigger={goToLogin} />} />
            <Route path="/tienda" element={<Tienda user={user} credits={credits} purchasedSkins={purchasedSkins} buySkin={buySkin} onLoginTrigger={goToLogin} />} />
            <Route
              path="/admin"
              element={
                user?.rol === 'admin' ? (
                  <AdminDashboard user={user} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/admin/analytics"
              element={
                user?.rol === 'admin' ? (
                  <AnalyticsDashboard />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route path="/perfil" element={<Profile user={user} updateUserSession={updateUserSession} purchasedSkins={purchasedSkins} onLoginTrigger={goToLogin} onLogout={handleLogout} />} />
            <Route path="/soporte" element={<SupportTickets user={user} onLoginTrigger={goToLogin} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </MainLayout>
      } />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}

export default App;

