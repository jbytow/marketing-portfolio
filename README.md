# Marketing Portfolio App

A full-stack bilingual (EN/PL) marketing portfolio application designed to showcase professional experience, marketing campaigns, case studies, and creative content work. Built for marketing professionals who want a modern, customizable online presence with a powerful admin panel for content management.

The application features a clean, responsive design with smooth animations, comprehensive admin controls for all content sections, drag-and-drop reordering, media management, and full internationalization support. It demonstrates modern full-stack development practices including OAuth authentication, RESTful API design, and containerized deployment.

**Live:** [https://zakulecka.pl](https://zakulecka.pl)

## Why a CMS, Not a Static Site

This wasn't built as a one-off static page. The brief came from a real case: a marketing
professional needed a portfolio that could keep pace with her career — new campaigns, new
roles, updated skills — without needing a developer involved every time something changed.

A hand-coded static site solves the "day one" problem but creates a new one: it goes stale,
and every meaningful update (a new project, a reworked bio, a skills reshuffle) turns into a
mini rebuild. Two or three years in, it's effectively due for a rewrite.

So the site owner is a first-class user, not just the visitor. Everything that would normally
require touching code — posts, experience entries, skills, newsletters, site copy, even the
homepage stats — lives behind the admin panel instead, editable in English and Polish, with no
deploy required. The portfolio is meant to grow alongside the person it represents, like a CV
that updates itself.

## Features

- **Bilingual Support**: Full English and Polish language support with seamless switching
- **OAuth Authentication**: Secure login via Google
- **Comprehensive Admin Panel**:
  - Manage posts, experiences, skills, interests, and newsletters
  - Drag-and-drop reordering for all content sections
  - Rich text editor (TipTap) for content creation
  - Media library with image/video/PDF uploads
  - Customizable site settings (hero, stats, footer, SEO)
- **Content Sections**:
  - About Me with editable tags and interests gallery
  - Professional Experience timeline with achievements
  - Projects & Campaigns with case studies
  - Skills organized by customizable categories
  - Newsletter archive
  - Contact form
- **Modern UI/UX**:
  - Responsive mobile-first design
  - Framer Motion animations
  - Two switchable themes, Dark and Rose, with Rose as the default; the Light theme is disabled in the code

## 🌸 Rose Theme — Magic Effects

Switching to the Rose theme (🌸 in the header) unlocks a set of just-for-fun animated easter eggs, layered on top of the normal UI:

| Effect | Trigger |
|--------|---------|
| Magic hover | Hovering a button/card adds a gold glow + twinkling sparkles |
| Fairy dust | Clicking a button/link bursts stars, hearts & mini roses from the click point |
| Rose-petal loading spinner | Loading states spin a little rose instead of a plain ring |
| Rose bloom | Switching into the Rose theme triggers a radial "blooming" flash |
| KPI blessing | Clicking a homepage stat has a 2% chance to bless it with a golden glow |
| Rose explosion | 7–10 rapid clicks on the logo (which hints at this on hover) trigger a screen-wide petal shower |
| Enchant button | A pointless "✨ Enchant" button gently levitates the whole page for a second and sends the tiny fairy peeking in |
| Idle fairy | After 30s of inactivity, a hand-drawn pixel-art fairy flies corner to corner, facing whichever way she's travelling |
| Tiny fairy peek | Every 30–120s, the same fairy peeks in from a screen edge, waves, and darts off |
| Magic cursor | The mouse pointer becomes a wand that sprinkles a light trail of sparkles as it moves |
| Cursor spell | Drawing a circle gesture with the cursor makes the whole page glow, sends out sparks, and casts "✨ Campaignus Maximus ✨" |
| Cursor card tilt | Swiping fast over a card tilts it toward the cursor and sparks bounce off |
| Midnight Rose | Opening the app late at night (22:00–05:00) sends a big moon drifting back and forth across the screen, plus a "Late night marketing magic detected" banner |
| Make it prettier | A hidden-in-plain-sight button pulses every button, tilts every card, showers petals, and blesses every stat at once — then reverts with a "Much better." toast |

## Built With

### Backend
- Java 21
- Spring Boot 3.2
- Spring Security with OAuth2 (Google)
- PostgreSQL 16
- Flyway migrations
- JWT authentication
- Testcontainers (database tests)

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Query (TanStack Query v5)
- Framer Motion
- i18next (internationalization)
- TipTap (rich text editor)
- dnd-kit (drag and drop)
- Vitest + Testing Library (tests)

### Deployment Infrastructure
- **Proxmox VE** - Hypervisor for virtualization
- **Ubuntu Server** - Container VM operating system
- **Docker + Docker Compose** - Containerization and orchestration
- **NGINX** - Reverse proxy and static file serving
- **Cloudflare Tunnel** - Secure public access without exposed ports

## Tests and Quality Checks

The backend has around 460 tests (as of 2026-11-11; the number changes as the code does):

- Service tests on JUnit 5 and Mockito
- Controller tests on `@WebMvcTest`
- `SecurityConfigTest`, which drives the real Spring Security chain
- Database tests on Testcontainers with PostgreSQL 16: `PostRepositoryTest` and `MigrationSchemaTest`, the latter running the Flyway migrations and validating the resulting schema against the entities

Database tests need a working Docker daemon. On a machine where Docker runs inside WSL, point the tests at it:

```bash
export DOCKER_HOST=tcp://127.0.0.1:2375
export TESTCONTAINERS_RYUK_DISABLED=true
```

**Run backend tests:**
```bash
cd backend
.\mvnw.cmd test                    # Windows
./mvnw test                        # Linux/Mac
```

The frontend tests run on Vitest with Testing Library on jsdom. They cover i18n key parity between EN and PL and keys that no component consumes, the API client (`Accept-Language`, timeout, 401), the rich text renderer and editor sharing one TipTap extension list, the media components, and accessibility. Lint allows no warnings.

**Run frontend checks:**
```bash
cd frontend
npm run typecheck
npm run lint
npm test
npm run build
```

## Configuration Highlights

### Environment-Based Configuration
- Separate profiles for development and production
- Externalized configuration via environment variables
- Secure secrets management (JWT keys, OAuth credentials)

### Database
- Flyway migrations for version-controlled schema changes
- JSONB columns for flexible data (achievements, stats, social links)
- Automatic timestamps with `@PrePersist` and `@PreUpdate`

### Security
- Google OAuth2 is the only login provider
- Admin access is the `ADMIN_EMAILS` allowlist combined with a verified Google e-mail; the list is re-checked on every request, and `/api/admin/**` requires `ROLE_ADMIN`
- The JWT travels in an HttpOnly cookie (`Secure`, `SameSite=Lax` over HTTPS), so the frontend never handles the token
- Anonymous calls to `/api/**` answer 401 as JSON, without a redirect to the login page
- `JWT_SECRET` must be at least 32 bytes; the `prod` profile refuses to start with a missing or development secret
- CORS allows the single origin from `FRONTEND_URL`
- Uploads are checked against a server-side MIME allowlist and cannot leave the upload directory
- Rate limiting runs at the edge (nginx), per visitor keyed on `CF-Connecting-IP`, and answers 429

### Media Handling
- Uploads are stored on disk in the directory mounted from a Docker volume
- Accepted types are `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `video/mp4`, `video/webm` and `application/pdf`
- Each file is saved under a UUID name with the extension taken from its MIME type
- Files are served with `Cache-Control: public, immutable` for one year
- YouTube links are accepted in watch, shorts, live, embed, `youtu.be` and `nocookie` form
- Media URL resolution for both dev and production environments

### Internationalization
- Locale-aware API responses based on `Accept-Language` header
- Dual-column storage for all translatable content (EN/PL)
- Frontend i18next integration with language context

## Challenges During Development

### 1. React Query v5 Migration
The project upgraded from React Query v4 to v5, which removed the `onSuccess` callback from `useQuery`. Required refactoring to use `useEffect` for state synchronization with query data.

### 2. OAuth2 Session Management
Implementing stateless JWT authentication while maintaining OAuth2 login flow required careful coordination between Spring Security's OAuth2 client and custom JWT generation.

### 3. Bilingual Content Architecture
Designing database schema and DTOs to efficiently handle dual-language content while keeping the API clean. Solution: locale-aware getter methods in entities and service-level DTO mapping.

### 4. Media URL Resolution
Handling different media URL formats between development (localhost) and production (domain) environments. Implemented a `getMediaUrl` utility function that correctly resolves paths based on environment.

### 5. Drag-and-Drop with Server Sync
Implementing optimistic UI updates for drag-and-drop reordering while maintaining data consistency with the backend. Used local state with server sync on drag end.

### 6. Cloudflare Tunnel Integration
Configuring secure public access through Cloudflare Tunnel while maintaining proper HTTPS termination and WebSocket support for development hot reload.

### 7. Returning Visitors Hitting Deleted Chunks
After deploys, returning visitors got 404s on lazy-loaded chunks and a black screen: their browsers kept an older `index.html`, while each new image shipped only the latest `dist`. Fixed systemically: `index.html` is served with `no-cache`, hashed assets stay `immutable` and accumulate across deploys in a mounted `frontend/www`, and `frontend/deploy.sh` swaps `index.html` atomically only after checking that every file it references is published. Old generations are pruned by policy, and a `vite:preloadError` handler reloads a stale tab once (see [docs/operations.md](docs/operations.md)).

## Getting Started

### Prerequisites
- Docker and Docker Compose (Compose v2)
- Node.js 20+ for local frontend development (the Docker image builds on `node:24-alpine`)
- Java 21 for local backend development: Lombok in Spring Boot 3.2.1 fails on JDK 22 and newer, so `JAVA_HOME` has to point at a JDK 21 installation

### Quick Start with Docker

1. Clone the repository:
```bash
git clone https://github.com/jbytow/marketing-portfolio.git
cd marketing-portfolio
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure OAuth credentials in `.env` (optional, for admin access):
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
ADMIN_EMAILS=your_email@example.com
```

4. Start the application:
```bash
docker compose up --build
```

The development compose publishes ports 5432, 8080 and 5173 on `127.0.0.1` only.

5. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080/api
   - Admin Panel: http://localhost:5173/admin

### Production Deployment

Production uses `docker-compose.prod.yml`; the frontend is published additively with
`frontend/deploy.sh` so returning visitors never hit deleted chunks. See [docs/operations.md](docs/operations.md).

### Local Development

#### Backend
```bash
cd backend
.\mvnw.cmd spring-boot:run    # Windows
./mvnw spring-boot:run        # Linux/Mac
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
├── backend/
│   ├── src/main/java/com/portfolio/
│   │   ├── config/          # Configuration classes
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Data transfer objects
│   │   ├── entity/          # JPA entities
│   │   ├── repository/      # Spring Data repositories
│   │   ├── security/        # Security & JWT
│   │   └── service/         # Business logic
│   ├── src/test/java/       # Backend tests
│   └── src/main/resources/
│       ├── db/migration/    # Flyway migrations
│       └── application.yml  # Configuration
├── frontend/
│   ├── src/
│   │   ├── admin/           # Admin panel components
│   │   ├── components/      # Shared components
│   │   ├── contexts/        # React contexts
│   │   ├── i18n/            # Translations (en.json, pl.json)
│   │   ├── lib/             # Utilities (queryKeys, mediaUrl)
│   │   ├── pages/           # Public pages
│   │   ├── services/        # API services
│   │   └── types/           # TypeScript types
│   ├── deploy.sh            # Additive frontend deploy
│   ├── vitest.config.ts     # Test configuration
│   └── nginx.conf           # Nginx configuration
├── docs/
│   ├── api.md               # REST API reference
│   └── operations.md        # Production runbook
├── nginx/                   # Production nginx config
├── docker-compose.yml       # Development setup
└── docker-compose.prod.yml  # Production setup
```

## Environment Variables

The production compose file refuses to start without `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAILS` and `FRONTEND_URL`. Optional entries are `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `CONTACT_EMAIL` and `VITE_API_URL`.

The full list with defaults lives in [`.env.example`](.env.example). Startup checks, log lines and per-variable behaviour are in [docs/operations.md](docs/operations.md).

## API Endpoints

The full REST reference (public and admin endpoints, authentication, response envelope, error codes) lives in [docs/api.md](docs/api.md).

## License

MIT
