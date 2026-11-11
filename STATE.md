# STATE - marketingPortfolioApp
Aktualizacja: 2026-11-11

## Cel bieżący
Higiena logów produkcji: sondy skanerów (/api/.env, /wp-includes/...) mają dawać 404 bez
stack trace w backendzie i bez wpisów w error.log NGINX frontendu.

## Ostatnio zrobione
- niezacommitowane -> ten commit: `GlobalExceptionHandler.handleNoResourceFound` (404 JSON
  `{"error":"not found"}`, jedna linia WARN z klientem z `X-Forwarded-For`), test
  `GlobalExceptionHandlerTest` (@WebMvcTest, ListAppender sprawdza brak throwable),
  `log_not_found off` na poziomie `server` w `frontend/nginx.conf`
- 189205b / 10719d1 / 8f73d13 additive deploy frontendu, `index.html` no-cache, `sourcemap: 'hidden'`

## W toku
- Zmiana czeka na wdrożenie na prod (lokalnie brak Dockera, dostęp SSH do prod zablokowany
  w tej sesji). Weryfikacja po wdrożeniu: `curl -I` na `/api/.env` i `/wp-includes/css/buttons.css`
  -> 404, `docker logs portfolio-frontend-prod` bez `open() failed`, logi backendu z linią
  `No resource: GET /api/.env from ...` bez stack trace.

## Otwarte decyzje właściciela
- brak

## Następne kroki
1. Prod: `ssh jbytow@192.168.40.24`, `cd /opt/marketing-portfolio && git pull`,
   `docker compose -f docker-compose.prod.yml up -d --build backend`, `frontend/deploy.sh`.
2. Weryfikacja curl + logi jak w "W toku".
3. Za ~30 dni od 2026-11-01: `DRY_RUN=1 frontend/deploy.sh prune`, potem `prune`.

## Znane problemy / pułapki
- Lokalny `java` to JDK 25; Lombok z Boot 3.2.1 nie kompiluje na nim ("TypeTag :: UNKNOWN").
  Testy: `JAVA_HOME="/c/Program Files/Java/latest/jdk-21" ./mvnw test -Dtest=...` w `backend/`.
- `log_not_found off` musi być na poziomie `server`: błędy open() generuje blok regex dla
  `.js|.css|.svg` (bez `try_files`), nie `location /`.
- `add_header` w `location` NGINX kasuje dziedziczenie nagłówków z `server`; dlatego `expires -1`.
- `cp -n` w coreutils 9.2-9.4 kończy się kodem 1 przy pominięciu pliku; `deploy.sh` kopiuje pętlą.
- Frontend serwuje tylko to, co jest w `frontend/www`; zawsze wdrażać przez `deploy.sh`,
  nie przez `up --build frontend`. Deploy tylko jako jbytow (pliki roota psuły `git pull`).
- Lokalnie (Windows) brak Dockera; nginx.conf testowany dopiero na produkcji.

## Gdzie szukać
- `backend/src/main/java/com/portfolio/config/GlobalExceptionHandler.java`: mapowanie wyjątków.
- `frontend/nginx.conf`: cache, deny dla map, `log_not_found`; `nginx/nginx.conf`: proxy brzegowe.
- `DEPLOY.md` i `frontend/deploy.sh`: procedura deployu frontu i czyszczenie generacji.
- `docker-compose.prod.yml`: wolumen `frontend/www`, nazwy kontenerów.
