# SkillSwap

SkillSwap is a beginner-friendly full-stack learning project where users exchange skills, schedule learning sessions, join video meetings, chat, and review each other.

## Technology stack

- Frontend: React 19.3, Vite, JavaScript, and pure CSS
- Backend: Java 25, Spring Boot 4.1.1, and Maven
- Database: MySQL

The detailed roadmap and progress checklist are in [PROJECT_PLAN.md](PROJECT_PLAN.md).

Local demonstration credentials and suggested test workflows are documented in [SAMPLE_USERS.md](SAMPLE_USERS.md).

## Project folders

```text
Skillswap-fullstack/
|-- frontend/
`-- backend/
```

Setup and run instructions will be expanded during Milestone 1.

## Requirements

- Java 25
- Node.js 24 or later
- MySQL 8 or later
- Git

You do not need to install Maven globally. The backend includes the Maven Wrapper.

## 1. Create the MySQL database

Open MySQL Workbench or another MySQL client and run:

```sql
CREATE DATABASE skillswap;
```

The local MySQL account in this environment requires a password. Keep that password private and never add it to Git.

## 2. Run the backend

Create `backend/.env` from `backend/.env.example`. Add your database values and a private JWT secret:

```properties
DB_URL=jdbc:mysql://localhost:3306/skillswap
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_base64_secret
```

Generate a suitable JWT secret in PowerShell:

```powershell
$bytes = New-Object byte[] 32
$generator = [Security.Cryptography.RandomNumberGenerator]::Create()
$generator.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Copy only the generated Base64 result into `JWT_SECRET`, then close the generator with `$generator.Dispose()`.

Start the backend from the `backend` folder:

```powershell
./mvnw.cmd spring-boot:run
```

The API runs at `http://localhost:8080`. Check it at:

```text
http://localhost:8080/api/health
```

Expected response:

```json
{
  "message": "SkillSwap API is running.",
  "status": "UP"
}
```

The available configuration names are documented in `backend/.env.example`. The real `.env` file is ignored by Git and is loaded automatically when the backend starts from the `backend` folder.

## 3. Run the frontend

Open a second PowerShell terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Backend status card becomes green when the backend is available.

To use another API address, copy `frontend/.env.example` to `frontend/.env` and change `VITE_API_URL`. The `.env` file is ignored by Git.

## Useful commands

### Frontend

```powershell
npm run dev
npm run format
npm run format:check
npm run lint
npm run build
```

### Backend

```powershell
./mvnw.cmd spring-boot:run
./mvnw.cmd spotless:apply
./mvnw.cmd spotless:check
./mvnw.cmd -DskipTests package
```

## Current progress

Milestones 1 through 7 are complete. Users can manage their profiles and skills, find matching partners, complete the exchange-request workflow, and schedule, update, complete, or cancel learning sessions.

## Authentication pages and API

Frontend pages:

```text
http://localhost:5173/register
http://localhost:5173/login
http://localhost:5173/dashboard
```

Backend endpoints:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

The dashboard route and `/api/auth/me` require authentication. Logging out removes the JWT from the browser.

## Profile pages and API

Frontend pages:

```text
http://localhost:5173/profile/edit
http://localhost:5173/profiles/{userId}
```

Backend endpoints:

```text
GET /api/profiles/me
PUT /api/profiles/me
GET /api/profiles/{userId}
```

The edit page and `/api/profiles/me` endpoints require authentication. Profile updates always use the authenticated user, so one user cannot update another user's profile. Public profile responses do not include email addresses or passwords.

## Skills page and API

The authenticated skill-management page is available at:

```text
http://localhost:5173/skills
```

The application creates four starter categories and twelve starter skills when the backend starts. The initializer is safe to run repeatedly and does not create duplicate records.

Backend endpoints:

```text
GET    /api/categories
GET    /api/skills
GET    /api/user-skills/me
POST   /api/user-skills/me
PUT    /api/user-skills/me/{userSkillId}
DELETE /api/user-skills/me/{userSkillId}
GET    /api/user-skills/users/{userId}
```

Users can add skills as `TEACH` or `LEARN` and select `BEGINNER`, `INTERMEDIATE`, or `ADVANCED`. Update and delete operations use the authenticated user, preventing one user from changing another user's skills. Public user skills are displayed on public profile pages.

## Search page and API

The search page is available at:

```text
http://localhost:5173/search
```

Backend endpoint:

```text
GET /api/search
```

The public endpoint accepts optional `skill` and `categoryId` query parameters. It returns skill partners who share matching skills, supports partial and case-insensitive skill names, and groups each user's matching skills into one result card. Each card links to that user's public profile. When a logged-in user searches, their own profile is excluded from the results.

## Exchange requests

Authenticated users can open their request workspace at:

```text
http://localhost:5173/exchanges
```

An exchange can be requested from another member's public profile when the sender has at least one skill to teach. The sender chooses the requested skill from the full catalog, so neither participant needs to add that skill to a learning or teaching list before the request is sent. The recipient can review the offered and requested skills before accepting or declining.

Backend endpoints:

```text
POST /api/exchange-requests
GET  /api/exchange-requests/received
GET  /api/exchange-requests/sent
POST /api/exchange-requests/{id}/accept
POST /api/exchange-requests/{id}/reject
POST /api/exchange-requests/{id}/cancel
```

Only the receiver can accept or reject a pending request, and only the sender can cancel it. Each event creates a stored notification for the other participant. Notification list and read-state endpoints are planned for Milestone 10.

Manual two-account check:

1. Give user A a `TEACH` skill that user B has as `LEARN`.
2. Give user B a `TEACH` skill that user A has as `LEARN`.
3. Sign in as user A, open user B's public profile, and send a request.
4. Sign in as user B, open **Requests**, and accept or decline it.
5. Confirm the new status under user A's **Sent** tab. Also verify that self-requests, duplicate pending requests, and actions by the wrong participant are rejected.

## Learning sessions

Authenticated users can view and schedule sessions at:

```text
http://localhost:5173/sessions
http://localhost:5173/sessions/new
```

Either participant can schedule one learning session after an exchange is accepted. Both participants can view it, update its future date and meeting details, complete it after the scheduled time, or cancel it. Completing a session also changes its exchange request to `COMPLETED`.

Backend endpoints:

```text
POST /api/sessions
GET  /api/sessions
GET  /api/sessions/{id}
PUT  /api/sessions/{id}
POST /api/sessions/{id}/complete
POST /api/sessions/{id}/cancel
```

Dates use a local ISO date-time such as `2026-09-25T15:30:00`. The browser's `datetime-local` field and the backend `LocalDateTime` value intentionally preserve the user's local wall-clock time for this first version. Session creation and updates reject past times, and completion is unavailable before the scheduled time.

Manual two-account check:

1. Create and accept an exchange request between two accounts.
2. Open **Requests** and choose **Schedule session**, then enter a future date and optional meeting details.
3. Sign in as the other participant and confirm the session appears under **Sessions**.
4. Update its time, link, location, or agenda and confirm both accounts see the changes.
5. Verify completion is blocked before the scheduled time, then complete it after that time.
6. Schedule another accepted exchange, cancel its session, and confirm completed/cancelled sessions appear in history.
7. Verify a third account cannot read or modify either session.
