# SkillSwap - Beginner-Friendly Project Plan

## 1. Project Overview

SkillSwap is a full-stack web application where people can exchange skills. Users list skills they can share and want to learn, find skill partners, send exchange requests, schedule learning sessions, chat, and leave reviews.

This is also a learning project. Features will be built one at a time using simple code and a familiar layered structure.

## 2. Project Folder Structure

```text
Skillswap-fullstack/
|-- frontend/              # React application
|-- backend/               # Spring Boot application
|-- PROJECT_PLAN.md
`-- README.md              # Setup and run instructions
```

The frontend will communicate with the backend through REST APIs. The backend will store data in MySQL.

## 3. Technology Stack

### Frontend

- React 19.3
- Vite
- JavaScript
- React Router
- Axios for API requests
- Pure CSS for all styling

### Backend

- Java 25
- Spring Boot 4.1.1
- Spring Web
- Spring Data JPA
- Spring Security
- JWT authentication
- Bean Validation
- Maven

### Database

- MySQL

The first version will not use Tailwind CSS, OpenAPI/Swagger, Docker, or automated testing tools. Testing will be done manually while learning and developing each feature.

## 4. User Roles

### Regular user

- Register and log in
- View and update their profile
- Add skills they can share or want to learn
- Search for skills and users
- Send, accept, reject, or cancel an exchange request
- Schedule and complete a learning session
- Chat with an exchange partner
- Rate and review an exchange partner
- View notifications

### Admin

- Log in to an admin account
- View users and basic platform information
- Manage skill categories
- Disable or enable user accounts

Admin features will be developed after the main user workflow works.

## 5. Main Features

### 5.1 Authentication

- Register with name, email, and password
- Log in with email and password
- Hash passwords before saving them
- Use JWT to protect private backend endpoints
- Use `USER` and `ADMIN` roles
- Log out by removing the saved token from the frontend

To keep the first version simple, use one access token. Refresh-token support can be added later.

### 5.2 User profile

- Full name
- Biography
- Location
- Profile photo URL
- Availability
- Public profile page

For the first version, use an image URL instead of file upload. File upload can be learned and added later.

### 5.3 Skills

- Create skill categories
- Browse available skills
- Add a skill as `TEACH`
- Add a skill as `LEARN`
- Select `BEGINNER`, `INTERMEDIATE`, or `ADVANCED` level
- Add a short description
- Edit or remove a skill from the profile

### 5.4 Search

- Search by skill name
- Filter by category
- View skill partners who share a selected skill
- Open a user's public profile

Start with simple search. Pagination and advanced filters can be added later.

### 5.5 Exchange requests

- Select a skill the sender can share
- Select a skill the sender wants to learn
- Add a short request message
- Send the request to another user
- View sent and received requests
- Accept, reject, or cancel a request

Request statuses:

```text
PENDING -> ACCEPTED
PENDING -> REJECTED
PENDING -> CANCELLED
ACCEPTED -> COMPLETED
```

### 5.6 Learning sessions

- Create a session after an exchange request is accepted
- Select a date and time
- Create a private video-room name for the session
- Join an embedded video meeting from the session page
- Allow a normal meeting link or physical location as a fallback
- Add a short agenda
- Mark the session as completed or cancelled

Session statuses are `SCHEDULED`, `COMPLETED`, and `CANCELLED`.

### 5.7 Video meetings

Use **Jitsi Meet** for the first video-meeting version. Jitsi provides a browser IFrame API that can be embedded in the React application. This gives SkillSwap camera, microphone, screen sharing, and meeting controls without building a video-streaming server.

Simple architecture:

```text
React session page
    -> embeds a Jitsi meeting room

Spring Boot backend
    -> stores room name, session members, and schedule

Jitsi service
    -> handles video, audio, and screen sharing
