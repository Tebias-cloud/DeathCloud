const gameRepository = require('../repositories/game.repository');
const userRepository = require('../repositories/user.repository');

class GameService {
    async getCredits(gameId, userId) {
        return await gameRepository.getCredits(gameId, userId);
    }

    async addCredits(gameId, userId, amount) {
        if (!amount || amount <= 0) {
            throw new Error('Cantidad no válida');
        }
        return await gameRepository.addCredits(gameId, userId, amount);
    }

    async getSkins(gameId, userId) {
        return await gameRepository.getSkins(gameId, userId);
    }

    async buySkin(gameId, userId, skinId, price) {
        if (!skinId || price === undefined || price < 0) {
            throw new Error('Datos de compra incompletos o inválidos');
        }

        return await gameRepository.buySkinAtomic(gameId, userId, skinId, price);
    }

    async updateScore(gameId, userId, newScore) {
        if (newScore === undefined || newScore < 0) {
            throw new Error('Puntaje no válido');
        }
        return await gameRepository.updateScore(gameId, userId, newScore);
    }

    async getLeaderboard(gameId) {
        return await gameRepository.getLeaderboard(gameId);
    }

    async getNews(gameId) {
        return await gameRepository.getGameNews(gameId);
    }

    async getNewsComments(newsId) {
        return await gameRepository.getNewsComments(newsId);
    }

    async addNewsComment(newsId, userId, content) {
        if (!content || content.trim().length === 0) {
            throw new Error('El comentario no puede estar vacío');
        }
        return await gameRepository.addNewsComment(newsId, userId, content);
    }
}

module.exports = new GameService();
