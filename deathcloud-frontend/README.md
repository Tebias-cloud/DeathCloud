# 🌐 DeathCloud Frontend - Interfaz de Usuario React

La interfaz de usuario del ecosistema **DeathCloud**. Es una aplicación web SPA (Single Page Application) construida con **React.js** y **Vite**, que provee un portal completo donde los jugadores pueden autenticarse, chatear en tiempo real, ver rankings, acceder a la tienda de skins y gestionar sus perfiles.

La aplicación adapta dinámicamente su diseño visual y temas de colores según el juego activo que el usuario seleccione en el catálogo.

---

## 🛠️ Tecnologías Utilizadas

*   **Herramienta de Compilación:** Vite
*   **Biblioteca de UI:** React (v19)
*   **Enrutamiento:** `react-router-dom` (v7 / HashRouter)
*   **Estilos:** Tailwind CSS y CSS Vanilla
*   **Comunicaciones Sockets:** `socket.io-client` (Emulado)
*   **Gestión de Reportes:** `xlsx` y `jspdf` / `html2canvas`

---

## 🏛️ Arquitectura del Cliente

La aplicación está organizada bajo los siguientes directorios de React:

*   **Contexto (`context/`):** Contiene `GameContext.jsx` que gestiona la carga del catálogo de juegos y aplica dinámicamente los estilos y colores del tema del juego activo en el DOM.
*   **Vistas (`views/`):** Páginas del enrutador de React (Dashboard, Tienda, Comunidad, Rankings, Perfil y Panel Administrativo).
*   **Lobby Chat (`components/chat/`):** Implementa el panel lateral `LiveChatPanel.jsx` que conecta al canal de mensajería WebSocket.
*   **Capa de Simulación (`src/mocks/`):** 
    *   `browserDb.js`: Implementa el simulador de base de datos relacional sobre `localStorage`.
    *   `fetchMock.js`: Registra interceptores globales síncronos sobre `fetch` y `axios` para desviar las peticiones al motor local.
    *   `socketMock.js`: Emula el comportamiento bidireccional de `socket.io-client`.

---

## 📂 Estructura del Proyecto

```text
deathcloud-frontend/
├── src/
│   ├── components/           # Componentes comunes de UI y layout (MainLayout, Header)
│   │   └── chat/             # Panel de chat en vivo (LiveChatPanel)
│   ├── context/              # Contexto de estado del catálogo de juegos (GameContext)
│   ├── mocks/                # Capa de emulación/simulación local en cliente
│   ├── views/                # Vistas principales del enrutador de React
│   ├── App.jsx               # Lógica global, enrutamiento (HashRouter) y sesión de usuario
│   ├── main.jsx              # Registro de interceptores e inicialización de React
│   └── index.css             # Estilos CSS generales y directivas Tailwind
├── index.html                # Punto de entrada de carga estática de Vite
├── tailwind.config.js        # Configuraciones de estilos de Tailwind
└── package.json              # Dependencias del proyecto
```

---

## 🛠️ Instalación y Configuración Local

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Iniciar Servidor de Desarrollo:**
    ```bash
    npm run dev
    ```

3.  **Compilar y Generar el Paquete de Producción:**
    ```bash
    npm run build
    ```

4.  **Previsualizar el Build Generado:**
    ```bash
    npm run preview
    ```

---

## 📄 Licencia
Este proyecto se distribuye bajo la Licencia **MIT**.
