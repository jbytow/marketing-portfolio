# Przeniesienie zmian z audytu 2026-11 do forka

Ten plik opisuje wszystkie zmiany, które audyt z 2026-11-11 wprowadził w repo `marketing-portfolio`
(gałąź `audit-2026-11`), w formie nadającej się do przeniesienia do forka (osobne portfolio na tym samym kodzie).
Każdy punkt ma: co zmieniono, dlaczego, gdzie to leży w tym repo, jak sprawdzić, czy fork tego potrzebuje,
i jak zweryfikować po zmianie. Fork mógł się rozjechać z oryginałem, dlatego każdy punkt zaczyna się od
sprawdzenia, nie od kopiowania.

Źródło prawdy dla kodu: `git log 99390e6..82bf82a` w tym repo (152 commity, 21 paczek poprawek). Diff
konkretnej zmiany: `git log --oneline --grep="<fragment tematu commitu>"` i `git show <sha>`.

## Prompt do wklejenia w sesji w forku

```
Pracujemy w repo forka aplikacji marketing-portfolio (ten sam stos: Spring Boot 3.2 + React/Vite).
W oryginale zrobiono audyt i upgrade; opis wszystkich zmian jest w załączonym pliku
docs/audit-2026-11-porting-guide.md (sekcje "Zmiany do przeniesienia"). Oryginalne repo z gotowym kodem:
D:/Dev/Projects/Java/marketingPortfolioApp (gałąź audit-2026-11), możesz z niego czytać i kopiować.

Zadanie:
1. Etap 0: przeczytaj CLAUDE.md, STATE.md i README forka, ustal komendy testów (backend JDK 21, testy z bazą
   przez Testcontainers, frontend typecheck/lint/test/build), zapisz baseline (liczba testów, LOC).
2. Dla każdego punktu z sekcji "Zmiany do przeniesienia" wykonaj krok "Sprawdź w forku". Wynik:
   dotyczy / nie dotyczy (z dowodem path:line) / już zrobione. Nie zgaduj.
3. Punkty "dotyczy" podziel na paczki o rozłącznych plikach (max 8 na paczkę), każda w osobnym worktree,
   TDD (test pada przed poprawką), commit bez atrybucji AI, niezależna recenzja diffu. Zmiany widoczne
   dla użytkownika i zmiany architektury tylko po mojej decyzji; zbierz je na koniec, nie pytaj w trakcie.
4. Po scaleniu: pełne testy (z bazą), lint, typecheck, build, smoke lokalny (compose), aktualizacja
   README/docs tak jak w oryginale (docs/operations.md, docs/api.md), LESSONS.md.
5. Raport po polsku: tabela punktów (dotyczy / nie dotyczy / zrobione), testy przed i po, decyzje dla mnie,
   blok "Do zrobienia" z wdrożeniem (tylko na moje polecenie).
```

## Jak czytać punkty

- **Sprawdź w forku**: komenda grep albo plik do otwarcia. Jeśli wynik jest inny niż w oryginale, punkt może
  nie dotyczyć.
- **Zmiana**: co zrobić. **Dlaczego**: ryzyko lub koszt, który usuwa.
- **Wzór**: pliki w tym repo, które można skopiować lub podejrzeć.
- **Test**: jak udowodnić, że działa (klasa testu lub komenda).

Konwencje oryginału, które warto przenieść razem z kodem: komentarze tylko "dlaczego", bez nowych warstw
i abstrakcji "na zapas", nowe zachowanie zawsze z testem, zmiany schematu tylko przez nową migrację Flyway,
`ddl-auto: validate`.

## Zmiany do przeniesienia

### A. Bezpieczeństwo backendu

