import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiList, FiLock, FiCalendar, FiX } from 'react-icons/fi';
import PurchaseModal from '../components/store/PurchaseModal';
import { useGame } from '../context/GameContext';
import { communityService } from '../services/communityService';

export default function Dashboard({ user, credits, purchasedSkins, buySkin, onLoginTrigger }) {
  const { gameInfo } = useGame();
  
  // Download Simulation states
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // News Interactions State
  const [activeNewsId, setActiveNewsId] = useState(null); 
  const [comentarios, setComentarios] = useState({});     
  const [nuevoComentario, setNuevoComentario] = useState("");

  // Shop Confirmation modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);

  // Download Simulation states
  const handleDownloadComplete = (interval) => {
    clearInterval(interval);
    setTimeout(() => {
      setDownloading(false);
      const link = document.createElement('a');
      link.href = '/launcher_mock.txt';
      link.setAttribute('download', 'launcher_mock.txt');
      document.body.appendChild(link);
      link.click();
      link.remove();
    }, 600);
    return 100;
  };

  // News Modal State
  const [selectedNews, setSelectedNews] = useState(null);

  const handleDownloadLauncher = () => {
    if (downloading) return;
    setDownloading(true);
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) return handleDownloadComplete(interval);
        return prev + 10;
      });
    }, 150);
  };

  const [isProcessing, setIsProcessing] = useState(false);

  // Buy Item Action
  const handlePurchase = async () => {
    if (!selectedItem || isProcessing) return;
    setPurchaseError(null);
    setIsProcessing(true);

    const currentCredits = credits === undefined ? 0 : credits;
    if (currentCredits < selectedItem.price) {
      setPurchaseError(`E-Points insuficientes. Se requieren ${selectedItem.price} EP.`);
      setIsProcessing(false);
      return;
    }

    if (buySkin) {
      const result = await buySkin(gameInfo.id, selectedItem.id, selectedItem.price);
      if (result.success) {
        setPurchaseSuccess(true);
      } else {
        setPurchaseError(result.message || 'Error al procesar la compra.');
      }
    } else {
      setPurchaseSuccess(true);
    }
    setIsProcessing(false);
  };

  // =========================================================================

  // =========================================================================
  const getApiUrlLocal = (path) => {
    const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/api$/, '');
    return `${base}${path}`;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === 'none' || imagePath === 'not-found') return imagePath;
    if (imagePath.startsWith('http')) return imagePath;
    const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/api$/, '');
    return `${base}${imagePath}`;
  };

  const handleReaccion = async (newsId, tipo) => {
    if (!user) return onLoginTrigger ? onLoginTrigger() : alert("Debes iniciar sesión");
    try {
      await fetch(getApiUrlLocal(`/api/game/news/${newsId}/react`), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ usuario_id: user.id, tipo })
      });
      const result = await communityService.getNewsByGame(gameInfo.id);
      if (result.success && result.data) setNews(result.data.slice(0, 3));
    } catch (err) { console.error(err); }
  };

  const handleValoracion = async (newsId, estrellas) => {
    if (!user) return onLoginTrigger ? onLoginTrigger() : alert("Debes iniciar sesión");
    try {
      await fetch(getApiUrlLocal(`/api/game/news/${newsId}/rate`), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ usuario_id: user.id, estrellas })
      });
      const result = await communityService.getNewsByGame(gameInfo.id);
      if (result.success && result.data) setNews(result.data.slice(0, 3));
    } catch (err) { console.error(err); }
  };

  const handleEnviarComentario = async (newsId) => {
    if (!user) return onLoginTrigger ? onLoginTrigger() : alert("Debes iniciar sesión");
    if (!nuevoComentario.trim()) return;

    try {
      const res = await fetch(getApiUrlLocal(`/api/game/news/${newsId}/comments`), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          usuario_id: user.id,
          nombre_usuario: user.name || "Usuario",
          comentario: nuevoComentario
        })
      });
      const data = await res.json();
      if (data.success) {
        setComentarios(prev => ({
          ...prev,
          [newsId]: [...(prev[newsId] || []), data.data]
        }));
        setNuevoComentario("");
      }
    } catch (err) { console.error(err); }
  };

  const fetchNewsComments = async (newsId) => {
    try {
      const res = await fetch(getApiUrlLocal(`/api/game/news/${newsId}/comments`));
      const data = await res.json();
      if (data.success) {
        setComentarios(prev => ({ ...prev, [newsId]: data.data }));
      }
    } catch (err) { console.error(err); }
  };

  const toggleNews = (newsId) => {
    if (activeNewsId === newsId) {
      setActiveNewsId(null);
    } else {
      setActiveNewsId(newsId);
      if (!comentarios[newsId]) {
        fetchNewsComments(newsId);
      }
    }
  };

  const [leaderboard, setLeaderboard] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(getApiUrlLocal(`/api/game/${gameInfo.id}/leaderboard`));
        const data = await res.json();
        if (data.success && data.leaderboard && data.leaderboard.length > 0) {
          setLeaderboard(data.leaderboard.slice(0, 5));
        } else {
          setLeaderboard(gameInfo.leaderboard || []);
        }
      } catch (err) {
        console.error("Error fetching dashboard leaderboard:", err);
        setLeaderboard(gameInfo.leaderboard || []);
      }
    };

    const fetchNews = async () => {
      const result = await communityService.getNewsByGame(gameInfo.id);
      if (result.success && result.data) {
        setNews(result.data.slice(0, 3));
      } else {
        setNews([]);
      }
    };

    fetchLeaderboard();
    fetchNews();
  }, [gameInfo.id, gameInfo.leaderboard]);

  return (
    <div className="flex-1 flex flex-col pb-8 pt-4 lg:pt-16 fade-in transition-all duration-500">
      
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center mb-16 min-h-[350px] relative z-10 transition-all duration-500">
        <h1 className="font-display font-black text-[3.8rem] md:text-[6.5rem] leading-none text-white tracking-wider uppercase flex flex-col items-center" style={{ textShadow: '0 0 20px var(--theme-neon-glow)' }}>
          <span>DEATH CLOUD</span>
          <span className="text-theme-neon text-[2.2rem] md:text-[4.2rem] tracking-[0.3em] font-medium mt-3" style={{ textShadow: '0 0 10px var(--theme-neon-glow)' }}>
            {gameInfo.displayName.toUpperCase().replace('DEATHCLOUD', '').trim() || gameInfo.displayName.toUpperCase()}
          </span>
        </h1>
        <p className="text-theme-muted uppercase tracking-[0.4em] font-bold text-[10px] md:text-xs mb-12 mt-6">
          {gameInfo.tagline}
        </p>
        
        <button 
          onClick={handleDownloadLauncher}
          className="neon-button border border-theme-neon/50 rounded-sm px-10 py-3 flex items-center gap-10 bg-theme-dark/40 backdrop-blur-sm group relative overflow-hidden"
        >
          {downloading ? (
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-theme-neon border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xl md:text-2xl font-bold tracking-widest font-mono text-theme-neon">DESCARGANDO {downloadProgress}%</span>
            </div>
          ) : (
            <>
              <FiChevronLeft className="text-theme-neon group-hover:text-white transition-colors" />
              <span className="text-xl md:text-2xl font-bold tracking-widest">JUGAR AHORA</span>
              <FiChevronRight className="text-theme-neon group-hover:text-white transition-colors" />
            </>
          )}
        </button>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 w-full max-w-6xl mx-auto">
        
        {/* Leaderboard Widget */}
        <div className="glass-panel flex flex-col p-5 hover:border-theme-neon/40 transition-colors duration-500">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-theme-neon/20 transition-colors">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white">
              <FiList className="text-theme-neon" /> Clasificación
            </h3>
            <div className="flex items-center gap-3">

              <Link to="/ranking" className="text-xs text-theme-muted hover:text-theme-neon transition-colors">Ver todo →</Link>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {leaderboard.map(player => (
              <div key={player.name} className="flex flex-row items-center justify-between group hover:bg-theme-neon/10 p-2 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-theme-neon/20">
                <div className="flex items-center gap-4">
                  <span className="text-theme-muted text-sm w-4 font-mono">{player.rank < 10 ? `0${player.rank}` : player.rank}</span>
                  <div className="w-8 h-8 rounded-full bg-theme-dark border border-theme-neon/30 overflow-hidden shadow-inner flex items-center justify-center">
                    {player.avatar_url && player.avatar_url !== "none" ? (
                       <img src={player.avatar_url} alt="avatar" className="w-full h-full object-cover blur-[1px] group-hover:blur-0 transition-all" />
                    ) : (
                       <span className="text-[10px] text-theme-muted">{player.name.substring(0,2)}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-white group-hover:text-theme-neon transition-colors">{player.name}</span>
                </div>
                <div className={`flex items-center gap-2 ${player.color || 'text-theme-muted'} font-bold text-sm`} style={{ color: player.color?.includes('#') ? player.color.replace('text-[', '').replace(']','') : '' }}>
                  <span className="w-3 h-3 inline-block bg-current rounded-[2px] shadow-[0_0_5px_currentColor]"></span> {player.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Store Freemium Widget */}
        <div className="glass-panel glass-active flex flex-col p-5 transform transition-transform lg:-translate-y-4 hover:shadow-neon-strong z-20 relative duration-500">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-theme-dark border border-theme-neon px-4 py-1 rounded-full text-[10px] tracking-widest uppercase text-theme-neon shadow-neon font-bold transition-colors">
            Destacado
          </div>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-theme-neon/20 mt-2 transition-colors">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white">
              <FiLock className="text-theme-neon" /> Tienda
            </h3>
            <Link to="/tienda" className="text-xs text-theme-muted hover:text-theme-neon transition-colors">Ver tienda →</Link>
          </div>
          
          {gameInfo.store.slice(0,1).map(item => {
            const isOwned = purchasedSkins?.includes(item.id);
            return (
              <div key={item.id} className="flex flex-col flex-1 mt-2">
                <div className="relative w-full h-36 bg-black/50 rounded-lg overflow-hidden border border-theme-neon/10 mb-4 group cursor-pointer shadow-inner flex items-center justify-center transition-colors">
                  {item.image === "none" ? (
                    <span className="text-theme-muted text-xs">Sin Imagen</span>
                  ) : (
                    <img src={getImageUrl(item.image)} alt={item.title} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500" style={{ filter: 'drop-shadow(0 0 15px var(--theme-neon-glow))' }} />
                  )}
                </div>
                <div className="flex flex-col">
                  <h4 className="font-bold text-base text-white">{item.title}</h4>
                  <span className={`text-xs ${item.rarityColor} font-semibold mb-2 tracking-wide uppercase`}>{item.rarity}</span>
                  <p className="text-xs text-theme-muted leading-relaxed line-clamp-2">{item.description}</p>
                </div>
                <div className="mt-auto pt-4 flex gap-2">
                  <button 
                    onClick={() => {
                      if (!user) {
                        if (onLoginTrigger) onLoginTrigger();
                        return;
                      }
                      if (isOwned) return;
                      setSelectedItem(item);
                      setPurchaseSuccess(false);
                      setPurchaseError(null);
                    }}
                    disabled={isOwned}
                    className={`flex-1 neon-button border rounded-lg py-2.5 flex items-center justify-center gap-2 transition-all ${
                      isOwned 
                        ? 'bg-theme-success/10 border-theme-success/30 text-theme-success cursor-default shadow-none' 
                        : 'border-theme-neon/40 bg-theme-neon/10 hover:bg-theme-neon hover:text-theme-dark'
                    }`}
                  >
                    <span className="w-3 h-3 bg-current rotate-45 inline-block shadow-sm"></span> 
                    <span className="font-bold">{isOwned ? 'Adquirido' : `${item.price} EP`}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

       {/* News Widget */}
        <div className="glass-panel flex flex-col p-5 hover:border-theme-neon/40 transition-colors duration-500">
           <div className="flex justify-between items-center mb-4 pb-2 border-b border-theme-neon/20 transition-colors">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white">
              <FiCalendar className="text-theme-neon" /> Noticias
            </h3>
            <Link to="/comunidad" className="text-xs text-theme-muted hover:text-theme-neon transition-colors">Ver todas →</Link>
          </div>
          
          <div className="flex flex-col gap-4 mt-2">
            {news.length === 0 ? (
              <p className="text-xs text-theme-muted italic">No hay noticias recientes para este juego.</p>
            ) : (
              news.map((n, idx) => (
                <div key={n.id} className="flex flex-col bg-black/20 p-2 rounded-lg hover:bg-black/30 transition-all border border-transparent hover:border-theme-neon/10">
                  
                  {/* Cabecera Clickable para expandir */}
                  <button type="button" onClick={() => toggleNews(n.id)} className="flex gap-4 cursor-pointer group text-left focus:outline-none w-full">
                    <div className="w-24 h-16 rounded-md overflow-hidden border border-theme-neon/20 flex-shrink-0 relative bg-theme-dark flex items-center justify-center transition-colors">
                      <div className="absolute inset-0 bg-theme-neon/10 group-hover:bg-transparent transition-colors z-10"></div>
                      {n.image && n.image !== "none" ? (
                        <img src={getImageUrl(n.image)} alt={n.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <span className="text-[10px] text-theme-muted">Noticia {idx+1}</span>
                      )}
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="text-sm font-bold text-white group-hover:text-theme-neon transition-colors leading-tight">{n.title}</h4>
                      <p className="text-xs text-theme-muted line-clamp-1 mt-1">{n.desc || n.description}</p>
                      <span className="text-[10px] text-theme-muted/60 mt-1 uppercase font-semibold">{n.date}</span>
                    </div>
                  </button>
  
                  {/* Contenedor expandible con interacciones */}
                  {activeNewsId === n.id && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-3">
                      <div className="flex justify-between items-center bg-black/40 p-2 rounded border border-white/5 mt-3">
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleReaccion(n.id, 'like')} className="text-theme-neon hover:scale-110 transition-transform text-sm font-bold flex items-center gap-1">
                            👍 {n.likes || 0}
                          </button>
                          <button onClick={() => handleReaccion(n.id, 'dislike')} className="text-[#f87171] hover:scale-110 transition-transform text-sm font-bold flex items-center gap-1">
                            👎 {n.dislikes || 0}
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-theme-muted text-[11px]">Valorar ({n.rating || '0.0'}):</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => handleValoracion(n.id, star)} className={`hover:scale-125 transition-transform text-sm ${n.rating >= star ? 'text-theme-neon' : 'text-theme-muted/40'}`}>★</button>
                          ))}
                        </div>
                      </div>
  
                      <div className="flex flex-col gap-2 bg-black/40 p-2 rounded border border-white/5">
                        <span className="text-[11px] font-bold text-theme-muted tracking-wider uppercase">Comentarios</span>
                          <div className="max-h-24 overflow-y-auto flex flex-col gap-1.5 text-[11px]">
                            {(comentarios[n.id] || []).length === 0 ? (
                              <span className="text-theme-muted/50 italic text-[10px]">Sé el primero en comentar...</span>
                            ) : (
                              comentarios[n.id].map((c, i) => (
                                <div key={`${c.nombre_usuario}-${i}`} className="bg-white/5 p-1.5 rounded border border-white/5 text-white/80">
                                  <strong className="text-theme-neon">{c.nombre_usuario}:</strong> {c.comentario}
                                </div>
                              ))
                            )}
                          </div>
                        <div className="flex gap-2 mt-1">
                          <input 
                            type="text" 
                            value={nuevoComentario}
                            onChange={(e) => setNuevoComentario(e.target.value)}
                            placeholder="Escribe un comentario..." 
                            className="flex-1 bg-theme-dark border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none"
                          />
                          <button onClick={() => handleEnviarComentario(n.id)} className="bg-theme-neon text-theme-dark font-bold text-xs px-3 py-1 rounded">Enviar</button>
                        </div>
                      </div>
                    </div>
                  )}
  
                </div>
              ))
            )}
          </div>
        </div>

      </div> {/* Este div cierra el grid general de Esteban */}

      {/* Store Purchase Modal Dialog */}
      <PurchaseModal 
        selectedItem={selectedItem}
        purchaseSuccess={purchaseSuccess}
        purchaseError={purchaseError}
        user={user}
        credits={credits}
        isProcessing={isProcessing}
        onClose={() => setSelectedItem(null)}
        onPurchase={handlePurchase}
      />

      {/* News Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl glass-panel border border-theme-neon/40 shadow-neon-strong rounded-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            <button 
              onClick={() => setSelectedNews(null)}
              className="absolute top-4 right-4 z-10 text-white/70 hover:text-white bg-black/50 p-2 rounded-full backdrop-blur-md transition-all"
            >
              <FiX size={20} />
            </button>

            {selectedNews.image && selectedNews.image !== 'none' && selectedNews.image !== 'not-found' && (
              <div className="w-full h-48 md:h-64 relative bg-theme-dark border-b border-white/10">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent z-0"></div>
                <img src={selectedNews.image} alt={selectedNews.title} className="w-full h-full object-cover mix-blend-lighten opacity-80" />
              </div>
            )}

            <div className="p-6 md:p-8 flex flex-col gap-4 overflow-y-auto">
              <div className="flex items-center gap-2">
                <span className="text-theme-neon text-xs font-bold uppercase tracking-widest bg-theme-neon/10 px-3 py-1 rounded-full border border-theme-neon/20">
                  {selectedNews.game_id}
                </span>
                <span className="text-gray-400 text-xs font-semibold">{selectedNews.date}</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-white font-display leading-tight">
                {selectedNews.title}
              </h2>

              <div className="w-12 h-1 bg-theme-neon rounded-full my-2 shadow-[0_0_10px_var(--theme-neon-glow)]"></div>

              <div className="text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-line mt-2">
                {selectedNews.desc || selectedNews.description}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                <button 
                  onClick={() => setSelectedNews(null)}
                  className="px-6 py-2 border border-white/20 hover:bg-white/10 text-white rounded-lg transition-colors font-bold text-sm uppercase tracking-wider"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

Dashboard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rol: PropTypes.string,
    name: PropTypes.string,
    nickname: PropTypes.string,
    nombre_usuario: PropTypes.string
  }),
  credits: PropTypes.number,
  purchasedSkins: PropTypes.arrayOf(PropTypes.string),
  buySkin: PropTypes.func,
  onLoginTrigger: PropTypes.func
};
