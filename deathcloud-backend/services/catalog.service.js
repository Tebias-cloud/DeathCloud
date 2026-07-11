const catalogRepository = require('../repositories/catalog.repository');

class CatalogService {
    async getGames() {
        const games = await catalogRepository.getGames();
        
        let formattedGames = games.map(row => ({
            ...row,
            displayName: row.displayname,
            subTagline: row.subtagline
        }));

        formattedGames = await Promise.all(formattedGames.map(async (game) => {
            const gId = game.id;
            
            const [storeItems, newsArticles] = await Promise.all([
                catalogRepository.getStoreItemsByGameId(gId),
                catalogRepository.getNewsArticlesByGameId(gId)
            ]);
            
            game.store = storeItems.map(item => ({
                ...item,
                rarityColor: item.raritycolor
            }));
            
            game.news = newsArticles;
            
            try {
                const gameRepository = require('../repositories/game.repository');
                const board = await gameRepository.getLeaderboard(gId, 3);
                game.leaderboard = board.map((p, idx) => {
                    let rankColor = "text-[#f87171]";
                    if (idx === 0) rankColor = "text-theme-neon";
                    else if (idx === 1) rankColor = "text-[#c084fc]";
                    
                    return {
                        rank: idx + 1,
                        name: p.nickname || p.nombre_usuario,
                        score: p.best_score || "0",
                        color: rankColor
                    };
                });
            } catch (err) {
                console.error(`No leaderboard available for ${gId}:`, err);
                game.leaderboard = [];
            }
            return game;
        }));
        
        return formattedGames;
    }

    async createGame(gameData) {
        // 1. Crear el juego en el catálogo (principal)
        const newGameId = await catalogRepository.createGame(gameData);
        
        // 2. Crear la base de datos segmentada (usando el repositorio)
        await catalogRepository.setupGameSchema(newGameId);
        
        return newGameId;
    }

    async updateGame(id, gameData) {
        await catalogRepository.updateGame(id, gameData);
    }

    async deleteGame(id) {
        // Validación: Prevenir eliminación de juegos core (opcional, pero buena práctica)
        const coreGames = ['deathcloud-runner', 'deathcloud-toxic-skies', 'deathcloud-2d-shooter'];
        if (coreGames.includes(id)) {
            throw new Error("No se pueden eliminar los juegos principales del sistema.");
        }

        // 1. Eliminar del catálogo y su esquema dinámico (manejado por el repositorio)
        await catalogRepository.deleteGame(id);
    }

    async createStoreItem(itemData) {
        await catalogRepository.createStoreItem(itemData);
    }

    async updateStoreItem(id, itemData) {
        await catalogRepository.updateStoreItem(id, itemData);
    }

    async deleteStoreItem(id) {
        await catalogRepository.deleteStoreItem(id);
    }

    async createNews(newsData) {
        const data = { ...newsData, status: newsData.status || 'published' };
        await catalogRepository.createNews(data);
    }

    async updateNews(id, newsData) {
        const data = { ...newsData, status: newsData.status || 'published' };
        await catalogRepository.updateNews(id, data);
    }

    async deleteNews(id) {
        await catalogRepository.deleteNews(id);
    }
}

module.exports = new CatalogService();
