# DeathCloud Database

Este repositorio contiene los scripts de inicialización, migración y poblado (seeding) de la base de datos PostgreSQL de la plataforma.

## Estructura Ordenada (Estándar de Ingeniería)

Para evitar desorden y facilitar el versionamiento (Historias de Usuario):

- `/migrations`: Contiene los scripts que crean o alteran las estructuras de las tablas (DDL).
  - `create_db.js`
  - `init_db.js` (Desarrollo)
  - `init_db_prod.js` (Producción)
- `/seeds`: Contiene los scripts que insertan datos iniciales o falsos para pruebas (DML).
  - `fill_fake_data.js`

## Uso

1. Copiar `.env.example` a `.env` y configurar la conexión.
2. Ejecutar las migraciones:
   ```bash
   node migrations/init_db.js
   ```
3. (Opcional) Poblar con datos de prueba:
   ```bash
   node seeds/fill_fake_data.js
   ```
