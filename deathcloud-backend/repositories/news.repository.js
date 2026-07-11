const pool = require('../config/db');

class NewsRepository {
    async getNewsByGameId(gameId) {
        const result = await pool.query(
            `SELECT n.id, n.game_id, n.title, n."desc", n.date, n.image, n.fecha_creacion,
                    (SELECT COUNT(*) FROM news_likes WHERE news_id = n.id AND tipo = 'like') as likes,
                    (SELECT COUNT(*) FROM news_likes WHERE news_id = n.id AND tipo = 'dislike') as dislikes,
                    (SELECT ROUND(AVG(estrellas), 1) FROM news_rates WHERE news_id = n.id) as rating
             FROM news_articles n 
             WHERE n.game_id = $1 AND n.status = $2 
             ORDER BY n.fecha_creacion DESC`,
            [gameId, 'published']
        );
        return result.rows;
    }
}

module.exports = new NewsRepository();