```

Implementation rules:

- Create a long, unpredictable room name when an exchange session is scheduled.
- Store the room name in `learning_sessions`.
- Return meeting details only to the two exchange participants.
- Check session membership in Spring Boot before showing the meeting page.
- Show Join Meeting only for an accepted exchange with a scheduled session.
- Ask for camera and microphone permission only after the user chooses to join.
- Display clear controls for joining, leaving, muting, camera, and screen sharing.
- Do not implement meeting recording in the first version.
- Do not send video or audio through the Spring Boot backend.

For learning and demonstration, the public Jitsi Meet service can be used initially. Public rooms do not provide a production privacy or availability guarantee. Before a real public launch, choose either managed Jitsi hosting or a self-hosted Jitsi deployment; server hosting is not free even though Jitsi software is open source.

The first fallback can be a saved external Google Meet or other meeting URL. Automatically creating Google Meet rooms requires Google authentication and Google Workspace API configuration, so it is not the recommended first implementation.

### 5.8 Reviews

- Allow a review only after a session is completed
- Give a rating from 1 to 5
- Add an optional comment
- Show a user's average rating on their profile
- Allow only one review from each participant for a session

### 5.9 Notifications

- Notify a user when an exchange request is received
- Notify the sender when a request is accepted or rejected
- Notify users when a session is scheduled or updated
- Mark notifications as read

Start with notifications stored in the database and loaded through REST APIs. Real-time notifications can be added later.

### 5.10 Chat

- Allow messages only between users who have an accepted exchange
- Display a simple conversation page
- Store messages in the database

Start with REST-based messaging and a refresh button or timed refresh. WebSocket-based real-time chat can be added later.

## 6. Core User Workflow

```text
Register or log in
    -> Complete profile
    -> Add skills to share and learn
    -> Search for a skill or user
    -> Send an exchange request
    -> Other user accepts the request
    -> Schedule a learning session
    -> Chat and attend the session
    -> Mark the session as completed
    -> Leave a rating and review
```

## 7. Database Plan

### `users`

- `id`, `name`, `email`, `password`, `role`, `enabled`, `created_at`

### `profiles`

- `id`, `user_id`, `bio`, `location`, `photo_url`, `availability`

### `categories`

- `id`, `name`, `description`

### `skills`

- `id`, `name`, `description`, `category_id`

### `user_skills`

- `id`, `user_id`, `skill_id`, `skill_type`, `level`, `description`
- `skill_type` is `TEACH` or `LEARN`

### `exchange_requests`

- `id`, `sender_id`, `receiver_id`, `offered_skill_id`, `wanted_skill_id`, `message`, `status`, `created_at`

### `learning_sessions`

- `id`, `exchange_request_id`, `scheduled_at`, `video_room_name`, `meeting_url`, `location`, `agenda`, `status`

### `messages`

- `id`, `exchange_request_id`, `sender_id`, `content`, `sent_at`

### `reviews`

- `id`, `learning_session_id`, `reviewer_id`, `reviewee_id`, `rating`, `comment`, `created_at`

### `notifications`

- `id`, `user_id`, `message`, `type`, `reference_id`, `is_read`, `created_at`

## 8. Simple Backend Structure

Use a traditional layered structure so it is easy to understand where each class belongs:

```text
backend/
|-- pom.xml
`-- src/main/
    |-- java/com/skillswap/
    |   |-- SkillSwapApplication.java
    |   |-- config/          # Security and application configuration
    |   |-- controller/      # Receives HTTP requests
    |   |-- service/         # Business logic
    |   |-- repository/      # Database access
    |   |-- entity/          # JPA database entities
    |   |-- dto/             # Request and response objects
    |   |-- security/        # JWT and authentication classes
    |   |-- exception/       # Error handling
    |   `-- enums/           # Status, role, level, and type values
    `-- resources/
        |-- application.properties
        `-- data.sql         # Optional starter categories
```

### How a backend request flows

```text
Frontend request -> Controller -> Service -> Repository -> MySQL
```

- A controller handles the HTTP request and response.
- A service contains business rules.
- A repository reads and writes database data.
- An entity represents a database table.
- A DTO controls data accepted from or returned to the frontend.

Do not return entities directly from controllers. Use DTOs so passwords and internal fields are not accidentally exposed.

### REST API groups

```text
/api/auth
/api/users
/api/profiles
/api/categories
/api/skills
/api/user-skills
/api/exchange-requests
/api/sessions
/api/messages
/api/reviews
/api/notifications
/api/admin
```

## 9. Simple Frontend Structure

```text
frontend/
|-- package.json
|-- vite.config.js
`-- src/
    |-- assets/              # Images and icons
    |-- components/          # Reusable Navbar, Button, Card, etc.
    |-- pages/               # Complete application pages
    |-- services/            # Axios setup and API functions
    |-- context/             # Authentication state
    |-- styles/              # Shared pure CSS files
    |-- App.jsx              # Routes and main layout
    `-- main.jsx             # React entry point
