# STATE - marketingPortfolioApp
Aktualizacja: 2026-11-11 (audyt zakończony, czeka na decyzje właściciela)

## Cel bieżący
Gałąź `audit-2026-11` (z `main` @ 99390e6) zawiera wynik audytu i upgrade'u: 21 paczek poprawek w 4 falach,
poprawki po audycie regresji, nowe docs. Czeka na decyzję właściciela o merge do `main` i wdrożeniu
(wymagania wdrożenia w `docs/operations.md`). Lista decyzji produktowych: `docs/decyzje/001-audyt-2026-11-11.md`.

## Ostatnio zrobione
- ac541c7 poprawki z audytu regresji (link host:port, inwalidacja mediów, stan błędu Skills, bootstrap motywu, stały limit uploadu)
- 994fea1 docs/decyzje (40 tematów) + poprawka statusu duplikatu sluga w docs/api.md
- 8528f0d usunięty @tiptap/html, @types/node + typecheck tsconfig.node, README (Documentation, Status), context.md wpis
- ef954e1 / c09fd1c / f1d196b / c8f5541 scalone fale 4, 3, 2, 1
- de3bfe6 docs/operations.md (runbook) zamiast DEPLOY.md; a097816 docs/api.md
- Weryfikacja końcowa: backend 460 testów (0 błędów, 0 pominiętych, DB przez Testcontainers); frontend typecheck
  (tsc + tsconfig.node), lint 0 ostrzeżeń, vitest 132/132, build OK (entry 94,8 kB). Gałąź wypchnięta na origin.
- Smoke lokalny (compose dev w WSL, świeża baza): V1-V16 zmigrowane, backend healthy po 15 s, publiczne 200 PL, 404 JSON, admin 401, SPA 200, .map 403; stack usunięty.
- LESSONS.md: 21 lekcji (L12-L21 nowe), sekcja "Audyt 2026-11-11"; zsynchronizowane do D:\Dev\_lekcje.

## W toku
- Sprzątanie po audycie (po akceptacji raportu): `bash C:/Users/localnode/AppData/Local/Temp/mpa-audit/cleanup.sh`
  (21 worktree w `.worktrees/`, gałęzie `audit/*`, kontener `mpa-tc-socat`). Artefakty audytu w `%TEMP%\mpa-audit`.

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
- Junction `node_modules` w worktree usuwać tylko `[System.IO.Directory]::Delete(...)` (rmwt.sh), nigdy `rm -rf`.
- Duplikat sluga: 400 z jawnego sprawdzenia, 409 tylko przy wyścigu na constraincie DB.
- npm audit: 2 critical dev-only (tinypool z vitest 3) wymagają Vite 6+ (decyzja D1/D37).

## Gdzie szukać
- `docs/operations.md`: runbook produkcyjny. `docs/api.md`: referencja REST. `docs/decyzje/`: decyzje właściciela.
- `backend/src/main/java/com/portfolio/config/SecurityConfig.java`, `GlobalExceptionHandler.java`: auth i błędy.
- `frontend/src/i18n/i18n.test.ts`: parytet kluczy EN/PL. `nginx/nginx.conf`: limity per odwiedzający, resolver.
