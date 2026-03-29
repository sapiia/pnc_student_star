# Backend Structure
- `app/` Express app, server entry, realtime socket wiring.
- `config/` Environment, database, and path helpers.
- `modules/` Feature-first modules that bundle routes, controllers, and models.
- `utils/` Shared utilities.
- `uploads/` Static assets used by the app.

# Module Pattern
- Each module keeps `*.routes.js`, `*.controller.js`, and `*.model.js` together.
- App wiring lives in `app/app.js` and imports from `modules/index.js`.
