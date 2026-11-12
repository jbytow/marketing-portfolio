# STATE - marketingPortfolioApp
Aktualizacja: 2026-11-12 (po wdrożeniu fal 1-4 i A-C na prod; fala D scalona: Boot 4.1.2, edge na loopback, CI)

## Cel bieżący
Gałąź `audit-2026-11` (z `main` @ 99390e6): audyt + 21 paczek poprawek, poprawki po audycie regresji, docs,
oraz wdrożone decyzje właściciela (fale A i B: 7 paczek + i18n panelu). Fala D (D1 upgrade Boot + CI, D6 porty) scalona, czeka na drugi merge do `main` i wdrożenie przez właściciela (bez migracji; backend i nginx do odtworzenia).
Otwarte: rola bazy bez superusera (procedura w runbooku), CSP do przełączenia na wymuszający po tygodniu bez naruszeń.

## Ostatnio zrobione
- 62631ab fala D: Spring Boot 4.1.2 (bez nadpisań Tomcat/Testcontainers, jjwt z Jacksonem 2, sondy wyłączone), edge 127.0.0.1:80 bez 443, .github CI + Dependabot; backend 530 testów, frontend 260
- Właściciel scalił audit-2026-11 do main i wdrożył na prod (2026-11-12); sprzątanie worktree zrobione
- 4d86841 fala C: podgląd szkiców (/admin/posts/:id/preview, /admin/newsletters/:id/preview); frontend vitest 260/260
- bb6a458 i18n panelu admina (DeepSeek 10 plików + agent Claude 7 plików, 201 kluczy EN/PL)
- f04ed51 fala B (health z Actuatora, bez /api/categories; Home/About błędy, menu mobilne, spinner, linki powrotu); 7fb0f78 fala A (Origin check, V17, honeypot, szkice 404, pliki wpisu, strefa contact, CSP RO, sanitizer About, 404, scroll, fonty lokalne, fasada YouTube, modal sesji, unsaved changes)
- f177674 docs/audit-2026-11-porting-guide.md (przewodnik dla forka), Wyzwania 8-10 w README, PBS w runbooku; 66bf541 decyzje właściciela zapisane w docs/decyzje
- ac541c7 poprawki z audytu regresji (link host:port, inwalidacja mediów, stan błędu Skills, bootstrap motywu, stały limit uploadu)
- 994fea1 docs/decyzje (40 tematów) + poprawka statusu duplikatu sluga w docs/api.md
- 8528f0d usunięty @tiptap/html, @types/node + typecheck tsconfig.node, README (Documentation, Status), context.md wpis
- ef954e1 / c09fd1c / f1d196b / c8f5541 scalone fale 4, 3, 2, 1
- de3bfe6 docs/operations.md (runbook) zamiast DEPLOY.md; a097816 docs/api.md
- Weryfikacja po fali B + i18n: backend 527 testów (0 błędów, 0 pominiętych), frontend vitest 241/241, typecheck, lint, build OK (entry 113 kB).
- Smoke lokalny (compose dev w WSL, świeża baza): V1-V16 zmigrowane, backend healthy po 15 s, publiczne 200 PL, 404 JSON, admin 401, SPA 200, .map 403; stack usunięty.
- LESSONS.md: 21 lekcji (L12-L21 nowe), sekcja "Audyt 2026-11-11"; zsynchronizowane do D:\Dev\_lekcje.

## W toku
- Sprzątanie po audycie zrobione 2026-11-12: 29 worktree i gałęzi `audit/*` usunięte, forwarder Dockera zatrzymany. Artefakty audytu nadal w `%TEMP%\mpa-audit` (raporty, recenzje, briefy) do usunięcia ręcznie.

## Otwarte decyzje właściciela
- Merge `audit-2026-11` -> `main` i wdrożenie (tylko na polecenie "wdrażaj"); przed wdrożeniem: prod .env z JWT_SECRET >= 32 bajty, pg_dump (V16), `up -d --force-recreate nginx`, próbne logowanie admina.
- 40 tematów w docs/decyzje: najważniejsze D9 backupy, D1 upgrade Spring Boot + CI, D11 utrata pracy przy wygasłej sesji, D3 szkice publiczne po slugu, D4 "O mnie" jako HTML/CSP, D5 CSRF, D6 porty/superuser, D18 i18n panelu admina, D27 akceptacja polskich tłumaczeń.
- Wpis do "Wyzwania projektowe" w README (propozycja w raporcie końcowym).

## Następne kroki
1. Właściciel: przegląd raportu i decyzji; "wdrażaj" uruchamia merge do main i procedurę z docs/operations.md.
2. Po akceptacji: cleanup.sh; usunąć `%TEMP%\mpa-audit` po zarchiwizowaniu raportów.
3. Audyt regresji nie sprawdził 41 ustaleń low (budżet) i nie testował zachowania za Cloudflare; weryfikacja po wdrożeniu wg sekcji "Verification after deploy" runbooka.

## Znane problemy / pułapki
- Lokalny `java` to JDK 25; Lombok z Boot 3.2.1 nie kompiluje na nim. Zawsze `JAVA_HOME="/c/Program Files/Java/latest/jdk-21"`.
- Testy DB z Windows: forwarder socat w WSL (patrz auto-memory "DB tests via WSL Docker forwarder"); WSL gasi VM po ostatniej sesji.
- Junction `node_modules` w worktree: najpierw usunąć sam link (`cmd /c rmdir`) i sprawdzić, że znikł, dopiero potem `git worktree remove`; `git worktree remove --force` z istniejącym junction wyczyścił główne `node_modules` (odtworzone `npm ci`, 2026-11-12).
- Duplikat sluga: 400 z jawnego sprawdzenia, 409 tylko przy wyścigu na constraincie DB.
- npm audit: 2 critical dev-only (tinypool z vitest 3) wymagają Vite 6+ (decyzja D1/D37).

## Gdzie szukać
- `docs/operations.md`: runbook produkcyjny. `docs/api.md`: referencja REST. `docs/decyzje/`: decyzje właściciela.
- `backend/src/main/java/com/portfolio/config/SecurityConfig.java`, `GlobalExceptionHandler.java`: auth i błędy.
- `frontend/src/i18n/i18n.test.ts`: parytet kluczy EN/PL. `nginx/nginx.conf`: limity per odwiedzający, resolver.
