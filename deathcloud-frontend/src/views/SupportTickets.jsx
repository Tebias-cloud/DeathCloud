import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiLifeBuoy, FiSend, FiFileText, FiCheckCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';

// Dynamic API URL builder
const getApiUrl = (route) => {
    const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/api$/, '');
  return `${base}/api/${route}`;
};

export default function SupportTickets({ user, onLoginTrigger }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('otro');
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);


  const fetchTickets = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const token = user?.token || localStorage.getItem('jwt_token');
      const res = await fetch(getApiUrl('tickets'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al obtener tickets.');
      }
      setTickets(data.tickets || []);
    } catch (err) {
      console.warn("Backend error fetching support tickets:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [user, fetchTickets]);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center pb-8 pt-12 md:pt-20 max-w-md mx-auto w-full text-center animate-fade-in">
        <div className="glass-panel p-8 border border-theme-neon/30 bg-theme-panel backdrop-blur-md rounded-2xl shadow-neon-strong w-full flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-theme-neon/10 border border-theme-neon flex items-center justify-center shadow-neon">
            <FiLifeBuoy size={32} className="text-theme-neon animate-pulse" />
          </div>
          <h2 className="font-display font-black text-2xl text-white tracking-widest uppercase">
            SOPORTE AL JUGADOR
          </h2>
          <p className="text-xs text-theme-muted leading-relaxed">
            Debes iniciar sesión con tu cuenta de DeathCloud para registrar nuevos tickets de soporte y consultar el historial de soporte técnico.
          </p>
          <button 
            onClick={onLoginTrigger}
            className="w-full bg-theme-neon hover:bg-[#00d2ff] text-black font-black py-3 rounded-xl transition-all shadow-[0_0_15px_var(--theme-neon-glow)] hover:shadow-[0_0_25px_var(--theme-neon)] font-display uppercase tracking-wider text-sm"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setSubmitSuccess(null);
    setSubmitError(null);

    if (!title.trim() || !description.trim()) {
      setSubmitError('Debe completar el título y descripción de la consulta.');
      return;
    }

    setSubmitLoading(true);
    try {
      const token = user?.token || localStorage.getItem('jwt_token');
      const res = await fetch(getApiUrl('tickets'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, category })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al crear ticket de soporte.');
      }

      setSubmitSuccess('¡Ticket registrado con éxito! Un Administrador del Sistema lo revisará pronto.');
      setTitle('');
      setDescription('');
      setCategory('otro');
      fetchTickets();
    } catch (err) {
      console.warn("Backend error submitting ticket:", err.message);
      setSubmitError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Color mappings
  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'cuenta': return 'Problemas con Cuenta';
      case 'bug': return 'Error del Juego (Bug)';
      case 'tienda': return 'Tienda / Compra';
      case 'reporte': return 'Reportar Jugador';
      case 'conexion': return 'Problemas de Conexión';
      case 'sugerencia': return 'Feedback / Sugerencia';
      case 'pagos': return 'E-Points / Pagos';
      case 'recuperacion': return 'Recuperación de Cuenta';
      default: return 'Otro asunto';
    }
  };



  const getStatusBadge = (status) => {
    switch (status) {
      case 'cerrado': return 'bg-black/40 text-theme-muted border-white/5';
      case 'resuelto': return 'bg-theme-success/20 text-theme-success border-theme-success/30';
      case 'en_progreso': return 'bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30';
      default: return 'bg-theme-neon/20 text-theme-neon border-theme-neon/30 shadow-neon-sm';
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-8 pt-4 lg:pt-10 fade-in transition-all duration-500 max-w-5xl mx-auto w-full">
      
      {/* Title */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl text-white tracking-wide uppercase" style={{ textShadow: '0 0 12px var(--theme-neon-glow)' }}>
          TICKETS DE SOPORTE
        </h1>
        <p className="text-theme-muted uppercase tracking-[0.2em] text-xs font-semibold mt-1">
          Asistencia Técnica & Transmisiones de Emergencia al Sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Formulario para enviar ticket */}
        <div className="glass-panel p-6 flex flex-col gap-5 h-fit">
          <h3 className="font-display text-xl font-bold text-white flex items-center gap-2 border-b border-theme-neon/10 pb-2">
            <FiLifeBuoy className="text-theme-neon" /> Reportar Problema
          </h3>

          {submitError && (
            <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold flex items-center gap-2">
              <FiAlertTriangle size={16} /> {submitError}
            </div>
          )}

          {submitSuccess && (
            <div className="p-3 bg-theme-success/10 text-theme-success border border-theme-success/20 rounded-lg text-xs font-bold flex items-center gap-2">
              <FiCheckCircle size={16} /> {submitSuccess}
            </div>
          )}

          <form onSubmit={handleSubmitTicket} className="flex flex-col gap-4">
            
            {/* Title */}
            <div className="flex flex-col gap-2">
              <label htmlFor="ticketTitle" className="text-[10px] uppercase tracking-widest font-bold text-theme-muted ml-1">Título de la Consulta</label>
              <input 
                id="ticketTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Falla al cargar montura"
                required
                maxLength={80}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-theme-neon/40 focus:bg-black/60 transition-all placeholder:text-theme-muted/30"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2">
              <label htmlFor="ticketCategory" className="text-[10px] uppercase tracking-widest font-bold text-theme-muted ml-1">Categoría</label>
              <select 
                id="ticketCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-theme-neon focus:outline-none focus:border-theme-neon/40 focus:bg-black/60 transition-all cursor-pointer"
              >
                <option value="bug" className="bg-[#09090b]">Error del Juego (Bug)</option>
                <option value="conexion" className="bg-[#09090b]">Problemas de Conexión</option>
                <option value="pagos" className="bg-[#09090b]">E-Points / Pagos</option>
                <option value="cuenta" className="bg-[#09090b]">Problemas con Cuenta</option>
                <option value="recuperacion" className="bg-[#09090b]">Recuperación de Cuenta</option>
                <option value="reporte" className="bg-[#09090b]">Reportar Jugador</option>
                <option value="tienda" className="bg-[#09090b]">Tienda / Compra</option>
                <option value="sugerencia" className="bg-[#09090b]">Feedback / Sugerencia</option>
                <option value="otro" className="bg-[#09090b]">Otro asunto</option>
              </select>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label htmlFor="ticketDesc" className="text-[10px] uppercase tracking-widest font-bold text-theme-muted ml-1">Descripción del Problema</label>
              <textarea 
                id="ticketDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                placeholder="Detalla de forma clara tu inconveniente, adjuntando la mayor cantidad de datos de cuenta o transacción posibles..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-theme-neon/40 focus:bg-black/60 transition-all placeholder:text-theme-muted/30"
              />
            </div>

            <button 
              type="submit"
              disabled={submitLoading}
              className="w-full mt-2 bg-theme-neon hover:bg-[#00d2ff] text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 group transition-all shadow-[0_0_15px_rgba(0,243,255,0.2)] hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] disabled:opacity-50"
            >
              {submitLoading ? 'Transmitiendo...' : 'ENVIAR TICKET'}
              {!submitLoading && <FiSend className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" size={14} />}
            </button>
          </form>
        </div>

        {/* Column 2: Visor de tus tickets historicos */}
        <div className="glass-panel p-6 lg:col-span-2 flex flex-col gap-5">
          <h3 className="font-display text-xl font-bold text-white flex items-center gap-2 border-b border-theme-neon/10 pb-2">
            <FiFileText className="text-theme-neon" /> Historial de Transmisiones
          </h3>

          {(() => {
            if (loading) {
              return (
                <div className="flex flex-col items-center justify-center h-64 text-theme-muted italic">
                  <div className="w-6 h-6 border-2 border-theme-neon border-t-transparent rounded-full animate-spin mb-2"></div>
                  Obteniendo cola de tickets del usuario...
                </div>
              );
            }
            if (error && tickets.length === 0) {
              return (
                <div className="text-red-400 p-4 text-center">
                  <FiAlertTriangle size={24} className="mx-auto mb-2" />
                  <p className="text-xs">No se pudo sincronizar el historial de soporte.</p>
                </div>
              );
            }
            if (tickets.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center h-64 text-theme-muted italic text-center p-8 bg-black/10 rounded-2xl border border-white/5">
                  <FiInfo size={32} className="text-theme-neon/30 mb-2" />
                  <p className="text-sm font-semibold">No posees ningún reporte activo.</p>
                  <p className="text-xs text-theme-muted/60 mt-1 max-w-xs">Si experimentas alguna falla técnica, utiliza el panel lateral para reportarlo al comando.</p>
                </div>
              );
            }
            return (
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin">
                {tickets.map(t => (
                  <div 
                    key={t.id}
                    className="bg-black/30 border border-white/5 hover:border-theme-neon/20 p-4 rounded-xl flex flex-col gap-3 transition-all hover:bg-black/50"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-theme-muted font-mono leading-none">TICKET #{t.id} • {new Date(t.fecha_creacion).toLocaleDateString()}</span>
                        <h4 className="font-bold text-base text-white mt-1.5">{t.titulo}</h4>
                      </div>

                      <div className="flex gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${getStatusBadge(t.estado)}`}>
                          {t.estado}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-theme-muted leading-relaxed bg-black/20 p-3 rounded-lg border border-white/[0.02]">
                      {t.descripcion}
                    </p>

                    <div className="flex justify-between items-center text-[10px] text-theme-muted/50 font-mono mt-1">
                      <span>Categoría: {getCategoryLabel(t.categoria)}</span>
                      <span>Modificado: {new Date(t.fecha_creacion).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

      </div>
    </div>
  );
}

SupportTickets.propTypes = {
  user: PropTypes.shape({
    token: PropTypes.string
  }),
  onLoginTrigger: PropTypes.func
};