1. **401 zamiast przekierowania do Google dla API.** Sprawdź: `grep -n "exceptionHandling\|HttpStatusEntryPoint" backend/src/main/java/com/portfolio/config/SecurityConfig.java` (brak = dotyczy). Zmiana: `exceptionHandling().defaultAuthenticationEntryPointFor(new HttpStatusEntryPoint(UNAUTHORIZED), new AntPathRequestMatcher("/api/**"))`. Dlaczego: bez tego każdy gość wywołujący `/api/admin/auth/me` dostaje 302 do Google i tworzy sesję HTTP, a obsługa 401 we froncie jest martwa. Wzór: `SecurityConfig.java`, test `SecurityConfigTest.java`. Test: GET `/api/admin/auth/me` bez ciasteczka -> 401 bez nagłówka Location.
2. **ROLE_ADMIN i allowlista sprawdzana przy każdym żądaniu.** Sprawdź: `grep -n "hasRole\|authenticated()" SecurityConfig.java`; `grep -n "isAdmin\|ROLE_ADMIN" backend/src/main/java/com/portfolio/security/JwtAuthenticationFilter.java`. Zmiana: filtr JWT nadaje `ROLE_ADMIN` tylko e-mailom z `ADMIN_EMAILS` (sprawdzane per żądanie), `/api/admin/**` wymaga `hasRole("ADMIN")`. Dlaczego: usunięcie adresu z listy działa od razu, a obce źródło uwierzytelnienia nie przejdzie. Test: token nie-admina -> 403, admin -> 2xx.
3. **Walidacja `JWT_SECRET` na starcie.** Sprawdź: `grep -n "32\|dev_jwt" backend/src/main/java/com/portfolio/security/JwtService.java`. Zmiana: w profilu `prod` brak sekretu lub sekret krótszy niż 32 bajty albo równy domyślnemu deweloperskiemu zatrzymuje start. Dlaczego: domyślny sekret w prod pozwala wystawić sobie token admina. Wzór: `JwtService.java`, `JwtServiceTest.java`. Uwaga przy wdrożeniu: najpierw sprawdź `.env` na serwerze.
4. **OAuth: `email_verified`, redirect po błędzie, usunięty GitHub.** Sprawdź: `grep -n "email_verified\|github" -ri backend/src/main/java/com/portfolio/security/`. Zmiana: odrzucenie kont bez zweryfikowanego e-maila (redirect `/admin/login?error=not_authorized`), `failureHandler` przekierowuje na `/admin/login?error=oauth_failed` (domyślny `/login?error` nie jest trasą SPA), martwe gałęzie GitHub usunięte także we froncie (`AuthContext`, `AdminLogin`, klucze i18n). Test: `OAuth2AuthenticationSuccessHandlerTest`, `AdminLogin.test.tsx`.
5. **Ciasteczko sesji OAuth: Secure i SameSite=Lax.** Sprawdź: `grep -n "CookieSameSiteSupplier\|Secure" SecurityConfig.java`. Zmiana: `CookieSameSiteSupplier.ofLax().whenHasName("JSESSIONID")` i wymuszenie Secure, bo za tunelem Tomcat widzi tylko http. Dlaczego: JSESSIONID istnieje mimo STATELESS (przechowuje authorization request OAuth). Timeout sesji 5 min (`server.servlet.session.timeout`).
6. **Origin check dla zapisów do `/api/admin/**`** (fala A, decyzja D5). Sprawdź: `ls backend/src/main/java/com/portfolio/security/OriginCheckFilter.java`. Zmiana: filtr odrzuca 403 metody inne niż GET/HEAD/OPTIONS na `/api/admin/**`, gdy `Origin` (albo origin z `Referer`) jest obecny i różny od `app.frontend.url`; brak nagłówka = przepuszczane (klienci nie-przeglądarkowi). Dlaczego: CSRF jest wyłączony, a SameSite=Lax nie chroni przed subdomenami. Test: `SecurityConfigTest`, `OriginCheckFilterTest`.
7. **Konta Google spoza allowlisty nie są zapisywane; V17 czyści stare** (fala A, D7). Sprawdź: `sed -n '40,65p' backend/src/main/java/com/portfolio/service/UserService.java` (zapis przed sprawdzeniem `isAdmin` = dotyczy). Dlaczego: dane osobowe bez celu (RODO), tabela rośnie. Migracja: `DELETE FROM users WHERE is_admin IS NOT TRUE;`.
8. **Honeypot w formularzu kontaktowym** (fala A, D2). Zmiana: pole `website` w `ContactRequest` (opcjonalne); gdy wypełnione, kontroler loguje WARN i zwraca 200 bez wysyłki; we froncie ukryte pole off-screen z `tabIndex=-1` i `aria-hidden`. Na brzegu osobna strefa limitu `/api/contact` (5 r/min). Test: `ContactControllerTest`, `Contact.test.tsx`.

