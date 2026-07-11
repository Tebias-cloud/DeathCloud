const pool = require('../config/db');
const newsService = require('../services/news.service');

exports.getNewsByGame = async (req, res) => {
  const { gameId } = req.params;
  try {
    const news = await newsService.getNewsByGame(gameId);
    
    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ success: false, message: 'Server error fetching news' });
  }
};

exports.getNewsStats = async (req, res) => {
  try {
    // 1. Total de likes
    const likesResult = await pool.query(
      "SELECT COUNT(*) AS total_likes FROM news_likes WHERE tipo = 'like'"
    );
    const totalLikes = Number.parseInt(likesResult.rows[0].total_likes, 10);

    // 2. Promedio de valoraciones
    const ratingResult = await pool.query(
      "SELECT AVG(estrellas) AS average_rating FROM news_rates"
    );
    const averageRating = ratingResult.rows[0].average_rating 
      ? Number.parseFloat(ratingResult.rows[0].average_rating).toFixed(1)
      : '0.0';

    // 3. Top 10 noticias más interactuadas (visitas + likes)
    const topNewsResult = await pool.query(`
      SELECT 
        n.id, 
        n.title as titulo, 
        n.fecha_creacion,
        (SELECT COUNT(*) FROM news_likes WHERE news_id = n.id AND tipo = 'like') AS likes,
        (SELECT COUNT(*) FROM news_likes WHERE news_id = n.id AND tipo = 'dislike') AS dislikes,
        (SELECT COUNT(*) FROM news_rates WHERE news_id = n.id) AS rates_count,
        (SELECT COUNT(*) FROM news_likes WHERE news_id = n.id) + 
        (SELECT COUNT(*) FROM news_rates WHERE news_id = n.id) AS total_interacciones
      FROM news_articles n
      ORDER BY total_interacciones DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        totalLikes,
        averageRating,
        topNews: topNewsResult.rows
      }
    });

  } catch (error) {
    console.error('Error fetching news stats:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor al obtener las estadísticas.' });
  }
};

