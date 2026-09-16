# نظام إدارة المستفيدين من ذوي الإعاقة (Disability Beneficiaries Management System)

A simple full-stack admin tool: one shared admin login, a dashboard with totals,
4 fixed departments, and per-department CRUD + search over beneficiaries, plus
an admin credentials page.

- **Frontend:** plain HTML + CSS + JavaScript (Arabic RTL), served as static files
- **Backend:** Node.js + Express.js, JWT authentication (httpOnly cookie), bcryptjs password hashing
- **Database:** **Supabase (managed Postgres)** — raw parameterized SQL via the `pg` package, no ORM

---

## ⚠️ Important note about how this was built

This was written in a sandbox with **no Node.js, no internet access, and no
Supabase account** — I can't sign up for Supabase, create a project, or get a
connection string on your behalf; that part only you can do (it's tied to
your account). Everything else — the schema, the database access layer, the
connection config — was rewritten by hand for Postgres and syntax-checked,
but the first real run on your machine, against your actual Supabase project,
is the true test. Send me the exact error if anything doesn't line up.

---

## 1. Create the Supabase project (you do this part)

1. Go to [supabase.com](https://supabase.com) → sign in / sign up → **New project**.
2. Pick an organization, name the project (e.g. `disability-beneficiaries`), set a
   **database password** (save it somewhere — you'll need it in step 3), pick the
   region closest to you, and create the project. Wait ~2 minutes for it to provision.

## 2. Run the schema

1. In your Supabase project, open **SQL Editor** (left sidebar) → **New query**.
2. Open `Backend/database/schema.sql` from this project, copy its entire contents,
   paste into the SQL Editor, and click **Run**.
3. This creates the `admin_users`, `departments`, and `beneficiaries` tables,
   all constraints/indexes, and seeds the 4 placeholder departments. You can
   confirm it worked in **Table Editor** — you should see the 3 tables, with
   `departments` already containing 4 rows.

## 3. Get your connection string

1. In Supabase: **Project Settings** (gear icon) → **Database** → **Connection string** → **URI** tab.
2. Copy the **Connection pooling** string (port `6543`) — this handles the
   short-lived connections a normal web app makes much better than the direct
   connection.
3. It looks like:
   ```
   postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-REGION.pooler.supabase.com:6543/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with the database password you set in step 1.

## 4. Configure and run the backend

```bash
cd Backend
npm install
```

Edit `Backend/.env` and paste your real connection string:
```env
DATABASE_URL=postgresql://postgres.xxxxxxxxxxxx:YOUR-ACTUAL-PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
```

Set a real random `JWT_SECRET` before any real use:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Paste the output as `JWT_SECRET` in `.env`.

The `ADMIN_SETUP_USERNAME` / `ADMIN_SETUP_PASSWORD` in `.env` are only used
**once**, the very first time the server starts with an empty `admin_users`
table — the password is hashed with bcryptjs before being saved, never stored
as plain text. Change them to whatever you want before the first run.

Then start the server:
```bash
npm start
```

You should see:
```
Admin account created for username "admin".
Server running at http://localhost:5000
Open http://localhost:5000/login.html to sign in.
```

Open that URL and log in with the admin credentials from your `.env`.

## 5. Data persistence

Beneficiary data now lives in Supabase's managed Postgres — closing the app,
restarting your machine, or redeploying doesn't affect it, and it's reachable
from anywhere (not just your local network), since Supabase is hosted.

---

## What changed from the local SQL Server version

- **Driver:** `mssql` → `pg` (node-postgres), talking to Supabase's Postgres over a pooled connection.
- **Schema:** rewritten in Postgres syntax with lowercase `snake_case` column names
  (Postgres convention) — `Backend/database/schema.sql` replaces the old EF/SQL
  Server migration approach. Run it once in the Supabase SQL Editor instead of SSMS.
- **Config:** a single `DATABASE_URL` in `.env` replaces the old `DB_SERVER` /
  `DB_USER` / `DB_PASSWORD` / trusted-connection settings.
- **Models:** every query rewritten with `$1, $2...` positional parameters
  (Postgres style) instead of mssql's named `@param` style — still fully
  parameterized, no SQL injection risk either way.
- **Nothing else changed**: same routes, same validation rules (Egyptian
  phone, National ID, required fields, etc.), same JWT/bcrypt auth, same
  frontend, same UI, same features. The API contract the frontend talks to
  (`/api/...` JSON shapes) is identical.

---

## Project structure

```
Project/
├── Frontend/                     # static HTML/CSS/JS, Arabic RTL — unchanged
│   └── ...
│
└── Backend/                       # Node.js + Express
    ├── config/db.js               # Postgres (Supabase) connection pool
    ├── controllers/                # auth, department, beneficiary
    ├── models/                     # raw parameterized SQL queries (Postgres)
    ├── routes/
    ├── middleware/                 # JWT auth guard, central error handler
    ├── services/validationService.js  # Egyptian phone / National ID / etc.
    ├── database/schema.sql         # run once in Supabase's SQL Editor
    ├── app.js / server.js
    ├── package.json
    ├── .env / .env.example
```

## API endpoints

```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/status
POST   /api/auth/change-credentials

GET    /api/departments
GET    /api/departments/{id}
GET    /api/dashboard

GET    /api/departments/{departmentId}/beneficiaries?search=...
GET    /api/beneficiaries/{id}
POST   /api/beneficiaries
PUT    /api/beneficiaries/{id}
DELETE /api/beneficiaries/{id}
```

All endpoints except `/api/auth/login` require a valid session (JWT in an
HttpOnly cookie, set on login).

## Validation rules (enforced on both frontend and backend)

- **Egyptian phone** (Phone, Guardian Phone): exactly 11 digits, starts with 010/011/012/015.
- **National ID**: exactly 14 digits.
- **File Number**: digits only, required, unique (checked against the database on every create/update, backed by a `UNIQUE` constraint).
- **Full Name / Guardian Name / Guardian Relation**: letters and spaces only (Arabic or English).
- **Date of Birth**: required, valid date, cannot be in the future.
- **Required fields**: File Number, Full Name, National ID, Date of Birth, Gender, Phone, Disability Type, Disability Degree — marked with a red `*` on the form.
- The backend re-checks every one of these regardless of what the frontend sent, and returns structured Arabic error messages per field (`{ message, errors: { fieldName: "..." } }`).

## Security notes

- `DATABASE_URL` (with your DB password) and `JWT_SECRET` live only in
  `Backend/.env`, which is gitignored — never commit it.
- The backend connects to Supabase with the full-access `postgres` role
  through the pooler — that's normal for a server-side app talking to its
  own database. Row Level Security is intentionally left off (see the note
  at the bottom of `schema.sql`) since only this backend ever touches these
  tables directly; nothing calls Supabase from the browser.
- Passwords are hashed with bcryptjs before storage; the admin password is
  never hard-coded or logged.

## Troubleshooting

**`password authentication failed`**: double-check the password in
`DATABASE_URL` matches exactly what you set when creating the Supabase
project (Project Settings → Database → you can reset it there if needed —
just update `.env` to match).

**`self signed certificate` / SSL errors**: already handled — `config/db.js`
sets `ssl: { rejectUnauthorized: false }`, which matches Supabase's own
connection examples.

**Dates look off by a day**: already handled in `config/db.js` (a custom type
parser keeps `date_of_birth` as a plain `YYYY-MM-DD` string instead of letting
node-postgres convert it through a timezone-sensitive `Date` object).

**Port 5000 already in use**: change `PORT` in `.env` to something else (e.g. `5050`).

---

## Manual test checklist

1. Visiting any page while logged out redirects to `login.html`.
2. Wrong password → Arabic error shown inline and as a toast; not logged in.
3. Correct login → dashboard loads with totals and 4 department cards.
4. Add a beneficiary with all required fields → success toast, appears in the table.
5. Try invalid Egyptian phone (e.g. `1012345678`) → inline error under the field + toast, not saved.
6. Try a 13-digit National ID → inline error, not saved.
7. Try a duplicate File Number → backend rejects with "رقم الملف موجود بالفعل، برجاء إدخال رقم آخر".
8. Try a future Date of Birth → rejected on both frontend and backend.
9. Type letters into the Phone/National ID/File Number fields → filtered out as you type.
10. Type digits into the Full Name field → filtered out as you type.
11. Edit a beneficiary, save → success toast, table reflects the change, and the date of birth still shows the exact date you entered (no off-by-one).
12. Search by name/file number/national ID → results filter correctly.
13. Delete a beneficiary → confirmation dialog first, then a success toast.
14. Go to "تغيير بيانات الدخول" → change username/password → success, logged out, new credentials work on next login.
15. Log out → redirected to login, protected pages/API no longer accessible.
16. Restart the server → all data still there (it's in Supabase now, not memory or a local file).
17. Open **Table Editor** in Supabase and confirm rows appear/update/disappear there as you use the app — that's the clearest proof it's really talking to Supabase.
