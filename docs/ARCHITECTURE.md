# Architecture — Encounters of the Void

Agent reference document. Describes the target system design.
Use this when writing tickets, reviewing code, and proposing implementation plans.
Always check this document before designing a new feature or service.

## Multi-Module SCS Architecture (TECH-012)

Maven multi-module project: a Spring Cloud Gateway entry point routes traffic to four self-contained Spring Boot microservices. Each service manages its own H2 (dev/test) or PostgreSQL (prod) datasource.

```mermaid
graph LR
    Client["Client"]

    subgraph GW ["gateway :8080"]
        Gateway["GatewayApplication\nSpring Cloud Gateway 2023.0.3"]
    end

    subgraph US ["user-service :8081"]
        UC["UsersController\nGET /api/users/"]
        UDB[("H2 dev/test\nPG prod")]
    end

    subgraph LS ["layout-service :8082"]
        LC["LayoutsController\nGET /api/layouts/"]
        LDB[("H2 dev/test\nPG prod")]
    end

    subgraph CS ["campaign-service :8083"]
        CC["CampaignsController\nGET /api/campaigns/"]
        CDB[("H2 dev/test\nPG prod")]
    end

    subgraph TS ["template-service :8084"]
        TC["TemplatesController\nGET /api/templates/"]
        TDB[("H2 dev/test\nPG prod")]
    end

    Client -->|"HTTP"| Gateway
    Gateway -->|"/api/users/**\nhttp://user-service:8081"| UC
    Gateway -->|"/api/layouts/**\nhttp://layout-service:8082"| LC
    Gateway -->|"/api/campaigns/**\nhttp://campaign-service:8083"| CC
    Gateway -->|"/api/templates/**\nhttp://template-service:8084"| TC
    UC --- UDB
    LC --- LDB
    CC --- CDB
    TC --- TDB
```

Source: [`docs/diagrams/architecture.md`](diagrams/architecture.md)

---

## System Overview

Encounters of the Void is a full-stack web application built on the
**Self-Contained System (SCS)** pattern. Each SCS owns one domain slice
end-to-end: its own Spring Boot application, its own schema on a shared
database, and its own HAL API surface. An API Gateway mediates all
frontend-to-backend traffic. The React frontend uses MobX for state and
Material UI for visual components.

```
Browser
  └── React SPA (MobX + Material UI)
        └── [OAuth token on every request]
              └── API Gateway (Spring Cloud Gateway)
                    ├── /api/users/**   → User SCS      (:8081)
                    ├── /api/layouts/** → Layout SCS     (:8082)
                    ├── /api/campaigns/**→ Campaign SCS  (:8083)
                    └── /api/templates/**→ Template SCS  (:8084)

  SCS-to-SCS calls:
    Layout SCS    →[basic-auth]→ User SCS
    Campaign SCS  →[basic-auth]→ User SCS, Template SCS
    Template SCS  →[basic-auth]→ (none currently)
```

---

## Self-Contained Systems

### Design rules for every SCS

1. Each SCS is a standalone Spring Boot 3.x application.
2. Each SCS exposes a REST API using Spring HATEOAS — all responses are HAL+JSON.
3. Each SCS has its own Maven module and its own Spring Security config.
4. SCS share the same PostgreSQL instance but each owns a dedicated schema
   (e.g. `schema_user`, `schema_layout`, `schema_campaign`, `schema_template`).
5. SCS never share JPA entities or repositories with each other.
6. Cross-SCS reads use HTTP clients (Spring `RestClient`) authenticated with
   an internal basic-auth user — never direct DB joins across schemas.
7. No SCS exposes internal endpoints publicly. The API Gateway is the only
   public ingress.

### SCS catalogue

| SCS           | Port  | Schema            | Core responsibility                                      |
|---------------|-------|-------------------|----------------------------------------------------------|
| user-service  | 8081  | schema_user       | Accounts, roles, OAuth resource server, profile data     |
| layout-service| 8082  | schema_layout     | Saved layout definitions, user-layout ownership, rendering config |
| campaign-service | 8083 | schema_campaign  | Campaigns, worlds, encounters, creatures (runtime data)  |
| template-service | 8084 | schema_template  | Reusable creature templates, encounter presets, note templates |

### SCS Maven structure (each module)

