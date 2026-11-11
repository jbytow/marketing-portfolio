# STATE - marketingPortfolioApp
Aktualizacja: 2026-11-11 (checkpoint w trakcie audytu, limit Claude 86%)

## Cel bieżący
Audyt i upgrade aplikacji (workflow wieloagentowy) na gałęzi `audit-2026-11` (z `main` @ 99390e6).
Fale 1-2 poprawek scalone i zweryfikowane; fala 3 trwa; potem fala 4, audyt regresji, lekcje, raport.

## Ostatnio zrobione
- a097816 docs/api.md (60 tras, z inwentarza kontrolerów) + README odsyła do niego
- de3bfe6 docs/operations.md (runbook) zamiast DEPLOY.md; linki poprawione
- f1d196b fala 2 scalona: posty/newslettery (slug 409, 404, locale), i18n publiczny (EN+PL, test parytetu), api.ts (Accept-Language, timeout, martwe wrappery), rich text (wspólne rozszerzenia), Tomcat 10.1.61
- c8f5541 fala 1 scalona: security (401 JSON, ROLE_ADMIN, JWT_SECRET), config, błędy 4xx, media (NPE YouTube, confinement), admin API walidacja, skills N+1, V16 + test schematu, app shell, strony publiczne (linki, błędy), admin (MediaManager submit), deps (npm audit fix, MapStruct/H2 out, vitest), obrazy/mvnw, edge nginx (limity per CF-Connecting-IP, resolver)
- Weryfikacja po fali 2: backend 460 testów (0 błędów, DB przez Testcontainers), frontend typecheck/lint/vitest 64/build zielone
- niezacommitowane: README.md (aktualizacja faktów po audycie, w trakcie)

## W toku
- Fala 3 (workflow w tle): frontend-P7 rose-effects, frontend-P8 admin-errors-and-cleanup; worktree `.worktrees/<name>`, gałęzie `audit/<name>`.
- Potem fala 4: frontend-P9 frontend-final-cleanup (worktree do utworzenia z HEAD po scaleniu fali 3).
- Artefakty: `C:\Users\localnode\AppData\Local\Temp\mpa-audit\` (CTX.md, findings_full.json, plan_*.json, packages.json, briefs/, reports/, reviews/, wave*_results.json, decisions_draft.md (40 tematów), report_notes.md, LESSONS_BRIEF.md, REGRESSION_BRIEF_TEMPLATE.md, fix-wave.js, mkwt.sh, rmwt.sh).
- Forwarder Dockera: kontener `mpa-tc-socat` w WSL (127.0.0.1:2375) trzymany przez proces w tle; `DOCKER_HOST=tcp://127.0.0.1:2375 TESTCONTAINERS_RYUK_DISABLED=true` wystarcza (bez api.version).

## Otwarte decyzje właściciela
- 40 tematów w `decisions_draft.md` (do docs/decyzje i raportu końcowego); m.in. backupy, upgrade Spring Boot, i18n panelu admina, strona 404, scroll-to-top, polskie tłumaczenia z fali 2 do akceptacji.

## Następne kroki
1. Po fali 3: scalić `audit/rose-effects`, `audit/admin-errors-and-cleanup`; pełne testy; `mkwt.sh frontend-final-cleanup`; fala 4 (workflow fix-wave, base = nowy HEAD).
2. Po fali 4: scalić; `npm uninstall @tiptap/html` w frontend (sesja główna); pełne testy + build.
3. Etap 7: audytor regresji (REGRESSION_BRIEF_TEMPLATE.md, lista fixed z wave*_results.json).
4. Etap 8: lekcje (LESSONS_BRIEF.md, agent Opus), sync `D:\Dev\_lekcje`; context.md wpis; docs/decyzje/001-audyt-2026-11-11.md z decisions_draft.md; README dokończyć.
5. Raport końcowy po polsku; push `audit-2026-11` (bez merge do main, bez deployu).
6. Sprzątanie: `rmwt.sh <name>` dla 20 worktree, `git branch -d audit/*`, `wsl docker rm -f mpa-tc-socat`.

## Znane problemy / pułapki
- Lokalny `java` to JDK 25; Lombok z Boot 3.2.1 nie kompiluje na nim. Zawsze `JAVA_HOME="/c/Program Files/Java/latest/jdk-21"`.
- WSL gasi VM po ostatniej sesji, więc kontener socat ginie; trzymać proces `wsl` w tle.
- Junction `node_modules` w worktree usuwać tylko `[System.IO.Directory]::Delete(...)`, nigdy `rm -rf`; `cmd //c mklink` nie działa z Git Bash.
- Paczka zmieniająca lockfile potrzebuje prawdziwego `node_modules` (bez junction) i `npm ci`; po scaleniu `npm ci` w głównym frontendzie.
- DeepSeek: diff do długiego README nie pasował po równoległej edycji sekcji; nakładać `git apply --reject` albo prosić o plik NEW.
- Wdrożenie wymaga: JWT_SECRET >= 32 bajty w prod .env, pg_dump przed V16, `up -d --force-recreate nginx`, próbne logowanie admina (email_verified). Szczegóły: docs/operations.md.

## Gdzie szukać
- `docs/operations.md`: runbook produkcyjny (deploy, weryfikacja, backup, awarie).
- `docs/api.md`: referencja REST po zmianach (usunięte endpointy w sekcji Changes).
- `backend/src/main/java/com/portfolio/config/SecurityConfig.java`, `GlobalExceptionHandler.java`: auth i błędy.
- `frontend/src/i18n/i18n.test.ts`: parytet kluczy EN/PL i allowlista PENDING_CONSUMERS.
- `nginx/nginx.conf`: limity per odwiedzający, resolver upstreamów.