### B. Obsługa błędów i logowanie

9. **Błędy klienta jako 4xx z jednolitym `ApiResponse`, bez stack trace.** Sprawdź: `grep -c "@ExceptionHandler" backend/src/main/java/com/portfolio/config/GlobalExceptionHandler.java` (oryginał po zmianie: ok. 15 handlerów). Zmiana: `MethodArgumentTypeMismatch`, `PropertyReference`, `HttpMessageNotReadable`, `MissingServletRequestParameter` -> 400; `HttpRequestMethodNotSupported` -> 405; `HttpMediaTypeNotSupported` -> 415; `MaxUploadSizeExceeded` -> 413; `DataIntegrityViolation` -> 409; `NoResourceFound` -> 404 `{"error":"not found"}`; każdy jedną linią WARN z metodą, URI i IP klienta z `CF-Connecting-IP`. Nie rozszerzaj `ResponseEntityExceptionHandler` (zmienia body na ProblemDetail). Test: `GlobalExceptionHandlerTest` z `ListAppender` (sprawdza brak throwable w logu).
10. **Kontakt: 503 przy awarii SMTP, timeouty, brak logowania adresów odwiedzających.** Sprawdź: `grep -n "connectiontimeout\|writetimeout" backend/src/main/resources/application.yml`; `grep -n "getEmail()" backend/src/main/java/com/portfolio/service/ContactService.java` w logach. Zmiana: `mail.smtp.connectiontimeout/timeout/writetimeout`, `MailException` -> 503, startowy WARN gdy `CONTACT_EMAIL` lub `MAIL_USERNAME` puste.
11. **Health bez wskaźnika poczty, graceful shutdown.** Zmiana: `management.health.mail.enabled: false` (awaria SMTP nie restartuje kontenera), `server.shutdown: graceful` z fazą 8 s (Docker stop 10 s). Zostaw własny `/api/health`, jeśli monitor zewnętrzny go używa (w oryginale Uptime Kuma).

### C. Media i uploady

12. **NPE przy usuwaniu mediów YouTube.** Sprawdź: `grep -n "getFilename()" backend/src/main/java/com/portfolio/service/MediaService.java` w metodzie delete (brak null-checku = dotyczy). Test: `MediaServiceTest` "deletes YouTube media without touching storage".
13. **Spójność plik i wiersz, jedna mapa MIME, ścieżki w katalogu uploadów.** Sprawdź: `grep -n "normalize\|startsWith\|resolve" backend/src/main/java/com/portfolio/service/StorageService.java`. Zmiana: zapis pliku i wiersza w jednej kolejności z kompensacją przy błędzie; rozszerzenie, typ i podkatalog z jednej mapy MIME (nieznany typ w konfiguracji zatrzymuje start); `resolve()` + `normalize()` + `startsWith(root)` przy odczycie i usuwaniu; `Cache-Control: public, max-age=31536000, immutable` dla plików o nazwach UUID; 404 dla brakującego pliku. Test: `StorageServiceTest`, `MediaServiceTest`, `MediaControllerTest` (łącznie ok. 107 testów w oryginale).
14. **Parser YouTube i walidacja długości.** Zmiana: akceptuje watch, shorts, live, embed, youtu.be, nocookie, `v=` po innych parametrach; alt do 255, URL do 500 -> 400 zamiast 500. Usunięty publiczny `GET /api/media/{id}` (metadane), jeśli front go nie woła (`grep -n "media/" frontend/src/services/api.ts`).
15. **Usunięcie wpisu usuwa jego pliki** (fala A, D13): `MediaService.deleteAllForPost` wywoływane z `PostService.deletePost`.

