# Encounters of the Void

Full-stack application with a Spring Boot 3.x / Java 21 HAL API backend and a React 19 / TypeScript / Vite / Material Web Components frontend.

## Prerequisites

- Java 21
- Node 18+
- Maven Wrapper included (`./mvnw`)

## Running the Backend

```bash
./mvnw spring-boot:run
```

The backend starts on **port 8080**.

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on **port 5173** and proxies `/api` requests to the backend.

## Verifying Endpoints

```bash
curl http://localhost:8080/api/v1/status
curl -H "Accept: application/hal+json" http://localhost:8080/api/v1/home
```

## Project Structure

```
.
├── .mvn/wrapper/          Maven wrapper config
├── src/
│   ├── main/
│   │   ├── java/com/voidfuldawn/encountersofthevoid/
│   │   │   ├── EncountersOfTheVoidApplication.java
│   │   │   ├── config/CorsConfig.java
│   │   │   ├── controller/ApiController.java
│   │   │   └── model/HomeResource.java
│   │   └── resources/application.properties
│   └── test/
│       └── java/com/voidfuldawn/encountersofthevoid/
│           └── ApiControllerTest.java
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.test.tsx
│   │   ├── setupTests.ts
│   │   ├── global.d.ts
│   │   └── types/HalHome.ts
│   ├── vite.config.ts
│   └── package.json
├── pom.xml
├── mvnw
├── mvnw.cmd
└── README.md
```

## Deployment

### Prerequisites

- Docker and Docker Compose

### Required Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `encounters` |
| `DB_USER` | Database username | — |
| `DB_PASSWORD` | Database password | — |
| `FRONTEND_ORIGIN` | Allowed CORS origin (e.g. `https://example.com`) | `http://localhost` |

### Build and Start

```bash
docker compose up --build
```

The application is served at `http://localhost` (port 80).

### Switching Spring Profiles

Set `SPRING_PROFILES_ACTIVE` in the backend service environment. The default in `docker-compose.yml` is `prod`.

To run with the test profile via CLI:

```bash
docker compose run -e SPRING_PROFILES_ACTIVE=test backend
```

### Running Tests with Default Profile

```bash
./mvnw test
```

To run tests explicitly with the test profile:

```bash
./mvnw test -Dspring.profiles.active=test
```

## Running Tests

**Backend:**
```bash
./mvnw test
```

**Frontend:**
```bash
cd frontend && npm test
```
