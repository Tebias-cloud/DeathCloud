# 🚀 DeathCloud Core

Bienvenido al repositorio consolidado de **DeathCloud Core**, una plataforma web full-stack de distribución de videojuegos, perfiles de usuario, mensajería instantánea en vivo, sistema de tickets y análisis de estadísticas de juego.

Este repositorio está estructurado como un **monorepo** para facilitar la exhibición y despliegue del proyecto completo desde un único lugar.

---

## 📁 Estructura del Proyecto

- **[deathcloud-frontend/](file:///c:/Users/esteb/OneDrive/Escritorio/Uni/ProyectosU/deathcloud%20core/deathcloud-frontend)**: Cliente SPA construido con **React.js**, **Vite** y **Vanilla CSS**.
- **[deathcloud-backend/](file:///c:/Users/esteb/OneDrive/Escritorio/Uni/ProyectosU/deathcloud%20core/deathcloud-backend)**: Servidor REST API y WebSockets con **Node.js**, **Express** y **Socket.io**.
- **[deathcloud-database/](file:///c:/Users/esteb/OneDrive/Escritorio/Uni/ProyectosU/deathcloud%20core/deathcloud-database)**: Scripts de creación, seedings y migración de base de datos PostgreSQL, junto con sus respectivos scripts de rollback.

---

## 🏛️ Decisiones de Diseño y Arquitectura

### 1. Backend: Estructura por Capas Pura
Para asegurar el desacoplamiento de código y la mantenibilidad a largo plazo, el backend implementa una arquitectura limpia estructurada en capas físicas:
- **Controllers:** Reciben las peticiones HTTP, validan los parámetros iniciales y retornan las respuestas formateadas.
- **Services:** Contienen la lógica de negocio pura y coordinan llamadas a los repositorios.
- **Repositories (DAO):** Encapsulan todas las consultas SQL (DDL y DML). Los servicios no tienen conocimiento de cómo se almacenan o consultan los datos en la base de datos PostgreSQL.

### 2. Base de Datos Dinámica y Segmentada
El backend permite la creación dinámica de esquemas de base de datos y tablas segmentadas para cada juego registrado en la plataforma (esquemas independientes con tablas de skins de usuario, estadísticas de juego y foros comunitarios), aislando los datos por título de manera ágil y segura.

### 3. Aseguramiento de Calidad (QA) y SonarQube
El código frontend y backend cumple rigurosamente con los estándares de calidad de **SonarQube Quality Gate** (cobertura aprobada, 0% de duplicados críticos de código y código moderno libre de llamadas DOM obsoletas).

### 4. Optimización de Red y Carga
Implementación de lógica optimizada de dependencias en Hooks de React (`useInventory.js`) para prevenir ciclos de renderizado y peticiones HTTP infinitas o redundantes de forma activa.

---

## ⚙️ CI/CD y Despliegue en GitHub

El proyecto está configurado para ejecutarse y desplegarse automáticamente usando **GitHub Actions**:

- **Frontend (GitHub Pages):** Al hacer push a la rama `main`, GitHub Actions compila la carpeta `deathcloud-frontend` de forma estática y la publica automáticamente en **GitHub Pages** (rama `gh-pages`) de tu repositorio de forma transparente.
- **Backend (Servidor Único via SSH):** Valida las pruebas de Jest y, tras el éxito, abre una sesión SSH segura con tu servidor en la nube (ej. VPS) para actualizar el código en caliente y reiniciar la aplicación en **PM2**.

---

## 🛠️ Cómo Ejecutar en Entorno Local (Desarrollo)

### 1. Variables de Entorno (.env)
Crea y configura los archivos `.env` correspondientes:

* **En `deathcloud-backend/`** (crea un archivo `.env`):
  ```ini
  PORT=3000
  DB_USER=tu_usuario
  DB_PASSWORD=tu_contraseña
  DB_HOST=localhost
  DB_PORT=5432
  DB_NAME=death_cloud_dev
  JWT_SECRET=tu_firma_jwt_secreta
  ```

* **En `deathcloud-frontend/`** (crea un archivo `.env`):
  ```ini
  VITE_API_URL=http://localhost:3000/api
  ```

### 2. Iniciar el Backend
```bash
cd deathcloud-backend
npm install
npm run dev
```

### 3. Iniciar el Frontend
```bash
cd deathcloud-frontend
npm install
npm run dev
```

### 4. Inicializar Base de Datos (Opcional)
```bash
cd deathcloud-database
# Si deseas poblar la base de datos local con datos falsos realistas
node run_seed.js
```
