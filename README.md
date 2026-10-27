# Mbono Professional Services – Recruitment Platform (Beta)

Design follows the Mbono Career Goals page (mbono.co.za/career-goals): focus-area cards, call-to-action band and company footer. Colours are CSS variables at the top of `frontend/css/styles.css` (`--nav`, `--gold`) so you can match the exact brand colours.

Full-stack beta: a Node.js + Express API (backend) and a plain HTML/CSS/JS app (frontend).
Data is saved in a JSON file, so you do not need to install a database yet.

## Run it
You need Node.js 18 or newer.

```
cd backend
npm install
npm start
```
Open http://localhost:3000 for the landing page. The platform itself is at http://localhost:3000/app.html. The backend serves the frontend too, so that is all.
(Optional) Copy `.env.example` to `.env` and set your own `JWT_SECRET`.

If you prefer VS Code Live Server for the frontend, run the backend as above and open `frontend/index.html`
with Live Server. It calls the API at http://localhost:3000 automatically.

## Sign in
The app opens on a sign-in page. Candidates can create an account, and use "Forgot password?" to reset. Without email (SMTP) settings, emails (including reset links) are printed in the server terminal and saved to `backend/data/outbox.log`.

## Demo accounts (password for all: Demo@123)
| Role | Email |
|---|---|
| Candidate | candidate@mbono.demo |
| Recruiter | recruiter@mbono.demo |
| Hiring Manager | manager@mbono.demo |

The sign-in page has one-click buttons for these three accounts. The Admin account is hidden: it is not listed in the app and has no demo button. Its password is set with `ADMIN_PASSWORD` in `backend/.env`, or generated and printed once in the terminal the first time the server starts (delete `backend/data/db.json` to start fresh). To reset the demo data, stop the server and delete `backend/data/db.json`.

## Project layout
```
backend/
  server.js        API: auth, vacancies, applications, profile, users, audit log
  data/seed.json   starter vacancies and applications (db.json is created on first run)
frontend/
  index.html + css/landing.css   public landing page and hero
  app.html + css/styles.css + js/app.js   the platform (sign-in, candidate, recruiter, manager, admin)
```

## API (all under /api, JWT bearer token except login)
| Method and path | Who |
|---|---|
| POST /auth/login | anyone |
| GET, PUT /me | any signed-in user |
| GET /jobs | everyone (candidates see open vacancies only) |
| POST /jobs, POST /jobs/:id/duplicate | Recruiter, Admin |
| PATCH /jobs/:id (status) | Recruiter can close; Hiring Manager and Admin approve, request changes, close |
| GET /applications | candidates see their own, staff see all |
| POST, DELETE /applications | Candidate |
| PATCH /applications/:id (stage, rate, fb), POST /applications/:id/notes | Recruiter, Hiring Manager, Admin |
| GET /users, GET /audit | Admin |

## Added in this version
- Sign-up, sign-in, sign-out and password reset (one-hour link)
- CV upload (PDF or DOCX) with automatic skill detection into the profile
- Email notifications (application received, stage changes) and interview invitations with a calendar (.ics) file
- POPIA tools: consent recorded at sign-up, download my data, delete my account and data

## Not built yet
- PostgreSQL or SQL Server database (data is still a JSON file)
- Microsoft Entra ID sign-in and automatic Teams meetings (needs an Azure app registration)
- AI candidate matching and chatbot, SMS alerts, assessments, 2FA
- Admin retention rules (automatic deletion of old data)