### D. Baza danych

16. **Migracja V16 i test schematu.** Sprawdź: `ls backend/src/main/resources/db/migration/`; `grep -rn "DataJpaTest\|MigrationSchemaTest" backend/src/test`. Zmiana: `DROP INDEX IF EXISTS idx_posts_slug, idx_users_email, idx_users_provider` (zdublowane z UNIQUE), `published NOT NULL` w posts i newsletters (po `UPDATE ... SET published=false WHERE published IS NULL`); `MigrationSchemaTest` na Testcontainers uruchamia Flyway i waliduje schemat z encjami (`ddl-auto: validate` w teście, nie `create-drop`). Dlaczego: testy z `create-drop` nigdy nie sprawdzały migracji. Przed wdrożeniem migracji usuwającej obiekty: `pg_dump`.
17. **`@Enumerated(EnumType.STRING)` zamiast konwerterów.** Sprawdź: `ls backend/src/main/java/com/portfolio/config/*Converter.java`. Zmiana: usunięte `CategoryConverter`, `MediaTypeConverter` i ich testy; encje z `@Enumerated`. Zachowanie identyczne (kolumny VARCHAR).
18. **`baseline-on-migrate: false`.** Dlaczego: na niepustej bazie bez historii Flyway baseline oznaczyłby schemat jako zmigrowany bez wykonania migracji.
19. **Zapytanie po hashtagu przyjazne indeksowi GIN**, `@EntityGraph` dla umiejętności z kategorią (N+1), `countByCategoryId` zamiast ładowania list. Sprawdź `SoftSkillRepository`, `SkillCategoryService.getAllCategories`.

### E. API: walidacja i martwe trasy

20. **`@Valid` na każdym `@RequestBody` admina, walidacja reorder.** Sprawdź: `grep -L "@Valid" backend/src/main/java/com/portfolio/controller/Admin*Controller.java`. Zmiana: `ReorderRequest` z `@NotEmpty List<@Valid OrderItem>`, `@NotNull id/displayOrder`; 201 na create; usunięte komunikaty sukcesu bez konsumenta. Test: `RequestDtoValidationTest`, `AdminPostControllerTest`.
21. **Usunięte trasy bez wywołań z frontu.** Sprawdź własny inwentarz: adnotacje `@*Mapping` w kontrolerach vs `frontend/src/services/api.ts` (skrypt: `C:/Users/localnode/AppData/Local/Temp/mpa-audit/route-inventory.py` albo grep). W oryginale usunięto: `/api/soft-skills`, `/api/soft-skills/{id}`, `/api/skill-categories` (lista i po id; `with-skills` zostaje), `/api/experiences/{id}`, `/api/interests/{id}`, `/api/media/{id}`, `/api/posts/paged`, `/api/posts/hashtags` oraz ich wrappery w `api.ts` i martwe metody repozytoriów. Zasada: grep przed usunięciem (backend, front, testy, i18n, CSS).
22. **Slug: jeden `SlugUtils`, puste/duplikaty, 404 dla nieznanego newslettera.** Sprawdź: `grep -rn "Slugify\|slugify" backend/src/main/java`. Zmiana: wspólny slugifier dla wpisów i newsletterów, pusty slug przy edycji zachowuje stary, duplikat -> 400 (wyścig -> 409 z constraintu), `hasCaseStudy` per język, publiczne odpowiedzi tylko z polami żądanego języka (pola drugiego języka = null; typy frontu nullable).
23. **Szkice niewidoczne publicznie po slugu** (fala A, D3): `findBySlugAndPublishedTrue` w publicznych ścieżkach wpisów i newsletterów.

### F. Konfiguracja

