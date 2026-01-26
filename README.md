# Marketing Portfolio App

A full-stack bilingual (EN/PL) marketing portfolio application for showcasing professional experience, campaigns, case studies, and content work.

## Tech Stack

### Backend
- Java 21
- Spring Boot 3.2
- Spring Security with OAuth2 (Google, GitHub)
- PostgreSQL 16
- Flyway migrations
- JWT authentication

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Query
- Framer Motion
- i18next (internationalization)

### Infrastructure
- Docker & Docker Compose
- Nginx (reverse proxy)

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local frontend development)
- Java 21+ (for local backend development)

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
docker-compose up --build
```

5. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080/api
   - Admin Panel: http://localhost:5173/admin

### Local Development

#### Backend
```bash
cd backend
./mvnw spring-boot:run
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
│   └── src/main/resources/
│       ├── db/migration/    # Flyway migrations
│       └── application.yml  # Configuration
├── frontend/
│   ├── src/
│   │   ├── admin/           # Admin panel components
│   │   ├── components/      # Shared components
│   │   ├── contexts/        # React contexts
│   │   ├── i18n/            # Translations
│   │   ├── pages/           # Public pages
│   │   ├── services/        # API services
│   │   └── types/           # TypeScript types
│   └── nginx.conf           # Nginx configuration
├── nginx/                   # Production nginx config
├── docker-compose.yml       # Development setup
└── docker-compose.prod.yml  # Production setup
```

## Features

- **Bilingual Support**: Full English and Polish language support
- **OAuth Authentication**: Login via Google or GitHub
- **Admin Panel**: Manage posts, media, and site settings
- **Content Categories**:
  - About Me
  - Experience
  - Campaigns
  - Influence Marketing
  - Case Studies
  - Content & Copy
  - Soft Skills
- **Media Management**: Upload and manage images, videos, PDFs
- **Rich Text Editor**: TipTap-based content editing
- **Responsive Design**: Mobile-first approach

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_DB` | Database name | portfolio |
| `POSTGRES_USER` | Database user | portfolio |
| `POSTGRES_PASSWORD` | Database password | portfolio123 |
| `JWT_SECRET` | JWT signing key | (dev key) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | - |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | - |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | - |
| `ADMIN_EMAILS` | Comma-separated admin emails | admin@example.com |

## API Endpoints

### Public
- `GET /api/posts` - List published posts
- `GET /api/posts/{slug}` - Get post by slug
- `GET /api/categories` - List categories
- `GET /api/settings` - Get site settings

### Admin (requires authentication)
- `GET/POST /api/admin/posts` - Manage posts
- `GET/POST /api/admin/media` - Manage media
- `GET/PUT /api/admin/settings` - Manage settings

## License

MIT
