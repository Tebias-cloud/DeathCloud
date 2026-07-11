import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiMessageSquare, FiLogOut, FiX, FiCpu, FiChevronDown } from 'react-icons/fi';
import PropTypes from 'prop-types';
import { useGame } from '../../context/GameContext';

export default function Header({ user, onLogout, onToggleChat, credits, onLoginTrigger }) {
  const { gameInfo, switchGame, availableGames } = useGame();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showGameSelector, setShowGameSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === 'none' || imagePath === 'not-found') return imagePath;
    if (imagePath.startsWith('http')) return imagePath;
    const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/api$/, '');
    return `${base}${imagePath}`;
  };

  const getThemeColor = (themeData) => {
    let color = '0 210 255';
    if (!themeData) return `rgb(${color.replaceAll(' ', ',')})`;
    if (typeof themeData === 'object') {
       color = themeData['theme-neon'] || color;
    } else {
      try {
        const parsed = JSON.parse(themeData);
        color = parsed['theme-neon'] || themeData;
      } catch {
        color = themeData;
      }
    }
    
    if (color.startsWith('#')) return color;
    return `rgb(${color.replaceAll(' ', ',')})`;
  };

  // Interactive notifications state with lazy loading & persistence
  const [notifications, setNotifications] = useState([]);
  
  // Unread chat indicator
  const [hasUnreadChats, setHasUnreadChats] = useState(false);

  // Close game selector on outside click
  useEffect(() => {
    const handleOutsideClick = () => setShowGameSelector(false);
    if (showGameSelector) {
      globalThis.addEventListener('click', handleOutsideClick);
    }
    return () => globalThis.removeEventListener('click', handleOutsideClick);
  }, [showGameSelector]);

  // Close notifications on outside click
  useEffect(() => {
    const handleOutsideClick = () => setShowNotifications(false);
    if (showNotifications) {
      globalThis.addEventListener('click', handleOutsideClick);
    }
    return () => globalThis.removeEventListener('click', handleOutsideClick);
  }, [showNotifications]);

  // (Hook de Escape eliminado por obsolescencia)

  // Sync notifications with localStorage
  useEffect(() => {
    const key = `notifications_${user?.id || user?.username || 'guest'}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNotifications(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing user notifications", e);
      }
    } else {
      // Remove dummy default notifications
      const defaultNotifs = [];
      setNotifications(defaultNotifs);
      localStorage.setItem(key, JSON.stringify(defaultNotifs));
    }
  }, [user?.id, user?.username]);

  const saveNotifications = (newNotifications) => {
    setNotifications(newNotifications);
    const key = `notifications_${user?.id || user?.username || 'guest'}`;
    localStorage.setItem(key, JSON.stringify(newNotifications));
  };

  // Listen for new private messages from LiveChatPanel
  useEffect(() => {
    const handleNewPrivateMsg = () => {
      setHasUnreadChats(true);
    };
    
    globalThis.addEventListener('new_private_message', handleNewPrivateMsg);
    return () => globalThis.removeEventListener('new_private_message', handleNewPrivateMsg);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    const unread = notifications.filter(() => false); // Borra todas
    saveNotifications(unread);
  };

  const markAsRead = (id) => {
    const updated = notifications.filter(n => n.id !== id); // La elimina al leerla
    saveNotifications(updated);
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  };

  // Empty forum debates to search in the main search bar since we don't have an endpoint for it yet
  const forumPosts = [];

  // System navigation/settings matches
  const systemActions = [
    { title: "Perfil de Jugador", desc: "Configura tu biografía, cambia tu avatar y edita tu Riot ID.", type: "Navegación", url: "/perfil" },
    { title: "Cambiar Contraseña", desc: "Actualizar la clave de seguridad de tu cuenta de DeathCloud.", type: "Seguridad", url: "/perfil" },
    { title: "Ranking Global", desc: "Clasificación de los mejores jugadores de Death Cloud.", type: "Navegación", url: "/ranking" },
    { title: "Foro de Comunidad", desc: "Debates, guías de conexión y noticias oficiales del parche.", type: "Navegación", url: "/comunidad" },
    { title: "Centro de Soporte Técnico", desc: "Crear tickets de soporte para asistencia técnica.", type: "Navegación", url: "/soporte" },
  ];

  // Mock search results over game store items, news, leaderboard, forum posts and navigation actions
  const searchResults = searchQuery.trim() === '' ? [] : [
    ...(gameInfo.store || []).filter(item => 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(item => ({ ...item, type: 'Item de Tienda', url: '/tienda' })),

    ...(gameInfo.news || []).filter(n => 
      n.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(n => ({ ...n, type: 'Noticia', url: '/comunidad' })),

    ...(gameInfo.leaderboard || []).filter(player => 
      player.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(player => ({ ...player, title: `${player.name} (Rank #${player.rank})`, type: 'Clasificación', url: '/ranking' })),

    ...(forumPosts || []).filter(p => 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.desc?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.author?.toLowerCase().includes(searchQuery.toLowerCase())
    ),

    ...(systemActions || []).filter(act => 
      act.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      act.desc?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ];

  return (
    <>
      <header className="grid grid-cols-[1fr_auto_1fr] items-center w-full h-28 px-8 bg-theme-dark/80 backdrop-blur-md border-b border-theme-neon/30 sticky top-0 z-50 transition-colors duration-500">
      {/* Logo / Dropdown Selector */}
      <div className="relative min-w-0">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setShowGameSelector(!showGameSelector);
          }}
          className="flex items-center gap-3 group text-left focus:outline-none"
          title="Seleccionar juego de la red"
        >
          <div className="relative h-28 w-40 flex items-center justify-center p-2 transition-all duration-300 group-hover:brightness-110">
            {gameInfo.url_portada && gameInfo.url_portada !== 'none' ? (
              <img 
                src={getImageUrl(gameInfo.url_portada)} 
                alt={gameInfo.displayName} 
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_0_10px_var(--theme-neon-glow)]"
              />
            ) : (
                <img 
                  src="/assets/logo.png" 
                  alt="DeathCloud Games" 
                  className="max-h-full max-w-full object-contain"
                  style={gameInfo.theme ? { filter: `drop-shadow(0 0 4px ${getThemeColor(gameInfo.theme)})` } : {}}
                />
            )}
          </div>
          <div className="h-8 w-px bg-theme-neon/20" />
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black uppercase tracking-widest text-theme-neon font-display">
              {gameInfo.displayName}
            </span>
            <FiChevronDown size={13} className="text-theme-neon transition-transform duration-300 group-hover:translate-y-0.5 shrink-0" />
          </div>
        </button>

        {/* Dropdown Menu (Riot Games style) */}
        {showGameSelector && (
          <div className="absolute left-0 mt-3 w-64 glass-panel border border-theme-neon/30 bg-theme-dark/95 backdrop-blur-2xl rounded-2xl shadow-neon-strong p-2 z-50 flex flex-col gap-1 animate-fade-in">
            <div className="px-3 py-1.5 border-b border-white/5 mb-1">
              <span className="text-[9px] uppercase tracking-widest font-black text-theme-muted font-mono">SELECCIONAR VERSIÓN</span>
            </div>
            {availableGames.map(game => {
              const isActive = game.id === gameInfo.id;
              return (
                <button
                  key={game.id}
                  onClick={() => {
                    switchGame(game.id);
                    setShowGameSelector(false);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl text-left transition-all border ${
                    isActive 
                      ? 'bg-theme-neon/10 border-theme-neon/30 text-theme-neon' 
                      : 'bg-transparent border-transparent hover:bg-white/5'
                  }`}
                  style={isActive ? {} : { 
                    '--hover-border': game.theme || '#ffffff',
                    borderLeftColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive && game.theme) {
                      e.currentTarget.style.borderColor = game.theme;
                      e.currentTarget.style.color = game.theme;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.color = '';
                    }
                  }}
                >
                  <span className={`text-xs font-bold tracking-wide ${isActive ? '' : 'text-theme-text'}`} 
                        style={isActive ? {} : { color: 'inherit' }}>{game.displayName}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation — Placed in the center grid cell */}
      <nav className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center gap-x-8 w-max justify-self-center relative">
        {/* Left group */}
        <div className="flex items-center justify-end gap-8">
          {[{ name: 'Ranking', path: '/ranking' }, { name: 'Comunidad', path: '/comunidad' }].map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `relative px-2 py-6 font-display text-sm font-semibold transition-colors duration-300 ${
                  isActive ? 'text-theme-neon' : 'text-theme-text hover:text-theme-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.name}
                  {isActive && <div className="absolute bottom-0 left-0 w-full h-1 bg-theme-neon shadow-neon rounded-t-md" />}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Juego — dead center */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `relative px-3 py-6 font-display text-sm font-semibold transition-colors duration-300 ${
              isActive ? 'text-theme-neon' : 'text-theme-text hover:text-theme-muted'
            }`
          }
        >
          {({ isActive }) => (
            <>
              Juego
              {isActive && <div className="absolute bottom-0 left-0 w-full h-1 bg-theme-neon shadow-neon rounded-t-md" />}
            </>
          )}
        </NavLink>

        {/* Right group */}
        <div className="flex items-center justify-start gap-8">
          {[{ name: 'Tienda', path: '/tienda' }, { name: 'Soporte', path: '/soporte' }].map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `relative px-2 py-6 font-display text-sm font-semibold transition-colors duration-300 ${
                  isActive ? 'text-theme-neon' : 'text-theme-text hover:text-theme-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.name}
                  {isActive && <div className="absolute bottom-0 left-0 w-full h-1 bg-theme-neon shadow-neon rounded-t-md" />}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Toggler & User Area */}
      <div className="flex items-center gap-6 justify-end">
        
        {/* Admin Buttons */}
        {user?.rol === 'admin' && (
          <div className="flex gap-2 shrink-0">
            <Link
              to="/admin"
              className="hidden md:flex items-center justify-center border border-theme-neon/50 text-theme-neon hover:bg-theme-neon hover:text-theme-dark rounded-md px-3 py-1.5 text-xs font-bold transition-colors shadow-[0_0_5px_var(--theme-neon-glow)]"
            >
              PANEL ADMIN
            </Link>
          </div>
        )}

        {/* Credits Balance Widget */}
        {user && (
          <div className="hidden lg:flex items-center gap-2 border border-theme-neon/30 bg-theme-neon/5 pl-3 pr-1.5 py-1 rounded-lg shadow-neon-sm">
            <div className="flex items-center gap-1.5">
              <svg width="12" height="14" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse drop-shadow-[0_0_5px_#00d2ff]">
                <path d="M12 2L2 12l10 10 10-10L12 2z"/>
                <path d="M12 2v20"/>
                <path d="M2 12h20"/>
              </svg>
              <span className="text-xs font-black text-theme-neon font-mono leading-none">{credits === undefined ? '2,500' : credits.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Search Trigger */}
        <button 
          onClick={() => setShowSearch(true)}
          className="w-10 h-10 flex items-center justify-center text-theme-muted hover:text-theme-neon hover:bg-white/5 rounded-full transition-colors"
          title="Buscar en la red"
        >
          <FiSearch size={20} />
        </button>

        {/* Notifications Trigger */}
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowNotifications(!showNotifications);
            }}
            className="relative w-10 h-10 flex items-center justify-center text-theme-muted hover:text-theme-neon hover:bg-white/5 rounded-full transition-colors"
            title="Transmisiones de alerta"
          >
            <FiBell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-theme-neon text-theme-dark text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
 
           {/* Notifications Dropdown */}
           {showNotifications && (
             <div 
               onClick={(e) => e.stopPropagation()}
               aria-hidden="true"
               className="absolute right-0 mt-3 w-80 glass-panel border border-theme-neon/30 bg-theme-dark/95 backdrop-blur-2xl rounded-2xl shadow-neon-strong p-4 z-50 flex flex-col gap-3"
             >
               <div className="flex justify-between items-center pb-2 border-b border-theme-neon/20">
                 <span className="font-display font-bold text-xs uppercase tracking-widest text-white">Transmisiones</span>
                 {unreadCount > 0 && (
                   <button 
                     onClick={markAllAsRead} 
                     className="text-[10px] text-theme-neon hover:underline font-bold"
                   >
                     Marcar leídas
                   </button>
                 )}
               </div>
               <div className="flex flex-col gap-2 max-h-60 overflow-y-auto scrollbar-thin pr-1">
                 {notifications.length === 0 ? (
                   <div className="text-center py-6 text-xs text-theme-muted italic">
                     Sin transmisiones activas
                   </div>
                 ) : (
                    notifications.map(n => (
                      <button 
                        key={n.id} 
                        onClick={() => markAsRead(n.id)}
                        type="button"
                        className={`p-2.5 rounded-lg border text-xs transition-all relative group cursor-pointer text-left ${
                          n.unread 
                            ? 'bg-theme-neon/10 border-theme-neon/20 text-white' 
                            : 'bg-black/30 border-white/5 text-theme-muted hover:bg-black/50'
                        }`}
                      >
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           deleteNotification(n.id);
                         }}
                         className="absolute top-1.5 right-1.5 text-theme-muted hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <FiX size={10} />
                       </button>
                       <div className="pr-4 leading-relaxed">{n.text}</div>
                       <span className="text-[9px] text-theme-muted/65 font-mono block mt-1">{n.date}</span>
                     </button>
                   ))
                 )}
               </div>
             </div>
           )}
         </div>
 
         {/* Chat Trigger */}
         <button 
           onClick={() => {
             setHasUnreadChats(false);
             onToggleChat();
           }}
           className="relative w-10 h-10 flex items-center justify-center text-theme-muted hover:text-theme-neon hover:bg-white/5 rounded-full transition-colors"
           title="Chat global y amigos"
         >
           <FiMessageSquare size={20} />
           {hasUnreadChats && (
             <span className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-red-500 border-2 border-theme-dark animate-pulse"></span>
           )}
         </button>
 
        {user ? (
          <>
            <div className="h-8 w-[1px] bg-theme-neon/20 mx-2"></div>
            
            <Link to="/perfil" className="flex items-center gap-3 group relative">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent group-hover:border-theme-neon transition-colors bg-theme-panel">
                  {user?.avatar_url && user.avatar_url !== 'none' ? (
                    <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-theme-neon font-bold">
                      {(user?.nickname || user?.username || 'In').substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-theme-success border-2 border-theme-dark transition-colors duration-500"></span>
              </div>
              <div className="hidden lg:flex items-center gap-2">
                <span className="font-bold text-sm text-theme-text group-hover:text-theme-neon transition-colors">{user?.nickname || user?.username || 'Invitado'}</span>
              </div>
            </Link>
              
            {/* Logout Button */}
            <button 
              onClick={onLogout}
              className="w-10 h-10 flex items-center justify-center text-theme-muted hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
              title="Cerrar Sesión"
            >
              <FiLogOut size={18} />
            </button>
          </>
        ) : (
          <button
            onClick={onLoginTrigger}
            className="neon-button border border-theme-neon/40 rounded-xl px-5 py-2.5 bg-theme-neon/15 text-theme-neon hover:bg-theme-neon hover:text-theme-dark text-xs font-black tracking-wider transition-all shadow-neon-sm"
          >
            INICIAR SESIÓN
          </button>
        )}
       </div>
      </header>

      {/* Global Search Modal Overlay */}
       {showSearch && (
         <div 
           onClick={() => {
             setShowSearch(false);
             setSearchQuery('');
           }}
           aria-hidden="true"
           className="fixed inset-0 z-[100] bg-theme-dark/90 backdrop-blur-md flex items-start justify-center pt-24 px-4 animate-fade-in cursor-pointer"
         >
           <div 
             onClick={(e) => e.stopPropagation()}
             aria-hidden="true"
             className="w-full max-w-2xl glass-panel border border-theme-neon/40 shadow-neon-strong p-6 rounded-2xl relative cursor-default"
           >
             <button 
               onClick={() => {
                 setShowSearch(false);
                 setSearchQuery('');
               }}
               className="absolute top-4 right-4 text-theme-muted hover:text-white transition-colors"
             >
               <FiX size={24} />
             </button>
             <h3 className="font-display font-bold text-xl text-white tracking-widest uppercase mb-4 flex items-center gap-2">
               <FiCpu className="text-theme-neon" /> BÚSQUEDA DE RED DEATHCLOUD
             </h3>
             
             <div className="relative">
               <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-neon" size={18} />
               <input 
                 type="text"
                 autoFocus
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && searchResults.length > 0) {
                     const firstResult = searchResults[0];
                     setShowSearch(false);
                     setSearchQuery('');
                     if (firstResult.action) {
                       firstResult.action();
                     } else if (firstResult.url) {
                       navigate(firstResult.url);
                     }
                   }
                 }}
                 placeholder="Escribe para buscar (ej. Tiburón, Evento, Shadow, foro, e-points)..."
                 className="w-full bg-black/60 border border-theme-neon/40 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-theme-neon focus:shadow-neon transition-all"
               />
             </div>
 
             <div className="mt-6 max-h-80 overflow-y-auto scrollbar-thin flex flex-col gap-2">
               {(() => {
                 if (searchQuery.trim() === '') {
                   return (
                     <div className="text-center py-8 text-xs text-theme-muted italic">
                       Ingresa palabras clave para escanear la base de datos local
                     </div>
                   );
                 }
                 if (searchResults.length === 0) {
                   return (
                     <div className="text-center py-8 text-xs text-red-400 italic">
                       No se encontraron coincidencias en la red.
                     </div>
                   );
                 }
                 return searchResults.map((result, idx) => {
                   const content = (
                     <div className="flex flex-col">
                       <span className="font-bold text-white group-hover:text-theme-neon transition-colors">{result.title}</span>
                       <span className="text-[10px] text-theme-muted mt-1">{result.desc || result.description || 'Consulta de datos en tabla'}</span>
                     </div>
                   );
                   const badge = (
                     <span className="text-[10px] uppercase font-bold px-2 py-0.5 border border-theme-neon/20 rounded bg-theme-neon/5 text-theme-neon font-mono">
                       {result.type}
                     </span>
                   );
                   const itemClass = "p-3 rounded-lg border border-white/5 bg-black/35 hover:border-theme-neon/40 hover:bg-theme-neon/5 transition-all flex items-center justify-between group text-left w-full";

                   if (result.action) {
                     return (
                       <button
                        key={result.id || result.title || idx}
                         onClick={() => {
                           setShowSearch(false);
                           setSearchQuery('');
                           result.action();
                         }}
                         type="button"
                         className={itemClass}
                       >
                         {content}
                         {badge}
                       </button>
                     );
                   }

                   return (
                     <Link 
                       key={result.id || result.title || idx}
                       to={result.url}
                       onClick={() => {
                         setShowSearch(false);
                         setSearchQuery('');
                       }}
                       className={itemClass}
                     >
                       {content}
                       {badge}
                     </Link>
                   );
                 });
               })()}
             </div>
          </div>
        </div>
      )}
     </>
  );
}

Header.propTypes = {
  onToggleChat: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    username: PropTypes.string,
    nickname: PropTypes.string,
    rol: PropTypes.string,
    avatar_url: PropTypes.string
  }),
  onLogout: PropTypes.func.isRequired,
  credits: PropTypes.number,
  onLoginTrigger: PropTypes.func.isRequired
};
