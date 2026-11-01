# STATE - marketingPortfolioApp
Aktualizacja: 2026-11-01

## Cel bieżący
Usunąć klasę awarii "404 na chunkach i czarny ekran po deployu" na zakulecka.pl:
additive deploy frontendu i poprawne nagłówki cache.

## Ostatnio zrobione
- 8f73d13 additive deploy: `frontend/deploy.sh` (deploy + prune), wolumen `./frontend/www` w
  `docker-compose.prod.yml`, `Cache-Control: no-cache` dla HTML, `*.map` -> 403, `base: '/'`, `DEPLOY.md`
- 10719d1 `sourcemap: 'hidden'`, reload przy `vite:preloadError` w `main.tsx`, wpis 7 w README Challenges
- 2550e61 / d5512f4 przełącznik admina wymuszający animacje Rose mimo reduced-motion

## W toku
- brak. Produkcja na 10719d1 (2026-11-01), wszystkie kryteria akceptacji z `DEPLOY.md` przeszły,
  stary entry `index-Cvb-uSZ7.js` i jego chunki dalej zwracają 200.

## Otwarte decyzje właściciela
- brak

## Następne kroki
1. Kolejne wdrożenia frontu: `ssh jbytow@192.168.40.24`, `cd /opt/marketing-portfolio && git pull && frontend/deploy.sh`.
2. Za ~30 dni: `DRY_RUN=1 frontend/deploy.sh prune`, potem `prune`.

## Znane problemy / pułapki
- `add_header` w `location` NGINX kasuje dziedziczenie nagłówków z `server`; dlatego `expires -1`.
- `cp -n` w coreutils 9.2-9.4 kończy się kodem 1 przy pominięciu pliku (przerywa `set -e`);
  `deploy.sh` kopiuje pętlą.
- Po zmianie `www` frontend serwuje tylko to, co jest w `frontend/www`; pusty katalog = pusta strona.
  Zawsze wdrażać przez `deploy.sh`, nie przez `up --build frontend`.
- Lokalnie (Windows) brak Dockera; nginx.conf testowany dopiero na produkcji.
- Deploy jako root zostawił w `.git` i `frontend/www` pliki roota (pull jako jbytow padał); naprawione
  `chown`, deploy tylko jako jbytow.

## Gdzie szukać
- `DEPLOY.md`: procedura deployu, czyszczenie generacji, weryfikacja.
- `frontend/deploy.sh`: logika deploy/prune.
- `frontend/nginx.conf`: cache i deny dla map; `nginx/nginx.conf`: proxy brzegowe.
- `docker-compose.prod.yml`: wolumen `frontend/www`.
