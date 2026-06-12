# Class Diagram

Key Java classes and their relationships.

## Multi-Module SCS Classes (TECH-012)

Entry points and controllers for the 5 new modules, all under `com.voidfuldawn.encountersofthevoid`.

```mermaid
classDiagram
    namespace gateway {
        class GatewayApplication {
            +main(String[] args)
        }
    }

    namespace userservice {
        class UserApplication {
            <<Application>>
            +main(String[] args)
        }
        class UsersController {
            <<RestController>>
            <<RequestMapping /api/users>>
            +getAll() ResponseEntity~CollectionModel~
        }
    }

    namespace layoutservice {
        class LayoutApplication {
            <<Application>>
            +main(String[] args)
        }
        class LayoutsController {
            <<RestController>>
            <<RequestMapping /api/layouts>>
            +getAll() ResponseEntity~CollectionModel~
        }
    }

    namespace campaignservice {
        class CampaignApplication {
            <<Application>>
            +main(String[] args)
        }
        class CampaignsController {
            <<RestController>>
            <<RequestMapping /api/campaigns>>
            +getAll() ResponseEntity~CollectionModel~
        }
    }

    namespace templateservice {
        class TemplateApplication {
            <<Application>>
            +main(String[] args)
        }
        class TemplatesController {
            <<RestController>>
            <<RequestMapping /api/templates>>
            +getAll() ResponseEntity~CollectionModel~
        }
    }

    class CollectionModel {
        <<Spring HATEOAS>>
        +of(content, links) CollectionModel
        +getContent() Collection
        +getLinks() Links
    }

    class EntityModel {
        <<Spring HATEOAS>>
        +of(content, links) EntityModel
    }

    UsersController --> CollectionModel : returns
    LayoutsController --> CollectionModel : returns
    CampaignsController --> CollectionModel : returns
    TemplatesController --> CollectionModel : returns
    CollectionModel --> EntityModel : contains
```

### HAL+JSON Response Shape (SCS root endpoints)

```json
{
  "_embedded": {},
  "_links": {
    "self": { "href": "http://localhost:808x/api/<domain>/" }
  }
}
```

---

## Legacy Monolith Classes (pre-TECH-012)

```mermaid
classDiagram
    class EncountersOfTheVoidApplication {
        +main(String[] args)
    }

    class ApiController {
        <<RestController>>
        <<RequestMapping /api/v1>>
        +status() Map~String,String~
        +home() ResponseEntity~HomeResource~
    }

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
        <<JSON shape>>
        +self: HalLink
        +status: HalLink
    }

    class HalLink {
        <<JSON shape>>
        +href: String
    }

    class CorsConfig {
        <<Configuration>>
        +addCorsMappings(CorsRegistry registry)
    }

    class WebMvcConfigurer {
        <<interface>>
    }

    HomeResource --|> RepresentationModel : extends
    HomeResource "1" --> "1..*" HalLinks : serialized as _links
    HalLinks --> HalLink : self
    HalLinks --> HalLink : status
    CorsConfig ..|> WebMvcConfigurer : implements
    ApiController --> HomeResource : creates
```

## Frontend Components

| File | Role |
|------|------|
| `App.tsx` | Root component; two states: `status: string` (init `'Loading...'`) and `error: string \| null` (init `null`); `useEffect` fetches `/api/v1/home` on mount, calls `setStatus(data.status)` on success or `setError(err instanceof Error ? err.message : 'Unknown error')` on error; renders `<p className="error">` when error is non-null, else `<md-filled-card>` |
| `main.tsx` | React entry point; mounts `<App />` into `#root` |
| `global.d.ts` | TypeScript ambient declarations for Material Web custom elements (`md-filled-card`) |
| `types/HalHome.ts` | TypeScript interface for the HAL+JSON response: `{ status: string; _links: { self: { href: string }; status: { href: string } } }` |

## HAL+JSON Response Shape (legacy)

```json
{
  "status": "Everything is working.",
  "_links": {
    "self":   { "href": "http://localhost:8080/api/v1/home" },
    "status": { "href": "http://localhost:8080/api/v1/status" }
  }
}
```
