
# API reference

REST API of the backend. All endpoints are JSON over HTTPS, except media downloads.

## Conventions

**Base path.** Every endpoint lives under `/api`. The frontend talks to the API through the site origin; a separate gateway is not required.

**Authentication.** Admin endpoints under `/api/admin/**` require a logged-in administrator. Login uses Google OAuth2 at `/oauth2/authorization/google`; on success the backend sets an HttpOnly cookie containing a JWT. On every request the application checks that the token is valid, that the e-mail is verified (`email_verified`) and that the e-mail is present in the `ADMIN_EMAILS` configuration. Anonymous calls to `/api/**` return 401 (empty body), without a redirect to the login page. A valid cookie whose account has no admin role returns 403. `POST /api/admin/auth/logout` clears the cookie and requires no authentication.

**Localization.** Public list and detail responses for posts and newsletters contain only the fields of the requested language. The language comes from the `Accept-Language` header: `pl` selects Polish, anything else falls back to English. The unused `*En` or `*Pl` fields are then `null`. Admin endpoints receive both languages.

**Response envelope.** Every JSON response uses the `ApiResponse` envelope. Fields that are null are omitted from the output (`@JsonInclude(NON_NULL)`).

Success:

```json
{
  "success": true,
  "data": [
    { "slug": "example-post" }
  ]
}
```

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": "must not be blank"
  }
}
```

`errors` is present only for validation failures and maps a field name to its message.

**Error codes.**

| Code | Meaning |
|---|---|
| 400 | Invalid request: validation failed, malformed JSON, unknown enum value, missing part or parameter, invalid reorder payload |
| 401 | Missing or invalid admin session cookie |
| 403 | Authenticated account without the admin role |
| 404 | Entity, slug or media file not found |
| 405 | Method not supported for the path |
| 406 | `Accept` header cannot accept a JSON answer; returned without a body |
| 409 | Conflict with an existing record, for example a duplicate slug, or a field length limit |
| 413 | Uploaded file exceeds the configured size limit |
| 415 | Unsupported content type |
| 429 | Rate limit exceeded at the edge |
| 500 | Unexpected server error |
| 503 | Mail delivery failed when submitting the contact form |

**Rate limits.** Limits are enforced at the edge: 10 requests per second per visitor for `/api/`, 30 requests per second for `/api/media/`. Exceeding a limit returns 429.

## Public endpoints

| Method | Path | Purpose | Notes |
|---|---|---|---|
| GET | `/api/categories` | List post categories | Categories are a fixed enum |
| GET | `/api/categories/{category}` | Get one category | `category` is the enum name |
| POST | `/api/contact` | Submit the contact form | Validated fields: `name`, `email`, `message` up to 5000 characters; mail failure returns 503 |
| GET | `/api/experiences` | List experiences | Ordered by their display order |
| GET | `/api/health` | Liveness check | Used by the external monitor; `/actuator/health` is not exposed by the proxy |
| GET | `/api/interests` | List interests | Ordered by their display order |
| GET | `/api/media/{subDir}/{filename}` | Serve an uploaded file | Responds with `Cache-Control: max-age=31536000, public, immutable`; a missing file returns 404 |
| GET | `/api/newsletters` | List published newsletters | Only published items; one language per request |
| GET | `/api/newsletters/{slug}` | Get a published newsletter by slug | One language per request; unknown slug returns 404 |
| GET | `/api/posts` | List published posts | Optional `category` and `hashtag` query parameters; `hashtag` takes precedence; one language per request |
| GET | `/api/posts/{slug}` | Get a published post by slug | One language per request; unknown slug returns 404 |
| GET | `/api/settings` | Get public site settings | |
| GET | `/api/skill-categories/with-skills` | List skill categories together with their soft skills | Single call for the skills section |

## Admin endpoints

All endpoints in this section require the admin session described in Conventions.

### Auth

| Method | Path | Purpose | Notes |
|---|---|---|---|
| POST | `/api/admin/auth/logout` | Log out | Clears the session cookie; no authentication required |
| GET | `/api/admin/auth/me` | Get the current admin | Returns the account identified by the cookie |

### Posts

| Method | Path | Purpose | Notes |
|---|---|---|---|
| GET | `/api/admin/posts` | List all posts | Optional `category` filter; returns both languages |
| POST | `/api/admin/posts` | Create a post | Request body validated with `@Valid`; returns 201; slug generated from the title when empty |
| PATCH | `/api/admin/posts/reorder` | Reorder posts | Body `{"items":[{"id":"<uuid>","displayOrder":<int>}]}`; empty or null elements return 400 |
| DELETE | `/api/admin/posts/{id}` | Delete a post | Returns a success envelope with no data |
| GET | `/api/admin/posts/{id}` | Get a post by id | Returns both languages |
| PUT | `/api/admin/posts/{id}` | Update a post | Request body validated with `@Valid`; an empty slug keeps the previous one; duplicate slug returns 400 (409 only when two concurrent saves race on the database constraint) |
| PATCH | `/api/admin/posts/{id}/publish` | Toggle the published flag | Returns the updated post |

### Media

| Method | Path | Purpose | Notes |
|---|---|---|---|
| GET | `/api/admin/media` | List all media | |
| POST | `/api/admin/media` | Upload a file | Multipart: `file`, optional `postId`, `altTextEn`, `altTextPl`; allows image/jpeg, image/png, image/gif, image/webp, video/mp4, video/webm, application/pdf; oversize returns 413 |
| PATCH | `/api/admin/media/reorder` | Reorder media | Body `{"items":[{"id":"<uuid>","displayOrder":<int>}]}`; empty or null elements return 400 |
| GET | `/api/admin/media/unassigned` | List media not attached to a post | |
| POST | `/api/admin/media/youtube` | Register a YouTube video | Accepts watch, shorts, live, embed, youtu.be and nocookie links |
| DELETE | `/api/admin/media/{id}` | Delete a media record | |
| PUT | `/api/admin/media/{id}` | Update a media record | Metadata update for an existing file or video |

### Experiences

| Method | Path | Purpose | Notes |
|---|---|---|---|
| GET | `/api/admin/experiences` | List all experiences | |
| POST | `/api/admin/experiences` | Create an experience | Returned with 201 |
| PATCH | `/api/admin/experiences/reorder` | Reorder experiences | Body `{"items":[{"id":"<uuid>","displayOrder":<int>}]}`; empty or null elements return 400 |
| DELETE | `/api/admin/experiences/{id}` | Delete an experience | |
| GET | `/api/admin/experiences/{id}` | Get an experience by id | |
| PUT | `/api/admin/experiences/{id}` | Update an experience | |

### Interests

| Method | Path | Purpose | Notes |
|---|---|---|---|
| GET | `/api/admin/interests` | List all interests | |
| POST | `/api/admin/interests` | Create an interest | Returned with 201 |
| PATCH | `/api/admin/interests/reorder` | Reorder interests | Body `{"items":[{"id":"<uuid>","displayOrder":<int>}]}`; empty or null elements return 400 |
| DELETE | `/api/admin/interests/{id}` | Delete an interest | |
| GET | `/api/admin/interests/{id}` | Get an interest by id | |
| PUT | `/api/admin/interests/{id}` | Update an interest | |

### Newsletters

| Method | Path | Purpose | Notes |
|---|---|---|---|
| GET | `/api/admin/newsletters` | List all newsletters | Returns both languages and unpublished items |
| POST | `/api/admin/newsletters` | Create a newsletter | Returned with 201; slug generated from the title when empty |
| DELETE | `/api/admin/newsletters/{id}` | Delete a newsletter | |
| GET | `/api/admin/newsletters/{id}` | Get a newsletter by id | |
| PUT | `/api/admin/newsletters/{id}` | Update a newsletter | An empty slug keeps the previous one; duplicate slug returns 400 (409 only when two concurrent saves race on the database constraint) |

### Skill categories

| Method | Path | Purpose | Notes |
|---|---|---|---|
| GET | `/api/admin/skill-categories` | List all skill categories | |
| POST | `/api/admin/skill-categories` | Create a skill category | Returned with 201 |
| PATCH | `/api/admin/skill-categories/reorder` | Reorder skill categories | Body `{"items":[{"id":"<uuid>","displayOrder":<int>}]}`; empty or null elements return 400 |
| DELETE | `/api/admin/skill-categories/{id}` | Delete a skill category | |
| GET | `/api/admin/skill-categories/{id}` | Get a skill category by id | |
| PUT | `/api/admin/skill-categories/{id}` | Update a skill category | |

### Soft skills

| Method | Path | Purpose | Notes |
|---|---|---|---|
| GET | `/api/admin/soft-skills` | List all soft skills | |
| POST | `/api/admin/soft-skills` | Create a soft skill | Returned with 201 |
| PATCH | `/api/admin/soft-skills/reorder` | Reorder soft skills | Body `{"items":[{"id":"<uuid>","displayOrder":<int>}]}`; empty or null elements return 400 |
| DELETE | `/api/admin/soft-skills/{id}` | Delete a soft skill | |
| GET | `/api/admin/soft-skills/{id}` | Get a soft skill by id | |
| PUT | `/api/admin/soft-skills/{id}` | Update a soft skill | |

### Settings

| Method | Path | Purpose | Notes |
|---|---|---|---|
| GET | `/api/admin/settings` | Get site settings | |
| PUT | `/api/admin/settings` | Update site settings | |

## Changes from previous versions

Endpoints and behaviours that existed earlier and are no longer available:

- `GET /api/soft-skills` and `GET /api/soft-skills/{id}` replaced by `GET /api/skill-categories/with-skills`.
- `GET /api/skill-categories` and `GET /api/skill-categories/{id}` replaced by `GET /api/skill-categories/with-skills`.
- `GET /api/experiences/{id}` and `GET /api/interests/{id}` removed; the list endpoints are the public read path.
- `GET /api/media/{id}` removed; files are read at `/api/media/{subDir}/{filename}`.
- `GET /api/posts/paged` and `GET /api/posts/hashtags` removed; paging and hashtag filtering went away with them, hashtag filtering stays as a query parameter on `GET /api/posts`.
- GitHub login removed; Google OAuth2 is the only login provider.
