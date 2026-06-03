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

    class CorsConfig {
        <<Configuration>>
        +addCorsMappings(CorsRegistry registry)
    }

    class WebMvcConfigurer {
        <<interface>>
    }

    HomeResource --|> RepresentationModel : extends
    CorsConfig ..|> WebMvcConfigurer : implements
    ApiController --> HomeResource : creates
```

## Frontend Components

| File | Role |
|------|------|
| `App.tsx` | Root component; fetches `/api/v1/home` via `useEffect`, passes status string to render |
| `main.tsx` | React entry point; mounts `<App />` into `#root` |
| `global.d.ts` | TypeScript ambient declarations for Material Web custom elements |
| `types/HalHome.ts` | TypeScript interface for the HAL+JSON `HomeResource` response shape |
