const gameService = require('../services/game.service');

exports.getCredits = async (req, res) => {
    try {
        const credits = await gameService.getCredits(req.params.gameId, req.user.id);
        res.json({ success: true, credits });
    } catch (err) {
        console.error(`Error al obtener créditos para ${req.params.gameId}:`, err);
        res.status(500).json({ success: false, message: 'Error al obtener E-Points' });
    }
};

exports.addCredits = async (req, res) => {
    try {
        const credits = await gameService.addCredits(req.params.gameId, req.user.id, req.body.amount);
        res.json({ success: true, credits });
    } catch (err) {
        if (err.message === 'Cantidad no válida') {
            return res.status(400).json({ success: false, message: err.message });
        }
        console.error(`Error al añadir créditos para ${req.params.gameId}:`, err);
        res.status(500).json({ success: false, message: 'Error al abonar E-Points' });
    }
};

exports.getSkins = async (req, res) => {
    try {
        const skins = await gameService.getSkins(req.params.gameId, req.user.id);
        res.json({ success: true, skins });
    } catch (err) {
        console.error(`Error al obtener skins para ${req.params.gameId}:`, err);
        res.status(500).json({ success: false, message: 'Error al recuperar skins' });
    }
};

exports.buySkin = async (req, res) => {
    try {
        const credits = await gameService.buySkin(req.params.gameId, req.user.id, req.body.skinId, req.body.price);
        res.json({ success: true, message: 'Artículo adquirido correctamente', credits });
    } catch (err) {
        if (['Datos de compra incompletos o inválidos', 'Ya has adquirido este artículo.'].includes(err.message) || err.message.startsWith('E-Points insuficientes')) {
            return res.status(400).json({ success: false, message: err.message });
        }
        console.error(`Error al comprar skin en ${req.params.gameId}:`, err);
        res.status(500).json({ success: false, message: 'Error interno en la transacción' });
    }
};

exports.updateScore = async (req, res) => {
    try {
        const result = await gameService.updateScore(req.params.gameId, req.user.id, req.body.score);
        res.json({ success: true, message: 'Puntaje registrado', ...result });
    } catch (err) {
        if (err.message === 'Puntaje no válido') {
            return res.status(400).json({ success: false, message: err.message });
        }
        console.error(`Error al actualizar score en ${req.params.gameId}:`, err);
        res.status(500).json({ success: false, message: 'Error al procesar puntaje' });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await gameService.getLeaderboard(req.params.gameId);
        res.json({ success: true, leaderboard });
    } catch (err) {
        console.error(`Error al obtener leaderboard de ${req.params.gameId}:`, err);
        res.status(500).json({ success: false, message: 'Error al recuperar ranking' });
    }
};

exports.getNews = async (req, res) => {
    try {
        const news = await gameService.getNews(req.params.gameId);
        res.json({ success: true, data: news });
    } catch (err) {
        console.error(`Error fetching news for ${req.params.gameId}:`, err);
        res.status(500).json({ success: false, message: "Error interno" });
    }
};

exports.reactToNews = async (req, res) => {
    res.json({ success: true, message: 'Reacción registrada (TODO)' });
};

exports.rateNews = async (req, res) => {
    res.json({ success: true, message: 'Calificación registrada (TODO)' });
};

exports.getNewsComments = async (req, res) => {
    try {
        const data = await gameService.getNewsComments(req.params.newsId);
        res.json({ success: true, data });
    } catch (err) {
        console.error("Error fetching comments:", err);
        res.status(500).json({ success: false, message: "Error interno" });
    }
};

exports.addNewsComment = async (req, res) => {
    try {
        const commentContent = req.body.content || req.body.comentario;
        const data = await gameService.addNewsComment(req.params.newsId, req.user.id, commentContent);
        res.json({ success: true, message: 'Comentario añadido', data });
    } catch (err) {
        if (err.message === 'El comentario no puede estar vacío') {
            return res.status(400).json({ success: false, message: err.message });
        }
        console.error("Error adding comment:", err);
        res.status(500).json({ success: false, message: "Error interno" });
    }
};
