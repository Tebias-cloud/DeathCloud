# DeathCloud - Backend Server

El servidor Backend de la plataforma de juegos DeathCloud, construido con Node.js, Express y WebSockets para comunicación en tiempo real.

## 🏗 Arquitectura
El backend sigue una arquitectura multicapa (N-Tier Architecture). Separando las responsabilidades de enrutamiento (`/routes`), lógica de negocio (`/services`), y acceso a datos (`/repositories`). Utilizamos el patrón Singleton en los servicios y repositorios. La base de datos es Multi-Tenant, utilizando un esquema público para datos core y esquemas dedicados (`schema_name`) para la información específica de cada juego.

## 🛠 Tecnologías Utilizadas
- **Node.js & Express:** Framework HTTP y ruteo.
- **PostgreSQL:** Base de datos relacional.
- **Socket.io:** Comunicación en tiempo real (Chat y Estados).
- **JWT & Bcrypt:** Autenticación segura y cifrado de contraseñas.
- **Multer:** Subida y gestión de archivos e imágenes.
- **Jest & Supertest:** Framework para pruebas unitarias.

## 📋 Requisitos Previos
- Node.js v18 o superior
- npm v9 o superior
- Servidor PostgreSQL activo
- PM2 instalado globalmente (`npm install -g pm2`) para despliegue en servidor.

## 📦 Instalación

1. **Clona el repositorio** e instala las dependencias:
   ```bash
   npm install
   ```

2. **Configuración de Variables de Entorno:**
   Para poder levantar el proyecto en tu máquina (desarrollo), necesitas configurar las variables de entorno.
   - Crea una copia del archivo `.env.example` y llámala `.env.dev` (este es el archivo que se usará para desarrollo local).
   - Abre `.env.dev` y completa los datos de conexión a la base de datos local.
   ```env
   PORT=3000
   DB_USER=postgres
   DB_HOST=localhost
   DB_PASSWORD=tu_clave
   DB_PORT=5432
   DB_NAME=death_cloud_dev
   JWT_SECRET=tu_secreto_super_seguro
   FRONTEND_URL=http://localhost:5173
   ```

## 🚀 Uso y Entornos de Ejecución

### Cómo conectarse a la BD y ejecutar migraciones
Toda la lógica de migración y populación de datos ha sido movida a la carpeta `deathcloud-database`.
Para inicializar tu base de datos en local:
```bash
cd deathcloud-database
npm install
node setup_db.js
```

### Cómo levantar Backend: Local
Este es el que debes usar mientras escribes código en tu computadora:
```bash
npm run dev
# o para recarga automática al guardar cambios (Nodemon):
npm run dev:watch
```

### Cómo levantar Backend: Dev (Servidor Remoto)
Cuando el código se despliega en el servidor (ej: `192.168.50.24`), el entorno **DEV** se expone en el **puerto 8080** (`http://192.168.50.24:8080` vía Nginx).
- El backend de DEV corre internamente en el puerto 3000 y usa `.env.dev`.
- Para levantarlo manualmente con PM2:
```bash
cd /var/www/proyecto/back-dev
pm2 start server.js --name back-dev
pm2 save
```

### Cómo desplegar en Producción
El entorno de **PROD** es el oficial y se expone directo en la **IP sola (Puerto 80)** (`http://192.168.50.24`).
- El backend de PROD corre internamente en el puerto 4000 usando `.env.prod`.
- Para desplegar en producción:
```bash
cd /var/www/proyecto/back-prod
git pull origin main
npm install
pm2 restart back-prod
```

## 🌐 URLs del Sistema
- **URL de Desarrollo (DEV API):** `http://192.168.50.24:8080/api`
- **URL de Producción (PROD API):** `http://192.168.50.24/api`

## 📂 Rutas y Directorios en el Servidor
- **Directorio Backend Dev:** `/var/www/proyecto/back-dev/`
- **Directorio Backend Prod:** `/var/www/proyecto/back-prod/`
- **Logs de PM2:** `~/.pm2/logs/`
- **Logs Locales del App:** `/var/www/proyecto/back-prod/logs/prod/error.log`

## 🧪 Testing y Calidad

### Cómo ejecutar pruebas unitarias
El backend utiliza Jest para las pruebas de los servicios principales.
```bash
npm run test
```

### Cómo ejecutar SonarScanner desde local
Para analizar la calidad del código, deuda técnica y cobertura:
1. Asegúrate de tener SonarQube corriendo localmente (puerto 9000).
2. Ejecuta el scanner apuntando al servidor de Sonar:
```bash
sonar-scanner \
  -Dsonar.projectKey=deathcloud-backend \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=tu_token_generado
```

## 📁 Rutas de la API (Endpoints Principales)
Todas las rutas protegidas requieren enviar un token JWT válido en las cabeceras: `Authorization: Bearer <token>`.

### Autenticación (`/api`)
- `POST /login`: Valida credenciales e inicia sesión.
- `POST /register`: Registra un nuevo usuario.

### Usuarios (`/api`)
- `GET /users/me`: Obtiene los detalles de la sesión actual.
- `PUT /users/me`: Actualiza avatar o nickname.

### Tienda / Catálogo (`/api/catalog`)
- `GET /store`: Devuelve todos los artículos de la tienda.
- `GET /games`: Devuelve la información de los juegos.

### Administrador (`/api/admin`) *(Requiere rol `admin`)*
- `GET /users`: Lista a todos los usuarios registrados.
- `GET /api/analytics/dashboard`: Devuelve las estadísticas y reporte del sistema.

### Sistema
- `GET /api/version`: Devuelve la versión actual del backend desplegado.

---
**DeathCloud** - Desarrollado para gestión de catálogo, soporte técnico e identidades centralizadas.
