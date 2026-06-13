# Infrastructure — Shared PostgreSQL 16

This directory contains the Docker Compose file and SQL init script for the
shared Encounters of the Void development database.

## Prerequisites

- Docker ≥ 24 with Compose v2
- A `.env` file at the repo root (copy `.env.example` and fill in values)

## Starting the database

```bash
# From the repo root
docker compose -f infra/docker-compose.db.yml up -d
```

Docker prints the container ID. Wait for the healthcheck to report **healthy**:

```bash
docker inspect --format='{{.State.Health.Status}}' eotv-postgres
# healthy
```

To stop and remove the container (data volume is preserved):

```bash
docker compose -f infra/docker-compose.db.yml down
```

To also delete the data volume:

```bash
docker compose -f infra/docker-compose.db.yml down -v
```

## Schema layout

`infra/db/init.sql` runs automatically on the first startup and creates four
schemas inside the single `${DB_NAME}` database:

| Schema            | Owned by          |
|-------------------|-------------------|
| `schema_user`     | user-service      |
| `schema_layout`   | layout-service    |
| `schema_campaign` | campaign-service  |
| `schema_template` | template-service  |

## Connecting from a Spring Boot SCS

Set the `currentSchema` query parameter to the schema owned by that service.
Example for **user-service** in `application-prod.yaml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}?currentSchema=schema_user
    username: ${DB_USER}
    password: ${DB_PASSWORD}
```

Substitute `schema_layout`, `schema_campaign`, or `schema_template` for the
other services respectively.

## Environment variables

| Variable      | Description                         | Example           |
|---------------|-------------------------------------|-------------------|
| `DB_HOST`     | Hostname or IP of the Postgres node | `localhost`       |
| `DB_PORT`     | TCP port Postgres listens on        | `5432`            |
| `DB_NAME`     | Database name                       | `encounters`      |
| `DB_USER`     | Login role for all services         | `eotv_user`       |
| `DB_PASSWORD` | Password for `DB_USER`              | *(secret)*        |

All values are sourced from the `.env` file (git-ignored) or from the shell
environment. See `.env.example` at the repo root for a template.
