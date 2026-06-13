-- Encounters of the Void — schema provisioning
-- Runs automatically on first container init via /docker-entrypoint-initdb.d/
-- Uses IF NOT EXISTS so repeated container recreation is safe.

CREATE SCHEMA IF NOT EXISTS schema_user;
CREATE SCHEMA IF NOT EXISTS schema_layout;
CREATE SCHEMA IF NOT EXISTS schema_campaign;
CREATE SCHEMA IF NOT EXISTS schema_template;
