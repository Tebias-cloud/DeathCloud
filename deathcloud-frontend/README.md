# 🌐 DeathCloud Frontend - Interfaz de Usuario React

La interfaz de usuario del ecosistema **DeathCloud**. Es una aplicación web SPA (Single Page Application) construida con **React.js** y **Vite**, que provee un portal completo donde los jugadores pueden autenticarse, chatear en tiempo real, ver rankings, acceder a la tienda de skins y gestionar sus perfiles.

La aplicación adapta dinámicamente su diseño visual y temas de colores según el juego activo que el usuario seleccione en el catálogo.

---

## 🛠️ Tecnologías Utilizadas

*   **Herramienta de Compilación:** Vite
*   **Biblioteca de UI:** React (v18+)
*   **Enrutamiento:** `react-router-dom` (v6)
*   **Estilos:** Tailwind CSS y CSS Vanilla
*   **Comunicaciones Sockets:** `socket.io-client`
*   **Iconos:** `react-icons`

---

## 🏛️ Arquitectura del Cliente

La aplicación está organizada bajo los siguientes directorios de React:

*   **Contexto (`context/`):** Contiene [GameContext.jsx](file:///c:/Users/Esteban/Desktop/proyectosT/deathcloud-frontend/src/context/GameContext.jsx) que gestiona la carga dinámica del catálogo de juegos, y aplica los colores del tema de cada juego al elemento raíz de la página.
*   **Vistas (`views/`):** Páginas que se renderizan dentro del layout principal (Dashboard de jugador, Tienda de skins, Comunidad, Rankings, tickets de soporte y el Panel administrativo).
*   **Lobby Chat (`components/chat/`):** Implementa el panel lateral [LiveChatPanel.jsx](file:///c:/Users/Esteban/Desktop/proyectosT/deathcloud-frontend/src/components/chat/LiveChatPanel.jsx) que conecta el socket global.

---

## 🌟 Características de la Aplicación

### 1. Inyección de Temas Dinámica
*   **Tematización en Caliente:** Al cambiar de juego, `GameContext` lee los colores definidos en la propiedad `theme` del juego (almacenada en JSONB en la base de datos) y los escribe directamente como variables CSS en el `documentElement` (raíz del DOM), modificando el estilo visual del panel instantáneamente.

### 2. Panel de Chat en Vivo y Amigos
*   **Mensajería Instantánea:** Se conecta de manera asíncrona a la pasarela de sockets del backend. Escucha y renderiza el historial inicial y los nuevos mensajes.
*   **Lista de Amigos:** Lógica integrada para ver solicitudes entrantes/salientes y lista de amigos agregados mediante consultas asíncronas a la base de datos.
*   **Silenciar Usuarios:** Permite silenciar a usuarios específicos del chat, guardando de forma local los nombres silenciados en `localStorage`.

### 3. Simulador de Descarga de Lanzador
*   **Mock Launcher:** El Dashboard simula la descarga del launcher oficial con una barra de progreso animada, gatillando finalmente la descarga de un archivo de prueba.

---

## 📂 Estructura del Proyecto

```text
deathcloud-frontend/
├── src/
│   ├── components/           # Componentes comunes de UI y layout (MainLayout, Header)
│   │   └── chat/             # Panel de chat en vivo (LiveChatPanel)
│   ├── context/              # Contexto de estado del catálogo de juegos (GameContext)
│   ├── views/                # Vistas principales del enrutador de React
│   ├── App.jsx               # Lógica global, enrutamiento y sesión de usuario
│   ├── main.jsx              # Inicialización de React y render en el DOM
│   └── index.css             # Estilos CSS generales y directivas Tailwind
├── index.html                # Punto de entrada de carga estática de Vite
├── tailwind.config.js        # Configuraciones de estilos y temas de Tailwind
└── package.json              # Dependencias del proyecto
```

---

## 🛠️ Instalación y Configuración Local

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Configurar Variables de Entorno (.env.development):**
    Asegúrate de que la variable de desarrollo apunte al backend local:
    ```ini
    VITE_API_URL=http://localhost:3000/api
    ```

3.  **Iniciar Servidor de Desarrollo:**
    ```bash
    npm run dev
    ```

---

## ⚙️ Limitaciones y Deuda Técnica Detectada

*   **Peticiones Hardcodeadas a Localhost:** Los componentes de [Ranking.jsx](file:///c:/Users/Esteban/Desktop/proyectosT/deathcloud-frontend/src/views/Ranking.jsx#L15) y [Dashboard.jsx](file:///c:/Users/Esteban/Desktop/proyectosT/deathcloud-frontend/src/views/Dashboard.jsx#L75) realizan llamadas `fetch` directamente a `http://localhost:3000` para consultar clasificaciones. Ignoran las utilidades dinámicas y las variables de entorno, fallando si la API corre en otra IP/puerto.
*   **IP de Universidad Legacy:** El archivo `.env.production` apunta a `http://192.168.50.24/api`, requiriendo modificación para despliegues públicos alternativos.

---

## 📝 Informe de Auditoría Independiente

Para una revisión técnica de la calidad del código:
📄 **[Reporte de Revisión del Frontend (REVIEW_REPORT.md)](file:///c:/Users/Esteban/Desktop/proyectosT/deathcloud-frontend/REVIEW_REPORT.md)**

---

## 📄 Licencia
Este proyecto se distribuye bajo la Licencia **MIT**.
