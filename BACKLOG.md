# Backlog

Open items for the ballistic-calculator UI. Status markers: **OPEN**, **DONE**,
**BLOCKED**, **DROPPED**.

---

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
