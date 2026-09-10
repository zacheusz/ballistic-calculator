# AGENTS.md

Guidance for AI agents working in this repository. Read this before making
changes. This file is the single source of shared conventions; it is read
natively by Claude Code, Cursor, GitHub Copilot, and Devin (formerly Windsurf).
If a tool-specific rule file exists, it should defer to this file and add only
tool-specific detail — do not duplicate the conventions here.

## Project

The Snipe Ballistics Calculator is a React + TypeScript + Vite single-page app
that calls the Snipe Ballistics API. Use **TypeScript, not JavaScript**. State is
managed with Zustand (stores hydrate defaults from `src/config/default.json`);
UI is Material UI with theme switching and i18n.

### Layout

- `src/components` — reusable UI components.
- `src/pages` — top-level pages (CalculatorPage, ConfigPage, HomePage).
- `src/stores` — Zustand state.
- `src/hooks`, `src/context` — React hooks and context providers.
- `src/services` — API and external integrations (`api.ts`).
- `src/types` — TypeScript types, including the API request/response contract.
- `src/utils` — ballistics helpers and unit conversions.
- `src/i18n` — internationalization resources.
- `*/__tests__`, `src/__mocks__` — tests and mocks.
- `deployment/` — AWS SAM/CloudFront deployment config.

## Keep types in sync with the API contract

Types used for API communication (`src/types/ballistics.ts`, `apiTypes.ts`) must
match the OpenAPI spec that the backend serves (`openapi.yaml` in the
SnipeBallistics API repo, also published at the API's `/docs` endpoint). Property
names, types, and required/optional status must match. `toApiRequest()` must
produce objects that conform to the schema; response handling must type-check
against it. When the API changes, review the spec and update the types and any
validation in the same change.

## Build and test

- `npm test` — Jest unit tests.
- `npm run lint` — ESLint.
- `npm run dev` — Vite dev server (default `http://localhost:5173`).

## Development cycle

After each change:

- Run all unit tests and fix failures before moving on.
- Run the linter.
- Add or update test coverage for the change; new behaviour lands with a test.
- Keep the API types in sync with the contract (see above).
- Verify the change in the running app (see "Verifying in the running app").

Before preparing a commit:

- Run the full unit-test suite and the linter.
- Review every local change with `git status` and `git diff` — read all of it,
  not just the files you remember touching.
- Write the commit message in the Gitmoji format (see below).

After a file rename or removal, update every reference: imports/exports, other
code, tests, and documentation. Leave no dangling reference.

## Backlog

Known issues and deferred work are tracked in [BACKLOG.md](BACKLOG.md). Check it
before starting related work, and update the relevant item's status (or add a
new one) as part of the change that touches it.

## Commit message format

Commit messages use Gitmoji:

```
<intention> [scope?][:?] <message>
```

- `intention` — one or more emoji codes.
- `scope` — optional, adds context (e.g. a component or subsystem).
- `message` — a brief explanation of the change.

A message may start with more than one emoji. Distinguish a functional bug fix
(`:bug:`) from a compiler/linter-warning fix (`:rotating_light:`).

When writing a commit message, read [commit-conventions.md](commit-conventions.md)
for the full emoji reference and pick the code(s) that match the change.

## Verifying in the running app

Prefer verifying UI changes end-to-end in a browser (e.g. with the Playwright
tools your assistant provides) rather than trusting unit tests alone.

Manage the dev server carefully:

- Check whether one is already running before starting another: `lsof -i :5173`
  (or similar).
- If one is running, use it — do not start a second.
- If several are running, kill the extras:
  `pkill -f "node .*/node_modules/.bin/vite"`.
- Only run `npm run dev` if none is running.

Then drive the app and finish each check by:

- Setting the API key in the app's config UI (Config page → Snipe Ballistics API
  Key). The key is entered through the UI, not read from `.env` by the app; for
  automated runs the `.env` `API_KEY` is available to read and paste in.
- Selecting the target environment (dev/stage/prod) in the config UI.
- Pressing "Calculate" on the Calculator page.
- Confirming the solution grid has results; if not, confirming an error message
  (alert) is shown.
- Inspecting the underlying request/response in the Network tab.

### Inspecting the request payload

To see the outgoing request payload without the Network tab, enable logging: set
`VITE_LOG_API_REQUESTS=true` in the environment for all requests, or call
`calculateBallistics(true)` for a single one. The log prints the full payload
(atmosphere, shot, preferences).

### CORS from localhost

The API's authenticated (`dev`/`stage`/`prod`) responses return permissive CORS
headers, so real responses render from `localhost`. A CORS error in the console
generally means the request was rejected *before* the handler — most often a
missing or wrong API key (a 403 from API Gateway carries no CORS headers, so the
browser reports it as a CORS/network error rather than a 403). Treat a CORS
error as "check the API key / auth", not as a payload or state-management bug —
the request itself is built and sent correctly. Use the request logging above to
confirm payload correctness.
