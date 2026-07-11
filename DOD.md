# Definition of Done (DoD) - DeathCloud Core

## 1. Código
- [ ] Todo el código debe estar comentado y documentado de forma clara.
- [ ] No debe haber "código muerto" o no utilizado.
- [ ] Debe seguir las convenciones de estilo de código (linting).
- [ ] **Los commits se empujan al repositorio en Gitea (hay 3 repos separados para Frontend, Backend, Database).**
- [ ] No existen URLs de red ni credenciales "hardcodeadas" en el código fuente (se usan variables de entorno).
- [ ] Se respetan los patrones de arquitectura definidos:
  - Frontend: Separación de Responsabilidades (Vistas, Componentes, Servicios de Red).
  - Backend: Arquitectura por Capas (Controlador -> Servicio -> Repositorio).

- [ ] Las funcionalidades principales fueron probadas localmente y cumplen con los Criterios de Aceptación de la Historia de Usuario.
- [ ] No se rompen funcionalidades preexistentes (Regresión).
- [ ] La base de datos registra correctamente las operaciones relacionadas con la feature.

## 3. Revisión y Estándares
- [ ] El código ha sido revisado (o self-reviewed) buscando buenas prácticas de Clean Code.
- [ ] Los nombres de variables, funciones y ramas son semánticos y estructurados según la convención del equipo.
- [ ] La rama de trabajo tiene el nombre correspondiente a la historia de usuario (ej. `feature/HU-01-login`).

## 4. Documentación y Despliegue
- [ ] Si se añadieron nuevas variables de entorno, los archivos `.env.example` y los `README.md` han sido actualizados.
- [ ] Si hay cambios estructurales en la BD, los scripts de migración/seed están actualizados en el proyecto de Base de Datos.
