# STATE - marketingPortfolioApp
Aktualizacja: 2026-11-11 (checkpoint, limit Claude 96%)

## Cel bieżący
Audyt i upgrade aplikacji na gałęzi `audit-2026-11` (z `main` @ 99390e6). Wszystkie 4 fale poprawek (21 paczek)
scalone i zweryfikowane. Zostały: audyt regresji (Etap 7), lekcje (agent w toku), decyzje do docs (agent w toku),
raport końcowy, push gałęzi, sprzątanie worktree. Bez merge do main i bez deployu (decyzja właściciela).

## Ostatnio zrobione
- ef954e1 fala 4 scalona (frontend-final-cleanup: vendor chunki 514 -> 95 kB, GitHub usunięty, strict vite config)
- c09fd1c fala 3 (efekty Rose, admin: komunikaty serwera, wspólny modal); f1d196b fala 2; c8f5541 fala 1
- de3bfe6 docs/operations.md zamiast DEPLOY.md; a097816 docs/api.md; 8958e09 README z faktami po audycie
- Weryfikacja końcowa (HEAD + zmiany niżej): backend 460 testów (0 błędów, DB przez Testcontainers), frontend typecheck
  (tsc + tsconfig.node), lint 0 ostrzeżeń, vitest 124/124, build OK (entry 94.8 kB), npm audit 44 (dev-only critical z vitest)
- niezacommitowane (gotowe do commitu, zielone): frontend/package.json + lock (bez @tiptap/html, + @types/node, typecheck
  obejmuje tsconfig.node.json), README.md (sekcje Documentation i Project Status), context.md (wpis o audycie), .gitignore

## W toku
- Agent Opus: LESSONS.md wg `C:\Users\localnode\AppData\Local\Temp\mpa-audit\LESSONS_BRIEF.md` (lokalny plik, gitignored).
- Agent Opus: `decisions_final.md` + `docs/decyzje/001-audyt-2026-11-11.md` (40 tematów, stan po falach 1-4).
- Artefakty audytu: `C:\Users\localnode\AppData\Local\Temp\mpa-audit\` (CTX.md, findings_full.json, fixed_list.json = 188 naprawionych,
  wave1-4_results.json, reports/, reviews/, report_notes.md, REGRESSION_BRIEF_TEMPLATE.md, rmwt.sh).
- Forwarder Dockera: kontener `mpa-tc-socat` w WSL (127.0.0.1:2375) + proces `wsl` w tle; `DOCKER_HOST=tcp://127.0.0.1:2375 TESTCONTAINERS_RYUK_DISABLED=true`.

## Otwarte decyzje właściciela
- 40 tematów (docs/decyzje po zakończeniu agenta): backupy, upgrade Spring Boot, i18n panelu admina, strona 404,
  scroll-to-top, polskie tłumaczenia z fali 2 do akceptacji, timeout axios 30 s, port 80 tylko dla cloudflared.
- Merge `audit-2026-11` -> `main` i wdrożenie: tylko na polecenie (wymagania wdrożenia w docs/operations.md).

## Następne kroki
1. Commit niezacommitowanych plików (po sprawdzeniu `git status`); gdy agenci skończą: commit `docs/decyzje/`, sync lekcji `bash /d/Dev/_lekcje/sync.sh`.
2. Etap 7: świeży agent Opus z `REGRESSION_BRIEF_TEMPLATE.md` (BASE 99390e6, HEAD = aktualny, FIXED_LIST = fixed_list.json); naprawić znaleziska z testem.
3. Raport końcowy po polsku (liczby: 22 audytorów, 373/311 ustaleń, 216+93 potwierdzonych, 2 obalone; 21 paczek, 6 uwag blokujących; testy 136 -> 460 backend, 0 -> 124 frontend; wpis Wyzwań do akceptacji), potem `git push -u origin audit-2026-11`.
4. Sprzątanie: `bash /tmp/mpa-audit/rmwt.sh <name>` dla 21 worktree (lista: `git worktree list`), `git branch -d audit/*`,
   `wsl docker rm -f mpa-tc-socat`, usunąć `frontend/tsconfig.node.tsbuildinfo` jeśli nie ignorowany.

## Znane problemy / pułapki
- Lokalny `java` to JDK 25; Lombok z Boot 3.2.1 nie kompiluje na nim. Zawsze `JAVA_HOME="/c/Program Files/Java/latest/jdk-21"`.
- WSL gasi VM po ostatniej sesji, więc kontener socat ginie; trzymać proces `wsl` w tle. Testcontainers po bumpie nie potrzebuje api.version.
- Junction `node_modules` w worktree usuwać tylko `[System.IO.Directory]::Delete(...)` (rmwt.sh), nigdy `rm -rf`.
- Wdrożenie wymaga: JWT_SECRET >= 32 bajty w prod .env, pg_dump przed V16, `up -d --force-recreate nginx`, próbne logowanie admina. Szczegóły: docs/operations.md.
- DeepSeek dobrze robi docs z faktów; diff do długiego README nie pasował po równoległej edycji, pomógł `git apply --reject`.

## Gdzie szukać
- `docs/operations.md`: runbook produkcyjny. `docs/api.md`: referencja REST po zmianach.
- `backend/src/main/java/com/portfolio/config/SecurityConfig.java`, `GlobalExceptionHandler.java`: auth i błędy.
- `frontend/src/i18n/i18n.test.ts`: parytet kluczy EN/PL. `nginx/nginx.conf`: limity per odwiedzający, resolver.
