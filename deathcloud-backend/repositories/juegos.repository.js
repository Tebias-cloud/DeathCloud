const pool = require('../config/db');

class JuegosRepository {
    async getAll() {
        const result = await pool.query(
            `SELECT id, displayname as titulo, subtagline as genero, tagline as descripcion, assets->>'heroBackground' as url_portada 
             FROM games_catalog 
             WHERE id NOT IN ('deathcloud-runner', 'deathcloud-toxic-skies', 'deathcloud-2d') 
             ORDER BY id DESC`
        );
        return result.rows;
    }

    async getById(id) {
        const result = await pool.query(
            `SELECT id, displayname as titulo, subtagline as genero, tagline as descripcion, assets->>'heroBackground' as url_portada 
             FROM games_catalog WHERE id = $1`, 
            [id]
        );
        return result.rows[0];
    }

    async create(juegoData) {
        const { titulo, genero, url_portada, descripcion } = juegoData;
        const id = titulo.toLowerCase().trim().replaceAll(/[^a-z0-9]+/g, '-');
        const symbol = titulo.substring(0, 2).toUpperCase();
        const theme = JSON.stringify({
            'theme-dark': '15 23 42',
            'theme-panel': 'rgba(15, 23, 42, 0.7)',
            'theme-neon': '56 189 248',
            'theme-neon-glow': 'rgba(56, 189, 248, 0.5)',
            'theme-text': '255 255 255',
            'theme-muted': '156 163 175',
            'theme-success': '74 222 128',
            'theme-gradient-start': '15 23 42'
        });
        const assets = JSON.stringify({
            heroBackground: url_portada || 'none',
            storePrimaryItem: 'not-found',
            newsItem1: 'not-found'
        });

        await pool.query(
            `INSERT INTO games_catalog (id, displayName, tagline, subTagline, symbol, theme, assets)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [id, titulo, descripcion, genero, symbol, theme, assets]
        );

        // Dynamically create PostgreSQL Schema for the new game immediately!
        const dbSuffix = id.replaceAll(/[^a-zA-Z0-9]/g, '_');
        await pool.query(`CREATE SCHEMA IF NOT EXISTS "${dbSuffix}"`);
        const t = (table) => `"${dbSuffix}".${table}`;
        await pool.query(`CREATE TABLE IF NOT EXISTS ${t('user_credits')} ( usuario_id INT PRIMARY KEY, credits INT DEFAULT 2500 )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS ${t('user_skins')} ( id SERIAL PRIMARY KEY, usuario_id INT NOT NULL, skin_id VARCHAR(100) NOT NULL, fecha_adquisicion TIMESTAMP DEFAULT CURRENT_TIMESTAMP )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS ${t('user_stats')} ( usuario_id INT PRIMARY KEY, score VARCHAR(50) DEFAULT '0', best_score VARCHAR(50) DEFAULT '0', total_games INT DEFAULT 0, fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS ${t('community_posts')} ( id SERIAL PRIMARY KEY, usuario_id INT NOT NULL, title VARCHAR(200) NOT NULL, content TEXT NOT NULL, likes INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS ${t('community_replies')} ( id SERIAL PRIMARY KEY, post_id INT NOT NULL REFERENCES ${t('community_posts')}(id) ON DELETE CASCADE, usuario_id INT NOT NULL, content TEXT NOT NULL, likes INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP )`);

        return this.getById(id);
    }

    async update(id, juegoData) {
        const { titulo, genero, url_portada, descripcion } = juegoData;
        
        // Obtenemos los assets actuales
        const current = await pool.query('SELECT assets FROM games_catalog WHERE id = $1', [id]);
        if (!current.rows[0]) return null;
        
        const assets = current.rows[0].assets || {};
        if (url_portada) {
            assets.heroBackground = url_portada;
        }

        await pool.query(
            `UPDATE games_catalog SET displayName=$1, subTagline=$2, tagline=$3, assets=$4 WHERE id=$5`,
            [titulo, genero, descripcion, JSON.stringify(assets), id]
        );
        return this.getById(id);
    }

    async delete(id) {
        // Obtenemos los assets actuales por si hay que limpiar imagenes (manejado en controller)
        // También borramos el schema dinámico que creamos para este juego
        const dbSuffix = id.replaceAll(/[^a-zA-Z0-9]/g, '_');
        await pool.query(`DROP SCHEMA IF EXISTS "${dbSuffix}" CASCADE`);

        await pool.query(`DELETE FROM games_catalog WHERE id=$1`, [id]);
    }
}

module.exports = new JuegosRepository();
