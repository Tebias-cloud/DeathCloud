import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FiUser, FiShield, FiLock, FiCheckCircle, FiAlertTriangle, FiSettings, FiX, FiShoppingBag, FiInbox, FiMonitor, FiSmartphone } from 'react-icons/fi';
import { useGame } from '../context/GameContext';
import { getSessions, revokeSession, getProfile, updateProfile, changePassword, changeDeathCloudId } from '../services/userService';

const PRESET_AVATARS = [
  { name: 'Mech Shark', url: 'assets/mech_shark.png' },
  { name: 'Elite Blade', url: 'assets/premium_axe.png' },
  { name: 'Death Storm', url: 'assets/hero_bg.png' },
  { name: 'Cyber Luffy', url: 'assets/luffy_cyber.png' },
  { name: 'Sistema Core', url: 'none' }
];

export default function Profile({ user, updateUserSession, onLoginTrigger, purchasedSkins = [], onLogout }) {
  const { availableGames } = useGame();
  
  const allGlobalStoreItems = React.useMemo(() => {
    return availableGames.reduce((acc, game) => {
      const items = (game.store || []).map(i => ({ ...i, gameDisplayName: game.displayName }));
      return [...acc, ...items];
    }, []);
  }, [availableGames]);

  const ownedItems = React.useMemo(() => {
    return allGlobalStoreItems.filter(item => purchasedSkins.includes(item.id));
  }, [allGlobalStoreItems, purchasedSkins]);
  const [activeTab, setActiveTab] = useState('visible'); // 'visible' or 'security'
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit states for visible profile
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('none');
  
  // Auto-save feedback state
  const [savingState, setSavingState] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Refs to keep track of the latest values for auto-save comparison
  const originalValues = useRef({ nickname: '', bio: '', avatarUrl: 'none' });

  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // DeathCloud ID change states
  const [securityPassword, setSecurityPassword] = useState('');
  const [newDeathCloudId, setNewDeathCloudId] = useState('');
  const [idError, setIdError] = useState(null);
  const [idSuccess, setIdSuccess] = useState(null);
  const [idLoading, setIdLoading] = useState(false);



  // Active Sessions state
  const [activeSessions, setActiveSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const fetchSessions = React.useCallback(async () => {
    if (!user) return;
    setSessionsLoading(true);
    try {
      const data = await getSessions();
      if (data.success) {
        setActiveSessions(data.sessions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSessionsLoading(false);
    }
  }, [user]);

  const handleRevokeSession = async (sessionId) => {
    try {
      const data = await revokeSession(sessionId);
      if (data.success) {
        setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProfile = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getProfile();
      if (!data.success) {
        throw new Error(data.message || 'Error al recuperar perfil.');
      }
      setProfile(data.user);
      const dbNickname = data.user.nickname || data.user.username;
      const dbBio = data.user.bio || '';
      const dbAvatar = data.user.avatarUrl || 'none';

      setNickname(dbNickname);
      setBio(dbBio);
      setAvatarUrl(dbAvatar);

      originalValues.current = {
        nickname: dbNickname,
        bio: dbBio,
        avatarUrl: dbAvatar
      };
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchProfile();
      fetchSessions();
    } else {
      setLoading(false);
    }
  }, [user, fetchProfile, fetchSessions]);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center pb-8 pt-12 md:pt-20 max-w-md mx-auto w-full text-center animate-fade-in">
        <div className="glass-panel p-8 border border-theme-neon/30 bg-theme-panel backdrop-blur-md rounded-2xl shadow-neon-strong w-full flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-theme-neon/10 border border-theme-neon flex items-center justify-center shadow-neon">
            <FiShield size={32} className="text-theme-neon" />
          </div>
          <h2 className="font-display font-black text-2xl text-white tracking-widest uppercase">
            ACCESO RESTRINGIDO
          </h2>
          <p className="text-xs text-theme-muted leading-relaxed">
            Debes iniciar sesión con tu cuenta de DeathCloud para ver, personalizar y gestionar tu perfil de jugador o cambiar tu contraseña.
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

  // Trigger auto-save if value changed
  const handleAutoSave = async (field, value) => {
    // Compare with the last saved value
    if (originalValues.current[field] === value) return;

    setSavingState('saving');
    try {
      const payload = {
        nickname: field === 'nickname' ? value : nickname,
        bio: field === 'bio' ? value : bio,
        avatar_url: field === 'avatarUrl' ? value : avatarUrl
      };

      const data = await updateProfile(payload);
      if (!data.success) {
        throw new Error(data.message || 'Error al guardar.');
      }

      // Update original values cache
      originalValues.current[field] = value;
      setProfile(prev => ({ ...prev, ...data.user }));

      if (updateUserSession) {
        updateUserSession({
          nickname: data.user.nickname,
          username: data.user.username,
          avatar_url: data.user.avatarUrl
        });
      }

      setSavingState('saved');
      setTimeout(() => setSavingState('idle'), 3000);
    } catch (err) {
      console.error(err);
      setSavingState('error');
    }
  };

  const handleAvatarSelect = (url) => {
    setAvatarUrl(url);
    setShowAvatarModal(false);
    handleAutoSave('avatarUrl', url);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setPasswordLoading(true);
    try {
      const data = await changePassword(oldPassword, newPassword);
      if (!data.success) {
        throw new Error(data.message || 'Error al cambiar contraseña.');
      }
      setPasswordSuccess('Contraseña actualizada correctamente.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleChangeDeathCloudId = async (e) => {
    e.preventDefault();
    setIdError(null);
    setIdSuccess(null);

    if (!newDeathCloudId.trim()) {
      setIdError('El DeathCloud ID no puede estar vacío.');
      return;
    }

    setIdLoading(true);
    try {
      const data = await changeDeathCloudId(securityPassword, newDeathCloudId);
      if (!data.success) {
        throw new Error(data.message || 'Error al actualizar DeathCloud ID.');
      }

      setIdSuccess('DeathCloud ID actualizado correctamente.');
      setSecurityPassword('');
      setNewDeathCloudId('');
      
      // Update profile locally
      setProfile(prev => ({ ...prev, nombre_usuario: data.newDeathCloudId }));
      
      if (updateUserSession) {
        updateUserSession({
          username: data.newDeathCloudId
        });
      }
    } catch (err) {
      setIdError(err.message);
    } finally {
      setIdLoading(false);
    }
  };


  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-theme-muted italic">
          <div className="w-8 h-8 border-2 border-theme-neon border-t-transparent rounded-full animate-spin mb-3"></div>
          Estableciendo enlace cifrado de datos...
        </div>
      );
    }
    
    if (error && !profile) {
      return (
        <div className="glass-panel p-8 text-center text-red-400">
          <FiAlertTriangle size={32} className="mx-auto mb-2" />
          <p className="font-bold">Error de sincronización</p>
          <p className="text-xs text-theme-muted mt-1">{error}</p>
        </div>
      );
    }

    if (activeTab === 'inventory') {
      return (
        /* Full width layout for Inventory tab */
        <div className="w-full">
          <div className="glass-panel p-6 flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-theme-neon/10 pb-3 gap-2">
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <FiShoppingBag className="text-theme-neon" /> Mi Inventario de Objetos
              </h3>
              <span className="text-[10px] text-theme-muted uppercase tracking-wider font-semibold">
                Mostrando objetos desbloqueados en <strong className="text-theme-neon">TODOS LOS JUEGOS</strong>
              </span>
            </div>

            <div className="flex flex-col gap-6 relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                      <div className="bg-black/30 border border-white/5 p-4 rounded-xl flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest font-black text-theme-muted">Colección Global</span>
                        <span className="text-2xl font-black text-white font-mono mt-1">
                          {ownedItems.length}
                        </span>
                        <span className="text-[9px] text-theme-muted mt-0.5">Objetos en tu cuenta</span>
                      </div>
                      <div className="bg-black/30 border border-white/5 p-4 rounded-xl flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest font-black text-theme-muted">Inversión Estimada</span>
                        <span className="text-2xl font-black text-theme-neon font-mono mt-1">
                          {ownedItems.reduce((acc, curr) => acc + curr.price, 0).toLocaleString()} EP
                        </span>
                        <span className="text-[9px] text-theme-muted mt-0.5">Valor total en E-Points invertido</span>
                      </div>
                    </div>

                    {/* Skins grid list */}
                    {ownedItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center bg-black/25 border border-white/5 rounded-xl">
                        <FiInbox size={48} className="text-theme-muted mb-3" />
                        <h4 className="font-bold text-white text-sm uppercase tracking-wide">Inventario Vacío</h4>
                        <p className="text-xs text-theme-muted max-w-sm mt-1 mb-6 leading-relaxed">
                          No has adquirido ningún objeto estético. Explora la tienda para equiparte.
                        </p>
                        <Link 
                          to="/tienda" 
                          className="neon-button border border-theme-neon/40 rounded-lg px-6 py-2 bg-theme-neon/15 text-theme-neon hover:bg-theme-neon hover:text-theme-dark text-xs font-black tracking-wider transition-all shadow-neon-sm"
                        >
                          VISITAR LA TIENDA
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {ownedItems.map((item) => (
                          <div key={item.id} className="group relative bg-black/40 border border-white/10 rounded-2xl overflow-hidden hover:border-theme-neon/30 transition-all duration-500 hover:shadow-neon flex flex-col">
                            
                            {/* Image area */}
                            <div className="relative w-full h-44 flex items-center justify-center p-6 bg-gradient-to-b from-white/5 to-transparent transition-colors group-hover:from-theme-neon/5">
                              {item.image === "none" ? (
                                <span className="text-[10px] text-theme-muted">Aspecto {item.title}</span>
                              ) : (
                                <img src={item.image} alt={item.title} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 filter drop-shadow-[0_0_15px_var(--theme-neon-glow)]" />
                              )}
                            </div>

                            <div className="p-4 flex flex-col flex-1 relative z-10 border-t border-white/5">
                              <div className="flex justify-between items-center mb-1">
                                <span className={`text-[9px] ${item.rarityColor} font-black uppercase tracking-wide`}>{item.rarity}</span>
                                <span className="text-[8px] bg-white/5 text-white/70 px-2 py-0.5 rounded-full uppercase tracking-wider border border-white/5">{item.gameDisplayName}</span>
                              </div>
                              <span className="font-bold text-white text-sm leading-tight group-hover:text-theme-neon transition-colors mt-1">{item.title}</span>
                              <p className="text-[11px] text-theme-muted mt-2 leading-relaxed min-h-[32px] line-clamp-2 opacity-80">{item.description}</p>

                              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-semibold text-theme-muted">
                                <span>Valor de tienda:</span>
                                <span className="font-mono font-bold text-theme-neon flex items-center gap-1"><FiCheckCircle className="text-theme-success" /> Adquirido</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
            </div>
          </div>
        </div>
      );
    }

    return (
      /* Original split layout for Profile settings and Security */
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card de Previsualización Izquierda */}
        <div className="glass-panel p-6 flex flex-col items-center text-center relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-24 h-24 bg-theme-neon/5 blur-3xl rounded-full"></div>
          
          {/* Rol de Cuenta */}
          <span className={`self-end inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] uppercase font-black border ${
            profile.rol === 'admin' 
              ? 'bg-[#c084fc]/15 text-[#c084fc] border-[#c084fc]/30 shadow-[0_0_8px_rgba(192,132,252,0.3)]' 
              : 'bg-theme-neon/15 text-theme-neon border-theme-neon/30 shadow-neon-sm'
          }`}>
            <FiShield className="mr-1.5" size={10} />
            {profile.rol === 'admin' ? 'ADMINISTRADOR' : 'JUGADOR'}
          </span>

          {/* Avatar interactivo */}
          <button type="button" className="relative group my-6 cursor-pointer block border-none bg-transparent" onClick={() => setShowAvatarModal(true)}>
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-theme-neon/30 bg-gradient-to-b from-white/10 to-transparent shadow-neon-sm flex items-center justify-center relative transition-transform duration-300 group-hover:scale-105">
              {avatarUrl === 'none' ? (
                <span className="text-4xl text-theme-neon font-bold font-display">{(nickname || profile.nombre_usuario).substring(0, 2).toUpperCase()}</span>
              ) : (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover filter drop-shadow-[0_0_10px_var(--theme-neon-glow)]" />
              )}
              {/* Overlay flotante */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[10px] text-theme-neon font-bold tracking-wider">CAMBIAR</span>
              </div>
            </div>
          </button>

          {/* Datos Básicos */}
          <div className="flex flex-col mb-4">
            <h2 className="text-2xl font-bold font-display text-white">{nickname || profile.nombre_usuario}</h2>
            <span className="text-xs text-theme-muted font-mono mt-1" title="DeathCloud ID permanente">ID: #{profile.nombre_usuario}</span>
          </div>

          {/* Biografía de perfil */}
          <div className="w-full border-t border-theme-neon/10 pt-4 mt-2 text-left">
            <span className="text-[9px] uppercase font-bold text-theme-muted tracking-widest block mb-1.5">Biografía</span>
            <p className="text-xs text-white leading-relaxed italic bg-black/20 p-3 rounded-lg border border-white/5 min-h-[60px] whitespace-pre-line">
              {bio || 'Sin biografía escrita todavía.'}
            </p>
          </div>
        </div>

        {/* Panel Principal Derecho (Cambia según pestaña activa) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* TABS VIEW: PERFIL VISIBLE */}
          {activeTab === 'visible' && (
            <div className="glass-panel p-6 flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-theme-neon/10 pb-3">
                <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <FiUser className="text-theme-neon" /> Editar Perfil Visible
                </h3>
                
                {/* Status Indicator de Autoguardado */}
                <div className="text-xs font-semibold">
                  {savingState === 'saving' && (
                    <span className="text-theme-neon animate-pulse flex items-center gap-1.5">
                      <div className="w-2 h-2 border-2 border-theme-neon border-t-transparent rounded-full animate-spin"></div>
                      Guardando cambios...
                    </span>
                  )}
                  {savingState === 'saved' && (
                    <span className="text-theme-success flex items-center gap-1">
                      <FiCheckCircle size={14} /> Cambios guardados automáticamente
                    </span>
                  )}
                  {savingState === 'error' && (
                    <span className="text-red-400 flex items-center gap-1">
                      <FiAlertTriangle size={14} /> Error al guardar en red
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-5">
                {/* Campo Nickname */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-baseline">
                    <label htmlFor="inputNickname" className="text-[10px] uppercase tracking-widest font-bold text-theme-muted">Nombre Visible (En juego)</label>
                    <span className="text-[9px] text-theme-muted italic">Se guarda al salir del campo</span>
                  </div>
                  <input 
                    id="inputNickname"
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onBlur={(e) => handleAutoSave('nickname', e.target.value)}
                    placeholder="Ej. ShadowFang"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-theme-neon/40 focus:bg-black/60 transition-all font-semibold"
                  />
                </div>

                {/* Campo Bio */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-baseline">
                    <label htmlFor="inputBio" className="text-[10px] uppercase tracking-widest font-bold text-theme-muted">Biografía del Jugador</label>
                    <span className="text-[9px] text-theme-muted italic">Se guarda al salir del campo</span>
                  </div>
                  <textarea 
                    id="inputBio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    onBlur={(e) => handleAutoSave('bio', e.target.value)}
                    maxLength={250}
                    rows={5}
                    placeholder="Escribe algo sobre ti..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-theme-neon/40 focus:bg-black/60 transition-all leading-relaxed placeholder:text-theme-muted/20"
                  />
                  <span className="text-[10px] text-theme-muted text-right font-mono mt-0.5">
                    {bio.length}/250 caracteres
                  </span>
                </div>

                {/* Botón de acceso a modal de iconos alternativo */}
                <div className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-xl mt-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">Icono de Invocador</span>
                    <span className="text-[10px] text-theme-muted mt-0.5">Personaliza tu rastro holográfico de red</span>
                  </div>
                  <button 
                    onClick={() => setShowAvatarModal(true)}
                    className="neon-button border border-theme-neon/40 rounded-lg px-4 py-2 bg-theme-neon/10 hover:bg-theme-neon hover:text-theme-dark text-xs font-bold transition-all"
                  >
                    Seleccionar Icono
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* TABS VIEW: SEGURIDAD Y CONFIGURACIÓN */}
          {activeTab === 'security' && (
            <div className="flex flex-col gap-6">
              
              {/* Formulario de Cambio de Contraseña */}
              <div className="glass-panel p-6 flex flex-col gap-6">
                <h3 className="font-display text-xl font-bold text-white flex items-center gap-2 border-b border-theme-neon/10 pb-3">
                  <FiLock className="text-theme-neon" /> Cambiar Contraseña de Seguridad
                </h3>

                {passwordError && (
                  <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold flex items-center gap-2">
                    <FiAlertTriangle size={16} /> {passwordError}
                  </div>
                )}
                
                {passwordSuccess && (
                  <div className="p-3 bg-theme-success/10 text-theme-success border border-theme-success/20 rounded-lg text-xs font-bold flex items-center gap-2">
                    <FiCheckCircle size={16} /> {passwordSuccess}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="oldPwd" className="text-[10px] uppercase tracking-widest font-bold text-theme-muted">Contraseña Actual</label>
                      <input 
                        id="oldPwd"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-theme-neon/40 focus:bg-black/60 transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="newPwd" className="text-[10px] uppercase tracking-widest font-bold text-theme-muted">Nueva Contraseña</label>
                      <input 
                        id="newPwd"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-theme-neon/40 focus:bg-black/60 transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="confirmPwd" className="text-[10px] uppercase tracking-widest font-bold text-theme-muted">Confirmar Nueva Contraseña</label>
                      <input 
                        id="confirmPwd"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-theme-neon/40 focus:bg-black/60 transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={passwordLoading}
                    className="self-end neon-button border border-theme-neon/40 rounded-lg px-6 py-2.5 bg-theme-neon/10 hover:bg-theme-neon hover:text-theme-dark text-xs font-bold transition-all disabled:opacity-40"
                  >
                    {passwordLoading ? 'PROCESANDO...' : 'ACTUALIZAR CONTRASEÑA'}
                  </button>
                </form>
              </div>

              {/* Formulario de Cambio de DeathCloud ID Permanente */}
              <div className="glass-panel p-6 flex flex-col gap-6">
                <h3 className="font-display text-xl font-bold text-white flex items-center gap-2 border-b border-theme-neon/10 pb-3">
                  <FiSettings className="text-theme-neon" /> Cambiar DeathCloud ID Permanente
                </h3>
                
                <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-xs text-theme-muted leading-relaxed flex gap-2">
                  <FiAlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <strong className="text-red-400 block mb-0.5">ADVERTENCIA</strong>
                    <span>El <strong className="text-white">DeathCloud ID</strong> es tu identificador único de cuenta y se utiliza para fines de inicio de sesión y auditoría. Modificarlo es una acción de seguridad crítica y requiere tu contraseña actual.</span>
                  </div>
                </div>

                {idError && (
                  <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold flex items-center gap-2">
                    <FiAlertTriangle size={16} /> {idError}
                  </div>
                )}
                
                {idSuccess && (
                  <div className="p-3 bg-theme-success/10 text-theme-success border border-theme-success/20 rounded-lg text-xs font-bold flex items-center gap-2">
                    <FiCheckCircle size={16} /> {idSuccess}
                  </div>
                )}

                <form onSubmit={handleChangeDeathCloudId} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="newId" className="text-[10px] uppercase tracking-widest font-bold text-theme-muted">Nuevo DeathCloud ID</label>
                      <input 
                        id="newId"
                        type="text"
                        value={newDeathCloudId}
                        onChange={(e) => setNewDeathCloudId(e.target.value)}
                        placeholder="Ej. SebaCloud"
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-theme-neon/40 focus:bg-black/60 transition-all font-semibold"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="secPwd" className="text-[10px] uppercase tracking-widest font-bold text-theme-muted">Contraseña de Confirmación</label>
                      <input 
                        id="secPwd"
                        type="password"
                        value={securityPassword}
                        onChange={(e) => setSecurityPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-theme-neon/40 focus:bg-black/60 transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={idLoading}
                    className="self-end neon-button border border-theme-neon/40 rounded-lg px-6 py-2.5 bg-theme-neon/10 hover:bg-theme-neon hover:text-theme-dark text-xs font-bold transition-all disabled:opacity-40"
                  >
                    {idLoading ? 'PROCESANDO...' : 'ACTUALIZAR DEATHCLOUD ID'}
                  </button>
                </form>
              </div>

              {/* Panel de Sesiones Activas */}
              <div className="glass-panel p-6 flex flex-col gap-6">
                <h3 className="font-display text-xl font-bold text-white flex items-center gap-2 border-b border-theme-neon/10 pb-3">
                  <FiShield className="text-[#c084fc]" /> Sesiones Activas
                </h3>
                <p className="text-xs text-theme-muted leading-relaxed">
                  Estas son las sesiones activas actualmente en tu cuenta. Si no reconoces un dispositivo, revoca el acceso inmediatamente.
                </p>

                {sessionsLoading ? (
                  <div className="text-xs text-theme-muted flex items-center gap-2"><div className="w-4 h-4 border-2 border-theme-neon border-t-transparent rounded-full animate-spin"></div>Cargando sesiones...</div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {activeSessions.length === 0 ? (
                      <span className="text-xs text-theme-muted italic">No hay sesiones activas registradas.</span>
                    ) : (
                      activeSessions.map((session) => {
                        const isCurrent = session.token === (user?.token || localStorage.getItem('jwt_token'));
                        return (
                          <div key={session.id} className="bg-black/30 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4 transition-colors hover:bg-black/40">
                            <div className="flex items-center gap-4 overflow-hidden">
                              <div className="w-10 h-10 rounded-full bg-theme-neon/10 border border-theme-neon/30 flex items-center justify-center text-theme-neon shrink-0 shadow-neon-sm">
                                {session.os === 'Android' || session.os === 'iOS' ? <FiSmartphone size={20} /> : <FiMonitor size={20} />}
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-sm font-bold text-white flex items-center gap-2">
                                  {session.os} - {session.browser}
                                  {isCurrent && <span className="text-[9px] bg-theme-neon/20 text-theme-neon px-2 py-0.5 rounded-full uppercase tracking-wider">Sesión Actual</span>}
                                </span>
                                <span className="text-[10px] text-gray-500 font-mono mt-0.5">IP: {session.ip_address} • Iniciada: {new Date(session.fecha_creacion).toLocaleString()}</span>
                              </div>
                            </div>
                            
                            {isCurrent ? (
                              <button 
                                onClick={onLogout}
                                className="flex-shrink-0 text-xs font-bold bg-red-500/10 hover:bg-red-500/30 text-red-400 border border-red-500/40 hover:border-red-500 transition-colors px-4 py-2 rounded-lg"
                              >
                                Cerrar Sesión
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleRevokeSession(session.id)}
                                className="flex-shrink-0 text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/30 transition-colors px-4 py-2 rounded-lg"
                              >
                                Revocar
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col pb-8 pt-4 lg:pt-8 fade-in transition-all duration-500 max-w-5xl mx-auto w-full">
      
      {/* Title & Tabs Container */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-theme-neon/20 pb-4 mb-8">
        <div>
          <h1 className="font-display font-black text-4xl text-white tracking-wide uppercase" style={{ textShadow: '0 0 12px var(--theme-neon-glow)' }}>
            Configuración de Cuenta
          </h1>
          <p className="text-theme-muted uppercase tracking-[0.2em] text-[10px] font-semibold mt-1">
            Gestiona tu identidad de red en DeathCloud
          </p>
        </div>

        {/* Custom Tab Selector */}
        <div className="flex gap-2 mt-4 md:mt-0 bg-black/40 p-1.5 rounded-xl border border-white/5">
          <button 
            onClick={() => setActiveTab('visible')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'visible'
                ? 'bg-theme-neon text-theme-dark shadow-neon font-black'
                : 'text-theme-muted hover:text-white'
            }`}
          >
            <FiUser size={14} />
            PERFIL VISIBLE
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'inventory'
                ? 'bg-theme-neon text-theme-dark shadow-neon font-black'
                : 'text-theme-muted hover:text-white'
            }`}
          >
            <FiShoppingBag size={14} />
            INVENTARIO
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'security'
                ? 'bg-theme-neon text-theme-dark shadow-neon font-black'
                : 'text-theme-muted hover:text-white'
            }`}
          >
            <FiSettings size={14} />
            SEGURIDAD Y CUENTA
          </button>
        </div>
      </div>

      {renderContent()}
      {/* MODAL / MENU FLOTANTE PARA SELECCIONAR ICONO (PRESETS) */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel border border-theme-neon/40 shadow-neon-strong p-6 rounded-2xl relative">
            <button 
              onClick={() => setShowAvatarModal(false)}
              className="absolute top-4 right-4 text-theme-muted hover:text-white transition-colors"
            >
              <FiX size={20} />
            </button>
            
            <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider mb-4 border-b border-theme-neon/20 pb-2">
              Seleccionar Icono de Red
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
              {PRESET_AVATARS.map((avatar, idx) => (
                <button 
                  type="button"
                  key={avatar.name || idx}
                  onClick={() => handleAvatarSelect(avatar.url)}
                  className={`cursor-pointer bg-black/40 border p-3 rounded-xl flex flex-col items-center gap-3 transition-all hover:bg-black/60 group focus:outline-none ${
                    avatarUrl === avatar.url 
                      ? 'border-theme-neon shadow-neon' 
                      : 'border-white/5 hover:border-theme-neon/40'
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-b from-white/10 to-transparent border border-theme-neon/10 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
                    {avatar.url === 'none' ? (
                      <span className="text-xl text-theme-neon font-bold font-display">{(nickname || profile?.nombre_usuario || 'In').substring(0, 2).toUpperCase()}</span>
                    ) : (
                      <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <span className="text-[10px] text-white font-bold group-hover:text-theme-neon transition-colors text-center">{avatar.name}</span>
                </button>
              ))}
            </div>
            
            <div className="text-center text-[10px] text-theme-muted mt-2">
              El icono seleccionado se guardará de forma automática e inmediata en tu perfil.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

Profile.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    username: PropTypes.string,
    nickname: PropTypes.string,
    token: PropTypes.string
  }),
  updateUserSession: PropTypes.func,
  onLoginTrigger: PropTypes.func.isRequired,
  purchasedSkins: PropTypes.arrayOf(PropTypes.string),
  onLogout: PropTypes.func.isRequired
};
