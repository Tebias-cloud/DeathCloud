const juegosService = require('../services/juegos.service');
const path = require('node:path');
const fs = require('node:fs');

exports.getJuegos = async (req, res) => {
    try {
        const juegos = await juegosService.getAllJuegos();
        res.json({ success: true, data: juegos });
    } catch (err) {
        console.error('Error fetching juegos:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getJuego = async (req, res) => {
    try {
        const juego = await juegosService.getJuegoById(req.params.id);
        if (!juego) {
            return res.status(404).json({ success: false, message: 'Juego no encontrado' });
        }
        res.json({ success: true, data: juego });
    } catch (err) {
        console.error('Error fetching juego:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createJuego = async (req, res) => {
    try {
        const { titulo, genero, descripcion } = req.body;
        let url_portada = null;

        if (req.file) {
            url_portada = `/api/uploads/${req.file.filename}`;
        }

        const newJuego = await juegosService.createJuego({ titulo, genero, url_portada, descripcion });
        res.status(201).json({ success: true, message: 'Juego creado con éxito', data: newJuego });
    } catch (err) {
        console.error('Error creating juego:', err);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

exports.updateJuego = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, genero, descripcion } = req.body;
        
        const juegoData = { titulo, genero, descripcion };
        
        if (req.file) {
            juegoData.url_portada = `/api/uploads/${req.file.filename}`;
            
            // Opcional: Eliminar la imagen anterior para ahorrar espacio
            const currentJuego = await juegosService.getJuegoById(id);
            if (currentJuego?.url_portada) {
                const oldImagePath = path.join(__dirname, '../public', currentJuego.url_portada);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        const updatedJuego = await juegosService.updateJuego(id, juegoData);
        res.json({ success: true, message: 'Juego actualizado con éxito', data: updatedJuego });
    } catch (err) {
        console.error('Error updating juego:', err);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

exports.deleteJuego = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Opcional: Eliminar la imagen del disco
        const currentJuego = await juegosService.getJuegoById(id);
        if (currentJuego?.url_portada) {
            const imagePath = path.join(__dirname, '../public', currentJuego.url_portada);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await juegosService.deleteJuego(id);
        res.json({ success: true, message: 'Juego eliminado con éxito' });
    } catch (err) {
        console.error('Error deleting juego:', err);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};
