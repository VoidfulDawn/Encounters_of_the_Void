# Infrastructure — Shared PostgreSQL 16

This directory contains the Docker Compose file and SQL init script for the
shared Encounters of the Void development database.

## Prerequisites

- Docker ≥ 24 with Compose v2
- A `.env` file at the repo root (copy `.env.example` and fill in values)

## Network isolation

`docker-compose.db.yml` is a **standalone** file. The `eotv-postgres` container
exposes port `${DB_PORT}` on the host but is **not** joined to the `backend`
internal network defined in the root `docker-compose.yml`. This is intentional
for local development: Spring services run directly on the host (or in IDE) and
connect via `localhost`. If you run both compose files simultaneously, configure
`DB_HOST=host-gateway` (Linux) or `DB_HOST=host.docker.internal` (Mac/Windows)
inside the `backend` network so containerised services can reach the database.

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
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
```

Substitute `schema_layout`, `schema_campaign`, or `schema_template` for the
other services respectively.

## Environment variables

| Variable       | Description                                       | Example           |
|----------------|---------------------------------------------------|-------------------|
| `DB_HOST`      | Hostname or IP of the Postgres node               | `localhost`       |
| `DB_PORT`      | TCP port Postgres listens on                      | `5432`            |
| `DB_NAME`      | Database name                                     | `encounters`      |
| `DB_USER`      | Postgres superuser role (used by Docker Compose)  | `eotv_user`       |
| `DB_USERNAME`  | Datasource username used by Spring services       | `eotv_user`       |
| `DB_PASSWORD`  | Password for the database user                    | *(secret)*        |

> **Note:** `DB_USER` and `DB_USERNAME` typically hold the same value.
> `DB_USER` is read by `docker-compose.db.yml` to configure the Postgres container;
> `DB_USERNAME` is read by each Spring service's `application-prod.yaml` via
> `spring.datasource.username`.

All values are sourced from the `.env` file (git-ignored) or from the shell
environment. See `.env.example` at the repo root for a template.
