const communityService = require('../services/community.service');

// GET /api/community/:gameId/posts
async function getPosts(req, res) {
  const { gameId } = req.params;
  try {
    const posts = await communityService.getPosts(gameId);
    res.json({ success: true, posts });
  } catch (err) {
    console.error('Error getPosts:', err);
    res.status(500).json({ success: false, message: 'Error al obtener publicaciones' });
  }
}

// GET /api/community/:gameId/posts/:postId/replies
async function getReplies(req, res) {
  const { gameId, postId } = req.params;
  try {
    const replies = await communityService.getReplies(gameId, postId);
    res.json({ success: true, replies });
  } catch (err) {
    console.error('Error getReplies:', err);
    res.status(500).json({ success: false, message: 'Error al obtener respuestas' });
  }
}

// POST /api/community/:gameId/posts
async function createPost(req, res) {
  const { gameId } = req.params;
  const { title, content } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ success: false, message: 'No autenticado' });
  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ success: false, message: 'Título y contenido requeridos' });
  }

  try {
    const post = await communityService.createPost(gameId, userId, title, content);
    res.json({ success: true, post });
  } catch (err) {
    console.error('Error createPost:', err);
    res.status(500).json({ success: false, message: 'Error al crear publicación' });
  }
}

// POST /api/community/:gameId/posts/:postId/replies
async function createReply(req, res) {
  const { gameId, postId } = req.params;
  const { content } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ success: false, message: 'No autenticado' });
  if (!content?.trim()) return res.status(400).json({ success: false, message: 'Contenido requerido' });

  try {
    const reply = await communityService.createReply(gameId, postId, userId, content);
    res.json({ success: true, reply });
  } catch (err) {
    console.error('Error createReply:', err);
    res.status(500).json({ success: false, message: 'Error al crear respuesta' });
  }
}

// POST /api/community/:gameId/posts/:postId/like
async function likePost(req, res) {
  const { gameId, postId } = req.params;
  if (!req.user?.id) return res.status(401).json({ success: false });
  try {
    const likes = await communityService.likePost(gameId, postId);
    res.json({ success: true, likes });
  } catch (err) {
    console.error('Error likePost:', err);
    res.status(500).json({ success: false });
  }
}

// POST /api/community/:gameId/replies/:replyId/like
async function likeReply(req, res) {
  const { gameId, replyId } = req.params;
  if (!req.user?.id) return res.status(401).json({ success: false });
  try {
    const likes = await communityService.likeReply(gameId, replyId);
    res.json({ success: true, likes });
  } catch (err) {
    console.error('Error likeReply:', err);
    res.status(500).json({ success: false });
  }
}

module.exports = { getPosts, getReplies, createPost, createReply, likePost, likeReply };