24. **application.yml:** usunięte `messages_*.properties` i blok `spring.messages` (nieużywane), usunięte wpisy równe domyślnym, stały limit uploadu 50MB (compose nie przekazywał `MAX_FILE_SIZE`), `forward-headers-strategy: framework` zostaje. Sprawdź diff `git show 428dc14 8c62be6 adca20b 25238c3 cceff1c b9e3f65 00f61ee d6caa13 -- backend/src/main/resources/application.yml` w oryginale.
25. **`.env.example` bez zmiennych, których produkcja nie czyta** (`UPLOAD_PATH`, `MAX_FILE_SIZE`, `VITE_OAUTH_REDIRECT_URL`); compose prod z `${VAR:?}` dla 8 wymaganych zmiennych.

### G. Frontend publiczny

26. **Wszystkie teksty przez i18n (EN i PL) z testem parytetu.** Sprawdź: `grep -rn ">[A-Z][a-z]\+ [a-z]" frontend/src/pages frontend/src/components | head` (literały w JSX) oraz brak testu kluczy. Zmiana: klucze w `en.json` i `pl.json`, test `src/i18n/i18n.test.ts` (identyczne zbiory kluczy, każdy klucz użyty w `src` istnieje, lista `PENDING_CONSUMERS` dla kluczy bez konsumenta). Wzór: `frontend/src/i18n/i18n.test.ts`.
27. **Kafelki jako prawdziwe linki (stretched link), focus, aria.** Sprawdź: `grep -n "onClick={() => navigate" frontend/src/pages/*.tsx`. Zmiana: `<Link>` na tytule karty z `after:absolute after:inset-0`, interaktywne dzieci `relative z-10`, `focus-within` ring; lightbox jako dialog z Escape i pułapką focusu, karuzela z aria. Dlaczego: klawiatura i crawler nie widziały `onClick` na `<article>`.
28. **Stan błędu oddzielony od pustego wyniku.** Sprawdź: `grep -L "isError" frontend/src/pages/*.tsx`. Zmiana: `isPending`/`isError`/`refetch`, blok `common.loadError` + `common.retry`; 404 tylko dla statusu 404. Wzór: `Projects.tsx`, test `Skills.test.tsx`.
29. **Daty lokalne (bug strefy), limity pól kontaktu, filtrowanie pustych social links** (`Experience.tsx`, `Contact.tsx`, `Footer.tsx`).
30. **ErrorBoundary per strona + obsługa błędu chunka** (`vite:preloadError` przeładowanie raz, potem ekran błędu z przyciskiem), skip link, reduced motion poza efektami (`App.tsx`, `main.tsx`, `ErrorBoundary.tsx`).
31. **Motyw malowany przed startem Reacta.** Sprawdź: `grep -n "data-theme\|savedTheme" frontend/index.html`. Zmiana: inline `<script>` czyta `localStorage.theme` i ustawia `data-theme` przed pierwszym malowaniem (bez statycznego atrybutu, bo użytkownicy ciemnego motywu widzieli błysk). Test: `src/test/theme-init.test.ts`.
32. **Strona 404, scroll-to-top przy zmianie ścieżki (bez POP), fasada YouTube (miniatura, odtwarzacz nocookie po kliknięciu), czcionki hostowane lokalnie (WOFF2 latin + latin-ext, `styles/fonts.css`, licencja OFL), sanitizer tekstu "O mnie"** (fala A, D4, D8, D26, D34). Sprawdź: `grep -n "fonts.googleapis\|dangerouslySetInnerHTML\|path=\"\\*\"" frontend/index.html frontend/src/pages/About.tsx frontend/src/App.tsx`.
33. **Rich text: jedna lista rozszerzeń TipTap dla edytora i renderera**, renderer przez `generateHTML` z `@tiptap/react` (zeed-dom z `@tiptap/html` gubił `text-align`), widoczny fallback zamiast pustej treści, linki bez schematu -> `https://` (uwaga na `host:port`), toolbar z klawiatury. Sprawdź: `grep -rn "@tiptap/html" frontend/src frontend/package.json`. Wzór: `frontend/src/lib/richTextExtensions.ts`, `RichTextContent.test.tsx`.
34. **Bundle:** vendor chunki (`react`, `motion`, `i18n`, `data`) i `chunkSizeWarningLimit` 350 kB w `vite.config.ts` (główny chunk 494 -> 95 kB), `@types/node` + `typecheck` obejmujący `tsconfig.node.json`, strict w konfiguracji Vite, obrazy efektów WebP w rozmiarze wyświetlania.

