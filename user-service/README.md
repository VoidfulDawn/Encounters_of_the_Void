# user-service

Spring Boot 3.4.1 microservice — part of the Encounters of the Void multi-module project.

## Port
`8081`

## API
| Method | Path | Description |
|--------|------|-------------|
| GET    | /api/users/ | Returns HAL `CollectionModel` with self link (skeleton) |

## Profiles
| Profile | Datasource |
|---------|-----------|
| default | H2 in-memory (`jdbc:h2:mem:userdb`), `create-drop` |
| prod    | PostgreSQL — `${DB_URL}` / `${DB_USERNAME}` / `${DB_PASSWORD}`, `validate` |
| test    | H2 in-memory (`jdbc:h2:mem:usertestdb;DB_CLOSE_DELAY=-1`), `create-drop` |

## Build
```bash
./mvnw -pl user-service -am verify
```

## Docker
```bash
docker build -t encountersofthevoid/user-service:0.0.1-SNAPSHOT .
```