```

Keep component-specific CSS beside its component or page when helpful:

```text
components/
|-- Navbar.jsx
`-- Navbar.css

pages/
|-- LoginPage.jsx
`-- LoginPage.css
```

Avoid adding extra folders until they are genuinely needed.

### Main pages

- Home, register, and login pages
- User dashboard
- Edit profile and public profile pages
- My skills and search pages
- Exchange requests page
- Session details and chat pages
- Reviews and notifications pages
- Admin and not-found pages

## 10. UI Design Direction

The visual style will be inspired by the clean, energetic learning experience of [Phitron](https://phitron.io), while keeping SkillSwap visually distinct. The interface should feel friendly, modern, colorful, and easy for a beginner to implement with pure CSS.

### 10.1 Typography

Phitron currently loads Montserrat, Inter, and Hind Siliguri. SkillSwap will use a simpler two-font system:

- **Montserrat** for headings, navigation, buttons, numbers, and badges
- **Inter** for paragraphs, forms, tables, cards, and other interface text
- `sans-serif` as the fallback font

Example:

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700;800&display=swap");

:root {
  --font-heading: "Montserrat", sans-serif;
  --font-body: "Inter", sans-serif;
}
```

Use a small and consistent type scale:

```text
Hero title:       48px desktop / 34px mobile
Page title:       36px desktop / 28px mobile
Section heading:  28px desktop / 24px mobile
Card heading:     20px
Body text:        16px
Small text:       14px
```

Use font weight and spacing before adding more font sizes.

### 10.2 Color system

Use a bright blue as the main action color, a coral red as the energetic accent, off-white page backgrounds, dark navy text, and soft blue/green/orange supporting colors.

```css
:root {
  --color-primary: #1769e0;
  --color-primary-dark: #1153b5;
  --color-primary-light: #eaf4ff;

  --color-accent: #e64942;
  --color-accent-light: #fff0ef;

  --color-text: #172033;
  --color-text-muted: #667085;
  --color-background: #f8fafc;
  --color-surface: #ffffff;
  --color-border: #e8e8e8;

  --color-success: #4d9b55;
  --color-success-light: #edf8e8;
  --color-warning: #d9822b;
  --color-warning-light: #fff4df;
  --color-error: #cf423b;

  --shadow-sm: 0 4px 14px rgba(23, 32, 51, 0.08);
  --shadow-md: 0 12px 30px rgba(23, 32, 51, 0.12);
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 22px;
}
```

Color usage rules:

- Blue: primary buttons, links, selected tabs, focus rings, and important icons
- Coral: small highlights, notification counts, decorative shapes, and destructive actions
- Green: success messages and completed statuses
- Orange: pending statuses and warnings
- White/off-white: surfaces and page backgrounds
- Dark navy: headings and important body text

Do not use coral and blue equally everywhere. Blue is the main interaction color; coral is an accent.

### 10.3 Layout and components

- Use a centered content container with a maximum width of about `1200px`.
- Use generous white space and a simple 8px spacing system: `8, 16, 24, 32, 48, 64`.
- Use white cards on an off-white background with a subtle border and shadow.
- Use rounded buttons and cards, but keep form fields slightly less rounded.
- Keep the navigation simple: logo, main links, notifications, and profile menu.
- Use skill chips for categories and share/learn labels.
- Use clear colored status badges for pending, accepted, completed, rejected, and cancelled states.
- Use friendly empty states with a short message and one clear action.
- Keep forms one column on mobile and use two columns only when it improves clarity on desktop.

### 10.4 Page-specific UI ideas

- **Home:** large headline, short explanation, two action buttons, skill-category cards, and a three-step "How it works" section.
- **Dashboard:** greeting, small summary cards, recent requests, upcoming session, and recommended skills.
- **Search:** prominent search field, category chips, simple filter panel, and profile result cards.
- **Profile:** profile header, rating, biography, share/learn skill sections, and an exchange-request button.
- **Exchange requests:** separate Received and Sent tabs with readable status badges.
- **Session:** date/time card, agenda, meeting details, partner summary, and session action buttons.
- **Video meeting:** large meeting area, clear Join/Leave actions, permission guidance, and a fallback meeting link.
- **Chat:** calm two-column desktop layout and a single conversation view on mobile.

