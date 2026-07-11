const analyticsRepository = require('../repositories/analytics.repository');

exports.getDashboardStats = async (req, res) => {
  try {
    const generalStats = await analyticsRepository.getGeneralStats();
    const topItemsRaw = await analyticsRepository.getTopSoldItems();
    const trafficRaw = await analyticsRepository.getConnectionsTraffic();
    const recentPurchases = await analyticsRepository.getRecentPurchases();

    const topItemsChart = {
      labels: topItemsRaw.map(item => item.title.length > 20 ? item.title.substring(0,20)+'...' : item.title),
      datasets: [
        {
          label: 'Costo E-Points (Ranking)',
          data: topItemsRaw.map(item => item.total_ventas),
          backgroundColor: 'rgba(0, 210, 255, 0.5)',
          borderColor: '#00d2ff',
          borderWidth: 1
        }
      ]
    };

    const trafficChart = {
      labels: trafficRaw.map(item => item.fecha),
      datasets: [
        {
          label: 'Tráfico Diario (Conexiones/Registros)',
          data: trafficRaw.map(item => item.cantidad),
          fill: true,
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderColor: '#10b981',
          tension: 0.4
        }
      ]
    };

    res.json({
      success: true,
      data: {
        generalStats,
        topItemsChart,
        trafficChart,
        recentPurchases
      }
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ success: false, message: 'Error interno al obtener estadísticas' });
  }
};
