const cron = require('node-cron');
const messageRepository = require('../repositories/message.repository');

const startMessageCleanupJob = () => {
  // Ejecutar cada hora (en el minuto 0 de cada hora)
  // Puedes ajustarlo a '* * * * *' para pruebas (cada minuto)
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🧹 [CRON] Iniciando limpieza de mensajes globales y privados expirados (> 24h)...');
      const deletedCounts = await messageRepository.deleteExpiredMessages();
      console.log(`🧹 [CRON] Limpieza completada. Mensajes eliminados - Privados: ${deletedCounts.privados}, Globales: ${deletedCounts.globales}`);
    } catch (error) {
      console.error('❌ [CRON] Error durante la limpieza de mensajes:', error);
    }
  });
  console.log('⏳ [CRON] Tarea de limpieza de mensajes programada (se ejecuta cada hora).');
};

module.exports = startMessageCleanupJob;
