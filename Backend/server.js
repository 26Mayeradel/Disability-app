require("dotenv").config();

const bcrypt = require("bcryptjs");
const app = require("./app");
const { pool } = require("./config/db");
const adminModel = require("./models/adminModel");

const SALT_ROUNDS = 10;
const PORT = process.env.PORT || 5000;

// Creates the single admin account from .env, but only the first time
// (when the AdminUsers table is empty). The password is hashed with bcrypt
// before being stored — never saved as plain text, never hard-coded here.
async function seedAdminIfNeeded() {
  const count = await adminModel.countAdmins();
  if (count > 0) return;

  const username = process.env.ADMIN_SETUP_USERNAME;
  const password = process.env.ADMIN_SETUP_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "No admin account exists yet and ADMIN_SETUP_USERNAME / ADMIN_SETUP_PASSWORD " +
      "are not set in .env. Set them and restart the server. See README.md."
    );
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await adminModel.createAdmin(username, passwordHash);
  console.log(`Admin account created for username "${username}".`);
}

async function start() {
  try {
    await pool.query("SELECT 1"); // fail fast if Supabase/Postgres isn't reachable
    await seedAdminIfNeeded();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Open http://localhost:${PORT}/login.html to sign in.`);
    });
  } catch (err) {
    console.error("Failed to start the server:", err.message);
    process.exit(1);
  }
}

start();
