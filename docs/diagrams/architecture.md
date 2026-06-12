# Architecture Diagram

System topology for Encounters of the Void.

## Multi-Module SCS Architecture (TECH-012)

Maven multi-module project with a Spring Cloud Gateway entry point routing to four self-contained Spring Boot microservices.

```mermaid
graph LR
    Client["Client"]

    subgraph GW ["gateway :8080"]
        Gateway["GatewayApplication\nSpring Cloud Gateway"]
    end

    subgraph US ["user-service :8081"]
        UC["UsersController\nGET /api/users/"]
        UDB[("H2 dev\nPG prod")]
    end

    subgraph LS ["layout-service :8082"]
        LC["LayoutsController\nGET /api/layouts/"]
        LDB[("H2 dev\nPG prod")]
    end

    subgraph CS ["campaign-service :8083"]
        CC["CampaignsController\nGET /api/campaigns/"]
        CDB[("H2 dev\nPG prod")]
    end

    subgraph TS ["template-service :8084"]
        TC["TemplatesController\nGET /api/templates/"]
        TDB[("H2 dev\nPG prod")]
    end

    Client -->|"HTTP"| Gateway
    Gateway -->|"/api/users/**"| UC
    Gateway -->|"/api/layouts/**"| LC
    Gateway -->|"/api/campaigns/**"| CC
    Gateway -->|"/api/templates/**"| TC
    UC --- UDB
    LC --- LDB
    CC --- CDB
    TC --- TDB
```

### Gateway Route Configuration (`gateway/src/main/resources/application.yaml`)

| Route ID | Path Predicate | Upstream URI |
|----------|---------------|--------------|
| user-service | `/api/users/**` | `http://localhost:8081` |
| layout-service | `/api/layouts/**` | `http://localhost:8082` |
| campaign-service | `/api/campaigns/**` | `http://localhost:8083` |
| template-service | `/api/templates/**` | `http://localhost:8084` |

### SCS Datasource Profiles

| Profile | Datasource | DDL |
|---------|-----------|-----|
| default (dev) | H2 in-memory (`jdbc:h2:mem:<service>db`) | `update` |
| `prod` | PostgreSQL via `DB_HOST/DB_PORT/DB_NAME_*/DB_USER/DB_PASS` env vars | `validate` |
| `test` | H2 in-memory (`jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1`) | `create-drop` |

---

## Legacy Monolith + Docker Topology (pre-TECH-012)

The original single-module backend with Vite dev server and Docker Compose deployment.

```mermaid
graph TD
    Browser["Browser"]

    subgraph Frontend ["Frontend (Vite Dev Server :5173)"]
        Vite["Vite Dev Server\n(proxy /api/* → :8080)"]
        React["React 19 App\n(App.tsx)"]
        MWC["@material/web\nmd-filled-card\n(per-component import)"]
        ErrorState["Error State\n(p.error renders on fetch failure)"]
    end

    subgraph Backend ["Backend (Spring Boot :8080)"]
        Controller["ApiController\n@RestController /api/v1"]
        HomeEP["GET /api/v1/home\n→ HAL+JSON HomeResource\n{status, _links:{self, status}}"]
        StatusEP["GET /api/v1/status\n→ {status: 'Everything is working.'}"]
        CorsConfig["CorsConfig\n(allows :5173 on /api/**)"]
    end

    Browser -->|"loads UI"| Vite
    Vite --> React
    React --> MWC
    React -->|"fetch /api/v1/home"| Vite
    Vite -->|"proxy /api/* → :8080"| Controller
    Controller --> HomeEP
    Controller --> StatusEP
    CorsConfig -.->|"CORS policy"| Controller
    React -->|"on fetch error"| ErrorState
```

## Production Deployment Topology

Docker Compose brings up two containers on isolated networks. The backend is on an internal-only network; the frontend bridges both networks and is the sole public entry point.

```mermaid
graph TD
  subgraph DockerHost["Docker Host"]
    FE["frontend\nnginx:alpine\nport 80\n(networks: frontend + backend)"]
    subgraph network_backend["network: backend (internal-only)"]
      BE["backend\neclipse-temurin:21-jre-alpine\nport 8080"]
    end
    FE -->|"/api/ proxy"| BE
  end
  Browser -->|"HTTP :80"| FE
  BE -->|"JDBC"| PG[("PostgreSQL\nexternal")]
```

## Component Notes

| Component | Details |
|-----------|---------|
| React 19 (`App.tsx`) | Single component; two states: `status` (string) and `error` (string \| null); `useEffect` fires fetch on mount |
| MWC import | Per-component: `@material/web/labs/card/filled-card.js` (not the bulk `all.js`) |
| Vite proxy | `vite.config.ts` maps `/api/*` → `http://localhost:8080`; no env var needed in dev |
| Error handling | `.catch()` in `useEffect` calls `setError()` with the error message; renders `<p className="error">` (not `md-filled-card`) when `error` state is non-null |
| CORS | `CorsConfig` permits `GET, POST, OPTIONS` from `http://localhost:5173` on `/api/**` |
