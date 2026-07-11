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
      console.warn('Error fetching dynamic catalog, loading showcase mock data:', err);
      // Fallback local mock data for exhibition/portfolio
      const mockGames = [
        {
          id: 'deathcloud-runner',
          title: 'DeathCloud Runner',
          displayName: 'DeathCloud Runner',
          tagline: 'ESQUIVA LA LLUVIA ÁCIDA Y SOBREVIVE',
          description: 'Esquiva la lluvia ácida y sobrevive en este frenético runner post-apocalíptico de plataformas.',
          genre: 'Arcade / Platformer',
          status: 'active',
          color: '0 210 255',
          banner_image: 'assets/hero_bg.png',
          created_at: new Date().toISOString(),
          leaderboard: [
            { name: 'CyberGamer', score: '24,500', rank: 1 },
            { name: 'ToxicSurvivor', score: '19,800', rank: 2 },
            { name: 'LuffyCoder', score: '15,200', rank: 3 },
            { name: 'AcidDodger', score: '11,000', rank: 4 }
          ],
          store: [
            { id: 'skin-neon', title: 'Skin de Neón', category: 'aspectos', price: 150, image: 'assets/retro_skin.png', desc: 'Una skin brillante para destacar en la nube tóxica.' },
            { id: 'axe-premium', title: 'Hacha Premium', category: 'aspectos', price: 300, image: 'assets/premium_axe.png', desc: 'Hacha pesada con filo de plasma de alta frecuencia.' },
            { id: 'skin-toxic', title: 'Traje Tóxico', category: 'aspectos', price: 200, image: 'assets/toxic_skin.png', desc: 'Traje de contención biológica modificado para resistir lluvia ácida.' }
          ],
          news: [
            { id: 'news-1', title: '¡Nueva Actualización 2.2 ya disponible!', desc: 'Se han optimizado los saltos y corregido físicas de lluvia.', date: 'Hoy', image: 'assets/logo.png', likes: 120, rating: 4.8 },
            { id: 'news-2', title: 'Torneo del Sector 7 el próximo Sábado', desc: 'Inscríbete y compite por una skin legendaria exclusiva.', date: 'Ayer', image: 'assets/hero_bg.png', likes: 85, rating: 4.5 }
          ]
        },
        {
          id: 'deathcloud-toxic-skies',
          title: 'Toxic Skies',
          displayName: 'Toxic Skies',
          tagline: 'PILOTA ENTRE EL GAS Y DESTRUYE A LA CORPORACIÓN',
          description: 'Pilota tu nave esquivando nubes de gas mortífero y destruye las defensas de la corporación corrupta.',
          genre: 'Shoot \'em Up',
          status: 'active',
          color: '121 40 202',
          banner_image: 'assets/mech_shark.png',
          created_at: new Date().toISOString(),
          leaderboard: [
            { name: 'AcePilot', score: '98,000', rank: 1 },
            { name: 'SkyDestroyer', score: '84,500', rank: 2 },
            { name: 'StarFighter', score: '72,100', rank: 3 }
          ],
          store: [
            { id: 'ship-shield', title: 'Escudo Reforzado', category: 'aspectos', price: 250, image: 'assets/mech_shark.png', desc: 'Escudo energético de plasma para aguantar más disparos.' }
          ],
          news: [
            { id: 'news-3', title: '¡Nuevos jefes añadidos al final del nivel!', desc: 'Prepárate para combatir contra la nave nodriza de la corporación.', date: 'Hace 2 días', image: 'assets/mech_shark.png', likes: 140, rating: 4.9 }
          ]
        },
        {
          id: 'deathcloud-2d-shooter',
          title: '2D Shooter',
          displayName: '2D Shooter',
          tagline: 'SOBREVIVE A OLEADAS DE ROBOTS MUTANTES',
          description: 'Sobrevive a oleadas de robots mutantes en este intenso shooter táctico en dos dimensiones.',
          genre: 'Action / Shooter',
          status: 'active',
          color: '255 0 128',
          banner_image: 'assets/premium_axe.png',
          created_at: new Date().toISOString(),
          leaderboard: [
            { name: 'RoboKiller', score: '5,600', rank: 1 },
            { name: 'MutantHunter', score: '4,800', rank: 2 }
          ],
          store: [
            { id: 'ammo-extended', title: 'Cargador Ampliado', category: 'aspectos', price: 100, image: 'assets/premium_axe.png', desc: 'Aumenta un 50% la capacidad de tu miunición básica.' }
          ],
          news: [
            { id: 'news-4', title: 'Ajuste de equilibrio de armas', desc: 'Se incrementó el daño del rifle táctico y se redujo el tiempo de recarga.', date: 'Hace 3 días', image: 'assets/logo.png', likes: 62, rating: 4.2 }
          ]
        }
      ];
      setGames(mockGames);
      if (!activeGameId || !mockGames.some(g => g.id === activeGameId)) {
        setActiveGameId(mockGames[0].id);
      }
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
