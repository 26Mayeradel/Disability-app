const { query } = require("../config/db");

async function getAdmin() {
  const result = await query("SELECT * FROM admin_users LIMIT 1");
  return result.rows[0] || null;
}

async function countAdmins() {
  const result = await query("SELECT COUNT(*)::int AS cnt FROM admin_users");
  return result.rows[0].cnt;
}

async function createAdmin(username, passwordHash) {
  await query(
    "INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)",
    [username, passwordHash]
  );
}

async function updateAdmin(id, username, passwordHash) {
  await query(
    "UPDATE admin_users SET username = $1, password_hash = $2 WHERE id = $3",
    [username, passwordHash, id]
  );
}

module.exports = { getAdmin, countAdmins, createAdmin, updateAdmin };