### H. Panel admina

35. **Przyciski wewnątrz formularza wpisu wysyłały formularz** (`MediaManager`: `type="button"` na usuń, Enter w polu YouTube). Sprawdź: `grep -n "<button" frontend/src/admin/components/MediaManager.tsx | grep -vc 'type="button"'`.
36. **Inwalidacja cache po mutacjach** (klucze publiczne per język, prefiksy `queryKeys.prefix.*`), usunięcie mediów odświeża wpisy, interests i ustawienia (`lib/mediaInvalidation.ts`), rollback reorder przy błędzie, paging biblioteki (100), guardy przy błędzie ładowania.
37. **Komunikaty błędów z serwera w toastach** (`lib/apiError.ts`: `message` + błędy pól, 413), jeden `ConfirmDeleteModal` zamiast czterech kopii, pusty slug pomijany w zapisie, `null` czyści kategorię umiejętności, `hasCaseStudyContent` per język, przycisk publikacji zablokowany w trakcie żądania.
38. **Wygasła sesja i niezapisane zmiany** (fala A, D11): 401 w panelu pokazuje modal "zaloguj w nowej karcie" zamiast przeładowania, `useUnsavedChanges` (beforeunload + confirm przy Anuluj) w 7 formularzach.
39. **Komunikat po nieudanym logowaniu** (`?error=oauth_failed|not_authorized` -> toast z klucza), `useSiteSettings` zamiast powtórzonych zapytań.
40. **i18n panelu admina** (D18): ok. 320 tekstów w `src/admin` przeniesionych na klucze `admin.*` (EN i PL), test parytetu pilnuje kompletności. Sprawdź: `grep -nE "toast\.(success|error)\('" frontend/src/admin/*.tsx` (trafienia = dotyczy).
41. **Podgląd szkicu w panelu** (D3, druga połowa): trasy `/admin/posts/:id/preview` i `/admin/newsletters/:id/preview` renderują wpis komponentem prezentacyjnym wspólnym ze stroną publiczną, z przełącznikiem języka i banerem "podgląd szkicu"; przycisk Podgląd w listach i formularzach. Potrzebne, bo publiczny slug nie pokazuje już szkiców.
42. **Reszta decyzji D26/D34/D27**: błąd z ponowieniem także na Home i About (bez zmyślonych umiejętności przy pustej liście), menu mobilne zamyka się przy zmianie adresu, kliknięciu logo i Escape, pełnoekranowy spinner po 200 ms (`LoadingSpinner`), linki powrotu jako pełne zdania per sekcja (`post.backToProjects` itd.).
43. **`/api/health` z Actuatora** (D16): 200 UP albo 503 DOWN bez szczegółów komponentów; monitor zewnętrzny widzi awarię bazy. `/api/categories` usunięte (front używa lokalnego enuma). Sprawdź: `grep -n "HealthEndpoint" backend/src/main/java/com/portfolio/controller/HealthController.java`.

### I. Zależności, build, obrazy

44. **npm:** `npm audit fix` bez `--force`; usunięte `@tiptap/html`, `@tiptap/extension-image`, `i18next-http-backend`; dodane dev: `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/dom`, `@types/node`; skrypty `test`, `typecheck`; `lint` z `--max-warnings 0`. Sprawdź: `npm ls --depth=0` i `npm audit`.
45. **Maven:** usunięte MapStruct (3 artefakty), H2, jawne `jackson-datatype-jsr310`; `<testcontainers.version>` podbity (Testcontainers 1.19.3 nie działa z Dockerem 29: "client version 1.32 is too old"), `<tomcat.version>10.1.61</tomcat.version>` (łatki CVE przy Boot 3.2.1). Sprawdź: `grep -n "mapstruct\|h2\|testcontainers.version\|tomcat.version" backend/pom.xml`.
46. **Obrazy:** `node:24-alpine`, `nginx:1.30-alpine` (potrzebny do `resolve` w upstream), `.dockerignore` dla frontu i backendu, `app.jar` należy do roota (bez `chown -R /app`), oficjalny `mvnw` only-script z `distributionSha256Sum`, `.gitignore` bez `maven-wrapper.jar`.

