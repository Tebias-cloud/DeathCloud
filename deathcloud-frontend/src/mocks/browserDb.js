// Base de datos simulada en el navegador utilizando localStorage

const DEFAULT_GAMES = [
  {
    id: 'deathcloud-runner',
    title: 'DeathCloud Runner',
    displayName: 'DeathCloud Runner',
    tagline: 'ESQUIVA LA LLUVIA ÁCIDA Y SOBREVIVE',
    subTagline: 'Esquiva la lluvia ácida y sobrevive',
    genre: 'Arcade / Platformer',
    status: 'active',
    theme: '0 210 255',
    image: 'assets/hero_bg.png',
    assets: { portada: 'assets/hero_bg.png' },
    created_at: new Date().toISOString(),
    leaderboard: [
      { rank: 1, name: 'ShadowFang', score: 24500, color: 'text-theme-neon' },
      { rank: 2, name: 'LunaMist', score: 19800, color: 'text-[#c084fc]' },
      { rank: 3, name: 'CyberNinja', score: 15200, color: 'text-[#f87171]' },
      { rank: 4, name: 'GhostRider', score: 11000, color: 'text-theme-muted' }
    ],
    store: [
      { id: 'skin-neon', title: 'Skin de Neón', category: 'aspectos', rarity: 'Legendario', rarityColor: 'text-[#00d2ff]', price: 150, image: 'assets/retro_skin.png', description: 'Una skin brillante para destacar en la nube tóxica.' },
      { id: 'axe-premium', title: 'Hacha Premium', category: 'armas', rarity: 'Épico', rarityColor: 'text-[#c084fc]', price: 300, image: 'assets/premium_axe.png', description: 'Hacha pesada con filo de plasma de alta frecuencia.' },
      { id: 'skin-toxic', title: 'Traje Tóxico', category: 'aspectos', rarity: 'Común', rarityColor: 'text-theme-muted', price: 200, image: 'assets/toxic_skin.png', description: 'Traje de contención biológica modificado para resistir lluvia ácida.' }
    ],
    news: [
      { id: 'news-1', title: '¡Nueva Actualización 2.2 ya disponible!', desc: 'Se han optimizado los saltos y corregido físicas de lluvia.', date: 'Hoy', image: 'assets/logo.png', likes: 120, dislikes: 5, rating: 4.8, comments_count: 3, fecha_creacion: new Date(Date.now() - 86400000).toISOString() },
      { id: 'news-2', title: 'Torneo del Sector 7 el próximo Sábado', desc: 'Inscríbete y compite por una skin legendaria exclusiva.', date: 'Ayer', image: 'assets/hero_bg.png', likes: 85, dislikes: 2, rating: 4.5, comments_count: 1, fecha_creacion: new Date(Date.now() - 86400000 * 2).toISOString() }
    ]
  },
  {
    id: 'deathcloud-toxic-skies',
    title: 'Toxic Skies',
    displayName: 'Toxic Skies',
    tagline: 'PILOTA ENTRE EL GAS Y DESTRUYE A LA CORPORACIÓN',
    subTagline: 'Pilota entre el gas y destruye la corporación',
    genre: 'Shoot \'em Up',
    status: 'active',
    theme: '121 40 202',
    image: 'assets/mech_shark.png',
    assets: { portada: 'assets/mech_shark.png' },
    created_at: new Date().toISOString(),
    leaderboard: [
      { rank: 1, name: 'NeonSamurai', score: 98000, color: 'text-theme-neon' },
      { rank: 2, name: 'PlasmaBurn', score: 84500, color: 'text-[#c084fc]' },
      { rank: 3, name: 'VoidWalker', score: 72100, color: 'text-[#f87171]' }
    ],
    store: [
      { id: 'ship-shield', title: 'Escudo Reforzado', category: 'aspectos', rarity: 'Épico', rarityColor: 'text-[#c084fc]', price: 250, image: 'assets/mech_shark.png', description: 'Escudo energético de plasma para aguantar más disparos.' }
    ],
    news: [
      { id: 'news-3', title: '¡Nuevos jefes añadidos al final del nivel!', desc: 'Prepárate para combatir contra la nave nodriza de la corporación.', date: 'Hace 2 días', image: 'assets/mech_shark.png', likes: 140, dislikes: 8, rating: 4.9, comments_count: 2, fecha_creacion: new Date(Date.now() - 86400000 * 3).toISOString() }
    ]
  },
  {
    id: 'deathcloud-2d-shooter',
    title: '2D Shooter',
    displayName: '2D Shooter',
    tagline: 'SOBREVIVE A OLEADAS DE ROBOTS MUTANTES',
    subTagline: 'Sobrevive a oleadas de robots mutantes',
    genre: 'Action / Shooter',
    status: 'active',
    theme: '255 0 128',
    image: 'assets/premium_axe.png',
    assets: { portada: 'assets/premium_axe.png' },
    created_at: new Date().toISOString(),
    leaderboard: [
      { rank: 1, name: 'StellarFox', score: 5600, color: 'text-theme-neon' },
      { rank: 2, name: 'QuantumLeap', score: 4800, color: 'text-[#c084fc]' }
    ],
    store: [
      { id: 'ammo-extended', title: 'Cargador Ampliado', category: 'armas', rarity: 'Común', rarityColor: 'text-theme-muted', price: 100, image: 'assets/premium_axe.png', description: 'Aumenta un 50% la capacidad de tu munición básica.' }
    ],
    news: [
      { id: 'news-4', title: 'Ajuste de equilibrio de armas', desc: 'Se incrementó el daño del rifle táctico y se redujo el tiempo de recarga.', date: 'Hace 3 días', image: 'assets/logo.png', likes: 62, dislikes: 1, rating: 4.2, comments_count: 0, fecha_creacion: new Date(Date.now() - 86400000 * 4).toISOString() }
    ]
  }
];

