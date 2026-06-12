# campaign-service

Spring Boot 3.3.x microservice — part of the Encounters of the Void multi-module project.

## Port
`8083`

## API
| Method | Path | Description |
|--------|------|-------------|
| GET    | /api/campaigns/ | Returns HAL `CollectionModel` with self link (skeleton) |

## Profiles
| Profile | Datasource |
|---------|-----------|
| default | H2 in-memory (`jdbc:h2:mem:campaignservicedb`) |
| prod    | PostgreSQL — `${DB_HOST}:${DB_PORT}/${DB_NAME_CAMPAIGN}` / `${DB_USER}` / `${DB_PASS}` |
| test    | H2 in-memory (`jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1`), `create-drop` |

## Build
```bash
./mvnw -pl campaign-service -am verify
```

## Docker
```bash
docker build -t encountersofthevoid/campaign-service:0.0.1-SNAPSHOT .
```
