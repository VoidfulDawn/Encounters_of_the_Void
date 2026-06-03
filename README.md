# Encounters of the Void

Full-stack application with a Spring Boot 3.x / Java 21 HAL API backend and a React 18 / TypeScript / Vite / Material Web Components frontend.

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

## Running Tests

**Backend:**
```bash
./mvnw test
```

**Frontend:**
```bash
cd frontend && npm test
```