const DEFAULT_USERS = [
  { id: 1, nombre_usuario: 'admin', nickname: 'Administrador Red', email: 'admin@deathcloud.com', clave: 'admin123', rol: 'admin', baneado: false, avatarUrl: 'none', credits: 99999, purchasedSkins: [] },
  { id: 2, nombre_usuario: 'ShadowFang', nickname: 'ShadowFang', email: 'shadow@test.com', clave: 'player123', rol: 'user', baneado: false, avatarUrl: 'assets/retro_skin.png', credits: 2450, purchasedSkins: ['skin-neon'] },
  { id: 3, nombre_usuario: 'LunaMist', nickname: 'LunaMist', email: 'luna@test.com', clave: 'player123', rol: 'user', baneado: false, avatarUrl: 'none', credits: 1500, purchasedSkins: [] },
  { id: 4, nombre_usuario: 'CyberNinja', nickname: 'CyberNinja', email: 'cyber@test.com', clave: 'player123', rol: 'user', baneado: false, avatarUrl: 'none', credits: 800, purchasedSkins: [] },
  { id: 5, nombre_usuario: 'GhostRider', nickname: 'GhostRider', email: 'ghost@test.com', clave: 'player123', rol: 'user', baneado: false, avatarUrl: 'none', credits: 1200, purchasedSkins: [] },
  { id: 6, nombre_usuario: 'NeonSamurai', nickname: 'NeonSamurai', email: 'neon@test.com', clave: 'player123', rol: 'user', baneado: false, avatarUrl: 'none', credits: 3500, purchasedSkins: [] },
  { id: 7, nombre_usuario: 'PlasmaBurn', nickname: 'PlasmaBurn', email: 'plasma@test.com', clave: 'player123', rol: 'user', baneado: false, avatarUrl: 'none', credits: 500, purchasedSkins: [] },
  { id: 8, nombre_usuario: 'VoidWalker', nickname: 'VoidWalker', email: 'void@test.com', clave: 'player123', rol: 'user', baneado: false, avatarUrl: 'none', credits: 400, purchasedSkins: [] }
];

