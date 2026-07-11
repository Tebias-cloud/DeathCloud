# DeathCloud - Frontend (React / Vite)

La interfaz de usuario del sistema DeathCloud. Provee un portal completo donde los jugadores pueden conectarse, chatear, acceder a la tienda de e-points, consultar el catálogo de juegos, administrar su perfil, abrir tickets de soporte y donde los administradores pueden gestionar toda la plataforma.

## 🏗 Arquitectura
El frontend sigue una arquitectura basada en componentes bajo el patrón de diseño Container-Presenter, separando las vistas (`/views`) de los componentes reusables (`/components`). La gestión del estado global se realiza mediante `Zustand` (en `/store`), y la comunicación de eventos en tiempo real se maneja a través de `socket.io-client`. El enrutamiento es administrado por `react-router-dom` con protección de rutas (Auth Guards).

## 🛠 Tecnologías Utilizadas
- **React.js 18:** Librería principal de la interfaz.
- **Vite:** Empaquetador extremadamente rápido (HMR).
- **Tailwind CSS:** Para estilos y diseño rápido.
- **React Router DOM:** Manejo de múltiples rutas y vistas protegidas.
- **Zustand:** Manejo del estado global de la aplicación (Autenticación y Tienda).
- **Socket.io-client:** Cliente para el chat en tiempo real.

## 📋 Requisitos Previos
- Node.js v18 o superior
- npm v9 o superior
- Servidor Backend DeathCloud corriendo y accesible (local o remoto).

## 📦 Instalación

1. **Clona el repositorio** e instala las dependencias:
   ```bash
   npm install
   ```

2. **Configuración de Variables de Entorno:**
   Para levantar el frontend localmente y que apunte a tu backend de desarrollo, debes configurar las variables de entorno de Vite.
   - Existen dos archivos preconfigurados: `.env.development` (para local) y `.env.production` (para el servidor).
   - Verifica que `.env.development` esté apuntando hacia tu servidor backend local (usualmente puerto 3000):
   ```env
   VITE_API_URL=http://localhost:3000
   ```

## 🚀 Uso y Entornos

### Cómo levantar Frontend: Local
Este comando es el que debes usar al programar. Cargará `.env.development`.
```bash
npm run dev
```
La aplicación se lanzará en `http://localhost:5173`. Vite se encarga del recargado en vivo (Hot Module Replacement) cada vez que guardas un archivo.

### Cómo levantar Frontend: Dev (Servidor Remoto)
El entorno de desarrollo en el servidor remoto se sirve mediante Nginx en el puerto 8080. Para levantarlo manualmente en el servidor:
```bash
cd /var/www/proyecto/front-dev
npm install
npm run build
```
Nginx ya está configurado para servir la carpeta `/var/www/proyecto/front-dev/dist` en `http://192.168.50.24:8080`.

### Cómo desplegar en Producción
Para desplegar manualmente en producción (puerto 80):
```bash
cd /var/www/proyecto/front-prod
git pull origin main
npm install
npm run build
```
Nginx servirá automáticamente los archivos actualizados desde `/var/www/proyecto/front-prod/dist` en `http://192.168.50.24`.

## 🌐 URLs del Sistema

- **URL de Desarrollo (DEV):** `http://192.168.50.24:8080`
- **URL de Producción (PROD):** `http://192.168.50.24`

## 🔑 Credenciales de Prueba
Puedes utilizar las siguientes credenciales para probar el sistema:
- **Administrador Global:**
  - Correo: `admin@deathcloud.com`
  - Contraseña: `admin123`

## 📂 Rutas y Directorios en el Servidor
- **Directorio Frontend Dev:** `/var/www/proyecto/front-dev/`
- **Directorio Frontend Prod:** `/var/www/proyecto/front-prod/`
- **Build Generado:** `/var/www/proyecto/front-prod/dist/`
- **Configuración Nginx:** `/etc/nginx/conf.d/proyecto.conf`
- **Logs de Acceso Nginx:** `/var/log/nginx/access.log`
- **Logs de Error Nginx:** `/var/log/nginx/error.log`

## 🗂 Estructura de Directorios Principal
- `/src/components/`: Componentes modulares y reutilizables (Botones, Chat global, Layouts).
- `/src/views/`: Vistas de nivel de página (Login, Register, Dashboard, AdminDashboard, AnalyticsDashboard, Ranking).
- `/src/store/`: Manejadores de estado global con Zustand (`authStore.js`).
- `/src/utils/`: Funciones de utilidad y formateadores.
- `/public/assets/`: Recursos estáticos locales que no pasan por el bundler.

## 🛡️ Rutas Protegidas y Roles
El frontend maneja un sistema de rutas privadas (`PrivateRoute`) que previene a los usuarios deslogueados ver páginas del juego, y un sistema de rutas para administradores que restringe el acceso al `AdminDashboard` (`/admin`) y al `AnalyticsDashboard` (`/admin/analytics`) a los usuarios con rol `'admin'`.
