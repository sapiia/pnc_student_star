# Frontend Structure
- `app/` App shell and entrypoint files.
- `features/` Page-level screens grouped by role and domain.
- `components/` Reusable UI building blocks.
- `hooks/` Shared hooks.
- `lib/` Third-party setup and shared libraries.
- `services/` API clients and data services.
- `types/` TypeScript types.
- `utils/` Shared helpers.
- `assets/` Static assets.

# Routing
- Routes live in `app/App.tsx` and import screens from `features/`.
