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

Open `http://localhost:3000`. The Backend status card becomes green when the backend is available.

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

Milestones 1 through 11 are complete. Users can manage profiles and skills, find matching partners, complete exchange requests, schedule learning sessions, join private Jitsi rooms, review partners, chat after an accepted exchange, and follow activity through notifications. Administrators can manage account access and skill categories.

## Authentication pages and API

Frontend pages:

```text
http://localhost:3000/register
http://localhost:3000/login
http://localhost:3000/dashboard
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
http://localhost:3000/profile/edit
http://localhost:3000/profiles/{userId}
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
http://localhost:3000/skills
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
http://localhost:3000/search
```

Backend endpoint:

```text
GET /api/search
```

The public endpoint accepts optional `skill` and `categoryId` query parameters. It returns skill partners who share matching skills, supports partial and case-insensitive skill names, and groups each user's matching skills into one result card. Each card links to that user's public profile. When a logged-in user searches, their own profile is excluded from the results.

## Exchange requests

Authenticated users can open their request workspace at:

```text
http://localhost:3000/exchanges
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
http://localhost:3000/sessions
http://localhost:3000/sessions/new
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

## Video meetings

Every learning session receives a long, random Jitsi room name when it is created. Room information is included in the protected session response only after the backend verifies that the signed-in user is one of the two exchange participants. A scheduled session shows **Join video meeting** on its details page and opens a responsive embedded meeting powered by the Jitsi IFrame API.

For an existing database, run this migration before restarting the backend:

```text
backend/database/migrations/20260925_add_video_room_to_sessions.sql
```

The meeting screen asks for camera and microphone access after the user chooses to join. If permission is denied, the user can retry, continue to Jitsi without the preflight check, or open the room in a new tab. The optional session meeting URL remains available as a fallback link. The default integration uses the public `meet.jit.si` service, so production deployments should review Jitsi's service terms or configure a dedicated Jitsi deployment.

Manual two-account check:

1. Sign in with two exchange participants in separate browsers or browser profiles.
2. Open the same scheduled session in both browsers and select **Join video meeting**.
3. Allow camera and microphone access, join the room, and confirm both participants can see or hear each other.
4. Leave and rejoin once, then deny media permission and verify the retry and external-link fallbacks.
5. Confirm a third account cannot retrieve the session or its room name.
6. Check the embedded meeting at phone and desktop widths.

## Reviews

After a learning session is marked `COMPLETED`, each participant can submit one review of the other participant from the session details page. Reviews contain a required rating from 1 to 5 and an optional comment of up to 1000 characters. The backend derives the reviewed member from the authenticated participant and session, preventing clients from reviewing an unrelated user. Reviews for scheduled or cancelled sessions, third-party submissions, and duplicate reviews are rejected.

Public profiles display the member's average rating, total review count, and received reviews. Reviewer email addresses and other private account information are never included.

Backend endpoints:

```text
POST /api/reviews
GET  /api/reviews/mine
GET  /api/reviews/users/{userId}
```

For an existing database, run this migration before restarting the backend:

```text
backend/database/migrations/20260926_create_reviews.sql
```

Manual two-account check:

1. Complete a learning session shared by users A and B.
2. Open the completed session as user A, submit a rating and comment, and confirm the submitted state appears.
3. Open user B's public profile and confirm its average, count, reviewer name, rating, and comment.
4. Try submitting another review for the same session and confirm it is rejected.
5. Sign in as user B and confirm user B can independently review user A.
6. Confirm a third user and participants in scheduled or cancelled sessions cannot submit a review.

## Chat and notifications

Accepted exchange partners can open a private conversation from the **Requests** page. Messages are delivered live over an authenticated WebSocket/STOMP connection, stored in the database, and limited to 1000 characters. A five-second REST refresh and REST message submission remain available as a fallback while the socket reconnects. Completed exchanges keep their conversation available. The backend verifies both exchange participation and exchange status before accepting messages, and delivers socket events through private user queues. Sending a message creates a stored notification for the recipient. Notification badges and the notification page refresh periodically, while opening the matching conversation automatically marks its message notifications as read.

Authenticated users can open **Notifications** from the main navigation to see exchange and session activity. The unread badge is loaded from the backend, and notifications can be marked read individually or all at once. Notification ownership checks prevent one user from reading or changing another user's notifications.

Backend endpoints:

```text
GET  /api/messages/exchanges/{exchangeId}
POST /api/messages/exchanges/{exchangeId}
WS   /ws
SEND /app/exchanges/{exchangeId}/messages
SUB  /user/queue/exchanges/{exchangeId}
GET  /api/notifications
POST /api/notifications/{id}/read
POST /api/notifications/read-all
POST /api/notifications/conversations/{exchangeId}/read
```

For an existing database, run this migration before restarting the backend:

```text
backend/database/migrations/20260927_create_messages.sql
```

Manual two-account check:

1. Accept an exchange between users A and B, open its chat in two browser profiles, and send messages from both accounts.
2. Confirm each conversation refreshes automatically and preserves messages after reloading the page.
3. Confirm a pending/rejected exchange and an unrelated third user cannot load or send messages.
4. Trigger exchange and session activity, then confirm the recipient sees the unread notification count and notification list.
5. Mark one notification as read, then use **Mark all as read** and confirm the unread badge clears.
6. Confirm one account cannot mark another account's notification as read.

## Admin workspace

The admin workspace is available only to authenticated users with the `ADMIN` role:

```text
http://localhost:3000/admin
```

For local development, register an account normally and promote it directly in MySQL:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-admin@example.com';
```

Log out and back in after changing the role so the new JWT contains the admin authority. Do not expose database access or role-promotion controls in the public application.

Backend endpoints:

```text
GET    /api/admin/users
PATCH  /api/admin/users/{userId}/enabled
POST   /api/admin/categories
PUT    /api/admin/categories/{categoryId}
DELETE /api/admin/categories/{categoryId}
```

Admins can enable or disable accounts but cannot disable their own account. Disabled users cannot log in or authenticate with an existing token. Category names must be unique, and a category cannot be deleted while skills still belong to it.

## Sample data and final manual check

The backend safely creates four starter categories and twelve catalog skills on startup. The initializer is repeatable and never creates duplicate names. Suggested local-only accounts and a two-user scenario are in [SAMPLE_USERS.md](SAMPLE_USERS.md); sample passwords and users are intentionally not inserted automatically.

Final workflow check:

1. Register users A and B and complete both profiles.
2. Add complementary teach and learn skills, then find user B from user A's search.
3. Send and accept an exchange, confirm both stored notifications, and exchange chat messages.
4. Schedule a future session, join its room in separate browser profiles, then complete it after its scheduled time.
5. Submit one review from each account and confirm both public ratings.
6. Promote a separate local account to admin, disable and re-enable user B, and create, rename, and delete an empty category.
7. Check the workflow at phone (about 375px), tablet (about 768px), and desktop (1200px or wider) widths with keyboard-only navigation.

## Production checklist

- Use a long, randomly generated `JWT_SECRET` and production-only database credentials.
- Set `FRONTEND_URL` to the exact deployed frontend origin.
- Keep `.env`, `node_modules`, `dist`, Maven `target`, and IDE files out of Git (the root `.gitignore` already covers them).
- Replace the public Jitsi service with managed or self-hosted infrastructure before a real public launch.
- Remove demonstration accounts and review category/user access before deployment.
