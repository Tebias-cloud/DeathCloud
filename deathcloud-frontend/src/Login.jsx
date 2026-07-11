import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FiUser, FiMail, FiLock, FiChevronRight } from 'react-icons/fi';
import { authService } from './services/authService';

const Login = ({ onLoginSuccess, isModal = false }) => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let result;
      if (isRegister) {
        result = await authService.register(username, email, password);
      } else {
        result = await authService.login(email, password);
      }

      if (!result.success) {
        throw new Error(result.error);
      }

      if (isRegister) {
        // Después de registro, cambiar a login o loguear directamente
        setIsRegister(false);
        setError('Registro exitoso. ¡Ahora puedes iniciar sesión!');
      } else {
        // Login exitoso - limpiar sesión anterior y guardar nueva
        localStorage.removeItem('username');
        localStorage.removeItem('nickname');
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        
        localStorage.setItem('jwt_token', result.token);
        localStorage.setItem('username', result.user.username);
        localStorage.setItem('nickname', result.user.nickname);
        localStorage.setItem('role', result.user.role);
        localStorage.setItem('userId', result.user.id);
        
        onLoginSuccess({ 
          id: result.user.id,
          username: result.user.username, 
          nickname: result.user.nickname, 
          token: result.token, 
          rol: result.user.role 
        });
        
        if (!isModal) navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isModal ? "w-full flex items-center justify-center bg-transparent relative font-sans" : "min-h-screen w-full flex items-center justify-center bg-[#09090b] relative overflow-hidden font-sans"}>
      {/* Background Decor */}
      {!isModal && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-theme-neon/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-theme-neon/5 blur-[120px] rounded-full"></div>
        </>
      )}

      <div className={isModal ? "relative z-10 w-full p-2" : "relative z-10 w-full max-w-md p-8"}>
        {!isModal && (
          <div className="text-center mb-8">
            <h1 className="font-display font-black text-5xl tracking-tighter text-white mb-2" style={{ textShadow: '0 0 20px var(--theme-neon-glow)' }}>
              DEATHCLOUD
            </h1>
            <p className="text-theme-neon text-xs tracking-[0.4em] uppercase font-bold opacity-80">
              {isRegister ? 'Registro de Jugador' : 'Acceso a la Red'}
            </p>
          </div>
        )}

        <div className="glass-panel p-6 md:p-8 border border-white/5 bg-white/[0.02] backdrop-blur-2xl rounded-2xl shadow-2xl">
          {error && (
            <div className={`p-3 rounded-lg mb-6 text-xs font-bold ${error.includes('exitoso') ? 'bg-theme-success/20 text-theme-success' : 'bg-red-500/20 text-red-400'} border border-current/20`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {isRegister && (
              <div className="flex flex-col gap-2">
                <label htmlFor="login-username" className="text-[10px] uppercase tracking-widest font-bold text-theme-muted ml-1">Nombre de Usuario</label>
                <div className="relative group">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted group-focus-within:text-theme-neon transition-colors" />
                  <input 
                    id="login-username"
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-theme-neon/50 focus:bg-black/60 transition-all text-sm"
                    placeholder="ShadowFang"
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="login-email" className="text-[10px] uppercase tracking-widest font-bold text-theme-muted ml-1">Correo Electrónico</label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted group-focus-within:text-theme-neon transition-colors" />
                <input 
                  id="login-email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-theme-neon/50 focus:bg-black/60 transition-all text-sm"
                  placeholder="jugador@deathcloud.com"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="login-password" className="text-[10px] uppercase tracking-widest font-bold text-theme-muted ml-1">Contraseña</label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted group-focus-within:text-theme-neon transition-colors" />
                <input 
                  id="login-password"
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-theme-neon/50 focus:bg-black/60 transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="mt-4 bg-theme-neon hover:bg-[#00d2ff] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 group transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? 'Procesando...' : null}
              {!loading && isRegister ? 'Crear Cuenta' : null}
              {!loading && !isRegister ? 'Sincronizar' : null}
              {!loading && <FiChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="text-theme-muted hover:text-theme-neon text-xs font-semibold transition-colors"
            >
              {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
            </button>
          </div>
        </div>

        <div className="mt-12 flex justify-center gap-8 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
           {/* Decorative partner logos or branding icons can go here */}
        </div>
      </div>
    </div>
  );
};

Login.propTypes = {
  onLoginSuccess: PropTypes.func.isRequired,
  isModal: PropTypes.bool
};

export default Login;
