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

## 🏛️ Estructura del Esquema de Datos

Los scripts crean la siguiente arquitectura relacional en PostgreSQL:

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

## ⚙️ Descripción de los Scripts

*   [init_db.js](file:///c:/Users/Esteban/Desktop/proyectosT/deathcloud-database/init_db.js): Inicializa la base de datos local de desarrollo creando las tablas en el esquema público y esquemas por juego. No destruye datos existentes.
*   [init_db_prod.js](file:///c:/Users/Esteban/Desktop/proyectosT/deathcloud-database/init_db_prod.js): Script de inicialización de producción. Realiza un vaciado total (`DROP SCHEMA ... CASCADE`) y re-crea toda la estructura sembrando las tablas de catálogo y un usuario administrador por defecto (`admin / admin123`).
*   [create_db.js](file:///c:/Users/Esteban/Desktop/proyectosT/deathcloud-database/create_db.js): Intenta conectarse al host Postgres y crear la base de datos física.
*   [check_db.js](file:///c:/Users/Esteban/Desktop/proyectosT/deathcloud-database/check_db.js): Realiza una conexión de prueba y reporta las tablas existentes en el search_path.

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
    ```bash
    node create_db.js
    node init_db.js
    ```

---

## ⚠️ Limitaciones y Deuda Técnica Detectada

*   **Nombre de DB Hardcodeado en Producción:** El archivo `init_db_prod.js` tiene configurado el parámetro `PROD_DB = 'death_cloud_prod'` de forma fija. Ignora el valor de `DB_NAME` presente en `.env` e intentará forzar la inicialización sobre dicha base de datos.
*   **Comandos Destructivos:** El script de producción ejecuta sentencias `DROP SCHEMA ... CASCADE` al arrancar, lo que elimina de manera definitiva toda la base de datos sin confirmación intermedia.

---

## 📝 Informe de Auditoría Independiente

Para un análisis detallado de deudas y de la arquitectura de la base de datos:
📄 **[Reporte de Revisión de Base de Datos (REVIEW_REPORT.md)](file:///c:/Users/Esteban/Desktop/proyectosT/deathcloud-database/REVIEW_REPORT.md)**

---

## 📄 Licencia
Este proyecto se distribuye bajo la Licencia **MIT**.
