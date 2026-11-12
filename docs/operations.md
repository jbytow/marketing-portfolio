# Operations Runbook

Runbook for the production deployment of `zakulecka.pl`. It replaces the former `DEPLOY.md`.

## Overview

Production is a Proxmox VM running Ubuntu and Docker Compose with `docker-compose.prod.yml`. The checkout lives in `/opt/marketing-portfolio`.

| Service | Container | Image | Data | Ports |
|---|---|---|---|---|
| `postgres` | `portfolio-db-prod` | `postgres:16-alpine` | volume `postgres_data_prod` | internal only |
| `backend` | `portfolio-backend-prod` | built from `./backend` (Spring Boot) | volume `uploads_data_prod` at `/app/uploads` | internal 8080 |
| `frontend` | `portfolio-frontend-prod` | built from `./frontend` | bind mount `./frontend/www` at `/usr/share/nginx/html`, read-only | internal 80 |
| `nginx` | `portfolio-nginx` | `nginx:1.30-alpine` (pinned) | `nginx/nginx.conf` and `nginx/ssl` bind mounts, read-only | published 80 and 443 |

- Cloudflare Tunnel (`cloudflared` on the VM, outside compose) forwards `zakulecka.pl` to the edge on port 80.
- The frontend container serves `frontend/www` (bind mount), not the `dist` baked into its image.
- The frontend image builds on `node:24-alpine` and runs on `nginx:1.30-alpine`; `.dockerignore` keeps `node_modules` and `dist` out of the build context.
- The edge is pinned to nginx 1.30 because `resolve` in `nginx/nginx.conf` needs upstream support available from 1.27.3.
- All four services use json-file logging (`max-size: 10m`, `max-file: 3`), `restart: unless-stopped`, and the bridge network `portfolio-network-prod`. `security_opt: no-new-privileges` is set on backend, frontend and nginx, intentionally not on postgres: its entrypoint starts as root and drops to the postgres user itself.
- Deploy as the user that owns the checkout (`jbytow`), never as root. Files created by root in `.git` or `frontend/www` block later pulls and deploys.

## Environment

Compose reads `.env` from the repository root. It is never committed.

Required. Compose refuses to start without them (`${VAR:?}` in the compose file):

| Variable | Consumed by | Notes |
|---|---|---|
| `POSTGRES_DB` | postgres, backend | database name, also used by the healthcheck |
| `POSTGRES_USER` | postgres, backend | also used by `pg_dump` and `pg_restore` |
| `POSTGRES_PASSWORD` | postgres, backend | |
| `JWT_SECRET` | backend | at least 32 bytes in the `prod` profile |
| `GOOGLE_CLIENT_ID` | backend | OAuth client |
| `GOOGLE_CLIENT_SECRET` | backend | OAuth client |
| `ADMIN_EMAILS` | backend | comma separated list, re-checked per request |
| `FRONTEND_URL` | backend | public origin used by the backend |

Optional:

| Variable | Default | Notes |
|---|---|---|
| `MAIL_HOST` | `smtp.gmail.com` | |
| `MAIL_PORT` | `587` | |
| `MAIL_USERNAME` | empty | startup WARN when blank |
| `MAIL_PASSWORD` | empty | Gmail app password |
| `CONTACT_EMAIL` | empty | startup WARN when blank |
| `VITE_API_URL` | `/api` | build argument of the frontend image |

Startup validations and their effects:

| Validation | Behaviour |
|---|---|
| `JWT_SECRET` missing (dev default) or shorter than 32 bytes, `prod` profile | backend refuses to start |
| `JWT_SECRET` rotated | every admin session is invalidated (kill switch); rejected tokens log INFO `JWT rejected: SignatureException` |
| `ADMIN_EMAILS` changed | re-checked on every request, so removing an address and restarting the backend revokes that admin immediately |
| Google e-mail not verified (`email_verified`) | login is rejected |
| `app.upload.allowed-types` | fixed to image/jpeg, image/png, image/gif, image/webp, video/mp4, video/webm, application/pdf; any other value stops the backend at startup, adding a type needs a code change |

Log lines worth knowing:

| Level | Message | Meaning |
|---|---|---|
| INFO | `Admin login: <email>` | successful admin login |
| WARN | `Rejected admin login: <email>` | address not in `ADMIN_EMAILS` |
| WARN | `Rejected admin login (unverified e-mail): <email>` | Google account without a verified e-mail |
| WARN | `OAuth login failed: <ExceptionClass>` | failed OAuth exchange |
| WARN | one line per client error (4xx) | method, URI and client IP, taken from `CF-Connecting-IP` |
| WARN | startup line when `CONTACT_EMAIL` or `MAIL_USERNAME` is blank | contact mail will not work |

