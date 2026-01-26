# Project Context

## Overview

This is a marketing portfolio application designed for marketing professionals to showcase their work, experience, and case studies. The application supports bilingual content (English and Polish) and features an admin panel for content management.

## Architecture

### Backend (Spring Boot)

The backend follows a layered architecture:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic layer
- **Repositories**: Data access layer using Spring Data JPA
- **Entities**: JPA entities mapped to PostgreSQL tables
- **DTOs**: Data transfer objects for API communication

Key components:
- **OAuth2 Authentication**: Supports Google and GitHub login
- **JWT Tokens**: Stateless authentication for API requests
- **Flyway**: Database migrations management
- **JPA Converters**: Custom converters for enum types (Category, MediaType)

### Frontend (React + TypeScript)

The frontend is a single-page application with:

- **React Router**: Client-side routing
- **React Query**: Server state management and caching
- **Context API**: Authentication and language state
- **i18next**: Internationalization
- **TipTap**: Rich text editor for content creation
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Animations

### Database Schema

Main entities:
- **posts**: Base content table with bilingual fields
- **experience_details**: Additional fields for experience posts
- **campaign_details**: Additional fields for campaign posts
- **case_study_details**: Additional fields for case study posts
- **influence_marketing_details**: Additional fields for influence marketing posts
- **media**: Uploaded files (images, videos, PDFs)
- **site_settings**: Global site configuration (singleton)
- **users**: OAuth user accounts

### Content Categories

Posts are organized by category:
1. `ABOUT_ME` - Personal introduction
2. `EXPERIENCE` - Work experience entries
3. `CAMPAIGNS` - Marketing campaigns
4. `INFLUENCE_MARKETING` - Influencer collaborations
5. `CASE_STUDY` - Detailed case studies
6. `CONTENT_COPY` - Content and copywriting samples
7. `SOFT_SKILLS` - Soft skills showcase

Each category can have additional detail fields stored in related tables.

## Key Design Decisions

### Bilingual Content
All user-facing text fields have `_en` and `_pl` suffixes (e.g., `title_en`, `title_pl`). The frontend determines which version to display based on the current language context.

### PostgreSQL Enums → VARCHAR
Originally used PostgreSQL native enums for `category` and `media_type`. Converted to VARCHAR with JPA Converters for better Hibernate compatibility and easier maintenance.

### OAuth-Only Authentication
No traditional username/password login. Admin access requires:
1. OAuth login (Google or GitHub)
2. Email must be in the `ADMIN_EMAILS` whitelist

### Stateless JWT
After OAuth login, a JWT token is issued. All subsequent API requests use this token. No server-side sessions.

### Media Storage
Files are stored on the filesystem (configurable via `UPLOAD_PATH`). In production, this should be a persistent volume or cloud storage.

## Development Notes

### Running Locally
The project uses Docker Compose for local development. The frontend Dockerfile includes nginx configuration that proxies `/oauth2/*` and `/login/oauth2/*` to the backend for OAuth flow.

### Adding New Categories
1. Add value to `Category` enum in `backend/src/main/java/com/portfolio/entity/Category.java`
2. Update database migration if needed
3. Add translations in `frontend/src/i18n/en.json` and `pl.json`
4. Create page component if needed

### Adding New Post Detail Types
1. Create new entity class extending the pattern of `ExperienceDetails`
2. Add relationship to `Post` entity
3. Create corresponding DTO
4. Update `PostService` to handle the new type
5. Update frontend forms and display components

## Security Considerations

- JWT secret should be at least 32 characters in production
- OAuth credentials should never be committed
- `ADMIN_EMAILS` controls who can access the admin panel
- CORS is configured to allow only the frontend origin
- File uploads are validated by MIME type

## Production Deployment

For production:
1. Use `docker-compose.prod.yml`
2. Configure proper SSL/TLS (uncomment nginx HTTPS config)
3. Set secure values for all secrets
4. Consider using external PostgreSQL (RDS, Cloud SQL)
5. Configure persistent storage for uploads
6. Set up proper OAuth redirect URIs for production domain
