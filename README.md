# EduLearn — Online Course Learning Management System

A complete, production-oriented Learning Management System built with Next.js (App Router),
TypeScript, Tailwind CSS, PostgreSQL, and Prisma ORM. EduLearn supports three role-based
dashboards (Super Admin, Instructor, Student), full course/curriculum management, a real
enrollment and progress-tracking workflow, Google Meet–based meeting scheduling, internal
messaging, announcements, notifications, and analytics — all backed by a real relational
database with server-side authorization on every route.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [Database Setup](#database-setup)
8. [Development Commands](#development-commands)
9. [Production Build & Deployment](#production-build--deployment)
10. [Demo Accounts](#demo-accounts)
11. [Demo Workflow Walkthrough](#demo-workflow-walkthrough)
12. [Testing](#testing)
13. [Security Notes](#security-notes)
14. [Sandbox Build Notes](#sandbox-build-notes)

---

## Project Overview

EduLearn is a three-role LMS: a **Super Admin** who manages the whole platform (students,
instructors, courses, categories, enrollments, meetings, reports, settings), an **Instructor**
who builds courses (modules → lessons), reviews enrollment requests, tracks student progress,
schedules meetings, and messages students, and a **Student** who browses the public catalog,
requests enrollment, works through lessons, tracks their own progress, joins scheduled
meetings, and messages their instructor.

Every dashboard route is protected server-side (Next.js Middleware + per-request session
checks in Server Components/Server Actions) — hiding a nav link is never the only line of
defense. All data is real: there are no hard-coded stats, no decorative buttons, and no mock
API responses. Every action (create course, approve enrollment, mark lesson complete, send
message, schedule meeting, etc.) performs a real, validated database write.

## Features

**Public marketing site** — home, course catalog with search/filter, course detail pages,
about, contact (with a working contact form), login, and registration.

**Authentication** — registration, login, logout, forgot/reset password (with a database-backed
reset token that expires), and JWT-based sessions stored in an HTTP-only cookie.

**Super Admin dashboard** — manage students and instructors (create/edit/deactivate/delete),
manage courses and categories, review and approve/reject enrollment requests, oversee all
scheduled meetings, view platform-wide analytics/reports with charts, and configure platform
settings.

**Instructor dashboard** — create and edit courses, build curriculum with modules and lessons
(supporting video, text, PDF, external-link, assignment, and notes content types), reorder
modules/lessons, review and approve/reject student enrollment requests, track per-student
progress, schedule Google Meet sessions (paste-a-link workflow), post course announcements,
and message enrolled students.

**Student dashboard** — browse and search courses, request enrollment, track real completion
progress per course, work through lessons in order, join scheduled meetings, message
instructors, and receive notifications.

**Cross-cutting systems** — an internal notification system (read/unread state, badge counts),
student↔instructor messaging (conversation threads), course announcements, global search and
filtering across courses/students/messages, and a responsive, professional UI built for every
screen size.

## Technology Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL 16 |
| ORM | Prisma 7 with the official `@prisma/adapter-pg` driver adapter |
| Auth | Custom JWT session auth (`jose`) + `bcryptjs` password hashing |
| Validation | Zod |
| Forms | `react-hook-form` + `useActionState` (React 19) |
| Charts | Recharts |
| Icons | lucide-react |
| Notifications (UI) | Sonner (toasts) |
| Testing | Playwright (E2E smoke suite) |

## Project Structure

```
lms/
├── prisma/
│   ├── schema.prisma          # Full relational schema (models, enums, relations, indexes)
│   ├── migrations/            # SQL migration history
│   └── seed.ts                # Realistic seed data + demo accounts
├── scripts/
│   └── e2e-smoke.mjs          # Playwright end-to-end smoke test (auth, RBAC, core flows)
├── src/
│   ├── actions/                # Server Actions ("use server") — one file per domain
│   ├── app/
│   │   ├── (public)/           # Marketing site: home, courses, about, contact
│   │   ├── (auth)/             # Login, register, forgot/reset password
│   │   ├── admin/               # Super Admin dashboard (protected)
│   │   ├── instructor/          # Instructor dashboard (protected)
│   │   ├── student/             # Student dashboard (protected)
│   │   └── unauthorized/        # 403 page for role violations
│   ├── components/
│   │   ├── ui/                  # Design-system primitives (Button, Input, Dialog, ...)
│   │   └── shared/               # Feature components shared across roles
│   ├── lib/
│   │   ├── auth/                 # Session, password hashing, route guards
│   │   ├── db/                   # Prisma client + query helpers
│   │   └── validation/           # Zod schemas
│   └── middleware.ts             # Server-side route protection by role
├── .env.example
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (running locally or accessible remotely)
- npm

### Installation

```bash
git clone <this-repository>
cd lms
npm install
cp .env.example .env
# edit .env with your real DATABASE_URL and AUTH_SECRET
```

`npm install` automatically runs `prisma generate` via the `postinstall` script.

## Environment Variables

Copy `.env.example` to `.env` and fill in real values. **Never commit `.env`.**

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string, e.g. `postgresql://user:pass@host:5432/lms_db` |
| `AUTH_SECRET` | Yes | Random secret used to sign session JWTs. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXT_PUBLIC_APP_URL` | Yes | Public base URL of the app (used to build password-reset links) |
| `SMTP_*` | No | Optional transactional email config. If unset, password-reset links are logged to the server console / shown in the UI in development instead of emailed |

## Database Setup

1. Create a PostgreSQL database matching your `DATABASE_URL`.
2. Apply the schema:

   ```bash
   npm run db:migrate        # applies committed migrations (production-safe)
   # or, for local iteration:
   npm run db:migrate:dev
   ```

3. Seed realistic demo data (accounts, courses, enrollments, meetings, messages, etc.):

   ```bash
   npm run db:seed
   ```

4. (Optional) Inspect the database visually:

   ```bash
   npm run db:studio
   ```

## Development Commands

```bash
npm run dev          # start the dev server (Turbopack) at http://localhost:3000
npm run lint          # run ESLint
npm run build          # production build (type-checks + compiles)
npm run start           # run the production build locally
```

## Production Build & Deployment

```bash
npm run build
npm run start
```

Deployment checklist:

- Provision a PostgreSQL database and set `DATABASE_URL` in your hosting provider's
  environment configuration.
- Set `AUTH_SECRET` to a strong, unique random value (never reuse the example value).
- Set `NEXT_PUBLIC_APP_URL` to your production domain.
- Run `npm run db:migrate` (not `db:migrate:dev`) as part of your deploy step to apply
  migrations without prompting.
- Run `npm run db:seed` once against a fresh database if you want the bundled demo data;
  omit it for a real production dataset.
- `npm run build` performs a full TypeScript check — treat a failing build as a blocking
  issue before deploying.

The app is a standard Next.js application and can be deployed to any platform that supports
Next.js 16 with a persistent Node.js runtime and outbound access to your PostgreSQL instance
(e.g. Vercel, Railway, Render, Fly.io, or a self-managed Node server).

## Demo Accounts

All demo accounts use the password: **`Passw0rd!`**

| Role | Email | Notes |
|---|---|---|
| Super Admin | `admin@edulearn.dev` | Full platform access |
| Instructor | `sarah.chen@edulearn.dev` | Has published courses with enrolled students |
| Instructor | `james.patel@edulearn.dev` | Secondary instructor account |
| Student | `alex.morgan@edulearn.dev` | Enrolled in multiple courses with progress |
| Student | `priya.sharma@edulearn.dev` | Additional seeded student |
| Student | `liam.oconnor@edulearn.dev` | Additional seeded student |
| Student | `mia.rodriguez@edulearn.dev` | Additional seeded student |
| Student | `noah.kim@edulearn.dev` | Additional seeded student |
| Student | `ava.johnson@edulearn.dev` | Additional seeded student |

These are development-only credentials seeded by `prisma/seed.ts`. They are not present in
any `.env` file and are safe to publish in documentation.

## Demo Workflow Walkthrough

A complete, real, end-to-end path through the system (matches what the E2E smoke test
exercises):

1. Log in as **Super Admin** → create a new instructor account.
2. Log out, log in as that **Instructor** → create a course, add modules and lessons
   (mixing content types), and publish it.
3. As Super Admin (or via self-registration), add/approve a new **Student** account and
   their enrollment request for the course.
4. Log in as the **Student** → see the approved course, open lessons in order, and mark
   lessons complete — progress percentage updates automatically.
5. As the Instructor → schedule a meeting (paste a Google Meet link) for the course; the
   Student sees it appear on their meetings page and can open the join link.
6. Student sends a message to the Instructor; Instructor replies — both sides see the
   conversation thread, and the Student receives a notification.
7. Student continues completing lessons until the course reaches 100% progress.

## Testing

An automated Playwright smoke test exercises authentication, role-based access control, and
the core navigation flows for all three roles against a running dev server:

```bash
# with the dev server running and the database seeded:
node scripts/e2e-smoke.mjs
```

It verifies: public pages render, course details load, all three roles can log in and land on
their correct dashboard, role-protected data (student/course lists) actually renders from the
database, unauthenticated users are redirected away from protected routes, and a student is
blocked from instructor-only routes.

## Security Notes

- Passwords are hashed with `bcryptjs` before storage — plaintext passwords are never
  persisted.
- Sessions are signed JWTs (`jose`) stored in an HTTP-only, secure cookie — not readable by
  client-side JavaScript.
- Every protected route is enforced **server-side**: Next.js Middleware checks the session
  and role on every request to a role-prefixed path, and Server Actions independently
  re-verify the caller's role before performing any mutation (never trusting client-supplied
  role/user IDs).
- Students cannot reach `/admin/*` or `/instructor/*` routes, and instructors cannot reach
  `/admin/*` routes — both are enforced by Middleware and by `requireRole()` checks inside
  each Server Component/Server Action, not merely by hiding navigation links.
- `.env` is git-ignored; only `.env.example` (with placeholder values) is committed.

## Sandbox Build Notes

This project was built inside a network-restricted sandbox that could not reach
`binaries.prisma.sh` to download Prisma's native schema-engine binary. This affected the
**build environment only** — it does not affect a normal networked environment and requires
no special setup for you:

- The app's runtime `PrismaClient` uses the official `@prisma/adapter-pg` driver adapter,
  which talks to PostgreSQL directly over the `pg` driver and needs **no native binary at
  all**. This is Prisma's officially supported architecture, not a workaround — `npm install`
  and `npm run dev` / `npm run build` work normally on a machine with standard network access.
- If you ever see a schema-engine download error in a similarly restricted environment,
  Prisma's bundled WASM engine (used automatically for `prisma generate` and schema
  validation) does not require that binary; only `prisma migrate`/`db push` need it to talk
  to the database for diffing. In that situation, apply `prisma/migrations/*/migration.sql`
  directly with `psql` as a fallback. On a normal machine, just use `npm run db:migrate` /
  `npm run db:migrate:dev` as documented above.
