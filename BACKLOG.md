# Backlog

Open items for the ballistic-calculator UI. Status markers: **OPEN**, **DONE**,
**BLOCKED**, **DROPPED**.

---

## Structured solver errors — **DONE**

The API client retains optional structured failure data and includes input paths,
pass, termination, reached/requested yards and stopped seconds in the calculator
error alert. Message-only errors remain supported. Individual form-field
highlighting and translated diagnostic labels remain future improvements.

## Time-unit contract alignment — **DONE**

Time-of-flight types and validation accept only seconds and milliseconds,
matching the API contract. Generic time conversion uses 60 seconds per minute
and 3600 seconds per hour without exposing these units as ToF choices.
Regressions cover the physical conversions and rejection of unsupported ToF units.

## 1. Deep links to SPA routes 404 on the deployed site — **OPEN**

**Symptom:** opening or refreshing any client-side route directly (e.g.
`/calculator`, `/config?tab=api`) on the deployed dev site
(`snipe-ballistics-web-ui-dev.s3-website.eu-central-1.amazonaws.com`) returns
HTTP 404. In-app navigation via the nav links works, because React Router then
handles the route on the client; only a hard load / bookmark / refresh of a
sub-route fails.

**Cause:** the app is a single-page app served from an S3 static-website bucket.
S3 static hosting serves the object at the requested key and, for a missing key,
returns the configured error document with a 404 -- it does not rewrite unknown
paths to `index.html`, so the client-side router never gets a chance to run.

**Fix options:**
- **S3-only:** set the bucket website error document to `index.html` (so a
  missing key serves the SPA shell). Simplest, but the response still carries a
  404 status, which is not ideal for SEO/crawlers.
- **CloudFront (preferred if a distribution fronts the bucket):** add a custom
  error response mapping 403/404 to `/index.html` with response code 200, or use
  a CloudFront Function / viewer-request rewrite that maps extension-less paths
  to `/index.html`. Serves the shell with a 200.

Apply in the deployment config (`deployment/` + the deploy workflows) for all
environments (dev/stage/prod), then verify by loading `/calculator` directly.

**Discovered:** 2026-09-10, during live dev verification of the deployed UI.

## 2. Dependency security review — **OPEN**

GitHub reports open dependency alerts. Triage them against the current lockfile,
distinguish shipped runtime dependencies from development/build tooling, and
update compatible dependency groups with tests, lint, build, and browser checks.
The form-data 4.0.6 update resolves that targeted advisory; it does not establish
that the rest of the dependency tree is free of known vulnerabilities. Avoid a
blanket forced audit update that combines unrelated breaking changes.

## 3. Deployment runtime refresh — **OPEN**

The dev workflow reports deprecated Node runtimes for its GitHub Actions.
Refresh checkout, setup-node, setup-python, and configure-aws-credentials, and
review the separately configured Node 20 application build runtime. Validate
dependency installation, all tests, lint, the build, and a dev deployment before
promoting workflow changes to stage or production.
