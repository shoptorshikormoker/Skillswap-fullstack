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

Open PowerShell in the `backend` folder and set the database values for the current terminal:

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/skillswap"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your_mysql_password"
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

The available configuration names are documented in `backend/.env.example`. Spring Boot reads environment variables from the terminal; it does not automatically load that example file.

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
./mvnw.cmd -DskipTests package
```

## Current progress

Milestone 1 is in progress. The frontend and backend compile, and the health API has been manually verified. MySQL database creation and the full browser connection still require valid local MySQL credentials.
