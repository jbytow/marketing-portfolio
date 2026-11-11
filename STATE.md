# STATE - marketingPortfolioApp
Aktualizacja: 2026-11-11 (w trakcie audytu, checkpoint pośredni)

## Cel bieżący
Audyt i upgrade aplikacji (workflow wieloagentowy). Gałąź integracyjna `audit-2026-11` (z `main` @ 99390e6).
Etapy 0-3 zrobione, trwa Etap 4-5 (poprawki w worktree + recenzje), fala 1 z 4.

## Ostatnio zrobione
- Audyt: 22 audytorów, 373 ustaleń surowych, 311 po dedup, 216 potwierdzonych, 93 częściowo, 2 obalone.
- Plany: 20 paczek (backend 8, frontend 9, infra 3) w 4 falach; 93 ustalenia to decyzje właściciela.
- Artefakty w `C:\Users\localnode\AppData\Local\Temp\mpa-audit\` (CTX.md, findings_full.json, plan_*.json,
  packages.json, briefs/, reports/, reviews/, decisions_draft.md, fix-wave.js, mkwt.sh, rmwt.sh).

## W toku
- Fala 1 (13 paczek) w workflow `mpa-fix-wave`; worktree w `.worktrees/<name>`, gałęzie `audit/<name>`.
- Forwarder Dockera: kontener `mpa-tc-socat` w WSL (127.0.0.1:2375), trzymany przy życiu przez proces w tle;
  testy DB: `DOCKER_HOST=tcp://127.0.0.1:2375 TESTCONTAINERS_RYUK_DISABLED=true ... ./mvnw test "-DargLine=-Dapi.version=1.44"`.

## Jak wznowić po przerwie
1. `git worktree list`; stan paczek: `reports/<pkg>.md` i `reviews/<pkg>-r*.md` w katalogu artefaktów.
2. Zatwierdzone paczki scalić po kolei na `audit-2026-11` (`git merge --no-ff audit/<name>`), potem fala 2:
   backend-P8, frontend-P1, P5, P6 (po `npm ci` w frontend po scaleniu infra-P1), fala 3: frontend-P7, P8, fala 4: frontend-P9.
3. Po scaleniu: pełne testy (z DB), tsc/lint/build, docs (README, DEPLOY -> docs/operations.md), LESSONS, decyzje do docs/.
4. Sprzątanie: `rmwt.sh <name>` (usuwa junction i worktree), `git branch -d audit/<name>`, `wsl docker rm -f mpa-tc-socat`.

## Otwarte decyzje właściciela
- 37 tematów w `decisions_draft.md` (do raportu końcowego).

## Znane problemy / pułapki
- Lokalny `java` to JDK 25; Lombok z Boot 3.2.1 nie kompiluje na nim. Testy: `JAVA_HOME="/c/Program Files/Java/latest/jdk-21"`.
- Testcontainers 1.19.3 vs Docker 29: wymaga `-Dapi.version=1.44` (sprawdza paczka infra-P1).
- WSL gasi VM po ostatniej sesji, kontener socat umiera; trzymać proces `wsl` w tle.
- Junction `node_modules` w worktree: usuwać tylko `[System.IO.Directory]::Delete(...)`, nigdy `rm -rf`.
- `cmd //c mklink` nie działa z Git Bash (konwersja ścieżek); używać PowerShell `New-Item -ItemType Junction`.

## Gdzie szukać
- `backend/src/main/java/com/portfolio/config/GlobalExceptionHandler.java`, `SecurityConfig.java`: granice błędów i auth.
- `frontend/nginx.conf`, `nginx/nginx.conf`, `frontend/deploy.sh`, `docs/operations.md`: wdrożenie.
