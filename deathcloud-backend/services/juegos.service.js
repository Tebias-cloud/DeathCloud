const juegosRepository = require('../repositories/juegos.repository');

class JuegosService {
    async getAllJuegos() {
        return await juegosRepository.getAll();
    }

    async getJuegoById(id) {
        return await juegosRepository.getById(id);
    }

    async createJuego(juegoData) {
        return await juegosRepository.create(juegoData);
    }

    async updateJuego(id, juegoData) {
        return await juegosRepository.update(id, juegoData);
    }

    async deleteJuego(id) {
        await juegosRepository.delete(id);
    }
}

module.exports = new JuegosService();
