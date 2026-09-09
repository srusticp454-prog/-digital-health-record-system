# Vitalis — Digital Health Record Management System

Full-stack MERN application: React (Vite + Tailwind) frontend, Node.js/Express backend, MongoDB database.

## Features
- JWT authentication with three roles: **Patient**, **Doctor**, **Admin**
- Patient profile management (allergies, blood group, chronic conditions, emergency contact)
- Doctor directory and profile management
- Appointment booking, confirmation, and status tracking
- Medical record creation (diagnosis, symptoms, prescriptions, notes) by doctors, viewable by the patient
- **Lab report / file uploads** — doctors attach PDF/JPG/PNG files to a medical record; patients see a download link
- **Appointment email reminders** — hourly job emails patients ~24h before a confirmed appointment (logs to console if SMTP isn't configured, so it works out of the box)
- **Audit log** — every record view, creation, update, and lab upload is logged with user, role, and timestamp; visible to admins
- **Analytics dashboard** — admin view with charts for appointment status breakdown, appointment volume over time, and top diagnoses
- Role-based route protection on both API and frontend
- Security: bcrypt password hashing, helmet, rate limiting, CORS

## Project Structure
```
health-record-system/
  backend/     Node.js + Express + MongoDB API
    jobs/         Scheduled tasks (appointment reminder emails)
    uploads/      Lab report files land here (git-ignored, kept via .gitkeep)
  frontend/    React + Vite + Tailwind client
```

## Getting Started

### 1. Backend
```bash
cd backend
cp .env.example .env    # then edit MONGO_URI / JWT_SECRET
npm install
npm run dev              # starts on http://localhost:5000
```

Make sure MongoDB is running locally (or point MONGO_URI to Atlas).

### 2. Frontend
```bash
cd frontend
npm install
npm run dev               # starts on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`.

## API Overview

| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Authenticated |
| GET/PUT | /api/patients/me | Patient |
| GET | /api/patients | Doctor, Admin |
| GET/PUT | /api/doctors/me | Doctor |
| GET | /api/doctors | Authenticated |
| POST | /api/appointments | Patient |
| GET | /api/appointments | Authenticated (scoped by role) |
| PUT | /api/appointments/:id | Doctor, Admin |
| POST | /api/records | Doctor |
| GET | /api/records/patient/:patientId? | Authenticated (scoped by role) |
| POST | /api/records/:id/upload | Doctor (multipart file upload) |
| GET | /api/analytics | Admin |
| GET | /api/audit?page=1&limit=50 | Admin |

## Email Reminders
The reminder job (`backend/jobs/appointmentReminders.js`) runs every hour and emails patients about
confirmed appointments happening in the next 24 hours. If `SMTP_HOST` is left blank in `.env`, emails
are printed to the console instead — useful for local dev without a real mail provider. To send real
emails, set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM` in `.env` (e.g. using
a Gmail app password, Mailtrap, or SendGrid SMTP credentials).

## Lab Report Uploads
Doctors can attach a PDF/JPG/PNG (max 10MB) to any medical record from the record's card in the UI.
Files are stored in `backend/uploads/` and served at `/uploads/<filename>`; the frontend dev server
proxies that path to the backend automatically.

## Audit Log
Every view, creation, and update of a medical record — plus lab report uploads — is written to the
`auditlogs` collection with the acting user, their role, and a timestamp. Admins can see the 10 most
recent entries on the dashboard, or query `GET /api/audit` directly for the full paginated log.

## Next Steps / Ideas to Extend
- File uploads for lab reports (multer + S3/Cloudinary) — model field already present
- Email/SMS appointment reminders (nodemailer)
- Audit log collection for HIPAA-style access tracking
- Pagination and search on patient/doctor lists
- Doctor availability calendar with slot conflict checks
- Refresh tokens / logout-everywhere support

## Security Notes
This scaffold covers the basics (hashed passwords, JWT, role checks, rate limiting, helmet).
Before handling real patient data, add: HTTPS everywhere, encryption at rest for sensitive fields,
detailed audit logging, and a data retention/deletion policy compliant with your local health
data regulations (e.g. HIPAA, GDPR).
