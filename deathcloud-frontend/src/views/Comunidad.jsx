import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FiMessageSquare, FiTrendingUp, FiLayers, FiSend, FiUser, FiCalendar, FiThumbsUp, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import { useGame } from '../context/GameContext';
import { communityService } from '../services/communityService';

const getApiUrl = (path) => {
    const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/api$/, '');
  return `${base}${path}`;
};

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('jwt_token');
  const res = await fetch(getApiUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  });
  return res.json();
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Hace un momento';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} hora${hrs > 1 ? 's' : ''}`;
  const days = Math.floor(hrs / 24);
  return `Hace ${days} día${days > 1 ? 's' : ''}`;
}

export default function Comunidad({ user, onLoginTrigger }) {
  const { gameInfo } = useGame();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [replies, setReplies] = useState({}); // { [postId]: reply[] }
  const [replyText, setReplyText] = useState('');
  const [repliesLoading, setRepliesLoading] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [news, setNews] = useState([]);

  // =========================================================================

  // =========================================================================
  const [activeNewsId, setActiveNewsId] = useState(null); 
  const [comentarios, setComentarios] = useState({});     
  const [nuevoComentario, setNuevoComentario] = useState("");

  // Estados para reporte y moderación de comentarios (HU #53)
  const [reportingComment, setReportingComment] = useState(null); // Objeto con datos del comentario reportado
  const [reportMotivo, setReportMotivo] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");
  const [reportError, setReportError] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const handleEnviarReporte = async (e) => {
    e.preventDefault();
    if (!user) return onLoginTrigger ? onLoginTrigger() : alert("Debes iniciar sesión");
    if (!reportMotivo) {
      setReportError("Debe seleccionar obligatoriamente un motivo para el reporte.");
      return;
    }
    setReportSubmitting(true);
    setReportError("");
    setReportSuccess("");
    try {
      const data = await apiFetch('/api/moderacion/reportar', {
        method: 'POST',
        body: JSON.stringify({
          comentario_id: reportingComment.id,
          motivo: reportMotivo
        })
      });
      if (data.success) {
        setReportSuccess("Su reporte ha sido enviado con éxito y será revisado por los moderadores.");
        setTimeout(() => {
          setReportingComment(null);
          setReportMotivo("");
          setReportSuccess("");
        }, 2000);
      } else {
        setReportError(data.message || "No se pudo enviar el reporte.");
      }
    } catch (err) {
      console.error(err);
      setReportError("Error de conexión al intentar comunicarse con el servidor.");
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleReaccion = async (newsId, tipo) => {
    if (!user) return onLoginTrigger ? onLoginTrigger() : alert("Debes iniciar sesión");
    try {
      await apiFetch(`/api/game/news/${newsId}/react`, {
        method: 'POST',
        body: JSON.stringify({ usuario_id: user.id, tipo })
      });
      const result = await communityService.getNewsByGame(gameInfo?.id);
      if (result.success && result.data) setNews(result.data);
    } catch (err) { console.error(err); }
  };

  const handleValoracion = async (newsId, estrellas) => {
    if (!user) return onLoginTrigger ? onLoginTrigger() : alert("Debes iniciar sesión");
    try {
      await apiFetch(`/api/game/news/${newsId}/rate`, {
        method: 'POST',
        body: JSON.stringify({ usuario_id: user.id, estrellas })
      });
      const result = await communityService.getNewsByGame(gameInfo?.id);
      if (result.success && result.data) setNews(result.data);
    } catch (err) { console.error(err); }
  };

  const handleEnviarComentario = async (newsId) => {
    if (!user) return onLoginTrigger ? onLoginTrigger() : alert("Debes iniciar sesión");
    if (!nuevoComentario.trim()) return;

    try {
      const data = await apiFetch(`/api/game/news/${newsId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          usuario_id: user.id,
          nombre_usuario: user.name || "Usuario",
          comentario: nuevoComentario
        })
      });
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
      const data = await apiFetch(`/api/game/news/${newsId}/comments`);
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


  const gameId = gameInfo?.id;

  const fetchPosts = useCallback(async () => {
    if (!gameId) return;
    setLoading(true);
    try {
      const data = await communityService.getPosts(gameId);
      if (data.success) setPosts(data.posts);
    } catch (err) {
      console.error('Error cargando posts:', err);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  const fetchNews = useCallback(async () => {
    if (!gameId) return;
    const result = await communityService.getNewsByGame(gameId);
    if (result.success && result.data) {
      setNews(result.data);
    }
  }, [gameId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPosts();
    fetchNews();
  }, [fetchPosts, fetchNews]);

  const fetchReplies = async (postId) => {
    setRepliesLoading(prev => ({ ...prev, [postId]: true }));
    try {
      const data = await apiFetch(`/api/community/${gameId}/posts/${postId}/replies`);
      if (data.success) setReplies(prev => ({ ...prev, [postId]: data.replies }));
    } catch (err) {
      console.error('Error cargando respuestas:', err);
    } finally {
      setRepliesLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleExpand = (postId) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
      if (!replies[postId]) fetchReplies(postId);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!user) {
      if (onLoginTrigger) onLoginTrigger();
      return;
    }
    if (!newTitle.trim() || !newContent.trim()) return;
    setSubmitting(true);
    try {
      const data = await apiFetch(`/api/community/${gameId}/posts`, {
        method: 'POST',
        body: JSON.stringify({ title: newTitle, content: newContent })
      });
      if (data.success) {
        setPosts(prev => [{ ...data.post, replies: '0' }, ...prev]);
        setNewTitle('');
        setNewContent('');
      }
    } catch (err) {
      console.error('Error creando post:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikePost = async (postId) => {
    if (!user) {
      if (onLoginTrigger) onLoginTrigger();
      return;
    }
    try {
      const data = await apiFetch(`/api/community/${gameId}/posts/${postId}/like`, { method: 'POST' });
      if (data.success) {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: data.likes } : p));
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleAddReply = async (e, postId) => {
    e.preventDefault();
    if (!user) {
      if (onLoginTrigger) onLoginTrigger();
      return;
    }
    if (!replyText.trim()) return;
    try {
      const data = await apiFetch(`/api/community/${gameId}/posts/${postId}/replies`, {
        method: 'POST',
        body: JSON.stringify({ content: replyText })
      });
      if (data.success) {
        setReplies(prev => ({ ...prev, [postId]: [...(prev[postId] || []), data.reply] }));
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, replies: String(Number.parseInt(p.replies, 10) + 1) } : p));
        setReplyText('');
      }
    } catch (err) {
      console.error('Error creando respuesta:', err);
    }
  };

  const handleLikeReply = async (gameId, replyId, postId) => {
    if (!user) {
      if (onLoginTrigger) onLoginTrigger();
      return;
    }
    try {
      const data = await apiFetch(`/api/community/${gameId}/replies/${replyId}/like`, { method: 'POST' });
      if (data.success) {
        setReplies(prev => ({
          ...prev,
          [postId]: (prev[postId] || []).map(r => r.id === replyId ? { ...r, likes: data.likes } : r)
        }));
      }
    } catch (err) {
      console.error('Error liking reply:', err);
    }
  };

  const postCountText = posts.length === 1 ? '1 publicación' : `${posts.length} publicaciones`;

  return (
    <div className="flex-1 flex flex-col pb-8 pt-4 lg:pt-8 fade-in max-w-6xl mx-auto w-full transition-all duration-500">

      {/* Header Info */}
      <div className="border-b border-theme-neon/20 pb-6 mb-8">
        <h1 className="font-display font-black text-4xl text-white tracking-wide uppercase flex items-center gap-3" style={{ textShadow: '0 0 12px var(--theme-neon-glow)' }}>
          <FiLayers className="text-theme-neon" /> Hub de Comunidad
        </h1>
        <p className="text-theme-muted uppercase tracking-[0.2em] text-[10px] font-semibold mt-1">
          {gameInfo?.name ? `Foro oficial de ${gameInfo.name}` : 'Entérate de las últimas transmisiones y debates de la red DeathCloud'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Columna Izquierda / Central: Foro de Discusión */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-panel p-6 flex flex-col gap-4">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
              <FiMessageSquare className="text-theme-neon" /> Crear Publicación
            </h3>

            <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Título del debate..."
                required
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-theme-neon/40 transition-all font-semibold"
              />
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Escribe el contenido del mensaje..."
                rows={3}
                required
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-theme-neon/40 transition-all leading-relaxed"
              />
              <button
                type="submit"
                disabled={submitting}
                className="self-end neon-button border border-theme-neon/40 rounded-lg px-6 py-2 bg-theme-neon/10 hover:bg-theme-neon hover:text-theme-dark text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <FiSend size={12} /> {submitting ? 'PUBLICANDO...' : 'PUBLICAR EN RED'}
              </button>
            </form>
          </div>

          {/* Refresh + Listado de Posts */}
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-theme-muted uppercase tracking-widest font-semibold">
              {loading ? 'Cargando...' : postCountText}
            </span>
            <button
              onClick={fetchPosts}
              className="flex items-center gap-1.5 text-[10px] text-theme-muted hover:text-theme-neon transition-colors"
            >
              <FiRefreshCw size={11} /> Actualizar
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {loading && (
              <div className="glass-panel p-8 text-center text-theme-muted text-sm">Cargando publicaciones...</div>
            )}
            {!loading && posts.length === 0 && (
              <div className="glass-panel p-8 text-center text-theme-muted text-sm">
                No hay publicaciones aún. ¡Sé el primero en publicar!
              </div>
            )}
            {!loading && posts.length > 0 && posts.map(post => {
              const isExpanded = expandedPostId === post.id;
              const postReplies = replies[post.id] || [];
              return (
                <div key={post.id} className="glass-panel p-5 hover:border-theme-neon/30 transition-all duration-300 flex flex-col gap-3">
                  <button
                    type="button"
                    className="w-full text-left flex justify-between items-start cursor-pointer group"
                    onClick={() => handleExpand(post.id)}
                  >
                    <h4 className="font-bold text-base text-white group-hover:text-theme-neon transition-colors">{post.title}</h4>
                    <span className="text-[10px] text-theme-muted font-mono shrink-0 ml-2">{timeAgo(post.created_at)}</span>
                  </button>

                  <p className="text-xs text-theme-muted leading-relaxed whitespace-pre-line">{post.content}</p>

                  <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1 text-[10px] text-theme-muted">
                    <div className="flex items-center gap-2">
                      <FiUser className="text-theme-neon" />
                      <span className="font-bold text-white">{post.author}</span>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleLikePost(post.id); }}
                        className="flex items-center gap-1 hover:text-theme-neon transition-colors"
                        title="Me gusta"
                      >
                        <FiThumbsUp /> <span>{post.likes}</span>
                      </button>
                      <button
                        onClick={() => handleExpand(post.id)}
                        className={`flex items-center gap-1 hover:text-theme-neon transition-colors ${isExpanded ? 'text-theme-neon' : ''}`}
                      >
                        <FiMessageSquare /> <span>{post.replies} respuesta{Number.parseInt(post.replies, 10) === 1 ? '' : 's'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Accordion Expanded Section */}
                  {isExpanded && (
                    <div className="border-t border-white/5 pt-4 mt-2 flex flex-col gap-4 animate-fade-in">
                      <h5 className="text-xs font-bold text-white tracking-widest uppercase mb-1">Respuestas ({post.replies})</h5>

                      {/* Comments list */}
                      <div className="flex flex-col gap-3 pl-4 border-l border-theme-neon/20">
                        {repliesLoading[post.id] && (
                          <div className="text-xs text-theme-muted italic">Cargando respuestas...</div>
                        )}
                        {!repliesLoading[post.id] && postReplies.length === 0 && (
                          <div className="text-xs text-theme-muted italic">No hay respuestas en este debate. ¡Sé el primero!</div>
                        )}
                        {!repliesLoading[post.id] && postReplies.length > 0 && postReplies.map(reply => (
                            <div key={reply.id} className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex flex-col gap-1.5 hover:border-theme-neon/10 transition-colors">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-theme-neon">{reply.author}</span>
                                <span className="text-theme-muted/50 font-mono">{timeAgo(reply.created_at)}</span>
                              </div>
                              <p className="text-xs text-theme-text/90 leading-relaxed">{reply.content}</p>
                              <div className="flex justify-end mt-0.5">
                                <button
                                  onClick={() => handleLikeReply(gameId, reply.id, post.id)}
                                  className="flex items-center gap-1 text-[9px] text-theme-muted hover:text-theme-neon transition-colors"
                                >
                                  <FiThumbsUp size={10} /> <span>{reply.likes || 0}</span>
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Reply form */}
                      <form onSubmit={(e) => handleAddReply(e, post.id)} className="flex items-center gap-2 mt-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Escribe una respuesta y presiona Enter..."
                          required
                          className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-theme-neon/40 transition-all"
                        />
                        <button
                          type="submit"
                          className="neon-button border border-theme-neon/40 rounded-xl px-4 py-2.5 bg-theme-neon/10 hover:bg-theme-neon hover:text-theme-dark text-xs font-bold transition-all flex items-center justify-center"
                        >
                          RESPONDER
                        </button>
                      </form>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

        {/* Columna Derecha: Noticias del juego */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-5">
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
              <FiTrendingUp className="text-theme-neon" /> Noticias Oficiales
            </h3>

            {news.length === 0 ? (
              <p className="text-xs text-theme-muted italic">No hay noticias recientes para este juego.</p>
            ) : (
              <div className="flex flex-col gap-5">
                {news.map((n, idx) => (
                  <div key={n.id || idx} className="flex flex-col gap-2 group bg-black/20 p-3 rounded-lg border border-transparent hover:border-theme-neon/20 transition-all">
                    
                    <button type="button" onClick={() => toggleNews(n.id)} className="cursor-pointer text-left focus:outline-none w-full">
                      <div className="h-32 w-full rounded-xl overflow-hidden border border-white/5 relative bg-black/40 flex items-center justify-center mb-2">
                        {n.image && n.image !== 'none' && n.image !== 'not-found' ? (
                          <img src={n.image} alt={n.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <span className="text-[10px] text-theme-muted">Noticia {idx + 1}</span>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                      </div>

                      <span className="text-[9px] font-mono text-theme-neon uppercase tracking-wider flex items-center gap-1.5 mt-1">
                        <FiCalendar size={10} /> {n.date} • {n.author || 'Staff'}
                      </span>

                      <h4 className="font-bold text-sm text-white group-hover:text-theme-neon transition-colors leading-snug">{n.title}</h4>
                      <p className="text-[11px] text-theme-muted leading-relaxed line-clamp-2">{n.desc}</p>
                    </button>

                    {/* Expandable Interaction Section */}
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
                          <div className="max-h-32 overflow-y-auto flex flex-col gap-2 text-[11px] pr-1">
                            {(comentarios[n.id] || []).length === 0 ? (
                              <span className="text-theme-muted/50 italic text-[10px]">Sé el primero en comentar...</span>
                            ) : (
                              comentarios[n.id].map((c, i) => (
                                <div key={c.id || `${c.nombre_usuario || c.author_name}-${i}`} className="bg-white/5 p-2 rounded border border-white/5 text-white/80 flex flex-col gap-1 group/comment relative">
                                  <div className="flex justify-between items-center">
                                    <strong className="text-theme-neon text-[10px]">{c.nombre_usuario || c.author_name || "Usuario"}</strong>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[9px] text-theme-muted/50">{timeAgo(c.fecha_comentario || c.date || new Date())}</span>
                                      <button 
                                        onClick={() => {
                                          if (!user) {
                                            if (onLoginTrigger) onLoginTrigger();
                                            else alert("Debes iniciar sesión para reportar");
                                            return;
                                          }
                                          setReportingComment({
                                            id: c.id,
                                            content: c.comentario || c.content,
                                            author: c.nombre_usuario || c.author_name || "Usuario"
                                          });
                                        }}
                                        className="text-[9px] text-red-400 hover:text-red-500 hover:underline cursor-pointer flex items-center gap-0.5 opacity-0 group-hover/comment:opacity-100 transition-opacity"
                                        title="Reportar Comentario"
                                      >
                                        <FiAlertTriangle size={8} /> Reportar
                                      </button>
                                    </div>
                                  </div>
                                  <span className="text-xs text-white/90">{c.comentario || c.content}</span>
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
                              className="flex-1 bg-theme-dark border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-theme-neon/40"
                              onKeyDown={(e) => e.key === 'Enter' && handleEnviarComentario(n.id)}
                            />
                            <button onClick={() => handleEnviarComentario(n.id)} className="bg-theme-neon hover:bg-theme-neon/80 text-theme-dark font-bold text-xs px-3 py-1 rounded transition-colors">Enviar</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL DE REPORTE (HU #53) */}
      {reportingComment && (
        <div className="fixed inset-0 w-screen h-screen z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0f172a] border border-red-500/30 p-6 rounded-2xl w-full max-w-md relative shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <button
              onClick={() => {
                setReportingComment(null);
                setReportMotivo("");
                setReportError("");
                setReportSuccess("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-sm font-mono cursor-pointer"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-2 border-b border-red-500/20 pb-3 mb-4">
              <FiAlertTriangle className="text-red-500 text-xl animate-pulse" />
              <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider">Reportar Comentario</h3>
            </div>

            <div className="bg-black/40 border border-white/5 p-3.5 rounded-xl mb-4 text-xs">
              <p className="text-theme-muted font-bold mb-1">Autor del comentario: <span className="text-white">{reportingComment.author}</span></p>
              <p className="text-gray-300 italic whitespace-normal break-words">"{reportingComment.content}"</p>
            </div>

            <form onSubmit={handleEnviarReporte} className="space-y-4">
              <div>
                <label className="block text-[10px] text-theme-muted uppercase tracking-widest font-bold mb-1.5">
                  Motivo de la Denuncia *
                </label>
                <select
                  value={reportMotivo}
                  onChange={(e) => {
                    setReportMotivo(e.target.value);
                    if (e.target.value) setReportError("");
                  }}
                  required
                  className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500/50 transition-all cursor-pointer"
                >
                  <option value="">-- Seleccione el motivo --</option>
                  <option value="Spam o Publicidad">Spam o Publicidad</option>
                  <option value="Lenguaje Ofensivo / Acoso">Lenguaje Ofensivo / Acoso</option>
                  <option value="Contenido Inapropiado">Contenido Inapropiado</option>
                  <option value="Información Falsa">Información Falsa</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {/* Mensajes de feedback */}
              {reportError && (
                <div className="bg-red-950/40 border border-red-500/30 p-2.5 rounded-lg text-[11px] text-red-200">
                  ⚠️ {reportError}
                </div>
              )}
              {reportSuccess && (
                <div className="bg-green-950/40 border border-green-500/30 p-2.5 rounded-lg text-[11px] text-green-200">
                  ✅ {reportSuccess}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setReportingComment(null);
                    setReportMotivo("");
                    setReportError("");
                    setReportSuccess("");
                  }}
                  disabled={reportSubmitting}
                  className="px-4 py-2 rounded text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={reportSubmitting || !reportMotivo}
                  className={`px-5 py-2 rounded text-xs font-bold text-white transition-colors cursor-pointer bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    reportSubmitting ? "cursor-wait animate-pulse" : ""
                  }`}
                >
                  {reportSubmitting ? "Enviando..." : "Enviar Reporte"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

Comunidad.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    username: PropTypes.string,
    nickname: PropTypes.string,
    nombre_usuario: PropTypes.string
  }),
  onLoginTrigger: PropTypes.func
};
