# ⚙️ DeathCloud Backend - Servidor API REST & WebSockets

El servidor backend del ecosistema **DeathCloud**, construido sobre **Node.js** con el framework **Express** para la API REST y **Socket.io** para la mensajería en tiempo real. 

El servidor implementa validación de tokens JWT, control administrativo de cuentas de usuario, soporte mediante tickets y una arquitectura resiliente de base de datos Postgres con simulador en memoria para pruebas locales.

---

## 🛠️ Tecnologías Utilizadas (Tech Stack)

*   **Entorno de Ejecución:** Node.js
*   **Framework Web:** Express.js
*   **Mensajería en Vivo (Sockets):** Socket.io
*   **Base de Datos Driver:** `pg` (PostgreSQL client pool)
*   **Cifrado y Seguridad:** `bcryptjs` (para contraseñas) y `jsonwebtoken` (JWT)
*   **Variables de Entorno:** `dotenv`

---

## 🏛️ Arquitectura del Servidor

El backend implementa una arquitectura estructurada por capas físicas:

*   **Rutas (`routes/`):** Define los endpoints de la API REST y aplica middlewares de validación de tokens.
*   **Controladores (`controllers/`):** Recibe las solicitudes HTTP, delega validaciones y orquesta las consultas a la base de datos.
*   **Configuración (`config/`):** Contiene el gestor de base de datos (`db.js`) que administra las conexiones Postgres y el fallback simulado.

---

## 🌟 Características del Servidor Original

### 1. Sistema de Contingencia (Mock Database Fallback)
*   **Detección de Caída:** El gestor de base de datos tiene configurado un tiempo límite de conexión de 8000ms. Si la conexión al host remoto falla (error `ECONNREFUSED` o timeout), cambia el estado del backend a `isLocalMockMode = true` y conmuta de manera transparente todas las llamadas SQL hacia un simulador local en memoria (`simulateQuery`), permitiendo que el servidor siga corriendo.

### 2. Sincronización Automática de Esquemas
*   **Inicialización al Boot:** Al iniciar, el backend ejecuta sentencias `CREATE TABLE IF NOT EXISTS` para asegurar que las tablas compartidas (`usuarios`, `mensajes`, `amigos`, `tickets`) estén creadas.
*   **Mapeo de Juegos:** Consulta la función `getGamePool` para crear esquemas independientes por juego (`runner`, `skies`, `game2d`) y poblar tablas de estadísticas por defecto si están vacías.

### 3. Mensajería Socket.io con Podado de Base de Datos
*   **Chat en Vivo:** Inicia un servidor de sockets que escucha el evento `enviar_mensaje`.
*   **Estrategia de Almacenamiento:** Para evitar el crecimiento infinito de la tabla de mensajería, cada inserción limpia la base de datos de producción eliminando registros antiguos por encima de las últimas 1000 entradas (`DELETE FROM mensajes WHERE id NOT IN (SELECT id ... LIMIT 1000)`).

---

## 📂 Estructura del Proyecto

```text
deathcloud-backend/
├── config/
│   └── db.js                 # Pool de conexiones PostgreSQL y simulador en memoria
├── controllers/              # Controladores de endpoints (auth, tickets, ranking, tienda)
├── middleware/               # Validación de tokens JWT y roles de usuario
├── routes/                   # Definición de rutas HTTP de la API
├── public/uploads/           # Carpeta para archivos estáticos subidos (avatars)
├── server.js                 # Punto de entrada principal e inicialización de Socket.io
└── package.json              # Dependencias del proyecto
```

---

## 🛠️ Instalación y Configuración Local

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Configurar Variables de Entorno (.env):**
    Crea un archivo `.env` en la raíz y configura tus variables:
    ```ini
    PORT=3000
    NODE_ENV=development
    JWT_SECRET=tu-clave-secreta-jwt
    DB_USER=usuario_postgres
    DB_PASSWORD=clave_postgres
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=death_cloud_dev
    FRONTEND_URL=http://localhost:5173
    ```

3.  **Iniciar Servidor de Desarrollo:**
    ```bash
    npm run dev
    ```

---

## 📄 Licencia
Este proyecto se distribuye bajo la Licencia **MIT**.
