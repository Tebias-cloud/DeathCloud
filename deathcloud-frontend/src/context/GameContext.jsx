/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

// Helper to convert #HEX to "R G B"
const hexToRgbStr = (hex) => {
  let h = hex.replaceAll('#', '');
  if (h.length === 3) h = h.split('').map(c => c+c).join('');
  const r = parseInt(h.substring(0,2), 16) || 0;
  const g = parseInt(h.substring(2,4), 16) || 0;
  const b = parseInt(h.substring(4,6), 16) || 0;
  return `${r} ${g} ${b}`;
};

const applyThemeToDOM = (activeGame) => {
  const root = document.documentElement;
  let color = '0 210 255'; // Default Cyan in RGB

  const defaultTheme = {
    'theme-dark': '15 23 42',
    'theme-text': '248 250 252',
    'theme-muted': '148 163 184',
    'theme-panel': 'rgba(15, 23, 42, 0.65)',
    'theme-success': '34 197 94',
    'theme-gradient-start': '30 41 59'
  };
  
  Object.entries(defaultTheme).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });

  let themeObj = {};
  let extracted = '0 210 255';
  if (typeof activeGame.theme === 'string') {
    extracted = activeGame.theme;
    try { 
      themeObj = JSON.parse(activeGame.theme); 
      if (themeObj['theme-neon']) extracted = themeObj['theme-neon'];
    } catch { /* not json */ }
  } else if (activeGame.theme && typeof activeGame.theme === 'object') {
    themeObj = activeGame.theme;
    if (themeObj['theme-neon']) extracted = themeObj['theme-neon'];
  }

  color = extracted.startsWith('#') ? hexToRgbStr(extracted) : extracted;
  
  if (color.startsWith('#')) color = hexToRgbStr(color);
  if (color.includes(',')) color = color.replaceAll(',', ' ').replaceAll(/[^\d\s]/g, '').trim(); 

  const rgbVals = color.split(' ').map(Number);
  const r = rgbVals[0] || 0;
  const g = rgbVals[1] || 0;
  const b = rgbVals[2] || 0;

  Object.entries(themeObj).forEach(([key, value]) => {
    if (key !== 'theme-neon') root.style.setProperty(`--${key}`, value);
  });

  if (!themeObj['theme-dark']) {
    root.style.setProperty('--theme-dark', `${Math.max(4, Math.floor(r * 0.08))} ${Math.max(8, Math.floor(g * 0.1))} ${Math.max(12, Math.floor(b * 0.12))}`);
  }
  if (!themeObj['theme-gradient-start']) {
    root.style.setProperty('--theme-gradient-start', `${Math.max(10, Math.floor(r * 0.15))} ${Math.max(20, Math.floor(g * 0.18))} ${Math.max(25, Math.floor(b * 0.2))}`);
  }
  if (!themeObj['theme-panel']) {
    root.style.setProperty('--theme-panel', `rgba(${Math.max(10, Math.floor(r * 0.1))}, ${Math.max(15, Math.floor(g * 0.12))}, ${Math.max(20, Math.floor(b * 0.15))}, 0.65)`);
  }

  root.style.setProperty('--theme-neon', color);
  root.style.setProperty('--theme-neon-glow', `rgba(${color.replaceAll(' ', ',')}, 0.5)`);
};

export const GameProvider = ({ children }) => {
  const [games, setGames] = useState([]);
  const [activeGameId, setActiveGameId] = useState(localStorage.getItem('deathcloud_active_game') || null);
  const [loading, setLoading] = useState(true);

  const fetchCatalog = async () => {
    try {
      const getApiUrl = () => {
        const base = import.meta.env.VITE_API_URL || '/api';
        return `${base}/catalog/games`;
      };

      const res = await fetch(getApiUrl());
      const data = await res.json();
      if (data.success && data.games.length > 0) {
        setGames(data.games);
        if (!activeGameId || !data.games.some(g => g.id === activeGameId)) {
          setActiveGameId(data.games[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching dynamic catalog:', err);
      // Fallback local if server is offline (for devs)
      // Actually, since we're strictly DB-driven now, we just set empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeGame = games.find(g => g.id === activeGameId) || games[0];


  useEffect(() => {
    if (activeGame) {
      applyThemeToDOM(activeGame);
      localStorage.setItem('deathcloud_active_game', activeGame.id);
    }
  }, [activeGame]);

  const switchGame = (gameId) => {
    setActiveGameId(gameId);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const contextValue = React.useMemo(() => ({ gameInfo: activeGame, switchGame, availableGames: games, refreshCatalog: fetchCatalog }), [activeGame, games]);

  // Provide a loading state overlay if catalog isn't loaded yet
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-theme-dark text-theme-neon text-xl font-bold">Iniciando Enlace con el Catálogo...</div>;
  }

  // If DB is totally empty and server returned no games
  if (games.length === 0) {
    return <div className="flex items-center justify-center min-h-screen bg-theme-dark text-red-500 text-xl font-bold">Error: Catálogo no disponible o Base de Datos vacía.</div>;
  }

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

GameProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
