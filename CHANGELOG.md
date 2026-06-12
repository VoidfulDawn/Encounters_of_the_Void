# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Maven multi-module root `pom.xml` restructured as aggregator (packaging: `pom`) with 5 sibling modules: `user-service`, `layout-service`, `campaign-service`, `template-service`, `gateway`; Spring Boot 3.3.0 parent + Spring Cloud 2023.0.3 BOM managed in `dependencyManagement` (TECH-012, Closes #11)
- `user-service` (port 8081) — Spring Boot HAL microservice; `UsersController` serves `GET /api/users/` returning `CollectionModel<EntityModel<String>>` with HAL self link; H2 dev datasource, PostgreSQL prod datasource via `DB_HOST/DB_PORT/DB_NAME_USER/DB_USER/DB_PASS` env vars, H2 in-memory test datasource (TECH-012)
- `layout-service` (port 8082) — Spring Boot HAL microservice; `LayoutsController` serves `GET /api/layouts/` returning `CollectionModel<EntityModel<String>>`; same three-profile datasource strategy as user-service (TECH-012)
- `campaign-service` (port 8083) — Spring Boot HAL microservice; `CampaignsController` serves `GET /api/campaigns/` returning `CollectionModel<EntityModel<String>>`; PostgreSQL prod env var `DB_NAME_CAMPAIGN` (TECH-012)
- `template-service` (port 8084) — Spring Boot HAL microservice; `TemplatesController` serves `GET /api/templates/` returning `CollectionModel<EntityModel<String>>`; PostgreSQL prod env var `DB_NAME_TEMPLATE` (TECH-012)
- `gateway` (port 8080) — Spring Cloud Gateway routing `/api/users/**` → `localhost:8081`, `/api/layouts/**` → `localhost:8082`, `/api/campaigns/**` → `localhost:8083`, `/api/templates/**` → `localhost:8084`; `GatewayApplication` entry point (TECH-012)
- Multi-stage Dockerfiles for all 5 new modules using `eclipse-temurin:21-jdk-alpine` builder stage and `eclipse-temurin:21-jre-alpine` runtime stage (TECH-012)
- `@WebMvcTest` slice tests per SCS (`UsersControllerTest`, `LayoutsControllerTest`, `CampaignsControllerTest`, `TemplatesControllerTest`) and gateway context load test (`GatewayApplicationTest`) (TECH-012)
- Architecture, class, and sequence diagrams in `docs/diagrams/` updated to reflect multi-module SCS topology with gateway routing (TECH-012)
- Containerised deployment: multi-stage Dockerfiles for backend (eclipse-temurin:21-jdk builder → eclipse-temurin:21-jre-alpine runtime) and frontend (node:20-alpine builder → nginx:alpine runtime) (TECH-004)
- Docker Compose with isolated `frontend` (bridge) and `backend` (internal-only) networks; frontend exposed on port 80 (TECH-004)
- Spring profiles: `test` (H2 in-memory DB, permissive CORS for `localhost:5173`) and `prod` (PostgreSQL via `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD` env vars, restricted CORS via `FRONTEND_ORIGIN`) (TECH-004)
- Nginx reverse proxy: serves static React build assets and forwards `/api/` requests to backend service (TECH-004)
- Architecture documentation: Mermaid diagram files (`architecture.mmd`, `api-flow.mmd`, `data-model.mmd`, `component.mmd`) in `docs/diagrams/` and `docs/ARCHITECTURE.md` with production deployment topology and API flow sections (TECH-002, TECH-004)
- Production deployment topology and API flow diagrams added to `docs/ARCHITECTURE.md`, reflecting Docker Compose network isolation (frontend bridges both networks; backend on internal-only network)
- `homeEndpointReturnsHalJsonWithSelfLink` test in `ApiControllerTest` asserting both `_links.self.href` and `_links.status.href` are non-empty in HAL response (PR #1 — branch `pr-1`)
- Error-path test in `App.test.tsx` covering fetch failure → caught error → user-visible error state render (PR #1)

### Changed
- Material Web Components import in `App.tsx` switched from bulk `@material/web/all.js` to per-component imports, reducing bundle size (PR #1)
- `frontend/README.md` rewritten with project-specific setup, run instructions, and test commands, replacing the generic Vite scaffold template (PR #1)
- Deployment subgraph added to `docs/diagrams/component.mmd` documenting Docker Compose, Nginx reverse proxy, and Spring profile artefacts alongside backend and frontend component graphs (TECH-004)

### Deprecated

### Removed

### Fixed
- Fetch error handling in `App.tsx`: `.catch()` block now catches network errors and non-2xx responses, rendering a user-visible message instead of crashing (PR #1)
- HTML page `<title>` in `frontend/index.html` updated from generic `frontend` to `Encounters of the Void` (PR #1)
- React version in root `README.md` corrected from React 18 to React 19.2.6, matching `frontend/package.json` (PR #1)
- Architecture diagrams corrected: `docs/diagrams/architecture.mmd` and `docs/ARCHITECTURE.md` now accurately show `frontend` container bridging both `frontend` and `backend` Docker networks; Nginx proxy location label corrected to `/api/` (TECH-004)

### Security

## [0.2.0] - 2026-06-03

### Added
- Spring Boot 3.3.0 HAL+JSON REST API with base path `/api/v1/`
- `GET /api/v1/status` endpoint returning `{"status": "Everything is working."}`
- `GET /api/v1/home` endpoint returning HAL+JSON `HomeResource` with `_links` (self, status)
- `HomeResource` model extending Spring HATEOAS `RepresentationModel`
- CORS configuration allowing `http://localhost:5173` on `/api/**` paths (GET, POST, OPTIONS)
- React 19 + TypeScript + Vite frontend scaffold in `/frontend/`
- Material Web Components integration (`@material/web ^2.4.1`) with `md-filled-card` usage
- Vite dev server proxy: `/api/*` → `http://localhost:8080` (via `vite.config.ts`)
- `useEffect` hook in `App.tsx` fetching `/api/v1/home` and rendering HAL status field
- Spring Boot integration tests (`ApiControllerTest`) using `MockMvc`
- Frontend Vitest + React Testing Library tests (`App.test.tsx`)
- Maven wrapper (`mvnw` / `mvnw.cmd`) for zero-install builds
- README with prerequisites, local run instructions, and project overview

[0.2.0]: https://github.com/VoidfulDawn/Encounters_of_the_Void/releases/tag/v0.2.0
