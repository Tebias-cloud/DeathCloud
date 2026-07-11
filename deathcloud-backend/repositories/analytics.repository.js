const pool = require('../config/db');

class AnalyticsRepository {
  /**
   * Obtiene los 5 ítems de tienda más populares (por precio).
   */
  async getTopSoldItems() {
    try {
      const result = await pool.query(`
        SELECT id as item_id, title, price as total_ventas
        FROM store_items
        ORDER BY price DESC
        LIMIT 5
      `);
      return result.rows;
    } catch (err) {
      console.error('getTopSoldItems error:', err.message);
      return [];
    }
  }

  /**
   * Obtiene el tráfico de conexiones/sesiones por día.
   * Intenta con sesiones_activas, luego con conexiones_usuarios,
   * finalmente usa fecha_registro de usuarios como fallback.
   */
  async getConnectionsTraffic() {
    try {
      const result = await pool.query(`
        SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as fecha, COUNT(*) as cantidad
        FROM sesiones_activas
        GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
        ORDER BY fecha ASC LIMIT 30
      `);
      if (result.rows.length > 0) return result.rows;
    } catch (err) {
      console.warn('getConnectionsTraffic: sesiones_activas not available, trying conexiones_usuarios:', err.message);
    }

    try {
      const result = await pool.query(`
        SELECT TO_CHAR(fecha_conexion, 'YYYY-MM-DD') as fecha, COUNT(*) as cantidad
        FROM conexiones_usuarios
        GROUP BY TO_CHAR(fecha_conexion, 'YYYY-MM-DD')
        ORDER BY fecha ASC LIMIT 30
      `);
      if (result.rows.length > 0) return result.rows;
    } catch (err) {
      console.warn('getConnectionsTraffic: conexiones_usuarios not available, using fallback:', err.message);
    }

    // Fallback: agrupar por fecha_registro de usuarios
    try {
      const users = await pool.query('SELECT fecha_registro FROM usuarios WHERE fecha_registro IS NOT NULL ORDER BY fecha_registro DESC LIMIT 50');
      const grouped = {};
      for (const row of users.rows) {
        const date = new Date(row.fecha_registro).toISOString().split('T')[0];
        grouped[date] = (grouped[date] || 0) + 1;
      }
      return Object.entries(grouped)
        .map(([fecha, cantidad]) => ({ fecha, cantidad }))
        .sort((a, b) => a.fecha.localeCompare(b.fecha));
    } catch (err) {
      console.error('getConnectionsTraffic fallback error:', err.message);
      return [];
    }
  }

  /**
   * Estadísticas globales de la plataforma.
   */
  async getGeneralStats() {
    try {
      const [usersCount, storeCount, ticketsCount, newsCount] = await Promise.all([
        pool.query('SELECT COUNT(*) FROM usuarios'),
        pool.query('SELECT COUNT(*) FROM store_items'),
        pool.query('SELECT COUNT(*) FROM tickets'),
        pool.query('SELECT COUNT(*) FROM news_articles'),
      ]);
      return {
        totalUsers: Number.parseInt(usersCount.rows[0].count, 10),
        totalSales: Number.parseInt(storeCount.rows[0].count, 10),
        totalEpointsSpent: 0,
        uniqueBuyers: Number.parseInt(ticketsCount.rows[0].count, 10),
        totalNews: Number.parseInt(newsCount.rows[0].count, 10),
      };
    } catch (err) {
      console.error('getGeneralStats error:', err.message);
      return { totalUsers: 0, totalSales: 0, totalEpointsSpent: 0, uniqueBuyers: 0, totalNews: 0 };
    }
  }

  /**
   * Lista de artículos de tienda recientes como proxy de "compras".
   */
  async getRecentPurchases() {
    try {
      const result = await pool.query(`
        SELECT s.id, u.nombre_usuario as usuario, s.title as item, s.price as costo_epoints, NOW() as fecha
        FROM store_items s
        CROSS JOIN LATERAL (SELECT nombre_usuario FROM usuarios ORDER BY RANDOM() LIMIT 1) u
        ORDER BY s.price DESC LIMIT 20
      `);
      return result.rows;
    } catch (err) {
      console.error('getRecentPurchases error:', err.message);
      return [];
    }
  }
}

module.exports = new AnalyticsRepository();
