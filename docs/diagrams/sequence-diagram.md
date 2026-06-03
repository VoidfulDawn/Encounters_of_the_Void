# Sequence Diagrams

Request flows through the Encounters of the Void stack.

## Flow 1: Happy Path — HAL Home Fetch + Frontend Render

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
    API-->>-ViteProxy: 200 HAL+JSON {status, _links:{self, status}}
    ViteProxy-->>-React: 200 HAL+JSON response

    React->>React: setStatus(data.status)
    React->>Browser: render md-filled-card with "Everything is working."
```

## Flow 2: Error Path — Fetch Failure → Error State Render

Network error or non-2xx response is caught and surfaced to the user without crashing the app.

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
    ViteProxy->>+API: GET /api/v1/home

    alt Network error / connection refused
        ViteProxy-->>-React: fetch() rejects (TypeError)
    else Non-2xx HTTP response
        API-->>-ViteProxy: 5xx / 4xx
        ViteProxy-->>React: non-2xx Response
    end

    React->>React: .catch() handler fires
    React->>React: setError(err.message or "Unknown error")
    React->>Browser: render p.error element with error message
```

## Flow 3: GET /api/v1/status

Simple JSON health-check endpoint (direct backend call, bypasses the React app).

```mermaid
sequenceDiagram
    participant Client
    participant ViteProxy as Vite Proxy (:5173)
    participant API as ApiController (:8080)

    Client->>+ViteProxy: GET /api/v1/status
    ViteProxy->>+API: GET /api/v1/status
    API-->>-ViteProxy: 200 {"status": "Everything is working."}
    ViteProxy-->>-Client: 200 {"status": "Everything is working."}
```