const DEFAULT_POSTS = [
  {
    id: 1,
    game_id: 'deathcloud-runner',
    title: '¿Cuál es la mejor estrategia para superar los 20,000 puntos?',
    content: 'Hola sobrevivientes. He estado atrapado en 18,000 por una semana. El ácido empieza a caer tan rápido que mis saltos de plataforma se desfasan. ¿Algún truco con el dash?',
    author: 'LunaMist',
    likes: 12,
    replies: '3',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 2,
    game_id: 'deathcloud-runner',
    title: '¡Nueva skin de Neón comprada! Se ve espectacular',
    content: 'Acabo de juntar los E-Points para la skin de Neón y brilla de una manera genial en el modo oscuro. Súper recomendado ahorrar para este aspecto.',
    author: 'ShadowFang',
    likes: 8,
    replies: '1',
    created_at: new Date(Date.now() - 3600000 * 20).toISOString()
  },
  {
    id: 3,
    game_id: 'deathcloud-toxic-skies',
    title: 'El Jefe del Nivel 3 está demasiado roto',
    content: '¿Cómo esquivan la ráfaga de plasma triple de la nave nodriza corporativa? Literalmente cubre el 80% de la pantalla y el escudo normal no aguanta.',
    author: 'PlasmaBurn',
    likes: 15,
    replies: '2',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

const DEFAULT_REPLIES = {
  1: [
    { id: 101, author: 'ShadowFang', content: 'Debes guardar el doble salto solo para las plataformas flotantes y hacer el dash justo antes de tocar el suelo para ganar inercia.', created_at: new Date(Date.now() - 3600000 * 4).toISOString(), likes: 5 },
    { id: 102, author: 'CyberNinja', content: 'Exacto, y memoriza la secuencia. Los patrones se repiten cada 3 minutos.', created_at: new Date(Date.now() - 3600000 * 3).toISOString(), likes: 2 },
    { id: 103, author: 'LunaMist', content: '¡Gracias! Intentaré eso hoy.', created_at: new Date(Date.now() - 3600000 * 2).toISOString(), likes: 0 }
  ],
  2: [
    { id: 104, author: 'GhostRider', content: '¡Sí! Es de mis favoritas, vale totalmente la pena.', created_at: new Date(Date.now() - 3600000 * 18).toISOString(), likes: 1 }
  ],
  3: [
    { id: 105, author: 'NeonSamurai', content: 'Necesitas equipar la mejora "Escudo Reforzado" en la Tienda del Sector. Sin eso es casi imposible esquivar todo.', created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(), likes: 8 },
    { id: 106, author: 'VoidWalker', content: 'O intenta ir por la esquina inferior izquierda, hay un punto ciego temporal.', created_at: new Date(Date.now() - 3600000 * 1).toISOString(), likes: 3 }
  ]
};

const DEFAULT_NEWS_COMMENTS = {
  'news-1': [
    { id: 201, nombre_usuario: 'CyberNinja', comentario: 'Por fin corrigieron el bug de colisión en la lluvia, ¡buen trabajo!', fecha_comentario: new Date(Date.now() - 3600000).toISOString() },
    { id: 202, nombre_usuario: 'LunaMist', comentario: 'Me encantan las nuevas físicas de salto, se sienten más responsivas.', fecha_comentario: new Date(Date.now() - 1800000).toISOString() }
  ],
  'news-2': [
    { id: 203, nombre_usuario: 'ShadowFang', comentario: '¡Allí estaré! Voy por esa skin.', fecha_comentario: new Date(Date.now() - 10000000).toISOString() }
  ]
};

const DEFAULT_TICKETS = [
  { id: 1001, usuario_id: 2, titulo: 'Falla al procesar la compra de Skin de Neón', descripcion: 'Descontaron mis E-Points pero no aparecía habilitado el botón en el inventario. Se solucionó después de recargar la página.', categoria: 'tienda', estado: 'resuelto', fecha_creacion: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 1002, usuario_id: 3, titulo: 'Latencia inusual en centro social', descripcion: 'A veces los mensajes del chat global tardan varios segundos en transmitirse.', categoria: 'conexion', estado: 'en_progreso', fecha_creacion: new Date(Date.now() - 86400000).toISOString() },
  { id: 1003, usuario_id: 4, titulo: 'Bug visual de lluvia ácida', descripcion: 'Las partículas caen en color fucsia temporalmente en vez de verde fluorescente en la skin básica.', categoria: 'bug', estado: 'abierto', fecha_creacion: new Date().toISOString() }
];

const DEFAULT_CHAT_HISTORY = [
  { usuario: 'ShadowFang', texto: '¿Alguien para jugar Toxic Skies?', hora: '12:05' },
  { usuario: 'LunaMist', texto: 'Yo me uno en 10 minutos, voy terminando una run de Runner.', hora: '12:06' },
  { usuario: 'NeonSamurai', texto: 'Gente, ¿vieron las nuevas skins de la tienda? Están increíbles.', hora: '12:08' },
  { usuario: 'CyberNinja', texto: 'Sí, ya compré la espada de plasma.', hora: '12:09' }
];

const DEFAULT_FRIENDSHIPS = [
  { id: 1, usuario_id_envia: 2, usuario_id_recibe: 3, estado: 'aceptado' }, // ShadowFang - LunaMist
  { id: 2, usuario_id_envia: 2, usuario_id_recibe: 4, estado: 'aceptado' }, // ShadowFang - CyberNinja
  { id: 3, usuario_id_envia: 3, usuario_id_recibe: 5, estado: 'aceptado' }, // LunaMist - GhostRider
  { id: 4, usuario_id_envia: 6, usuario_id_recibe: 2, estado: 'pendiente' }  // NeonSamurai -> ShadowFang (pendiente)
];

const DEFAULT_PRIVATE_MESSAGES = [
  { id: 1, sender_id: 3, receiver_id: 2, content: 'Hola Shadow, ¿jugamos luego?', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, sender_id: 2, receiver_id: 3, content: '¡Claro! Avisa cuando estés lista.', created_at: new Date(Date.now() - 3000000).toISOString() }
];

const DEFAULT_REPORTS = [
  { id: 1, comentario_id: 202, denunciante: 'GhostRider', comentario_original: 'Me encantan las nuevas físicas de salto...', motivo: 'Spam o Publicidad', fecha: new Date().toISOString(), estado: 'Pendiente' }
];

// Inicialización de la DB local
export const initDb = () => {
  if (!localStorage.getItem('dc_initialized')) {
    localStorage.setItem('dc_games', JSON.stringify(DEFAULT_GAMES));
    localStorage.setItem('dc_users', JSON.stringify(DEFAULT_USERS));
    localStorage.setItem('dc_posts', JSON.stringify(DEFAULT_POSTS));
    localStorage.setItem('dc_replies', JSON.stringify(DEFAULT_REPLIES));
    localStorage.setItem('dc_news_comments', JSON.stringify(DEFAULT_NEWS_COMMENTS));
    localStorage.setItem('dc_tickets', JSON.stringify(DEFAULT_TICKETS));
    localStorage.setItem('dc_chat_history', JSON.stringify(DEFAULT_CHAT_HISTORY));
    localStorage.setItem('dc_friendships', JSON.stringify(DEFAULT_FRIENDSHIPS));
    localStorage.setItem('dc_private_messages', JSON.stringify(DEFAULT_PRIVATE_MESSAGES));
    localStorage.setItem('dc_reports', JSON.stringify(DEFAULT_REPORTS));
    
    // Iniciar con sesiones vacías
    localStorage.setItem('dc_sessions', JSON.stringify([
      { id: 1, usuario_id: 2, token: 'fake_token_shadow', ip_address: '192.168.1.101', user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0' }
    ]));

    localStorage.setItem('dc_initialized', 'true');
    console.log('🔌 Base de datos local DeathCloud Net inicializada con éxito.');
  }
};

// Utilidades de Lectura/Escritura genéricas
const getTable = (key) => JSON.parse(localStorage.getItem(key)) || [];
const saveTable = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// --- API METHODS SIMULATORS ---

export const dbMethods = {
  // CATÁLOGO JUEGOS
  getGames() {
    return getTable('dc_games');
  },

  createGame(game) {
    const games = getTable('dc_games');
    const newGame = {
      id: game.displayname.toLowerCase().replaceAll(' ', '-'),
      displayName: game.displayname,
      title: game.displayname,
      tagline: game.tagline || 'TRANSIMISIÓN EN LÍNEA',
      subTagline: game.subtagline || '',
      genre: 'Acción / Aventura',
      status: 'active',
      theme: game.theme || '0 210 255',
      image: game.imageUrl || 'assets/logo.png',
      assets: { portada: game.imageUrl || 'assets/logo.png' },
      created_at: new Date().toISOString(),
      leaderboard: [],
      store: [],
      news: []
    };
    games.push(newGame);
    saveTable('dc_games', games);
    return newGame.id;
  },

  updateGame(id, data) {
    const games = getTable('dc_games');
    const idx = games.findIndex(g => g.id === id);
    if (idx !== -1) {
      games[idx] = {
        ...games[idx],
        displayName: data.displayname || data.displayName || games[idx].displayName,
        title: data.displayname || data.title || games[idx].title,
        tagline: data.tagline || games[idx].tagline,
        subTagline: data.subtagline || games[idx].subTagline,
        theme: data.theme || games[idx].theme,
        image: data.imageUrl || data.image || games[idx].image,
        assets: { portada: data.imageUrl || data.image || games[idx].image }
      };
      saveTable('dc_games', games);
      return true;
    }
    return false;
  },

  deleteGame(id) {
    const games = getTable('dc_games');
    const filtered = games.filter(g => g.id !== id);
    saveTable('dc_games', filtered);
    return true;
  },

  // TIENDA ITEMS
  createStoreItem(item) {
    const games = getTable('dc_games');
    const gameIdx = games.findIndex(g => g.id === item.game_id);
    if (gameIdx !== -1) {
      const newItem = {
        id: item.id || `skin-${Date.now()}`,
        title: item.title,
        category: item.category || 'aspectos',
        rarity: item.rarity || 'Común',
        rarityColor: item.rarityColor || 'text-theme-muted',
        price: Number.parseInt(item.price, 10) || 100,
        image: item.image || 'assets/logo.png',
        description: item.description
      };
      games[gameIdx].store = games[gameIdx].store || [];
      games[gameIdx].store.push(newItem);
      saveTable('dc_games', games);
      return true;
    }
    return false;
  },

  updateStoreItem(id, item) {
    const games = getTable('dc_games');
    let updated = false;
    games.forEach((g) => {
      if (g.store) {
        const idx = g.store.findIndex(i => i.id === id);
        if (idx !== -1) {
          g.store[idx] = {
            ...g.store[idx],
            title: item.title || g.store[idx].title,
            category: item.category || g.store[idx].category,
            rarity: item.rarity || g.store[idx].rarity,
            rarityColor: item.rarityColor || g.store[idx].rarityColor,
            price: Number.parseInt(item.price, 10) || g.store[idx].price,
            image: item.image || g.store[idx].image,
            description: item.description || g.store[idx].description
          };
          updated = true;
        }
      }
    });
    if (updated) saveTable('dc_games', games);
    return updated;
  },

  deleteStoreItem(id) {
    const games = getTable('dc_games');
    let updated = false;
    games.forEach((g) => {
      if (g.store) {
        const lengthBefore = g.store.length;
        g.store = g.store.filter(i => i.id !== id);
        if (g.store.length !== lengthBefore) updated = true;
      }
    });
    if (updated) saveTable('dc_games', games);
    return updated;
  },

  // NOTICIAS ARTICLES
  createNews(news) {
    const games = getTable('dc_games');
    const gameIdx = games.findIndex(g => g.id === news.game_id);
    if (gameIdx !== -1) {
      const newArticle = {
        id: news.id || `news-${Date.now()}`,
        title: news.title,
        desc: news.description || news.desc,
        date: 'Hoy',
        image: news.image || 'assets/logo.png',
        likes: 0,
        dislikes: 0,
        rating: 5.0,
        comments_count: 0
      };
      games[gameIdx].news = games[gameIdx].news || [];
      games[gameIdx].news.push(newArticle);
      saveTable('dc_games', games);
      return true;
    }
    return false;
  },

  updateNews(id, news) {
    const games = getTable('dc_games');
    let updated = false;
    games.forEach((g) => {
      if (g.news) {
        const idx = g.news.findIndex(n => n.id === id);
        if (idx !== -1) {
          g.news[idx] = {
            ...g.news[idx],
            title: news.title || g.news[idx].title,
            desc: news.description || news.desc || g.news[idx].desc,
            image: news.image || g.news[idx].image
          };
          updated = true;
        }
      }
    });
    if (updated) saveTable('dc_games', games);
    return updated;
  },

  deleteNews(id) {
    const games = getTable('dc_games');
    let updated = false;
    games.forEach((g) => {
      if (g.news) {
        const lengthBefore = g.news.length;
        g.news = g.news.filter(n => n.id !== id);
        if (g.news.length !== lengthBefore) updated = true;
      }
    });
    if (updated) saveTable('dc_games', games);
    return updated;
  },

  // AUTENTICACIÓN
  login(email, password) {
    const users = getTable('dc_users');
    const user = users.find(u => (u.email === email || u.nombre_usuario === email) && u.clave === password);
    if (!user) return { success: false, message: 'Credenciales inválidas.' };
    if (user.baneado) return { success: false, message: 'Esta cuenta ha sido suspendida administrativamente.' };

    const token = `mock_jwt_${user.nombre_usuario}_${Date.now()}`;
    
    // Registrar sesión activa
    const sessions = getTable('dc_sessions');
    sessions.push({
      id: Date.now(),
      usuario_id: user.id,
      token,
      ip_address: '127.0.0.1',
      user_agent: navigator.userAgent
    });
    saveTable('dc_sessions', sessions);

    return {
      success: true,
      token,
      id: user.id,
      username: user.nombre_usuario,
      nickname: user.nickname,
      rol: user.rol,
      avatar_url: user.avatarUrl
    };
  },

  register(username, email, password) {
    const users = getTable('dc_users');
    if (users.some(u => u.nombre_usuario.toLowerCase() === username.toLowerCase())) {
      return { success: false, message: 'El nombre de usuario ya está registrado.' };
    }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'El correo electrónico ya está registrado.' };
    }

    const newUser = {
      id: Date.now(),
      nombre_usuario: username,
      nickname: username,
      email,
      clave: password,
      rol: 'user',
      baneado: false,
      avatarUrl: 'none',
      credits: 500, // Regalo de bienvenida
      purchasedSkins: [],
      created_at: new Date().toISOString(),
      fecha_creacion: new Date().toISOString()
    };

    users.push(newUser);
    saveTable('dc_users', users);

    // Iniciar sesión automático
    return this.login(username, password);
  },

  // GESTIÓN PERFIL
  getProfile(token) {
    const sessions = getTable('dc_sessions');
    const session = sessions.find(s => s.token === token);
    if (!session) return { success: false, message: 'No autorizado' };

    const users = getTable('dc_users');
    const user = users.find(u => u.id === session.usuario_id);
    if (!user) return { success: false, message: 'Usuario no encontrado' };

    return {
      success: true,
      user: {
        id: user.id,
        username: user.nombre_usuario,
        nickname: user.nickname,
        email: user.email,
        bio: user.bio || '',
        avatarUrl: user.avatarUrl,
        rol: user.rol
      }
    };
  },

  updateProfile(token, payload) {
    const sessions = getTable('dc_sessions');
    const session = sessions.find(s => s.token === token);
    if (!session) return { success: false, message: 'No autorizado' };

    const users = getTable('dc_users');
    const idx = users.findIndex(u => u.id === session.usuario_id);
    if (idx !== -1) {
      users[idx].nickname = payload.nickname || users[idx].nickname;
      users[idx].bio = payload.bio !== undefined ? payload.bio : users[idx].bio;
      users[idx].avatarUrl = payload.avatar_url || users[idx].avatarUrl;
      saveTable('dc_users', users);

      return {
        success: true,
        user: {
          id: users[idx].id,
          username: users[idx].nombre_usuario,
          nickname: users[idx].nickname,
          avatarUrl: users[idx].avatarUrl
        }
      };
    }
    return { success: false, message: 'Error de perfil' };
  },

  changePassword(token, oldPassword, newPassword) {
    const sessions = getTable('dc_sessions');
    const session = sessions.find(s => s.token === token);
    if (!session) return { success: false, message: 'No autorizado' };

    const users = getTable('dc_users');
    const idx = users.findIndex(u => u.id === session.usuario_id);
    if (idx !== -1) {
      if (users[idx].clave !== oldPassword) return { success: false, message: 'La contraseña actual es incorrecta.' };
      users[idx].clave = newPassword;
      saveTable('dc_users', users);
      return { success: true };
    }
    return { success: false, message: 'Error' };
  },

  changeDeathCloudId(token, password, newDeathCloudId) {
    const sessions = getTable('dc_sessions');
    const session = sessions.find(s => s.token === token);
    if (!session) return { success: false, message: 'No autorizado' };

    const users = getTable('dc_users');
    const idx = users.findIndex(u => u.id === session.usuario_id);
    if (idx !== -1) {
      if (users[idx].clave !== password) return { success: false, message: 'Contraseña incorrecta.' };
      // Simular cambio de ID (cambiar nombre de usuario y nickname)
      users[idx].nombre_usuario = newDeathCloudId;
      users[idx].nickname = newDeathCloudId;
      saveTable('dc_users', users);
      return { success: true };
    }
    return { success: false, message: 'Error' };
  },

  getSessions(token) {
    const sessions = getTable('dc_sessions');
    const session = sessions.find(s => s.token === token);
    if (!session) return { success: false, message: 'No autorizado' };

    const allSessions = sessions.filter(s => s.usuario_id === session.usuario_id);
    return {
      success: true,
      sessions: allSessions.map(s => ({
        id: s.id,
        ip_address: s.ip_address,
        user_agent: s.user_agent,
        is_current: s.token === token,
        fecha_creacion: s.created_at || s.fecha_creacion || new Date(s.id || Date.now()).toISOString()
      }))
    };
  },

  revokeSession(token, sessionId) {
    const sessions = getTable('dc_sessions');
    const filtered = sessions.filter(s => !(s.id === Number.parseInt(sessionId, 10)));
    saveTable('dc_sessions', filtered);
    return { success: true };
  },

  // CRÉDITOS E INVENTARIO
  getCredits(token) {
    const sessions = getTable('dc_sessions');
    const session = sessions.find(s => s.token === token);
    if (!session) return { success: false, message: 'No autorizado' };

    const users = getTable('dc_users');
    const user = users.find(u => u.id === session.usuario_id);
    return { success: true, credits: user ? user.credits : 0 };
  },

  getInventory(token) {
    const sessions = getTable('dc_sessions');
    const session = sessions.find(s => s.token === token);
    if (!session) return { success: false, message: 'No autorizado' };

    const users = getTable('dc_users');
    const user = users.find(u => u.id === session.usuario_id);
    return { success: true, skins: user ? (user.purchasedSkins || []) : [] };
  },

  buySkin(token, gameId, skinId, price) {
    const sessions = getTable('dc_sessions');
    const session = sessions.find(s => s.token === token);
    if (!session) return { success: false, message: 'No autorizado' };

    const users = getTable('dc_users');
    const idx = users.findIndex(u => u.id === session.usuario_id);
    if (idx !== -1) {
      if (users[idx].credits < price) {
        return { success: false, message: 'E-Points insuficientes.' };
      }
      users[idx].credits -= price;
      users[idx].purchasedSkins = users[idx].purchasedSkins || [];
      if (!users[idx].purchasedSkins.includes(skinId)) {
        users[idx].purchasedSkins.push(skinId);
      }
      saveTable('dc_users', users);
      return { success: true, credits: users[idx].credits };
    }
    return { success: false, message: 'Usuario no encontrado' };
  },

  // LEADERBOARDS
  getLeaderboard(gameId) {
    const games = getTable('dc_games');
    const game = games.find(g => g.id === gameId);
    return { success: true, leaderboard: game ? (game.leaderboard || []) : [] };
  },

  // COMMENTS & INTERACTIONS NOTICIAS
  getNewsComments(newsId) {
    const comments = getTable('dc_news_comments');
    return { success: true, data: comments[newsId] || [] };
  },

  addNewsComment(token, newsId, payload) {
    const comments = getTable('dc_news_comments');
    const newComment = {
      id: Date.now(),
      nombre_usuario: payload.nombre_usuario || 'Anónimo',
      comentario: payload.comentario,
      fecha_comentario: new Date().toISOString()
    };
    comments[newsId] = comments[newsId] || [];
    comments[newsId].push(newComment);
    saveTable('dc_news_comments', comments);

    // Incrementar conteo en el catálogo
    const games = getTable('dc_games');
    games.forEach((g) => {
      if (g.news) {
        const n = g.news.find(a => a.id === newsId);
        if (n) n.comments_count = (n.comments_count || 0) + 1;
      }
    });
    saveTable('dc_games', games);

    return { success: true, data: newComment };
  },

  reactToNews(newsId, tipo) {
    const games = getTable('dc_games');
    let success = false;
    games.forEach((g) => {
      if (g.news) {
        const n = g.news.find(a => a.id === newsId);
        if (n) {
          if (tipo === 'like') n.likes = (n.likes || 0) + 1;
          else if (tipo === 'dislike') n.dislikes = (n.dislikes || 0) + 1;
          success = true;
        }
      }
    });
    if (success) saveTable('dc_games', games);
    return { success };
  },

  rateNews(newsId, estrellas) {
    const games = getTable('dc_games');
    let success = false;
    games.forEach((g) => {
      if (g.news) {
        const n = g.news.find(a => a.id === newsId);
        if (n) {
          // Promedio móvil simulado
          const currentRating = n.rating || 5.0;
          n.rating = Number.parseFloat(((currentRating * 4 + estrellas) / 5).toFixed(1));
          success = true;
        }
      }
    });
    if (success) saveTable('dc_games', games);
    return { success };
  },

  // FORO DE COMUNIDAD
  getNewsByGame(gameId) {
    const games = getTable('dc_games');
    const game = games.find(g => g.id === gameId);
    return { success: true, data: game ? (game.news || []) : [] };
  },

  getPosts(gameId) {
    const posts = getTable('dc_posts');
    const filtered = posts.filter(p => p.game_id === gameId).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    return { success: true, posts: filtered };
  },

  createPost(token, gameId, title, content) {
    const sessions = getTable('dc_sessions');
    const session = sessions.find(s => s.token === token);
    if (!session) return { success: false, message: 'No autorizado' };

    const users = getTable('dc_users');
    const user = users.find(u => u.id === session.usuario_id);

    const posts = getTable('dc_posts');
    const newPost = {
      id: Date.now(),
      game_id: gameId,
      title,
      content,
      author: user ? user.nickname : 'Anónimo',
      likes: 0,
      replies: '0',
      created_at: new Date().toISOString()
    };
    posts.unshift(newPost);
    saveTable('dc_posts', posts);

    return { success: true, post: newPost };
  },

  getReplies(postId) {
    const replies = getTable('dc_replies');
    return { success: true, replies: replies[postId] || [] };
  },

  createReply(token, gameId, postId, content) {
    const sessions = getTable('dc_sessions');
    const session = sessions.find(s => s.token === token);
    if (!session) return { success: false, message: 'No autorizado' };

    const users = getTable('dc_users');
    const user = users.find(u => u.id === session.usuario_id);

    const replies = getTable('dc_replies');
    const newReply = {
      id: Date.now(),
      author: user ? user.nickname : 'Anónimo',
      content,
      created_at: new Date().toISOString(),
      likes: 0
    };
    replies[postId] = replies[postId] || [];
    replies[postId].push(newReply);
    saveTable('dc_replies', replies);

    // Incrementar conteo en posts
    const posts = getTable('dc_posts');
    const idx = posts.findIndex(p => p.id === Number.parseInt(postId, 10));
    if (idx !== -1) {
      posts[idx].replies = String(Number.parseInt(posts[idx].replies, 10) + 1);
      saveTable('dc_posts', posts);
    }

    return { success: true, reply: newReply };
  },

  likePost(postId) {
    const posts = getTable('dc_posts');
    const idx = posts.findIndex(p => p.id === Number.parseInt(postId, 10));
    let likes = 0;
    if (idx !== -1) {
      posts[idx].likes = (posts[idx].likes || 0) + 1;
      likes = posts[idx].likes;
      saveTable('dc_posts', posts);
    }
    return { success: true, likes };
  },

  likeReply(postId, replyId) {
    const replies = getTable('dc_replies');
    let likes = 0;
    if (replies[postId]) {
      const idx = replies[postId].findIndex(r => r.id === Number.parseInt(replyId, 10));
      if (idx !== -1) {
        replies[postId][idx].likes = (replies[postId][idx].likes || 0) + 1;
        likes = replies[postId][idx].likes;
        saveTable('dc_replies', replies);
      }
    }
    return { success: true, likes };
  },

  // TICKETS DE SOPORTE
  getTickets(token) {
    const sessions = getTable('dc_sessions');
    const session = sessions.find(s => s.token === token);
    if (!session) return { success: false, message: 'No autorizado' };

    const tickets = getTable('dc_tickets');
    const filtered = tickets.filter(t => t.usuario_id === session.usuario_id);
    return { success: true, tickets: filtered };
  },

  createTicket(token, title, description, category) {
    const sessions = getTable('dc_sessions');
    const session = sessions.find(s => s.token === token);
    if (!session) return { success: false, message: 'No autorizado' };

    const tickets = getTable('dc_tickets');
    const newTicket = {
      id: Date.now() % 100000,
      usuario_id: session.usuario_id,
      titulo: title,
      descripcion: description,
      categoria: category,
      estado: 'abierto',
      fecha_creacion: new Date().toISOString()
    };
    tickets.unshift(newTicket);
    saveTable('dc_tickets', tickets);
    return { success: true, ticket: newTicket };
  },

  // CENTRO SOCIAL (AMIGOS & RELACIONES)
  getFriends(token) {
    const sessions = getTable('dc_sessions');
    const session = sessions.find(s => s.token === token);
    if (!session) return { success: false, message: 'No autorizado' };

    const friendships = getTable('dc_friendships');
    const users = getTable('dc_users');

    const friends = [];
    const incoming = [];
    const outgoing = [];

    friendships.forEach((f) => {
      if (f.usuario_id_envia === session.usuario_id) {
        const other = users.find(u => u.id === f.usuario_id_recibe);
        if (other) {
          const detail = {
            id: f.id,
            user_id: other.id,
            nombre_usuario: other.nombre_usuario,
            nickname: other.nickname,
            avatar_url: other.avatarUrl,
            status: 'online' // Simular que siempre están online para la demo
          };
          if (f.estado === 'aceptado') friends.push(detail);
          else outgoing.push({ ...detail, requestId: f.id });
        }
      } else if (f.usuario_id_recibe === session.usuario_id) {
        const other = users.find(u => u.id === f.usuario_id_envia);
        if (other) {
          const detail = {
            id: f.id,
            user_id: other.id,
            nombre_usuario: other.nombre_usuario,
            nickname: other.nickname,
            avatar_url: other.avatarUrl,
            status: 'online'
          };
          if (f.estado === 'aceptado') friends.push(detail);
          else incoming.push({ ...detail, requestId: f.id });
        }
      }
    });

    return {
      success: true,
      friends,
      requests: { incoming, outgoing }
    };
  },

  sendFriendRequest(token, targetUsername) {
    const sessions = getTable('dc_sessions');
    const session = sessions.find(s => s.token === token);
    if (!session) return { success: false, message: 'No autorizado' };

    const users = getTable('dc_users');
    const target = users.find(u => u.nombre_usuario.toLowerCase() === targetUsername.toLowerCase() || u.nickname.toLowerCase() === targetUsername.toLowerCase());
    if (!target) return { success: false, message: 'El usuario no existe.' };
    if (target.id === session.usuario_id) return { success: false, message: 'No puedes enviarte una solicitud a ti mismo.' };

    const friendships = getTable('dc_friendships');
    const existing = friendships.find(f => 
      (f.usuario_id_envia === session.usuario_id && f.usuario_id_recibe === target.id) ||
      (f.usuario_id_envia === target.id && f.usuario_id_recibe === session.usuario_id)
    );

    if (existing) {
      if (existing.estado === 'aceptado') return { success: false, message: 'Ya son amigos en la red.' };
      return { success: false, message: 'Ya existe una solicitud pendiente.' };
    }

    const newReq = {
      id: Date.now(),
      usuario_id_envia: session.usuario_id,
      usuario_id_recibe: target.id,
      estado: 'pendiente'
    };
    friendships.push(newReq);
    saveTable('dc_friendships', friendships);

    return { success: true, message: `Solicitud enviada a ${target.nickname}.` };
  },

  respondFriendRequest(token, requestId, action) {
    const friendships = getTable('dc_friendships');
    const idx = friendships.findIndex(f => f.id === requestId);
    if (idx !== -1) {
      if (action === 'accept') {
        friendships[idx].estado = 'aceptado';
      } else {
        friendships.splice(idx, 1);
      }
      saveTable('dc_friendships', friendships);
      return { success: true };
    }
    return { success: false, message: 'Solicitud no encontrada.' };
  },

  removeFriend(token, friendshipId) {
    const friendships = getTable('dc_friendships');
    const filtered = friendships.filter(f => f.id !== Number.parseInt(friendshipId, 10));
    saveTable('dc_friendships', filtered);
    return { success: true };
  },

  getPublicProfile(token, username) {
    const users = getTable('dc_users');
    const user = users.find(u => u.nombre_usuario.toLowerCase() === username.toLowerCase() || u.nickname.toLowerCase() === username.toLowerCase());
    if (!user) return { success: false, message: 'Perfil no encontrado.' };

    return {
      success: true,
      user: {
        id: user.id,
        username: user.nombre_usuario,
        nickname: user.nickname,
        bio: user.bio || 'Sobreviviente de la nube tóxica de la red DeathCloud.',
        avatarUrl: user.avatarUrl,
        rol: user.rol,
        credits: user.credits,
        fecha_creacion: user.created_at || user.fecha_creacion || (user.id > 1000 ? new Date(user.id).toISOString() : new Date(Date.now() - 86400000 * (10 - user.id)).toISOString())
      }
    };
  },

  // MODERACIÓN Y REPORTES
  reportComment(token, commentId, reason) {
    const reports = getTable('dc_reports');
    const comments = getTable('dc_news_comments');
    
    // Buscar comentario
    let commentAuthor = 'Desconocido';
    let commentText = 'Contenido inaccesible';
    Object.entries(comments).forEach(([_, list]) => {
      const found = list.find(c => c.id === commentId);
      if (found) {
        commentAuthor = found.nombre_usuario;
        commentText = found.comentario;
      }
    });

    const newReport = {
      id: Date.now() % 10000,
      comentario_id: commentId,
      denunciante: 'Usuario Web',
      comentario_original: commentText,
      motivo: reason,
      fecha: new Date().toISOString(),
      estado: 'Pendiente'
    };
    reports.unshift(newReport);
    saveTable('dc_reports', reports);
    return { success: true };
  },

  getReportsList() {
    return { success: true, data: getTable('dc_reports') };
  },

  approveReport(reportId) {
    const reports = getTable('dc_reports');
    const idx = reports.findIndex(r => r.id === Number.parseInt(reportId, 10));
    if (idx !== -1) {
      reports[idx].estado = 'Aprobado';
      saveTable('dc_reports', reports);
      return { success: true };
    }
    return { success: false, message: 'Reporte no encontrado' };
  },

  deleteComment(commentId) {
    const comments = getTable('dc_news_comments');
    let found = false;
    Object.keys(comments).forEach((newsId) => {
      const initialLen = comments[newsId].length;
      comments[newsId] = comments[newsId].filter(c => c.id !== Number.parseInt(commentId, 10));
      if (comments[newsId].length !== initialLen) found = true;
    });
    if (found) saveTable('dc_news_comments', comments);

    // Eliminar reportes asociados
    const reports = getTable('dc_reports');
    const filteredReports = reports.filter(r => r.comentario_id !== Number.parseInt(commentId, 10));
    saveTable('dc_reports', filteredReports);

    return { success: true };
  },

  // TERMINAL CONTROL ADMIN
  getUsersList() {
    const users = getTable('dc_users');
    return {
      success: true,
      users: users.map(u => ({
        id: u.id,
        nombre_usuario: u.nombre_usuario,
        nickname: u.nickname,
        email: u.email,
        rol: u.rol,
        baneado: u.baneado,
        motivo_ban: u.motivo_ban || null,
        fecha_creacion: u.created_at || u.fecha_creacion || (u.id > 1000 ? new Date(u.id).toISOString() : new Date(Date.now() - 86400000 * (10 - u.id)).toISOString())
      }))
    };
  },

  getAdminTickets() {
    const tickets = getTable('dc_tickets');
    return { success: true, tickets };
  },

  updateTicketStatus(ticketId, newStatus) {
    const tickets = getTable('dc_tickets');
    const idx = tickets.findIndex(t => t.id === Number.parseInt(ticketId, 10));
    if (idx !== -1) {
      tickets[idx].estado = newStatus;
      saveTable('dc_tickets', tickets);
      return { success: true };
    }
    return { success: false, message: 'Ticket no encontrado.' };
  },

  toggleBan(userId, isBanning, reason) {
    const users = getTable('dc_users');
    const idx = users.findIndex(u => u.id === Number.parseInt(userId, 10));
    if (idx !== -1) {
      users[idx].baneado = isBanning;
      users[idx].motivo_ban = isBanning ? reason : null;
      saveTable('dc_users', users);
      
      // Revocar sesiones si es baneado
      if (isBanning) {
        const sessions = getTable('dc_sessions');
        const filtered = sessions.filter(s => s.usuario_id !== Number.parseInt(userId, 10));
        saveTable('dc_sessions', filtered);
      }
      return { success: true };
    }
    return { success: false, message: 'Usuario no encontrado.' };
  },

  toggleRole(userId, newRole) {
    const users = getTable('dc_users');
    const idx = users.findIndex(u => u.id === Number.parseInt(userId, 10));
    if (idx !== -1) {
      users[idx].rol = newRole;
      saveTable('dc_users', users);
      return { success: true };
    }
    return { success: false, message: 'Usuario no encontrado.' };
  },

  // REPORT EXCEL GENERATION MOCKS
  getReportExcel(type) {
    // Retorna datos estructurados tabulares según el reporte pedido
    if (type === 'tickets') {
      return getTable('dc_tickets');
    }
    return getTable('dc_users');
  },

  // ANALYTICS & DASHBOARD METRICS
  getAnalyticsDashboard() {
    const users = getTable('dc_users');
    const games = getTable('dc_games');
    const tickets = getTable('dc_tickets');
    
    // Mapear todas las skins e ítems de la tienda para poder resolver nombres y precios
    const storeItemsMap = {};
    games.forEach((g) => {
      if (g.store) {
        g.store.forEach((item) => {
          storeItemsMap[item.id] = item;
        });
      }
    });

    // Reconstruir transacciones a partir del inventario de los usuarios
    const recentPurchases = [];
    const buyersSet = new Set();
    let totalEpointsSpent = 0;

    users.forEach((u) => {
      if (u.purchasedSkins && u.purchasedSkins.length > 0) {
        u.purchasedSkins.forEach((skinId, idx) => {
          const item = storeItemsMap[skinId] || { title: skinId, price: 150 };
          buyersSet.add(u.nombre_usuario);
          totalEpointsSpent += item.price;
          recentPurchases.push({
            id: `TX-${u.id}-${idx}`,
            usuario: u.nombre_usuario,
            item: item.title,
            costo_epoints: item.price,
            fecha: new Date(Date.now() - 3600000 * (idx + 1)).toISOString()
          });
        });
      }
    });

    // Si está vacío, rellenar con un par de mock purchases para que no se vea vacío
    if (recentPurchases.length === 0) {
      recentPurchases.push({
        id: 'TX-101',
        usuario: 'ShadowFang',
        item: 'Skin de Neón',
        costo_epoints: 150,
        fecha: new Date(Date.now() - 3600000).toISOString()
      });
      buyersSet.add('ShadowFang');
      totalEpointsSpent += 150;
    }

    const uniqueBuyers = buyersSet.size;
    const totalSales = recentPurchases.length;

    // Preparar gráficos para StoreAnalyticsDashboard
    const topItemsLabels = Object.values(storeItemsMap).slice(0, 5).map(i => i.title);
    if (topItemsLabels.length === 0) topItemsLabels.push('Skin de Neón', 'Hacha Premium', 'Traje Tóxico');
    
    const topItemsChart = {
      labels: topItemsLabels,
      datasets: [
        {
          label: 'Ventas por Artículo',
          data: topItemsLabels.map((_, idx) => Math.floor(Math.random() * 15) + (5 - idx)),
          backgroundColor: 'rgba(0, 210, 255, 0.45)',
          borderColor: '#00d2ff',
          borderWidth: 1.5
        }
      ]
    };

    const trafficChart = {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'Volumen de Conexiones',
          data: [120, 150, 180, 140, 220, 280, 310],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: true
        }
      ]
    };

    return {
      success: true,
      data: {
        // Campos para StoreAnalyticsDashboard
        generalStats: {
          totalUsers: users.length,
          totalSales,
          totalEpointsSpent,
          uniqueBuyers
        },
        topItemsChart,
        trafficChart,
        recentPurchases,
        
        // Campos heredados de AnalyticsDashboard (por si acaso)
        totalUsers: users.length,
        activeSessions: getTable('dc_sessions').length + 4,
        totalEarnings: totalEpointsSpent,
        resolvedTickets: tickets.filter(t => t.estado === 'resuelto').length,
        pendingTickets: tickets.filter(t => t.estado === 'abierto').length,
        gamesPlayed: games.map(g => ({ name: g.displayName, value: Math.floor(Math.random() * 200) + 50 })),
        creditsTrend: [
          { date: 'Lun', credits: 12000 },
          { date: 'Mar', credits: 15000 },
          { date: 'Mié', credits: 18000 },
          { date: 'Jue', credits: 14000 },
          { date: 'Vie', credits: 22000 },
          { date: 'Sáb', credits: 28000 },
          { date: 'Dom', credits: 31000 }
        ],
        popularItems: games.reduce((acc, g) => {
          if (g.store) {
            g.store.slice(0, 2).forEach(item => {
              acc.push({ name: item.title, quantity: Math.floor(Math.random() * 15) + 3, revenue: item.price * 5 });
            });
          }
          return acc;
        }, [])
      }
    };
  },

  getNewsStats() {
    const games = getTable('dc_games');
    let totalLikes = 0;
    let sumRatings = 0;
    let countNews = 0;
    const topNews = [];

    games.forEach((g) => {
      if (g.news) {
        g.news.forEach((n) => {
          totalLikes += n.likes || 0;
          sumRatings += n.rating || 5.0;
          countNews++;
          topNews.push({
            id: n.id,
            title: n.title,
            titulo: n.title,
            likes: n.likes || 0,
            dislikes: n.dislikes || 0,
            rating: n.rating || 5.0,
            comments: n.comments_count || 0,
            rates_count: n.comments_count || 0,
            total_interacciones: (n.likes || 0) + (n.dislikes || 0) + (n.comments_count || 0),
            fecha_creacion: n.fecha_creacion || g.created_at || new Date().toISOString()
          });
        });
      }
    });

    const averageRating = countNews > 0 ? (sumRatings / countNews).toFixed(1) : '5.0';

    return {
      success: true,
      users: {
        totalLikes,
        averageRating,
        topNews: topNews.sort((a,b) => b.likes - a.likes).slice(0, 5)
      }
    };
  },

  getUserStats() {
    const users = getTable('dc_users');
    const sessions = getTable('dc_sessions');
    return {
      success: true,
      stats: {
        total_users: users.length,
        active_sessions: sessions.length + 3, // mock
        total_messages: 140, // mock
        connections_by_hour: [
          { hour: '09', count: 12 },
          { hour: '10', count: 15 },
          { hour: '11', count: 22 },
          { hour: '12', count: 30 },
          { hour: '13', count: 45 },
          { hour: '14', count: 85 }, // peak hour
          { hour: '15', count: 50 },
          { hour: '16', count: 35 },
          { hour: '17', count: 28 }
        ]
      }
    };
  }
};
