# 🗃️ DeathCloud Database - Inicialización y Estructura PostgreSQL

Este repositorio contiene los scripts de configuración, inicialización y siembra de datos para las bases de datos de **DeathCloud**. 

El sistema utiliza bases de datos relacionales **PostgreSQL**, con un diseño segmentado: tablas de uso común en el esquema público y tablas exclusivas de juego aisladas en esquemas dedicados (`runner`, `skies`, `game2d`).

---

## 🛠️ Tecnologías Utilizadas

*   **Motor de Base de Datos:** PostgreSQL
*   **Lenguaje de Scripts:** Node.js
*   **Driver:** `pg` (PostgreSQL Client)
*   **Cifrado:** `bcryptjs` (para credenciales de prueba)
*   **Variables de Entorno:** `dotenv`

---

## 🏛️ Estructura del Esquema de Datos Original

Los scripts de inicialización crean la siguiente arquitectura relacional en PostgreSQL:

### 1. Esquema Público (Tablas Compartidas)
*   `usuarios`: Almacena las cuentas de jugador con credenciales encriptadas y balances de créditos.
*   `mensajes`: Bitácora para el canal de chat del lobby.
*   `amigos`: Tabla relacional con restricciones de unicidad y validación lógica (`CHECK`) para evitar relaciones repetidas o auto-amistad.
*   `tickets`: Control de incidentes clasificados por categoría, prioridad y estado.
*   `games_catalog`: Tabla de títulos con configuraciones visuales JSONB.
*   `store_items`: Artículos de tienda vinculados a cada juego.
*   `news_articles`: Tablón de noticias vinculadas a cada juego.

### 2. Esquemas por Juego (`runner`, `skies`, `game2d`)
Cada juego de la plataforma posee sus propias tablas bajo un esquema independiente:
*   `user_credits`: Registro de créditos de juego específicos (E-Points).
*   `user_skins`: Historial de aspectos de jugador comprados.
*   `user_stats`: Tabla de marcas (score) para la clasificación (Leaderboard).
*   `community_posts` / `community_replies`: Foros de discusión específicos de cada juego.

---

## 📂 Instalar y Ejecutar en Entorno Local

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Configurar Variables de Entorno (.env):**
    Configura los parámetros de conexión de tu Postgres local:
    ```ini
    DB_USER=usuario_postgres
    DB_PASSWORD=clave_postgres
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=death_cloud_dev
    ```

3.  **Crear e Inicializar Base de Datos:**
    Para crear e inicializar la base de datos física local:
    ```bash
    node create_db.js
    node init_db.js
    ```

---

## 📄 Licencia
Este proyecto se distribuye bajo la Licencia **MIT**.
