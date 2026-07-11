const catalogService = require('../services/catalog.service');

// --- GAMES CATALOG ---

const prepareGameData = (req, assets) => {
  // Caso 1: imagen subida como archivo (multipart)
  if (req.files && req.files.length > 0) {
    const file = req.files.find(f => f.fieldname === 'portada');
    if (file) {
      assets.portada = '/api/uploads/' + file.filename;
    }
  }
  // Caso 2: imagen ya subida, URL enviada como campo de texto
  if (req.body.imageUrl && !assets.portada) {
    assets.portada = req.body.imageUrl;
    delete req.body.imageUrl;
  }
  req.body.assets = JSON.stringify(assets);
  if (req.body.theme && !req.body.theme.startsWith('{') && !req.body.theme.startsWith('"')) {
    req.body.theme = JSON.stringify({ "theme-neon": req.body.theme });
  }
};

exports.getGames = async (req, res) => {
  try {
    const games = await catalogService.getGames();
    res.json({ success: true, games });
  } catch (err) {
    console.error('Error fetching games catalog:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createGame = async (req, res) => {
  try {
    let assets = {};
    prepareGameData(req, assets);
    
    const newGameId = await catalogService.createGame(req.body);
    res.json({ success: true, message: 'Juego creado y base de datos configurada con éxito', gameId: newGameId });
  } catch (err) {
    console.error('Error creating game:', err);
    res.status(500).json({ success: false, message: 'Error al crear juego' });
  }
};

exports.updateGame = async (req, res) => {
  try {
    const existingGames = await catalogService.getGames();
    const existingGame = existingGames.find(g => g.id === req.params.id);
    let assets = existingGame?.assets || {};
    
    prepareGameData(req, assets);
    
    await catalogService.updateGame(req.params.id, req.body);
    res.json({ success: true, message: 'Juego actualizado con éxito' });
  } catch (err) {
    console.error('Error updating game:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

exports.deleteGame = async (req, res) => {
  try {
    await catalogService.deleteGame(req.params.id);
    res.json({ success: true, message: 'Juego eliminado y esquema borrado con éxito' });
  } catch (err) {
    console.error('Error deleting game:', err);
    res.status(500).json({ success: false, message: 'Error al eliminar juego' });
  }
};

// --- STORE ITEMS ---

exports.createStoreItem = async (req, res) => {
  try {
    await catalogService.createStoreItem(req.body);
    res.json({ success: true, message: 'Item creado con éxito' });
  } catch (err) {
    console.error('Error creating store item:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

exports.updateStoreItem = async (req, res) => {
  try {
    await catalogService.updateStoreItem(req.params.id, req.body);
    res.json({ success: true, message: 'Item actualizado con éxito' });
  } catch (err) {
    console.error('Error updating store item:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

exports.deleteStoreItem = async (req, res) => {
  try {
    await catalogService.deleteStoreItem(req.params.id);
    res.json({ success: true, message: 'Item eliminado con éxito' });
  } catch (err) {
    console.error('Error deleting store item:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// --- NEWS ARTICLES ---

exports.createNews = async (req, res) => {
  try {
    await catalogService.createNews(req.body);
    res.json({ success: true, message: 'Noticia creada con éxito' });
  } catch (err) {
    console.error('Error creating news:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

exports.updateNews = async (req, res) => {
  try {
    await catalogService.updateNews(req.params.id, req.body);
    res.json({ success: true, message: 'Noticia actualizada con éxito' });
  } catch (err) {
    console.error('Error updating news:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    await catalogService.deleteNews(req.params.id);
    res.json({ success: true, message: 'Noticia eliminada con éxito' });
  } catch (err) {
    console.error('Error deleting news:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