### 10.5 Animation plan

Animations should explain interaction and make the interface feel polished. They should not delay the user or run everywhere.

#### Global motion rules

- Normal transitions: `180ms` to `250ms`
- Page/section entrance: no more than `400ms`
- Use `ease-out` for entrances and `ease` for hover transitions
- Animate `transform` and `opacity` where possible
- Respect `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### Planned animations

1. **Page entrance:** page content fades in and moves upward by about 12px.
2. **Card reveal:** homepage and search cards use a small staggered fade-up on first display.
3. **Button hover:** button moves upward by 2px and its shadow becomes slightly stronger.
4. **Card hover:** searchable user and skill cards move upward by 4px; avoid this on non-clickable cards.
5. **Navigation:** active-link underline grows smoothly from left to right.
6. **Modal:** overlay fades in while the dialog scales from `0.97` to `1`.
7. **Toast:** success/error message slides in from the top-right and fades out.
8. **Status change:** the new badge briefly uses a soft background-color transition.
9. **Loading:** use a small CSS spinner for actions and skeleton blocks for lists.
10. **Empty state:** illustration or icon uses one gentle entrance, not a looping animation.

Do not add scroll animation libraries at the beginning. Create a few reusable CSS classes such as `.fade-up`, `.card-hover`, and `.button-hover`. Add an animation library only later if a real need appears.

### 10.6 UI implementation order

1. Create `variables.css` for colors, fonts, spacing, shadows, and radii.
2. Create `global.css` for reset rules, typography, containers, and common states.
3. Build reusable `Button`, `Input`, `Card`, `Badge`, `Spinner`, and `EmptyState` components.
4. Build the responsive navbar and page layout.
5. Build one page at a time and keep its CSS beside it.
6. Add animations only after the page works correctly without them.
7. Check keyboard focus, color contrast, reduced motion, phone width, and desktop width.

## 11. Important Security Rules

- Never store plain-text passwords or return passwords in API responses.
- Store the JWT secret and database password outside source code.
- Validate important input in the backend.
- Check that the logged-in user owns a record before changing it.
- Protect admin endpoints with the `ADMIN` role.
- Do not allow users to send requests to themselves.
- Do not allow reviews before a session is completed.
- Configure CORS only for the frontend address.
- Show helpful errors without exposing internal details.

## 12. Git and Commit Plan

The repository should tell the story of how the project was built. Make small commits after a working piece is completed instead of one large commit at the end of a milestone.

### 12.1 Branch approach

For a first project, keep branching simple:

- `main` always contains working milestone code.
- Create one branch for the current milestone, such as `feature/authentication`.
- Commit small working steps on that branch.
- Manually verify the full milestone.
- Merge the branch into `main`.

Do not create a separate branch for every tiny file.

### 12.2 Commit message format

Use this easy format:

```text
type: short description
```

Suggested types:

- `chore:` project setup or configuration
- `feat:` a new user-facing feature
- `fix:` a bug fix
- `style:` CSS or visual change without feature logic
- `refactor:` code improvement without changing behavior
- `docs:` README or documentation change

Examples:

```text
chore: initialize React frontend
chore: initialize Spring Boot backend
feat: add user registration API
feat: connect registration form to backend
style: add responsive authentication pages
fix: prevent duplicate email registration
docs: add authentication setup notes
```

### 12.3 Rules for clean commits

- Make one commit for one understandable change.
- Run the application and manually check the change before committing.
- Do not commit broken code to `main`.
- Do not mix unrelated backend, frontend, and styling changes in one commit.
- Never commit `.env`, database passwords, JWT secrets, IDE files, build output, or `node_modules`.
- Review `git status` and `git diff` before every commit.
- Write commit messages that describe the result, not messages such as `update`, `work`, or `changes`.
- Update the README when setup steps or behavior change.

### 12.4 Milestone commit map

| Milestone      | Branch                   | Example important commits                                                         |
| -------------- | ------------------------ | --------------------------------------------------------------------------------- |
| Setup          | `chore/project-setup`    | initialize frontend; initialize backend; connect MySQL; connect frontend API      |
| Authentication | `feature/authentication` | add user model; add registration; add JWT login; build auth pages; protect routes |
| Profiles       | `feature/profiles`       | add profile API; build edit page; build public profile; style profile UI          |
| Skills         | `feature/skills`         | add category and skill models; add user skills; build skill pages                 |
| Search         | `feature/search`         | add search API; build filters; build result cards                                 |
| Exchanges      | `feature/exchanges`      | add request workflow; build request pages; add notifications                      |
| Sessions       | `feature/sessions`       | add scheduling API; build session pages; add status actions                       |
| Video meetings | `feature/video-meetings` | create secure room names; embed Jitsi; restrict meeting access; add call UI       |
| Reviews        | `feature/reviews`        | add review rules; build review form; show profile ratings                         |
| Chat           | `feature/chat`           | add message API; build conversation UI; restrict participants                     |
| Admin/final    | `feature/admin-polish`   | add admin pages; improve responsive UI; finish documentation                      |

## 13. Beginner-Friendly Development Milestones

Complete and manually verify one milestone before starting the next.

### Milestone 1 - Project setup

- Create the React 19.3 project inside `frontend/`
- Create the Spring Boot 4.1.1 and Java 25 project inside `backend/`
- Create and connect a MySQL database
- Create a simple backend endpoint and call it from React
- Add setup instructions to the root README

Learning goal: understand how the frontend, backend, and database connect.

Suggested commits:

```text
docs: add project plan and initial README
chore: initialize React 19.3 frontend
style: add global colors and typography
chore: initialize Spring Boot backend
chore: configure MySQL connection
feat: connect frontend to health endpoint
```

### Milestone 2 - Registration and login

- Create the user entity, repository, service, controller, and DTOs
- Implement registration, password hashing, login, and JWT authentication
- Create registration and login pages with protected routes

Learning goal: understand layered backend code, forms, APIs, and authentication.

Commit the user model, registration API, login/JWT logic, frontend forms, protected routes, and authentication styling as separate working changes.

### Milestone 3 - Profile management

- Create and update profiles
- Build edit-profile and public-profile pages
- Display validation and backend errors

Learning goal: understand CRUD operations and one-to-one relationships.

Commit the backend profile flow, edit page, public page, and responsive styling separately.

### Milestone 4 - Skills and categories

- Create categories and skills
- Add, edit, and remove share/learn skills from profiles
- Build the skill management pages

Learning goal: understand database relationships and reusable UI components.

Commit categories, skill records, user-skill operations, frontend pages, and skill-card styling separately.

### Milestone 5 - Search

- Search skills by name and filter by category
- Display matching users and open their profiles

Learning goal: understand query parameters and dynamic result lists.

Commit backend search, frontend filters, result cards, and search animations separately.

### Milestone 6 - Exchange requests

- Send and view requests
- Accept, reject, and cancel requests
- Enforce status changes in the service layer
- Create database notifications

Learning goal: understand business rules and multi-user workflows.

Commit each valid request action, the frontend request views, and notification creation in understandable steps.

### Milestone 7 - Learning sessions

- Schedule an accepted exchange
- Update meeting information
- Complete or cancel a session
- Display upcoming and completed sessions

Learning goal: understand dates, statuses, and related records.

Commit session creation, updates, completion rules, and the session UI separately.

### Milestone 8 - Video meetings

- Add `video_room_name` to learning sessions
- Generate a long random room name in Spring Boot
- Return room details only to session participants
- Embed Jitsi with its IFrame API in the React session page
- Add Join, Leave, loading, permission-error, and unsupported-browser states
- Manually verify the meeting with two users in separate browsers
- Add a normal external meeting link as a fallback

Learning goal: understand third-party browser APIs, camera/microphone permissions, and protecting meeting access.

Suggested commits:

```text
feat: generate video room for accepted session
feat: restrict video room details to participants
feat: embed Jitsi meeting on session page
style: add responsive video meeting layout
fix: handle camera and microphone permission errors
docs: add video meeting setup instructions
```

### Milestone 9 - Reviews

- Submit one review after a completed session
- Display reviews and average ratings
- Prevent invalid or duplicate reviews

Learning goal: understand validation involving multiple tables.

Commit review rules, review form, and rating display separately.

### Milestone 10 - Simple chat and notifications

- Send and load messages through REST APIs
- Restrict messages to exchange participants
- View notifications and mark them as read

Learning goal: understand user-specific data and repeated API loading.

Commit message storage, message permissions, chat UI, and notification UI separately.

### Milestone 11 - Admin and final improvement

- Manage categories and users
- Improve responsive CSS
- Add loading, empty, success, and error states
- Add sample data and complete README instructions
- Manually check the complete workflow with two user accounts

Learning goal: connect everything into a complete application.

Keep admin work, responsive fixes, animation polish, sample data, and documentation in separate commits.

## 14. Manual Check List

Automated testing is not part of this plan. After every feature, manually check:

- Does the normal action work?
- Are required fields checked and invalid values rejected?
- Can a logged-out user access protected pages or APIs?
- Can one user change another user's private data?
- Does the page show helpful loading, success, empty, and error messages?
- Does the layout work on phone and desktop widths?

Keep a small checklist of completed manual checks in the README while building.

## 15. Features to Add Only After the Main Project

- Real-time chat and notifications
- Email notifications
- Dark mode
- Dashboard charts
- Portfolio file uploads
- Achievement badges
- PDF export
- Smart skill recommendations
- Managed or self-hosted video infrastructure
- Video meeting recording
- Refresh tokens

## 16. First Version Definition of Done

The first version is complete when two users can register, log in, create profiles, add skills, find each other, send and accept an exchange request, schedule a session, join its video meeting, complete the session, exchange simple chat messages, receive stored notifications, and leave reviews. The application must also have understandable setup instructions and a responsive pure-CSS interface.

## 17. Implementation Checklist

This is the single progress tracker for the project. Update it immediately after completing and manually verifying a task.

Checklist meaning:

- `[ ]` Not started or not yet verified
- `[x]` Completed and manually verified
- Do not check an item only because code was written; first run it and confirm it works.
- At the end of each milestone, update the README and commit the checklist change with the related work.

### Milestone 1 - Project setup

- [x] Initialize the Git repository and create the root `.gitignore`
- [x] Create the root `README.md`
- [x] Create the `frontend/` React 19.3 project with Vite and JavaScript
- [x] Create the basic frontend folder structure
- [x] Install React Router and Axios
- [x] Add Montserrat and Inter fonts
- [x] Create global CSS variables and reset styles
- [x] Create the `backend/` Spring Boot 4.1.1 project with Java 25 and Maven
- [x] Create the layered backend package structure
- [x] Create the MySQL database
- [x] Configure the backend database connection without committing secrets
- [x] Create and manually call a backend health endpoint
- [x] Call the health endpoint from React
- [x] Add frontend and backend run instructions to the README
- [x] Review changes and commit the completed setup milestone

### Milestone 2 - Registration and login

- [x] Create the user entity and role enum
- [x] Create the user repository
- [x] Create registration request and response DTOs
- [x] Create the registration service and controller endpoint
- [x] Hash passwords securely
- [x] Reject duplicate email registration
- [x] Create the login DTOs, service, and endpoint
- [x] Add JWT generation and validation
- [x] Configure Spring Security and protected endpoints
- [x] Create the frontend authentication context and Axios configuration
- [x] Build and style the registration page
- [x] Build and style the login page
- [x] Add protected frontend routes and logout
- [x] Manually verify valid and invalid authentication cases
- [x] Update the README and commit the authentication milestone

### Milestone 3 - Profile management

- [x] Create the profile entity and user relationship
- [x] Create profile DTOs, repository, service, and controller
- [x] Protect profile update operations by ownership
- [x] Build and style the edit-profile page
- [x] Build and style the public-profile page
- [x] Add profile loading, empty, success, and error states
- [x] Check profile pages on phone and desktop widths
- [x] Manually verify profile CRUD and authorization
- [x] Update the README and commit the profile milestone

### Milestone 4 - Skills and categories

- [x] Create category and skill entities
- [x] Create the user-skill entity, type enum, and level enum
- [x] Create category, skill, and user-skill repositories
- [x] Create related DTOs, services, and controllers
- [x] Add starter skill categories
- [x] Build reusable skill card, chip, and status badge components
- [x] Build and style the My Skills page
- [x] Add share and learn skills to a profile
- [x] Edit and remove profile skills
- [x] Manually verify skill validation, ownership, and relationships
- [x] Update the README and commit the skills milestone

### Milestone 5 - Search

- [x] Create the backend skill and user search endpoint
- [x] Add skill-name and category filters
- [x] Build and style the search page
- [x] Build responsive search result cards
- [x] Link results to public profiles
- [x] Add search loading, empty, and error states
- [x] Add restrained result-card entrance and hover animations
- [x] Manually verify search and filters
- [x] Update the README and commit the search milestone

### Milestone 6 - Exchange requests

- [x] Create the exchange-request entity and status enum
- [x] Create exchange-request DTOs, repository, service, and controller
- [x] Prevent users from sending requests to themselves
- [x] Implement send, accept, reject, and cancel rules
- [x] Build the exchange-request form
- [x] Build Received and Sent request tabs
- [x] Add readable request status badges
- [x] Create stored notifications for request events
- [x] Manually verify the workflow using two accounts
- [x] Update the README and commit the exchange milestone

### Milestone 7 - Learning sessions

- [x] Create the learning-session entity and status enum
- [x] Create session DTOs, repository, service, and controller
- [x] Allow session creation only for accepted exchanges
- [x] Implement schedule, update, complete, and cancel rules
- [x] Build the session form and details page
- [x] Build upcoming and completed session views
- [x] Handle date and time values correctly
- [x] Manually verify session rules using two accounts
- [x] Update the README and commit the session milestone

### Milestone 8 - Video meetings

- [ ] Add the Jitsi IFrame API to the frontend
- [ ] Generate and save a long random room name in the backend
- [ ] Return room information only to session participants
- [ ] Show Join Meeting only for an authorized scheduled session
- [ ] Build the responsive embedded meeting area
- [ ] Add joining, loading, leaving, and fallback states
- [ ] Handle denied camera and microphone permissions
- [ ] Add an external meeting-link fallback
- [ ] Verify a call with two accounts in separate browsers
- [ ] Check meeting layout on phone and desktop widths
- [ ] Update the README and commit the video-meeting milestone

### Milestone 9 - Reviews

- [ ] Create the review entity
- [ ] Create review DTOs, repository, service, and controller
- [ ] Allow reviews only after completed sessions
- [ ] Prevent duplicate and unauthorized reviews
- [ ] Build and style the review form
- [ ] Display reviews and average rating on profiles
- [ ] Manually verify valid and invalid review cases
- [ ] Update the README and commit the review milestone

### Milestone 10 - Chat and notifications

- [ ] Create the message entity
- [ ] Create message DTOs, repository, service, and controller
- [ ] Restrict messages to accepted exchange participants
- [ ] Build and style the conversation page
- [ ] Add manual or timed message refresh
- [ ] Complete the notification entity and endpoints
- [ ] Build the notification list and unread indicator
- [ ] Add mark-one and mark-all-as-read actions
- [ ] Manually verify messages and notifications with two accounts
- [ ] Update the README and commit the chat/notification milestone

### Milestone 11 - Admin and final improvement

- [ ] Add admin authorization rules
- [ ] Build user-management endpoints and page
- [ ] Build category-management endpoints and page
- [ ] Add loading, empty, success, and error states across all pages
- [ ] Add modal, toast, button, page, and card animations where planned
- [ ] Add reduced-motion support
- [ ] Check keyboard navigation, focus states, labels, and color contrast
- [ ] Check every page on phone, tablet, and desktop widths
- [ ] Add safe sample data
- [ ] Manually complete the full workflow with two user accounts
- [ ] Verify secrets and generated files are ignored by Git
- [ ] Complete all README setup and usage instructions
- [ ] Review final Git history for clear commits
- [ ] Commit the completed first version

### Optional features - not part of the first version

- [ ] Real-time chat with WebSocket
- [ ] Real-time notifications
- [ ] Email notifications
- [ ] Dark mode
- [ ] Dashboard charts
- [ ] Portfolio file uploads
- [ ] Achievement badges
- [ ] PDF export
- [ ] Smart skill recommendations
- [ ] Managed or self-hosted video infrastructure
- [ ] Video meeting recording
- [ ] Refresh tokens

## 18. Recommended Way to Learn While Building

For every milestone:

1. Learn the small concept needed for that milestone.
2. Build the backend entity-to-controller flow.
3. Use Postman or a similar REST client to try the endpoint manually.
4. Build the React page and connect it to the endpoint.
5. Manually check normal and invalid cases.
6. Write short README notes about what you learned.
7. Commit the completed milestone before starting the next one.

Do not build all backend features first. Completing one small feature from database to browser makes the application easier to understand and debug.
