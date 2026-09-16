const { Pool, types } = require("pg");

// Without this, node-postgres parses DATE columns (date_of_birth) into a JS
// Date object using local time, and Express's JSON serialization then
// converts that to UTC — which can silently shift the date by a day
// depending on the server's timezone. Keeping it as the raw "YYYY-MM-DD"
// string avoids that entirely; the frontend already only uses the date part.
types.setTypeParser(1082, (val) => val); // 1082 = Postgres DATE oid

// Supabase's connection string already includes user/password/host/db, and
// requires SSL. `rejectUnauthorized: false` matches Supabase's own connection
// examples (their certs aren't in Node's default trust store) — fine for an
// app talking to your own Supabase project.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle Postgres client", err);
});

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query };
