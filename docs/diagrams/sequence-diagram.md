# Sequence Diagrams

Request flows through the Encounters of the Void stack.

## Flow 1: GET /api/v1/status

Simple JSON health-check endpoint.

```mermaid
sequenceDiagram
    participant Browser
    participant ViteProxy as Vite Proxy (:5173)
    participant API as ApiController (:8080)

    Browser->>+ViteProxy: GET /api/v1/status
    ViteProxy->>+API: GET /api/v1/status
    API-->>-ViteProxy: 200 {"status": "Everything is working."}
    ViteProxy-->>-Browser: 200 {"status": "Everything is working."}
```

## Flow 2: HAL Home Fetch + Frontend Render

React app starts, fetches the HAL home resource, and renders the status message using a Material Web Component.

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
    API-->>-ViteProxy: 200 HAL+JSON\n{status, _links:{self, status}}
    ViteProxy-->>-React: 200 HAL+JSON response

    React->>React: setStatus(data.status)
    React->>Browser: render md-filled-card\nwith status message
```
