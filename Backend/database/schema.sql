-- Run this once in Supabase: Dashboard -> your project -> SQL Editor -> New query
-- -> paste this whole file -> Run.
-- Safe to re-run: it drops and recreates these three tables first.

DROP TABLE IF EXISTS beneficiaries;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS admin_users;

CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    logo_url VARCHAR(500)
);

CREATE TABLE beneficiaries (
    id SERIAL PRIMARY KEY,
    department_id INTEGER NOT NULL REFERENCES departments (id),
    file_number VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(200) NOT NULL,
    national_id VARCHAR(20) NOT NULL UNIQUE,
    date_of_birth DATE NOT NULL,
    gender INTEGER NOT NULL,              -- 0 = Male, 1 = Female
    phone VARCHAR(20),
    address VARCHAR(300),
    disability_type INTEGER NOT NULL,     -- 0 Physical, 1 Visual, 2 Hearing, 3 Intellectual, 4 Other
    disability_degree INTEGER NOT NULL,   -- 0 Mild, 1 Moderate, 2 Severe
    guardian_name VARCHAR(200),
    guardian_relation VARCHAR(100),
    guardian_phone VARCHAR(20),
    notes VARCHAR(1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_beneficiaries_department_id ON beneficiaries (department_id);

INSERT INTO departments (name, logo_url) VALUES
    ('Department 1', NULL),
    ('Department 2', NULL),
    ('Department 3', NULL),
    ('Department 4', NULL);

-- Row Level Security: this app connects with the Postgres user embedded in
-- DATABASE_URL (full access, via the backend only — never exposed to the
-- browser), so RLS policies aren't needed for it to work. Left disabled to
-- keep the setup simple, matching the "no unnecessary complexity" brief.
-- If you ever call these tables directly from the frontend with a Supabase
-- anon key instead, enable RLS and add policies first.
