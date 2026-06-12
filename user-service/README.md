# user-service

Spring Boot 3.3.x microservice — part of the Encounters of the Void multi-module project.

## Port
`8081`

## API
| Method | Path | Description |
|--------|------|-------------|
| GET    | /api/users/ | Returns HAL `CollectionModel` with self link (skeleton) |

## Profiles
| Profile | Datasource |
|---------|-----------|
| default | H2 in-memory (`jdbc:h2:mem:userservicedb`) |
| prod    | PostgreSQL — `${DB_HOST}:${DB_PORT}/${DB_NAME_USER}` / `${DB_USER}` / `${DB_PASS}` |
| test    | H2 in-memory (`jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1`), `create-drop` |

## Build
```bash
./mvnw -pl user-service -am verify
```

## Docker
```bash
docker build -t encountersofthevoid/user-service:0.0.1-SNAPSHOT .
```
