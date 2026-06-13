# template-service

Spring Boot 3.3.x microservice — part of the Encounters of the Void multi-module project.

## Port
`8084`

## API
| Method | Path | Description |
|--------|------|-------------|
| GET    | /api/templates/ | Returns HAL `CollectionModel` with self link (skeleton) |

## Profiles
| Profile | Datasource |
|---------|-----------|
| default | H2 in-memory (`jdbc:h2:mem:templatedb`), `create-drop` |
| prod    | PostgreSQL — `${DB_URL}` / `${DB_USERNAME}` / `${DB_PASSWORD}`, `validate` |
| test    | H2 in-memory (`jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1`), `create-drop` |

## Build
```bash
./mvnw -pl template-service -am verify
```

## Docker
```bash
docker build -t encountersofthevoid/template-service:0.0.1-SNAPSHOT .
```
