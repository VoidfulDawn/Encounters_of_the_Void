# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [0.0.1-SNAPSHOT] - 2026-06-03

### Added
- Spring Boot 3.3.0 HAL+JSON REST API with base path `/api/v1/`
- `GET /api/v1/status` endpoint returning `{"status": "Everything is working."}`
- `GET /api/v1/home` endpoint returning HAL+JSON `HomeResource` with `_links` (self, status)
- `HomeResource` model extending Spring HATEOAS `RepresentationModel`
- CORS configuration allowing `http://localhost:5173` on `/api/**` paths (GET, POST, OPTIONS)
- React 19 + TypeScript + Vite frontend scaffold in `/frontend/`
- Material Web Components integration (`@material/web ^2.4.1`) with `md-filled-card` usage
- Vite dev server proxy: `/api/*` → `http://localhost:8080` (via `vite.config.ts`)
- `useEffect` hook in `App.tsx` fetching `/api/v1/home` and rendering HAL status field
- Spring Boot integration tests (`ApiControllerTest`) using `MockMvc`
- Frontend Vitest + React Testing Library tests (`App.test.tsx`)
- Maven wrapper (`mvnw` / `mvnw.cmd`) for zero-install builds
- README with prerequisites, local run instructions, and project overview
