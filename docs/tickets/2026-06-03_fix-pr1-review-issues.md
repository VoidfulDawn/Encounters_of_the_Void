# Tickets: Fix PR #1 Review Issues — Spring Boot HAL API + React MWC

**Branch:** `pr-1`
**PR:** #2
**Date:** 2026-06-03
**Status:** Done

---

## Epic: API Layer

### [Feature] HAL Root Resource with Status Endpoint

**Story:** As an API consumer, I want a versioned HAL root at `/api/v1/home` with embedded status and discoverable links, so that I can navigate the API using hypermedia.

**Acceptance Criteria:**
- [x] GET /api/v1/status returns `{"status": "Everything is working"}`
- [x] GET /api/v1/home returns HAL+JSON with `_links` to self and status
- [x] CORS configured for localhost:5173

**Resolution:** Implemented `ApiController` with `@RequestMapping("/api/v1")` using Spring HATEOAS `RepresentationModel`. The home endpoint returns a `HomeResource` with `_links.self` and `_links.status`, plus embedded status message. CORS configured via `CorsConfig` bean allowing the Vite dev server origin.

---

### [Technical] Missing _links.status.href Test Assertion

**Story:** As a developer, I want the home endpoint test to verify the status link href, so that link contract changes are caught by CI.

**Resolution:** Added `.andExpect(jsonPath("$._links.status.href").exists())` assertion to `ApiControllerTest.homeEndpoint()`. Reviewer caught this gap in cycle 1.

---

## Epic: Frontend

### [Feature] Material Web Banner Status Display

**Story:** As a user, I want to see the backend status displayed as a Material Web banner, so that I can confirm the service is running at a glance.

**Acceptance Criteria:**
- [x] Fetches HAL root from /api/v1/home on page load
- [x] Displays status in @material/web component
- [x] Vite proxies /api to localhost:8080

**Resolution:** React `App.tsx` fetches the HAL root via `fetch('/api/v1/home')`, extracts the status message, and renders it using `@material/web` card component. Vite config proxies `/api` to `http://localhost:8080`.

---

### [Technical] Per-Component Material Web Imports

**Story:** As a developer, I want per-component imports instead of `@material/web/all.js`, so that the bundle size stays minimal.

**Resolution:** Changed from `import '@material/web/all.js'` to `import '@material/web/labs/card/filled-card.js'`. Reviewer flagged the full-library import in cycle 1.

---

## Epic: Code Quality

### [Technical] Fetch Error Handling

**Story:** As a developer, I want proper error handling on API fetch calls, so that non-2xx responses show user-visible errors instead of silently failing.

**Resolution:** Added `res.ok` check before `res.json()`, `error` state in the component, and error UI rendering. Refactored to async/await. Reviewer caught the missing check in cycle 1.

---

### [Technical] Error Path Test Coverage

**Story:** As a developer, I want tests covering the fetch failure path, so that error handling regressions are caught by CI.

**Resolution:** Added error-path test in `App.test.tsx` that mocks a 500 response and verifies the error state renders correctly.

---

### [Technical] React 19 Version Consistency

**Story:** As a developer, I want the README to accurately reflect the React version used, so that onboarding docs aren't misleading.

**Resolution:** Updated root README.md from "React 18" to "React 19" to match `package.json`. Also fixed `global.d.ts` JSX augmentation for React 19/TypeScript 5+ compatibility.

---

### [Technical] Vite Template Cleanup

**Story:** As a developer, I want project-specific README and page title instead of Vite defaults, so that the project looks professional.

**Resolution:** Replaced `frontend/README.md` Vite template boilerplate with project-specific docs. Changed `index.html` title from "frontend" to "Encounters of the Void".

---

## Epic: Unresolved (Carried Forward)

### [Technical] Node Version Requirement Documentation

**Story:** As a developer, I want the README to specify the correct minimum Node version, so that contributors don't waste time on version mismatches.

**Resolution:** _Unresolved after 2 cycles._ README.md line 8 still says "Node 18+" — should be "Node >= 20" to match frontend/README.md and Vite 8.x requirements.

---

### [Technical] Test Mock Cleanup

**Story:** As a developer, I want fetch mocks properly restored between tests, so that test isolation is maintained.

**Resolution:** _Unresolved after 2 cycles._ `App.test.tsx` needs `afterEach(() => vi.unstubAllGlobals())` or `unstubGlobals: true` in vite.config.ts test config.