### J. Edge nginx, compose, deploy

47. **Rate limiting per odwiedzający za Cloudflare Tunnel.** Sprawdź: `grep -n "limit_req_zone" nginx/nginx.conf` (klucz `$binary_remote_addr` = dotyczy: wszyscy goście liczeni jako IP konektora). Zmiana: `map $http_cf_connecting_ip $client_ip { "" $remote_addr; default $http_cf_connecting_ip; }`, strefy `api` 10 r/s, `media` 30 r/s, `oauth` 10 r/min, `contact` 5 r/min, `general` 30 r/s, `limit_req_status 429`. Ryzyko: spoofing nagłówka z LAN przez port 80 (decyzja o bindowaniu portów do adresu cloudflared).
48. **Ponowne rozwiązywanie nazw upstreamów**: `resolver 127.0.0.11` + `server backend:8080 resolve` (bez 502 po odtworzeniu kontenera). Nagłówki forwarded nadpisywane (jednowartościowy `X-Forwarded-For`, `X-Forwarded-Host`, `X-Forwarded-Port 443`, `X-Forwarded-Proto https`), bez `Connection: upgrade` na `/api/`. Sprawdź `nginx -t` w kontenerze `nginx:1.30-alpine`.
49. **CSP w trybie Report-Only** (fala A, D4): `Content-Security-Policy-Report-Only` w bloku server razem z innymi nagłówkami (pamiętaj: `add_header` w `location` kasuje dziedziczenie).
50. **Compose prod:** `${VAR:?}` dla wymaganych zmiennych, rotacja logów json-file (10m x 3), `security_opt: no-new-privileges` (nie na Postgresie), dev: porty tylko na 127.0.0.1. **deploy.sh:** `flock` na `frontend/.deploy/lock`.
51. **Runbook:** `docs/operations.md` zamiast `DEPLOY.md` (deploy backendu z `pg_dump` przed nową migracją, `up -d --force-recreate nginx` po zmianie `nginx.conf`, weryfikacja curl, backup i restore), `docs/api.md` z inwentarza tras, README opisujący stan obecny (bez liczb testów per klasa).

### K. Testy

52. **Backend:** `SecurityConfigTest` na realnym łańcuchu (nie na `TestSecurityConfig`), `MigrationSchemaTest`, testy kontrolerów admina, mediów, kontaktu, `LocaleUtilsTest`, `SlugUtilsTest`; w oryginale 136 -> 460 testów, 0 pominiętych (Docker w WSL przez forwarder socat na 127.0.0.1:2375, zobacz README "Tests and Quality Checks").
53. **Frontend:** Vitest + Testing Library (jsdom): parytet i18n, klient API, rich text, komponenty mediów, dostępność, bootstrap motywu; 0 -> 132 testy.

## Decyzje, które właściciel oryginału musiał podjąć (sprawdź to samo w forku)

Pełna lista: `docs/decyzje/001-audyt-2026-11-11.md` (40 tematów). Najważniejsze: kopie zapasowe (PBS a dump przed migracją),
upgrade Spring Boot i CI, szkice publiczne po slugu, "O mnie" jako HTML i CSP, CSRF/Origin, porty i rola bazy bez superusera,
konta Google spoza allowlisty, Google Fonts i YouTube a RODO, wygasła sesja w panelu, i18n panelu admina, strona 404.

## Weryfikacja całości po przeniesieniu

```bash
cd backend && JAVA_HOME="<JDK 21>" ./mvnw test            # z Dockerem: 0 pominiętych
cd frontend && npm run typecheck && npm run lint && npm test && npm run build
docker compose up -d --build                                # świeża baza: Flyway do ostatniej wersji, backend healthy
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8080/api/admin/auth/me   # 401
curl -s http://127.0.0.1:8080/api/.env                      # 404 {"error":"not found"}
```
