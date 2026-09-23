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

Milestones 1 and 2 are complete and manually verified. Authentication includes registration, login, BCrypt password hashing, JWT authorization, protected routes, logout, validation, and responsive authentication pages.

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
