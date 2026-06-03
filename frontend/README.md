# Encounters of the Void — Frontend

React 19 / TypeScript / Vite / Material Web Components frontend for the Encounters of the Void app.

## Tech Stack

- React 19, TypeScript
- Vite (dev server + bundler)
- Material Web Components (MWC) v2

## Prerequisites

- Node >= 20
- Java 21 (for the backend)
- Maven Wrapper included at repo root (`./mvnw`)

## Running Locally

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

The frontend starts on **http://localhost:5173** and proxies `/api` requests to the backend.

Start the backend separately:

```bash
# from repo root
./mvnw spring-boot:run
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | _(empty — uses Vite proxy)_ | Override API base URL for non-proxied deployments |

## Building for Production

```bash
npm run build
```

Output is written to `dist/`.

## Running Tests

```bash
npm test
```
