# campaign-service

Spring Boot 3.4.1 microservice — part of the Encounters of the Void multi-module project.

## Port
`8083`

## API
| Method | Path | Description |
|--------|------|-------------|
| GET    | /api/campaigns/ | Returns HAL `CollectionModel` with self link (skeleton) |

## Profiles
| Profile | Datasource |
|---------|-----------|
| default | H2 in-memory (`jdbc:h2:mem:campaigndb`), `create-drop` |
| prod    | PostgreSQL — `${DB_URL}` / `${DB_USERNAME}` / `${DB_PASSWORD}`, `validate` |
| test    | H2 in-memory (`jdbc:h2:mem:campaigntestdb;DB_CLOSE_DELAY=-1`), `create-drop` |

## Build
```bash
./mvnw -pl campaign-service -am verify
```

## Docker
```bash
docker build -t encountersofthevoid/campaign-service:0.0.1-SNAPSHOT .
```
