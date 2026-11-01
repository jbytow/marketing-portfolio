# Production Deployment

Production runs `docker-compose.prod.yml`. The frontend container serves `frontend/www`
(bind mount, read-only), not the `dist` baked into its image.

## Why the frontend deploy is additive

Vite emits content-hashed chunks (`/assets/About-Ci4mxq5D.js`). A browser that loaded an older
`index.html` keeps requesting the chunks of that build while the tab is open or the HTML is
still cached. If a deploy deletes them, the lazy routes return 404 and the app renders a black
screen. `frontend/www/assets` therefore accumulates the assets of past builds and only
`index.html` is replaced.

Caching rules in `frontend/nginx.conf`:

| Path | Header |
|---|---|
| `index.html`, SPA routes | `Cache-Control: no-cache` (browser revalidates, 304 when unchanged) |
| `*.js`, `*.css`, images, fonts | `Cache-Control: public, immutable`, `expires 1y` |
| `*.map` | 403 (built with `sourcemap: 'hidden'`, so bundles do not reference them either) |

If a tab still fails to load a chunk (for example one removed by `prune`), `frontend/src/main.tsx`
handles `vite:preloadError` with a single page reload, which fetches the current `index.html`.

## Deploying a new frontend build

On the server, in the repository root:

```bash
git pull
frontend/deploy.sh
```

The script:

1. On the first run (no `frontend/www/index.html`), copies the build served by the running
   container into `frontend/www`, so its users keep their chunks.
2. Builds the image with `docker compose -f docker-compose.prod.yml build frontend`
   (`VITE_API_URL` comes from `.env`) and extracts the built `index.html` and `assets/`.
3. Adds assets that are missing in `frontend/www/assets`; existing files are never overwritten
   or deleted (only their mtime is refreshed).
4. Aborts if the new `index.html` references a file that is not published (for example a
   `/assets/assets/*` path from a wrong Vite `base`). The live `index.html` stays untouched.
5. Records the build's asset list in `frontend/.deploy/generations/`.
6. Swaps `index.html` atomically and runs `docker compose -f docker-compose.prod.yml up -d frontend`
   (needed when `nginx.conf` changed).

Backend deploys are unaffected: `docker compose -f docker-compose.prod.yml up -d --build backend`.

## Cleaning up old generations

Policy: keep the assets of the last 3 builds, and anything that was part of any build in the last
30 days. A file is deleted only when it fails both conditions.

```bash
DRY_RUN=1 frontend/deploy.sh prune   # list what would be deleted
frontend/deploy.sh prune
```

Override the policy with `KEEP_GENERATIONS` and `KEEP_DAYS`, e.g.
`KEEP_GENERATIONS=5 KEEP_DAYS=60 frontend/deploy.sh prune`. Prune refuses to run without any
generation manifest.

## Verification

```bash
curl -sI https://zakulecka.pl/ | grep -i cache-control                 # no-cache
curl -sI https://zakulecka.pl/some-spa-route | head -n 1               # 200
ENTRY=$(curl -s https://zakulecka.pl/ | grep -oE '/assets/index-[^"]+\.js')
curl -sI "https://zakulecka.pl$ENTRY" | grep -iE 'cache-control|expires' # immutable, 1y
curl -sI "https://zakulecka.pl$ENTRY.map" | head -n 1                  # 403
ls frontend/www/assets | wc -l                                          # grows across deploys
```
