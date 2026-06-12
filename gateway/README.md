# gateway

Spring Cloud Gateway 2023.0.3 entry point — part of the Encounters of the Void multi-module project.

## Port
`8080`

## Routes
| Route ID | Path Predicate | Upstream |
|----------|---------------|----------|
| user-service | `/api/users/**` | `http://localhost:8081` |
| layout-service | `/api/layouts/**` | `http://localhost:8082` |
| campaign-service | `/api/campaigns/**` | `http://localhost:8083` |
| template-service | `/api/templates/**` | `http://localhost:8084` |

## Build
```bash
./mvnw -pl gateway -am verify
```

## Docker
```bash
docker build -t encountersofthevoid/gateway:0.0.1-SNAPSHOT .
```
