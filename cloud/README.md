# WarLike Library — Cloud backend (not deployed)

**Status:** architecture only. The public Cloudflare Pages site currently stores personal assets and prefab definitions in the browser. It must never display "connected", "synced", or "cloud backup" until a real authenticated server responds.

## Proposed deployment

- Cloudflare Worker API on a dedicated route (e.g. `api.warlike-library.example`) with real user authentication.
- Cloudflare D1 dedicated **only** to WarLike Library for accounts, metadata, prefab versions, manifests, and access policies.
- Cloudflare R2 bucket dedicated to private uploaded GLB/PNG/audio files, with presigned short-lived upload/download authorizations; maximum sizes and quotas enforced on the server.
- Short-lived signed access tokens, session revocation and CSRF protection for cookie-based sessions. Passwords must be handled by a reputable authentication provider; do not build authentication by storing raw passwords in D1.
- Every query must scope by the authenticated `user_id`; deny by default, including shared collections.
- Per-user quotas, per-file SHA-256 checksums, server-side file type validation, explicit license metadata, version history and rollback.
- CORS allow-list only for trusted WarLike origins. Do not trust a user_id, path, asset URL, MIME type, or uploaded manifest supplied by the browser.
- Durable backups and migration tests before claiming automatic sync.

## Observed Cloudflare account state (2026-11-07)

The account currently exposes one unrelated D1 database (`codeduo-academy-auth`) and no Worker scripts. The R2 bucket endpoint returned HTTP 403. **Do not reuse the unrelated database** and do not enable upload endpoints until permissions and authenticated storage are configured.

## Backend acceptance checklist

1. Register/sign in securely, sign out, revoke sessions.
2. Create or upload an asset; verify it persists after changing browsers and signing back in.
3. Enforce owner isolation: another account cannot list, read, modify or delete the record or underlying blob.
4. Version a prefab, create a child variant, resolve its dependency tree, rollback.
5. Transfer a model plus its textures and metadata into a WarLike Engine project, then verify Play/Export uses the same data.
6. Verify quota failures, corrupt files, malicious manifests, 401/403 responses and recovery.
7. Publish to production only after all checks pass.

## Planned API contract (not yet implemented)

`GET /v1/me`, `GET/POST /v1/assets`, `POST /v1/uploads`, `GET /v1/assets/:id/versions`, `GET/POST /v1/prefabs`, `POST /v1/projects/:id/install` — authenticated endpoints, all scoped to the current identity.
