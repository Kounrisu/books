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

## v2 (not built yet)

AI-vision cover recognition and book-API metadata enrichment — see the
spec's "Goals (v2)" section. Deferred until v1 is in daily use and the API
cost is worth it.
