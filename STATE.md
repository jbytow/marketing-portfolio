# STATE - marketingPortfolioApp
Aktualizacja: 2026-11-01

## Cel bieżący
Usunąć klasę awarii "404 na chunkach i czarny ekran po deployu" na zakulecka.pl:
additive deploy frontendu i poprawne nagłówki cache.

## Ostatnio zrobione
- 8f73d13 additive deploy: `frontend/deploy.sh` (deploy + prune), wolumen `./frontend/www` w
  `docker-compose.prod.yml`, `Cache-Control: no-cache` dla HTML, `*.map` -> 403, `base: '/'`, `DEPLOY.md`
- (ten commit) `sourcemap: 'hidden'`, reload przy `vite:preloadError` w `main.tsx`, wpis 7 w README Challenges
- 2550e61 / d5512f4 przełącznik admina wymuszający animacje Rose mimo reduced-motion

## W toku
- Wdrożenie additive deployu na serwer nie zostało wykonane (pierwsze uruchomienie `frontend/deploy.sh`).

## Otwarte decyzje właściciela
- brak

## Następne kroki
1. Na serwerze: `git pull && frontend/deploy.sh` (zasiewa `www` buildem z działającego kontenera).
2. Kryteria akceptacji z sekcji Verification w `DEPLOY.md` (curl na `/`, entry JS, `.map`, trasa SPA).
3. Po kolejnym deployu: stary chunk z poprzedniego buildu zwraca 200.

## Znane problemy / pułapki
- `add_header` w `location` NGINX kasuje dziedziczenie nagłówków z `server`; dlatego `expires -1`.
- `cp -n` w coreutils 9.2-9.4 kończy się kodem 1 przy pominięciu pliku (przerywa `set -e`);
  `deploy.sh` kopiuje pętlą.
- Po zmianie `www` frontend serwuje tylko to, co jest w `frontend/www`; pusty katalog = pusta strona.
  Zawsze wdrażać przez `deploy.sh`, nie przez `up --build frontend`.
- Lokalnie (Windows) brak Dockera; nginx.conf nie był testowany w kontenerze.

## Gdzie szukać
- `DEPLOY.md`: procedura deployu, czyszczenie generacji, weryfikacja.
- `frontend/deploy.sh`: logika deploy/prune.
- `frontend/nginx.conf`: cache i deny dla map; `nginx/nginx.conf`: proxy brzegowe.
- `docker-compose.prod.yml`: wolumen `frontend/www`.
