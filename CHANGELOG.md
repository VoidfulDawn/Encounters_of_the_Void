# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `homeEndpointReturnsHalJsonWithSelfLink` test in `ApiControllerTest` asserting both `_links.self.href` and `_links.status.href` are non-empty in HAL response (PR #1 — branch `pr-1`)
- Error-path test in `App.test.tsx` covering fetch failure → caught error → user-visible error state render (PR #1)

### Changed
- Material Web Components import in `App.tsx` switched from bulk `@material/web/all.js` to per-component imports, reducing bundle size (PR #1)
- `frontend/README.md` rewritten with project-specific setup, run instructions, and test commands, replacing the generic Vite scaffold template (PR #1)

### Deprecated

### Removed

### Fixed
- Fetch error handling in `App.tsx`: `.catch()` block now catches network errors and non-2xx responses, rendering a user-visible message instead of crashing (PR #1)
- HTML page `<title>` in `frontend/index.html` updated from generic `frontend` to `Encounters of the Void` (PR #1)
- React version in root `README.md` corrected from React 18 to React 19.2.6, matching `frontend/package.json` (PR #1)

### Security
[0.2.0]: https://github.com/VoidfulDawn/Encounters_of_the_Void/releases/tag/v0.2.0