## Deploying the backend

Run everything from the repository root as `jbytow`.

1. Update the checkout.

```bash
git pull
```

2. Check whether the pull brought a migration.

```bash
ls backend/src/main/resources/db/migration/V*.sql | tail -n 5
```

If there is a new migration, dump the database before deploying. The commands below read `$POSTGRES_USER` and `$POSTGRES_DB` from the shell, so export them from `.env` first (`set -a; . ./.env; set +a`). V16 (drops redundant indexes, sets `posts.published` and `newsletters.published` NOT NULL) and V17 (deletes `users` rows that are not admins) change or remove data, so a dump before them is mandatory. V16 is the first migration that drops objects. The dump directory lives outside the repository and has to be created once:

```bash
mkdir -p /opt/backups
docker exec portfolio-db-prod pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB" > /opt/backups/portfolio-$(date +%F).dump
```

The dump contains `flyway_schema_history`, which a restore needs: `baseline-on-migrate` is off, so an empty schema is migrated from V1 while a restored schema continues from its recorded version.

3. Rebuild and restart the backend.

```bash
docker compose -f docker-compose.prod.yml up -d --build backend
```

4. Watch the startup.

```bash
docker logs portfolio-backend-prod --since 5m
```

- Shutdown is graceful (`server.shutdown=graceful`, 8 s phase, under Docker's 10 s stop timeout).
- `/actuator/health` no longer includes the mail indicator, so an SMTP outage does not restart the container; Docker HEALTHCHECK uses it.
- `/api/health` stays because an external Uptime Kuma monitor polls it; it mirrors the Actuator state (503 with `{"status":"DOWN"}` when the database is unreachable), so the monitor now sees database outages.
- SMTP has connect, read and write timeouts; a mail failure answers 503 on `/api/contact` and never pins request threads.
- No edge restart is needed after a backend deploy: the edge re-resolves `backend` and `frontend` through Docker DNS (`resolver 127.0.0.11`).

## Deploying the frontend

Only through `frontend/deploy.sh`.

Why the deploy is additive: Vite emits content-hashed chunks (`/assets/About-Ci4mxq5D.js`). A browser that loaded an older `index.html` keeps requesting the chunks of that build while the tab is open or the HTML is still cached. If a deploy deletes them, the lazy routes return 404 and the app renders a black screen. `frontend/www/assets` therefore accumulates the assets of past builds and only `index.html` is replaced.

Caching rules in `frontend/nginx.conf`:

| Path | Header |
|---|---|
| `index.html`, SPA routes | `Cache-Control: no-cache` (browser revalidates, 304 when unchanged) |
| `*.js`, `*.css`, images, fonts | `Cache-Control: public, immutable`, `expires 1y` |
| `*.map` | 403 (built with `sourcemap: 'hidden'`, so bundles do not reference them either) |

If a tab still fails to load a chunk (for example one removed by `prune`), `frontend/src/main.tsx` handles `vite:preloadError` with a single page reload, which fetches the current `index.html`.

```bash
git pull
frontend/deploy.sh
```

The script:

1. On the first run (no `frontend/www/index.html`), copies the build served by the running container into `frontend/www`, so its users keep their chunks.
2. Builds the image with `docker compose -f docker-compose.prod.yml build frontend` (`VITE_API_URL` comes from `.env`) and extracts the built `index.html` and `assets/`.
3. Adds assets that are missing in `frontend/www/assets`; existing files are never overwritten or deleted, only their mtime is refreshed.
4. Aborts if the new `index.html` references a file that is not published (for example an `/assets/assets/*` path from a wrong Vite `base`). The live `index.html` stays untouched.
5. Records the build's asset list in `frontend/.deploy/generations/`.
6. Swaps `index.html` atomically and runs `docker compose -f docker-compose.prod.yml up -d frontend` (needed when `nginx.conf` changed).

`deploy.sh` and `deploy.sh prune` are serialized with `frontend/.deploy/lock` (flock); a concurrent run exits 1 with "another deploy/prune is running".

Cleaning up old generations. Policy: keep the assets of the last 3 builds, and anything that was part of any build in the last 30 days. A file is deleted only when it fails both conditions.

```bash
DRY_RUN=1 frontend/deploy.sh prune   # list what would be deleted
frontend/deploy.sh prune
```

Override the policy with `KEEP_GENERATIONS` and `KEEP_DAYS`, for example `KEEP_GENERATIONS=5 KEEP_DAYS=60 frontend/deploy.sh prune`. Prune refuses to run without any generation manifest. The first prune is due around 2026-12-01.

## Deploying edge nginx and compose changes

- `nginx/nginx.conf` is a single-file bind mount, so an edit inside the running container would be lost and `nginx -s reload` does not pick up the new file. After a pull that changes it:

```bash
docker compose -f docker-compose.prod.yml up -d --force-recreate nginx
```

- Compose-level changes (`json-file` log rotation limits, `security_opt: no-new-privileges` on backend, frontend and nginx) apply only when containers are recreated. The first `up -d` after such a change recreates all four services, which means a short downtime.
- Rate limiting is per visitor: the key is `CF-Connecting-IP` with a fallback to the connector address. Throttled requests get 429.

| Zone | Rate | Notes |
|---|---|---|
| `api` | 10 r/s | burst 20 |
| `media` | 30 r/s | |
| `oauth` | 10 r/min | |
| `contact` | 5 r/min | burst 3, `POST /api/contact` only |
| `general` | 30 r/s | |

- `Content-Security-Policy-Report-Only` is sent from the edge (same block as the other security headers). Violations show up in the browser console only (no report endpoint yet). The policy allows the inline theme script in `frontend/index.html` through its sha256 hash in `script-src`; `frontend/src/test/csp-hash.test.ts` fails when the script and the hash drift apart, so after editing the script recompute the hash (`node -e "const c=require('crypto');const h=require('fs').readFileSync('frontend/index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];console.log('sha256-'+c.createHash('sha256').update(h).digest('base64'))"`) and update `nginx/nginx.conf`. Switch to the enforcing `Content-Security-Policy` header after a week without violations.
- Forwarded headers are overwritten at the edge: single-value `X-Forwarded-For` with the visitor IP, plus `X-Forwarded-Host`, `X-Forwarded-Port` 443 and `X-Forwarded-Proto` https.
- The edge publishes port 80 on 127.0.0.1 only (cloudflared runs as a systemd service on the same VM and forwards to localhost:80) and nothing on 443, so a LAN client cannot bypass Cloudflare or forge `CF-Connecting-IP`. Diagnostics from another host must go through the public hostname; on the VM itself `curl -H 'Host: zakulecka.pl' http://127.0.0.1/` works.
- The development compose publishes 5432, 8080 and 5173 on 127.0.0.1 only.

## Verification after deploy

```bash
curl -sI https://zakulecka.pl/ | grep -i cache-control                      # no-cache
curl -sI https://zakulecka.pl/some-spa-route | head -n 1                    # 200
ENTRY=$(curl -s https://zakulecka.pl/ | grep -oE '/assets/index-[^"]+\.js')
curl -sI "https://zakulecka.pl$ENTRY" | grep -iE 'cache-control|expires'    # immutable, 1y
curl -sI "https://zakulecka.pl$ENTRY.map" | head -n 1                       # 403
curl -s -o /dev/null -w '%{http_code}\n' https://zakulecka.pl/api/admin/auth/me   # 401 (empty body, no redirect)
curl -sI https://zakulecka.pl/oauth2/authorization/google | grep -i set-cookie    # JSESSIONID ... Secure; SameSite=Lax
curl -s -o /dev/null -w '%{http_code}\n' https://zakulecka.pl/api/.env            # 404
for i in $(seq 1 40); do curl -s -o /dev/null -w '%{http_code} ' https://zakulecka.pl/api/settings; done; echo   # some 429 after the burst
curl -sI "https://zakulecka.pl/api/media/<existing-file>" | grep -i cache-control  # max-age=31536000, public, immutable
ls frontend/www/assets | wc -l                                              # grows across deploys
```

After deploying the security package, log in once as admin to confirm the `email_verified` check does not lock the owner out.

Logs:

```bash
docker logs portfolio-backend-prod --since 10m | grep -E "WARN|ERROR"
docker logs portfolio-nginx --since 10m | tail
docker logs portfolio-frontend-prod
```

The frontend log should show no `open() failed`.

## Periodic tasks

- Prune old frontend generations with `frontend/deploy.sh prune` (policy above, list first with `DRY_RUN=1`).
- Refresh base image tags when upstream publishes security fixes (`eclipse-temurin` 21, `node:24-alpine`, `nginx:1.30-alpine`, `postgres:16-alpine`) and rebuild:

```bash
docker compose -f docker-compose.prod.yml build --pull
```

- Dependencies (`npm audit` on the frontend, the Maven BOM upgraded through Spring Boot versions) are owner decisions.
- Backups: the whole VM is backed up to Proxmox Backup Server (PBS) on a separate host, which covers both data volumes (`postgres_data_prod`, `uploads_data_prod`); a VM backup of a running PostgreSQL is crash-consistent, so a restore replays WAL on start. The application-level commands below are for the point-in-time dump before a migration that drops or alters objects, and for restoring a single object without rolling the VM back. The restore path has not been exercised yet (owner decision D9: test it once on a copy):

```bash
docker exec portfolio-db-prod pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB" > /opt/backups/portfolio-$(date +%F).dump
docker run --rm -v uploads_data_prod:/u -v /opt/backups:/b alpine tar czf /b/uploads-$(date +%F).tgz -C /u .
```

## Database role without superuser (planned)

The backend and Flyway connect as the role created by the postgres image (`POSTGRES_USER`), which is a superuser. The owner decided to move the application to a least-privilege role at the next database task. Procedure (one-off on the server, during a maintenance window, after a dump):

```bash
set -a; . ./.env; set +a
docker exec -i portfolio-db-prod psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<'SQL'
CREATE ROLE portfolio_app LOGIN PASSWORD 'CHANGE_ME';
GRANT CONNECT ON DATABASE portfolio TO portfolio_app;
GRANT USAGE, CREATE ON SCHEMA public TO portfolio_app;
DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I OWNER TO portfolio_app', r.tablename);
  END LOOP;
  FOR r IN SELECT sequencename FROM pg_sequences WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER SEQUENCE public.%I OWNER TO portfolio_app', r.sequencename);
  END LOOP;
END $$;
SQL
```

Flyway must own the tables it alters, hence the ownership transfer (including `flyway_schema_history`). Then point the backend at the new role: add `APP_DB_USER=portfolio_app` and `APP_DB_PASSWORD=...` to `.env`, change `SPRING_DATASOURCE_USERNAME`/`SPRING_DATASOURCE_PASSWORD` of the `backend` service in `docker-compose.prod.yml` to those variables (the `postgres` service keeps `POSTGRES_USER`), run `docker compose -f docker-compose.prod.yml up -d backend` and check the startup log for Flyway validation and the first requests. Rollback: switch the two variables back and restart the backend. Not applied yet: the compose file still uses `POSTGRES_USER` for the backend.

## When something breaks

- 502 from the edge after recreating backend or frontend: should not happen any more (Docker DNS resolver). If it does, run `docker compose -f docker-compose.prod.yml up -d --force-recreate nginx`.
- Backend container restarting at start: read `docker logs portfolio-backend-prod` and look for a `JWT_SECRET` validation failure, an unknown upload type, a Flyway validation error (schema drift) or a missing required environment variable.
- Admin cannot log in: check whether the address is in `ADMIN_EMAILS` (WARN `Rejected admin login`), whether the Google e-mail is verified, and whether the JWT clock is skewed. The frontend shows the login page with `?error=...`.
- Black screen after a frontend deploy: a stale tab hit a removed chunk and the app reloads itself once (`vite:preloadError`). If it persists, check that the files referenced by `frontend/www/index.html` exist; `deploy.sh` aborts instead of publishing a broken `index.html`.
- Mail not sent: `/api/contact` answers 503 and logs the SMTP exception class. Check `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` and the Gmail app password.
- Frontend container logs `open() failed`: the bind mount is missing or unreadable; confirm that `frontend/www/index.html` exists and is owned by `jbytow`.
- Edge serves a stale config after a pull: the container was not recreated, run the `--force-recreate nginx` command above.

## Restore from backup

Restore the database only against a stopped backend, otherwise clients write into a partially restored schema.

1. Start postgres.

```bash
docker compose -f docker-compose.prod.yml up -d postgres
```

2. Restore the dump inside the container (the dump file is passed on stdin):

```bash
docker exec -i portfolio-db-prod pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists < /opt/backups/portfolio-2026-11-11.dump
```

3. Start the backend. Flyway sees the restored `flyway_schema_history` and continues from its recorded version.

```bash
docker compose -f docker-compose.prod.yml up -d backend
```

4. Restore uploads into the volume if the dump is older than the files on disk:

```bash
docker run --rm -v uploads_data_prod:/u -v /opt/backups:/b alpine sh -c 'cd /u && tar xzf /b/uploads-2026-11-11.tgz'
```

5. Run the verification block above.

The uploads restore command is the reverse of the backup command and has never been exercised in production: to be confirmed.
