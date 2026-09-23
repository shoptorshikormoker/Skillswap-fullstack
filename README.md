# SkillSwap

SkillSwap is a beginner-friendly full-stack learning project where users exchange skills, schedule learning sessions, join video meetings, chat, and review each other.

## Technology stack

- Frontend: React 19.3, Vite, JavaScript, and pure CSS
- Backend: Java 25, Spring Boot 4.1.1, and Maven
- Database: MySQL

The detailed roadmap and progress checklist are in [PROJECT_PLAN.md](PROJECT_PLAN.md).

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

Milestones 1 through 4 are complete. Milestone 5 search is implemented and manually verified, and is awaiting final UI review and commit. Users can manage their profiles and skills, find people by teaching skill or category, and open public profile pages from the results.

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

The public endpoint accepts optional `skill` and `categoryId` query parameters. It returns users who teach matching skills, supports partial and case-insensitive skill names, and groups each user's matching skills into one result card. Each card links to that user's public profile. When a logged-in user searches, their own profile is excluded from the results.