```
<scs-name>/
  src/
    main/
      java/com/voidfuldawn/encountersofthevoid/<scs>/
        <ScsName>Application.java          # Spring Boot entry point
        api/                               # @RestController classes
        domain/                            # JPA entities, value objects
        repository/                        # Spring Data JPA repositories
        service/                           # Business logic
        client/                            # RestClient beans for inter-SCS calls
        config/                            # Security, CORS, HATEOAS, DB schema
        model/                             # HAL resource assemblers + models
      resources/
        application.yaml
        application-prod.yaml
        application-test.yaml
    test/
      java/...
        api/                               # MockMvc / @WebMvcTest
        service/                           # @ExtendWith(MockitoExtension)
        client/                            # WireMock stubs for inter-SCS
```

---

## API Gateway

- Technology: **Spring Cloud Gateway** (separate Spring Boot app, port 8080)
- Responsibilities:
  - Route `/api/<domain>/**` to the corresponding SCS
  - Validate OAuth 2.0 Bearer tokens (resource server mode, delegates to
    user-service or authorization server)
  - Strip internal headers before forwarding
  - Apply rate limiting and CORS policy for the public surface
- The gateway does NOT contain business logic.
- Gateway config lives in `gateway/src/main/resources/application.yaml`
  under `spring.cloud.gateway.routes`.

---

## Authentication

### Frontend → Gateway (public auth)

- **Protocol:** OAuth 2.0 with PKCE (Authorization Code flow)
- The React SPA obtains an access token from the authorization server
  (initially integrated into user-service; may be extracted later).
- Every request from the frontend carries `Authorization: Bearer <token>`.
- The gateway validates the token. Requests without a valid token receive 401.
- User identity (`sub`, roles) is forwarded to SCS via a trusted internal header
  (`X-Auth-User-Id`, `X-Auth-Roles`) added by the gateway after validation.
- SCS trust these headers only when requests arrive without a Bearer token
  (i.e. from the gateway on the internal network, not from the public internet).

### SCS → SCS (internal auth)

- **Protocol:** HTTP Basic Auth over the internal Docker network.
- Each SCS that receives cross-SCS calls has one dedicated service account
  (username/password) configured in its Spring Security in-memory or
  properties-based user details.
- Calling SCS inject credentials via `RestClient` using a pre-configured
  `BasicAuthenticationInterceptor`.
- Internal basic-auth credentials are never exposed through the gateway.
- Credential rotation: update `application-prod.yaml` env vars + restart.

### Internal credential naming convention

```
# In the receiving SCS (e.g. user-service application-prod.yaml)
internal:
  clients:
    layout-service:
      username: ${INTERNAL_LAYOUT_USER}
      password: ${INTERNAL_LAYOUT_PASS}
    campaign-service:
      username: ${INTERNAL_CAMPAIGN_USER}
      password: ${INTERNAL_CAMPAIGN_PASS}
```

---

## Database

- Engine: **PostgreSQL** (single instance in development and production)
- One schema per SCS — enforced at Flyway migration level.
- Schema names: `schema_user`, `schema_layout`, `schema_campaign`, `schema_template`
- Each SCS sets `spring.jpa.properties.hibernate.default_schema` to its schema.
- Flyway migrations live in each SCS under `src/main/resources/db/migration/`.
- Migration file naming: `V<NNN>__<description>.sql` (per-SCS counter, not global).
- Cross-schema foreign keys are **forbidden** — referential integrity across
  domains is maintained at the application level via HTTP calls.

---

## API Design (HAL)

All SCS return `application/hal+json`. Rules:

- Root collection: `GET /api/<domain>/` → `_embedded.<entity-list>` + `_links`
- Single resource: `GET /api/<domain>/<id>` → entity fields + `_links.self`
- Related resources are linked, not embedded by default (avoid N+1 over HTTP).
- Mutation endpoints (`POST`, `PUT`, `PATCH`, `DELETE`) return the updated
  resource with its HAL links.
- Use Spring HATEOAS `RepresentationModel`, `CollectionModel`, and
  `EntityModel` — do not hand-roll HAL JSON.
- Assemblers (`RepresentationModelAssembler`) live in `model/assemblers/`.
- Pagination: `PagedModel` for list endpoints that may grow large.

Example shape for a campaign:

```json
{
  "id": "c1a2b3",
  "name": "The Iron Siege",
  "worldId": "w9f8e7",
  "_links": {
    "self":      { "href": "/api/campaigns/c1a2b3" },
    "encounters":{ "href": "/api/campaigns/c1a2b3/encounters" },
    "world":     { "href": "/api/campaigns/c1a2b3/world" },
    "owner":     { "href": "/api/users/u5d4c3" }
  }
}
```

---

## Frontend

