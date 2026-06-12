# Architecture — Encounters of the Void

System overview for the Spring Boot HAL API + React frontend stack.

## System Architecture

Overall topology: browser loads the React/Vite frontend, which proxies API calls to the Spring Boot backend.

```mermaid
graph TB
    Browser["Browser"]

    subgraph Frontend ["Frontend (Vite Dev Server :5173)"]
        Vite["Vite Dev Server\n(proxy /api/* → :8080)"]
        React["React 19 App\n(App.tsx)"]
        MWC["@material/web\nmd-filled-card"]
        ErrorState["Error State\n(p.error on fetch failure)"]
    end

    subgraph Backend ["Backend (Spring Boot :8080)"]
        Controller["ApiController\n@RestController /api/v1"]
        HomeEP["GET /api/v1/home\n→ HAL+JSON HomeResource"]
        StatusEP["GET /api/v1/status\n→ JSON status"]
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

Source: [`docs/diagrams/architecture.mmd`](diagrams/architecture.mmd)

## Production Deployment

Containerised deployment via Docker Compose (TECH-004). The Nginx frontend container is the sole public entry point on port 80; the Spring Boot backend is on an internal-only network unreachable from outside Docker.

```mermaid
graph TD
  subgraph DockerHost["Docker Host"]
    subgraph network_frontend["network: frontend (bridge)"]
      FE["frontend\nnginx:alpine\nport 80"]
    end
    subgraph network_backend["network: backend (internal)"]
      BE["backend\neclipse-temurin:21-jre-alpine\nport 8080"]
    end
    FE -->|"/api/* proxy"| BE
  end
  Browser -->|"HTTP :80"| FE
  BE -->|"JDBC"| PG[("PostgreSQL\nexternal")]
```

Source: [`docs/diagrams/architecture.mmd`](diagrams/architecture.mmd)

## Production API Flow

Browser request proxied through Nginx to the Spring Boot backend over the internal Docker network:

```mermaid
sequenceDiagram
    actor User
    participant Nginx as Nginx (frontend :80)
    participant Backend as Spring Boot (backend :8080)
    participant DB as PostgreSQL (external)

    User->>+Nginx: GET /api/v1/home
    Nginx->>+Backend: GET /api/v1/home (proxy_pass)
    Backend->>+DB: JDBC query (prod profile)
    DB-->>-Backend: ResultSet
    Backend-->>-Nginx: 200 HAL+JSON {status, _links:{self, status}}
    Nginx-->>-User: 200 HAL+JSON
```

Source: [`docs/diagrams/sequence-diagram.md`](diagrams/sequence-diagram.md)

## API Flow (Development)

HAL home fetch (happy path and error path):

```mermaid
sequenceDiagram
    participant Browser
    participant React as React App (App.tsx)
    participant ViteProxy as Vite Proxy (:5173)
    participant API as ApiController (:8080)

    Browser->>React: page load
    React->>React: useState("Loading...")
    React->>React: useEffect fires

    React->>+ViteProxy: fetch /api/v1/home
    ViteProxy->>+API: GET /api/v1/home (Accept: application/hal+json)
    API->>API: new HomeResource("Everything is working.")
    API->>API: resource.add(self link)
    API->>API: resource.add(status link)
    API-->>-ViteProxy: 200 HAL+JSON {status, _links:{self, status}}
    ViteProxy-->>-React: 200 HAL+JSON response

    React->>React: setStatus(data.status)
    React->>Browser: render md-filled-card with status message

    note over React,API: Error path — fetch failure
    React->>+ViteProxy: fetch /api/v1/home
    ViteProxy-->>-React: network error or non-2xx
    React->>React: catch block → setError(err.message or "Unknown error")
    React->>Browser: render p.error with error message
```

Source: [`docs/diagrams/api-flow.mmd`](diagrams/api-flow.mmd)

## Data Model

Java model classes and HAL serialisation shape:

```mermaid
classDiagram
    class HomeResource {
        -String status
        +HomeResource(String status)
        +getStatus() String
    }

    class RepresentationModel {
        <<Spring HATEOAS>>
        +add(Link link)
        +getLinks() Links
    }

    class HalLinks {
        <<JSON _links shape>>
        +self HalLink
        +status HalLink
    }

    class HalLink {
        <<JSON shape>>
        +href String
    }

    HomeResource --|> RepresentationModel : extends
    HomeResource "1" --> "1" HalLinks : serialized as _links
    HalLinks --> HalLink : self
    HalLinks --> HalLink : status
```

Source: [`docs/diagrams/data-model.mmd`](diagrams/data-model.mmd)

## Component Breakdown

Module-level component map:

```mermaid
graph TB
    subgraph backend ["Backend — com.voidfuldawn.encountersofthevoid"]
        App["EncountersOfTheVoidApplication\n(entry point)"]
        Controller["ApiController\n/api/v1/home  /api/v1/status"]
        Model["HomeResource\nextends RepresentationModel"]
        Config["CorsConfig\nimplements WebMvcConfigurer"]
    end

    subgraph frontend ["Frontend — src/"]
        MainTSX["main.tsx\n(React entry, mounts App)"]
        AppTSX["App.tsx\n(root component, fetch + render)"]
        Types["types/HalHome.ts\n(TypeScript HAL interface)"]
        GlobalD["global.d.ts\n(md-filled-card ambient decl)"]
    end

    App --> Controller
    App --> Config
    Controller --> Model
    MainTSX --> AppTSX
    AppTSX --> Types
    AppTSX --> GlobalD
```

Source: [`docs/diagrams/component.mmd`](diagrams/component.mmd)
