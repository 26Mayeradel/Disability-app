# نظام إدارة المستفيدين من ذوي الإعاقة (Disability Beneficiaries Management System)

A simple full-stack admin tool: one shared admin login, a dashboard with totals,
4 fixed departments, and per-department CRUD + search over beneficiaries, plus
an admin credentials page.

- **Frontend:** plain HTML + CSS + JavaScript (Arabic RTL), served as static files
- **Backend:** Node.js + Express.js, JWT authentication (httpOnly cookie), bcryptjs password hashing
- **Database:** **Supabase (managed Postgres)** — raw parameterized SQL via the `pg` package, no ORM

---


