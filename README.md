# Books — Personal Library Manager

Self-hosted personal book cataloging app. See
`docs/superpowers/specs/2026-09-13-books-library-design.md` for the full
design and `docs/superpowers/plans/2026-09-13-books-library-v1.md` for the
implementation plan.

## Local development

```bash
docker compose up --build
```

- Frontend: http://localhost:4200
- Backend: http://localhost:3000
- Sample cover images for manual testing: `docs/sample-covers/`

## Deployment

Not yet deployed. When ready, follow
`07-my_server_infact_anacottest/VPS-OPERATIONS.md`'s shared-VPS-Caddy
runbook: build with `docker-compose.prod.yml`, join the external `web`
network, merge `Caddyfile.snippet` into the shared proxy's Caddyfile, then
`docker compose exec caddy caddy reload`.

The frontend and backend are served from a single origin,
`books.sn8w.com` — there is no separate API subdomain. Caddy routes
`/api/*` on that site to `books-backend:3000` (stripping the `/api`
prefix with `handle_path`, since the backend's own routes have no
`/api` prefix) and everything else to `books-frontend:4200`. The built
frontend calls the API at the relative path `/api` in production
(`environment.prod.ts`), so requests are always same-origin — no CORS
configuration or mixed-content HTTPS/HTTP mismatch to worry about.

## v2 (not built yet)

AI-vision cover recognition and book-API metadata enrichment — see the
spec's "Goals (v2)" section. Deferred until v1 is in daily use and the API
cost is worth it.
