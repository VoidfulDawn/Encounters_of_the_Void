# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Maven multi-module root `pom.xml` restructured as aggregator (packaging: `pom`) with 5 sibling modules: `user-service`, `layout-service`, `campaign-service`, `template-service`, `gateway`; Spring Boot 3.3.6 parent + Spring Cloud 2024.0.1 BOM managed in `dependencyManagement` (TECH-012, Closes #11)
- `user-service` (port 8081) — Spring Boot HAL microservice; `UsersController` serves `GET /api/users/` returning `CollectionModel<EntityModel<String>>` with HAL self link; H2 in-memory default datasource (`userdb`, `create-drop`), PostgreSQL prod datasource via `${DB_URL}`/`${DB_USERNAME}`/`${DB_PASSWORD}`, H2 in-memory test datasource (`usertestdb`) (TECH-012)
- `layout-service` (port 8082) — Spring Boot HAL microservice; `LayoutsController` serves `GET /api/layouts/` returning `CollectionModel<EntityModel<String>>`; same three-profile datasource strategy as user-service (`layoutdb` default) (TECH-012)
- `campaign-service` (port 8083) — Spring Boot HAL microservice; `CampaignsController` serves `GET /api/campaigns/` returning `CollectionModel<EntityModel<String>>`; default H2 `campaigndb`, prod `${DB_URL}`/`${DB_USERNAME}`/`${DB_PASSWORD}` (TECH-012)
- `template-service` (port 8084) — Spring Boot HAL microservice; `TemplatesController` serves `GET /api/templates/` returning `CollectionModel<EntityModel<String>>`; default H2 `templatedb`, prod `${DB_URL}`/`${DB_USERNAME}`/`${DB_PASSWORD}` (TECH-012)
- `gateway` (port 8080) — Spring Cloud Gateway routing `/api/users/**` → `http://user-service:8081`, `/api/layouts/**` → `http://layout-service:8082`, `/api/campaigns/**` → `http://campaign-service:8083`, `/api/templates/**` → `http://template-service:8084`; `GatewayApplication` entry point (TECH-012)
- Multi-stage Dockerfiles for all 5 new modules using `eclipse-temurin:21-jdk-alpine` builder stage and `eclipse-temurin:21-jre-alpine` runtime stage (TECH-012)
- `@SpringBootTest + @AutoConfigureMockMvc` tests per SCS (`UsersControllerTest`, `LayoutsControllerTest`, `CampaignsControllerTest`, `TemplatesControllerTest`) including `contextLoads()` and `@WithMockUser getAll` test, plus gateway context load test (`GatewayApplicationTest`); `spring-security-test` dependency added to each domain module (TECH-012)
- Architecture, class, and sequence diagrams in `docs/diagrams/` updated to reflect multi-module SCS topology with gateway routing (TECH-012)
- `infra/docker-compose.db.yml` — standalone PostgreSQL 16 (`postgres:16-alpine`) Docker Compose service (`eotv-postgres`) with named volume, `pg_isready` healthcheck, and read-only bind mount for schema init script; network-isolated from the `backend` Docker network by design (TECH-013)
- `infra/db/init.sql` — idempotent `CREATE SCHEMA IF NOT EXISTS` for all four SCS-owned schemas: `schema_user`, `schema_layout`, `schema_campaign`, `schema_template`; runs automatically on first container init (TECH-013)
- `infra/README.md` — start/stop commands, healthcheck verification, schema ownership table, Spring datasource URL pattern with `currentSchema` query param, and full env var reference table (TECH-013)
- `.env.example` — environment variable template documenting `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_USERNAME`, `DB_PASSWORD` with safe placeholder values; `.env` remains git-ignored (TECH-013)
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
- Spring Boot parent/BOM version reverted from 3.4.1 to 3.3.6 in root `pom.xml` to match TECH-012 spec and avoid property-binding breaking changes introduced in 3.4 (TECH-013)
- `infra/docker-compose.db.yml`: `restart: unless-stopped` added; comment block documenting standalone network isolation and `host-gateway` workaround for combined compose scenarios (TECH-013)
- Hardcoded `spring.security.user.password` removed from all committed YAML files; credentials must not be in source control (TECH-012)
- Java package names corrected from `*.userservice`/`*.campaignservice`/`*.layoutservice`/`*.templateservice` to `*.user`/`*.campaign`/`*.layout`/`*.template` per spec single-word suffix convention (TECH-012)
- `application-test.yaml` relocated from `src/main/resources` to `src/test/resources` in all four domain modules (TECH-012)
- Dockerfiles: `RUN mvn -B` changed to `-q` (quiet mode) and `ENTRYPOINT` path changed from absolute `/app/app.jar` to relative `app.jar` across all five modules (TECH-012)
- Class diagram namespace names corrected from `userservice`/`layoutservice`/`campaignservice`/`templateservice` to `user`/`layout`/`campaign`/`template` matching actual Java package suffixes (TECH-012)
- `docs/ARCHITECTURE.md` Mermaid diagram corrected: Spring Cloud Gateway version label updated from `2023.0.3` to `2024.0.1` matching `pom.xml`; "Current Implementation State" table updated to reflect completed TECH-004, TECH-012, and TECH-013 work

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
