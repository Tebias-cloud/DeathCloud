const newsRepository = require('../repositories/news.repository');

class NewsService {
    async getNewsByGame(gameId) {
        return await newsRepository.getNewsByGameId(gameId);
    }
}

module.exports = new NewsService();
