# Architecture Diagram

System topology for Encounters of the Void.

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
