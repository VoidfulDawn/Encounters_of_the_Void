# CLAUDE.md

## Product vision

Encounters of the Void is a standalone responsive web campaign tool for Pen & Paper Game Masters. It should help GMs organize worlds, create custom creatures, and prepare/run combat encounters with clean, flexible, reusable layouts.

Core promise: give GMs freedom to run campaigns their way without losing control of the chaos.

Product priorities:

- encounter creation and encounter running first
- clean, calm UI over feature density
- customizable layouts, dashboards, creature sheets, and encounter views
- reusable saved layouts/designs/templates after login
- Pathfinder-shaped depth, but avoid hard-locking to one ruleset too early
- usable across desktop, tablet, and mobile; tablet matters for table-side play

Avoid:

- bloat
- chaotic UI
- rigid one-size-fits-all workflows
- generic note-taking clone behavior
- accidental VTT scope creep
- rules database first, GM workflow second

For the full product vision, see `PRODUCT_VISION.md`.

## Current technical baseline

- Backend: Spring Boot 3.3, Java 21, Maven Wrapper
- API style: REST with Spring HATEOAS / HAL responses under `/api/v1`
- Frontend: React 19, TypeScript, Vite, Material Web Components
- Dev ports: backend `:8080`, frontend `:5173`
- Frontend proxies `/api` requests to the backend in development

## Development commands

Backend:

```bash
./mvnw test
./mvnw spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm test
npm run typecheck
npm run lint
npm run build
npm run dev
```

## Ticket guidance

For every UI or UX ticket, include responsive behavior expectations for desktop, tablet, and mobile.

For every feature ticket, check whether it improves one of:

1. encounter creation/running
2. campaign/world organization
3. customization or reusable layouts/designs
4. custom creature management
5. clean multi-device usability
6. saved user state behind login
