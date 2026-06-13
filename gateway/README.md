# gateway

Spring Cloud Gateway 2023.0.3 entry point — part of the Encounters of the Void multi-module project.

## Port
`8080`

## Routes
| Route ID | Path Predicate | Upstream |
|----------|---------------|----------|
| user-service | `/api/users/**` | `http://user-service:8081` |
| layout-service | `/api/layouts/**` | `http://layout-service:8082` |
| campaign-service | `/api/campaigns/**` | `http://campaign-service:8083` |
| template-service | `/api/templates/**` | `http://template-service:8084` |

## Build
```bash
./mvnw -pl gateway -am verify
```

## Docker
```bash
docker build -t encountersofthevoid/gateway:0.0.1-SNAPSHOT .
```
