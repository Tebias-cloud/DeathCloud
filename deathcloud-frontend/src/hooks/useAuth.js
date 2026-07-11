import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const getApiUrl = (path) => {
  const base = import.meta.env.VITE_API_URL || '/api';
  return `${base}${path}`;
};

export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('username');
    const savedNickname = localStorage.getItem('nickname') || savedUser;
    const token = localStorage.getItem('jwt_token');
    const role = localStorage.getItem('role') || 'user';
    const userId = localStorage.getItem('userId');
    const avatar_url = localStorage.getItem('avatar_url') || 'none';
    
    if (savedUser && token) {
      return { 
        id: userId ? Number.parseInt(userId, 10) : null, 
        username: savedUser, 
        nickname: savedNickname, 
        token, 
        rol: role, 
        avatar_url 
      };
    }
    return null;
  });

  // Setup global 401 fetch interceptor
  useEffect(() => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        // Only trigger logout if it's an API call
        const url = args[0] instanceof Request ? args[0].url : args[0];
        if (url.includes('/api/')) {
          globalThis.dispatchEvent(new Event('auth_unauthorized'));
        }
      }
      return response;
    };
    return () => {
      globalThis.fetch = originalFetch;
    };
  }, []);

  const handleLoginSuccess = useCallback((userData) => {
    localStorage.setItem('jwt_token', userData.token);
    localStorage.setItem('username', userData.username);
    localStorage.setItem('nickname', userData.nickname || userData.username);
    localStorage.setItem('role', userData.rol || 'user');
    if (userData.id) localStorage.setItem('userId', userData.id.toString());
    if (userData.avatar_url) localStorage.setItem('avatar_url', userData.avatar_url);
    setUser(userData);
  }, []);

  const updateUserSession = useCallback((updatedFields) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };
      if (updatedFields.username) localStorage.setItem('username', updatedFields.username);
      if (updatedFields.nickname) localStorage.setItem('nickname', updatedFields.nickname);
      if (updatedFields.avatar_url) localStorage.setItem('avatar_url', updatedFields.avatar_url);
      return updated;
    });
  }, []);

  const handleLogout = useCallback(async () => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        await fetch(getApiUrl('/logout'), {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Logout sync error:', err);
      }
    }
    
    localStorage.removeItem('username');
    localStorage.removeItem('nickname');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('avatar_url');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const onUnauthorized = () => {
      alert("Tu sesión ha caducado o ha sido revocada desde otro dispositivo.");
      handleLogout();
    };
    globalThis.addEventListener('auth_unauthorized', onUnauthorized);
    return () => globalThis.removeEventListener('auth_unauthorized', onUnauthorized);
  }, [handleLogout]);

  return {
    user,
    handleLoginSuccess,
    updateUserSession,
    handleLogout
  };
};
