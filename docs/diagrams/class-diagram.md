# Class Diagram

Key Java classes and their relationships.

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
| `App.tsx` | Root component; `useState<string>('Loading...')` holds `status`; `useEffect` fetches `/api/v1/home` on mount, calls `setStatus(data.status)` on success or `setStatus('Failed to load status.')` on error |
| `main.tsx` | React entry point; mounts `<App />` into `#root` |
| `global.d.ts` | TypeScript ambient declarations for Material Web custom elements (`md-filled-card`) |
| `types/HalHome.ts` | TypeScript interface for the HAL+JSON response: `{ status: string; _links: { self: { href: string }; status: { href: string } } }` |

## HAL+JSON Response Shape

```json
{
  "status": "Everything is working.",
  "_links": {
    "self":   { "href": "http://localhost:8080/api/v1/home" },
    "status": { "href": "http://localhost:8080/api/v1/status" }
  }
}
```
