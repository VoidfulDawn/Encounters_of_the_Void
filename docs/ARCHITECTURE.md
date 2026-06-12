# Architecture — Encounters of the Void

System overview for the Encounters of the Void Maven multi-module microservices stack.

## Multi-Module SCS Architecture (TECH-012)

Maven multi-module project with a Spring Cloud Gateway entry point routing to four self-contained Spring Boot microservices. Each SCS serves a HAL+JSON collection endpoint.

```mermaid
graph LR
    Client["Client"]

    subgraph GW ["gateway :8080"]
        Gateway["GatewayApplication\nSpring Cloud Gateway"]
    end

    subgraph US ["user-service :8081"]
        UC["UsersController\nGET /api/users/"]
        UDB[("H2 dev / PG prod")]
    end

    subgraph LS ["layout-service :8082"]
        LC["LayoutsController\nGET /api/layouts/"]
        LDB[("H2 dev / PG prod")]
    end

    subgraph CS ["campaign-service :8083"]
        CC["CampaignsController\nGET /api/campaigns/"]
        CDB[("H2 dev / PG prod")]
    end

    subgraph TS ["template-service :8084"]
        TC["TemplatesController\nGET /api/templates/"]
        TDB[("H2 dev / PG prod")]
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

Source: [`docs/diagrams/architecture.mmd`](diagrams/architecture.mmd) | Full detail: [`docs/diagrams/architecture.md`](diagrams/architecture.md)

### Gateway Route Configuration

| Route ID | Path Predicate | Upstream URI |
|----------|---------------|--------------|
| user-service | `/api/users/**` | `http://localhost:8081` |
| layout-service | `/api/layouts/**` | `http://localhost:8082` |
| campaign-service | `/api/campaigns/**` | `http://localhost:8083` |
| template-service | `/api/templates/**` | `http://localhost:8084` |

### SCS Datasource Profiles

| Profile | Datasource | DDL |
|---------|-----------|-----|
| default (dev) | H2 in-memory | `update` |
| `prod` | PostgreSQL via env vars | `validate` |
| `test` | H2 in-memory | `create-drop` |

---

## Legacy Monolith Architecture (pre-TECH-012)

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
    FE["frontend\nnginx:alpine\nport 80\n(networks: frontend + backend)"]
    subgraph network_backend["network: backend (internal-only)"]
      BE["backend\neclipse-temurin:21-jre-alpine\nport 8080"]
    end
    FE -->|"/api/ proxy"| BE
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

## SCS API Flow (TECH-012)

Gateway receives a request, matches a route predicate, and forwards to the appropriate self-contained service which returns a HAL+JSON collection response:

```mermaid
sequenceDiagram
    participant Client
    participant GW as Gateway :8080
    participant US as user-service :8081

    Client->>+GW: GET /api/users/ (Accept: application/hal+json)
    GW->>GW: match route Path=/api/users/**
    GW->>+US: GET /api/users/ (forwarded)
    US->>US: UsersController.getAll()
    US-->>-GW: 200 HAL+JSON {"_embedded":{},"_links":{"self":{"href":"http://localhost:8081/api/users/"}}}
    GW-->>-Client: 200 HAL+JSON
```

Source: [`docs/diagrams/api-flow.mmd`](diagrams/api-flow.mmd) | Full flows: [`docs/diagrams/sequence-diagram.md`](diagrams/sequence-diagram.md)

### Legacy Monolith API Flow (pre-TECH-012)

HAL home fetch through React/Vite dev server to the monolith backend:

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

    note over React,API: Error path - fetch failure
    React->>+ViteProxy: fetch /api/v1/home
    ViteProxy-->>-React: network error or non-2xx
    React->>React: catch block - setError(err.message or Unknown error)
    React->>Browser: render p.error with error message
```

## Data Model (TECH-012)

HAL response model used by all four SCS controllers — each returns a `CollectionModel<EntityModel<String>>` with a self link. No JPA entities exist in the current skeleton implementation.

```mermaid
classDiagram
    class CollectionModel {
        <<Spring HATEOAS>>
        +of(content, links) CollectionModel
        +getContent() Collection
        +getLinks() Links
    }

    class EntityModel {
        <<Spring HATEOAS>>
        +of(content, links) EntityModel
        +getContent() T
        +getLinks() Links
    }

    class Link {
        <<Spring HATEOAS>>
        +getRel() LinkRelation
        +getHref() String
    }

    class UsersController {
        +getAll() ResponseEntity~CollectionModel~
    }

    class LayoutsController {
        +getAll() ResponseEntity~CollectionModel~
    }

    class CampaignsController {
        +getAll() ResponseEntity~CollectionModel~
    }

    class TemplatesController {
        +getAll() ResponseEntity~CollectionModel~
    }

    CollectionModel "1" --> "0..*" EntityModel : contains
    CollectionModel "1" --> "1" Link : self rel
    EntityModel "1" --> "1" Link : self rel
    UsersController --> CollectionModel : returns
    LayoutsController --> CollectionModel : returns
    CampaignsController --> CollectionModel : returns
    TemplatesController --> CollectionModel : returns
```

Source: [`docs/diagrams/data-model.mmd`](diagrams/data-model.mmd) | Full detail: [`docs/diagrams/class-diagram.md`](diagrams/class-diagram.md)

## Component Breakdown (TECH-012)

Maven multi-module component map showing all five new modules:

```mermaid
graph TB
    subgraph root ["Root POM - com.voidfuldawn:encounters-of-the-void"]
        RootPOM["pom.xml\npackaging=pom\nSpring Boot 3.3.0 parent\nSpring Cloud 2023.0.3 BOM"]
    end

    subgraph gateway_mod ["gateway :8080"]
        GWApp["GatewayApplication\n@SpringBootApplication"]
        GWYaml["application.yaml\nroutes: users/layouts/campaigns/templates"]
    end

    subgraph user_mod ["user-service :8081"]
        UApp["Application\n@SpringBootApplication"]
        UC["UsersController\nGET /api/users/"]
    end

    subgraph layout_mod ["layout-service :8082"]
        LApp["Application\n@SpringBootApplication"]
        LC["LayoutsController\nGET /api/layouts/"]
    end

    subgraph campaign_mod ["campaign-service :8083"]
        CApp["Application\n@SpringBootApplication"]
        CC["CampaignsController\nGET /api/campaigns/"]
    end

    subgraph template_mod ["template-service :8084"]
        TApp["Application\n@SpringBootApplication"]
        TC["TemplatesController\nGET /api/templates/"]
    end

    RootPOM --> gateway_mod
    RootPOM --> user_mod
    RootPOM --> layout_mod
    RootPOM --> campaign_mod
    RootPOM --> template_mod
    GWApp --> GWYaml
    UApp --> UC
    LApp --> LC
    CApp --> CC
    TApp --> TC
```

Source: [`docs/diagrams/component.mmd`](diagrams/component.mmd)