- Framework: **React 19**, TypeScript
- State management: **MobX** — one MobX store per domain slice (UserStore,
  LayoutStore, CampaignStore, TemplateStore). Stores mirror the SCS split.
- UI components: **Material UI (MUI)** — use MUI components as the base layer.
  Custom components wrap MUI — do not bypass MUI to write raw CSS for layout.
- Component design:
  - Small, single-responsibility components.
  - Presentational components receive data as props; no direct store access.
  - Container components (suffixed `View` or `Page`) connect to MobX stores.
  - Co-locate component styles using MUI `sx` prop or `styled()`.
- Routing: React Router v6 with nested routes per domain.
- API layer: a thin `api/` module per domain (`api/campaigns.ts`,
  `api/layouts.ts`, etc.) using `fetch` with the Bearer token injected from
  `UserStore`. No API logic in components.
- Build: Vite.
- Dev proxy: Vite proxies `/api/**` to the gateway at `:8080`.

### Frontend directory structure

```
frontend/src/
  api/          # fetch wrappers per domain
  components/   # shared, reusable presentational components
  pages/        # route-level page components (one per route)
  stores/       # MobX stores (UserStore, CampaignStore, etc.)
  types/        # TypeScript interfaces for HAL resources
  hooks/        # custom React hooks
  theme/        # MUI theme config
  App.tsx
  main.tsx
```

---

## Deployment Topology

```
Docker Compose (dev) / Kubernetes (prod target)
  ├── postgres          (shared DB, 4 schemas)
  ├── gateway           (:8080, public)
  ├── user-service      (:8081, internal only)
  ├── layout-service    (:8082, internal only)
  ├── campaign-service  (:8083, internal only)
  ├── template-service  (:8084, internal only)
  └── frontend          (:80, Nginx SPA + proxy to gateway)
```

- SCS containers are on an internal Docker network with no published ports.
- Only the gateway and frontend are reachable from outside the Docker network.
- Nginx on the frontend container serves the React SPA and proxies
  `/api/**` to the gateway.

---

## Current Implementation State

The codebase is in an early bootstrapping phase. The following components
exist today:

| Component           | Status            | Notes                                  |
|---------------------|-------------------|----------------------------------------|
| Spring Boot app     | Exists (monolith) | Single module, not yet split into SCS  |
| `ApiController`     | Implemented       | `/api/v1/home`, `/api/v1/status`       |
| `HomeResource` (HAL)| Implemented       | Extends RepresentationModel            |
| `CorsConfig`        | Implemented       | Reads `cors.allowed-origins`           |
| React frontend      | Implemented       | Fetches `/api/v1/home`, MWC card       |
| Docker Compose      | PR open (TECH-004)| Multi-stage builds, Nginx, profiles    |
| API Gateway         | Not started       |                                        |
| SCS split           | Not started       | Monolith refactor → 4 SCS modules      |
| MobX stores         | Not started       |                                        |
| Material UI         | Not started       | Currently using @material/web          |
| PostgreSQL + schemas| Not started       |                                        |
| OAuth               | Not started       |                                        |
| Inter-SCS clients   | Not started       |                                        |

The migration path:
1. Merge TECH-004 (Docker infra)
2. Introduce PostgreSQL + multi-module Maven structure
3. Extract SCS one by one starting with user-service
4. Add API Gateway once two SCS exist
5. Migrate frontend from @material/web → MUI, add MobX
6. Wire OAuth between frontend and gateway/user-service

---

## Ticket-Writing Guide for Agents

When the user describes a feature, map it to this architecture before writing tickets.

**Checklist:**
- Which SCS owns this domain data? The ticket goes to that SCS.
- Does this feature require cross-SCS data? If yes, one ticket for the providing
  SCS (add endpoint) and one for the calling SCS (add HTTP client call).
- Is this a new entity? Include: Flyway migration, JPA entity, repository,
  service, assembler, controller, tests.
- Is this a frontend feature? Include: TypeScript HAL type, api/ fetch wrapper,
  MobX store action/observable, presentational component, page/container
  component, MUI layout, responsive behavior (desktop + tablet + mobile).
- Authentication-touching work always involves user-service and gateway.
- New inter-SCS communication always requires an internal basic-auth credential
  in both the calling (client config) and receiving (security config) SCS.

**Do not:**
- Write tickets that add cross-schema DB joins.
- Write tickets that expose SCS ports publicly.
- Write tickets that put business logic in the gateway.
- Write tickets that mix MobX store logic into presentational components.
- Write tickets that use `@material/web` — the target is MUI.
