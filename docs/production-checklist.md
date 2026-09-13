# Pre-production checklist

Small, concrete items to address before this app is ever exposed outside
local/trusted-network use. Not a general roadmap — see `docs/product/ROADMAP.md`
for that.

- **JWT_SECRET**: `backend/src/auth/auth.module.ts` falls back to the
  hardcoded string `'dev-secret-change-me'` when the `JWT_SECRET` environment
  variable isn't set. Fine for local dev; before any real deployment, set a
  strong, unique `JWT_SECRET` in the environment and confirm the app fails to
  start (or at least logs a loud warning) if it's missing, rather than
  silently falling back to a public, guessable secret.
