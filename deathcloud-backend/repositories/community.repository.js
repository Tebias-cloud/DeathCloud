const pool = require('../config/db');
const { getGamePool } = pool;

// Helper: normalize gameId → schema name
function gameSchema(gameId) {
  if (gameId === 'deathcloud-runner') return 'runner';
  if (gameId === 'deathcloud-toxic-skies') return 'skies';
  if (gameId === 'deathcloud-2d') return 'game2d';
  return gameId.replaceAll(/[^a-zA-Z0-9]/g, '_');
}

class CommunityRepository {
  async getPosts(gameId) {
    const schema = gameSchema(gameId);
    const { pool: gamePool } = await getGamePool(gameId);
    const postsResult = await gamePool.query(
      `SELECT p.id, p.title, p.content, p.likes, p.created_at,
              u.nickname AS author,
              (SELECT COUNT(*) FROM ${schema}.community_replies r WHERE r.post_id = p.id) AS replies
       FROM ${schema}.community_posts p
       JOIN usuarios u ON u.id = p.usuario_id
       ORDER BY p.created_at DESC`
    );
    return postsResult.rows;
  }

  async getReplies(gameId, postId) {
    const schema = gameSchema(gameId);
    const { pool: gamePool } = await getGamePool(gameId);
    const result = await gamePool.query(
      `SELECT r.id, r.content, r.likes, r.created_at,
              u.nickname AS author
       FROM ${schema}.community_replies r
       JOIN usuarios u ON u.id = r.usuario_id
       WHERE r.post_id = $1
       ORDER BY r.created_at ASC`,
      [postId]
    );
    return result.rows;
  }

  async createPost(gameId, userId, title, content) {
    const schema = gameSchema(gameId);
    const { pool: gamePool } = await getGamePool(gameId);
    const result = await gamePool.query(
      `INSERT INTO ${schema}.community_posts (usuario_id, title, content)
       VALUES ($1, $2, $3)
       RETURNING id, title, content, likes, created_at`,
      [userId, title.trim(), content.trim()]
    );
    return result.rows[0];
  }

  async createReply(gameId, postId, userId, content) {
    const schema = gameSchema(gameId);
    const { pool: gamePool } = await getGamePool(gameId);
    const result = await gamePool.query(
      `INSERT INTO ${schema}.community_replies (post_id, usuario_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, content, likes, created_at`,
      [postId, userId, content.trim()]
    );
    return result.rows[0];
  }

  async likePost(gameId, postId) {
    const schema = gameSchema(gameId);
    const { pool: gamePool } = await getGamePool(gameId);
    const result = await gamePool.query(
      `UPDATE ${schema}.community_posts SET likes = likes + 1 WHERE id = $1 RETURNING likes`,
      [postId]
    );
    return result.rows[0]?.likes;
  }

  async likeReply(gameId, replyId) {
    const schema = gameSchema(gameId);
    const { pool: gamePool } = await getGamePool(gameId);
    const result = await gamePool.query(
      `UPDATE ${schema}.community_replies SET likes = likes + 1 WHERE id = $1 RETURNING likes`,
      [replyId]
    );
    return result.rows[0]?.likes;
  }

  async getUserNickname(userId) {
    const userRes = await pool.query('SELECT nickname FROM usuarios WHERE id = $1', [userId]);
    return userRes.rows[0]?.nickname;
  }
}

module.exports = new CommunityRepository();
