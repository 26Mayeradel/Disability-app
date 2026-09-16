const { query } = require("../config/db");

async function getAll() {
  const result = await query(`
    SELECT d.id, d.name, d.logo_url, COUNT(b.id)::int AS beneficiary_count
    FROM departments d
    LEFT JOIN beneficiaries b ON b.department_id = d.id
    GROUP BY d.id, d.name, d.logo_url
    ORDER BY d.id
  `);
  return result.rows;
}

async function getById(id) {
  const result = await query(
    `
      SELECT d.id, d.name, d.logo_url, COUNT(b.id)::int AS beneficiary_count
      FROM departments d
      LEFT JOIN beneficiaries b ON b.department_id = d.id
      WHERE d.id = $1
      GROUP BY d.id, d.name, d.logo_url
    `,
    [id]
  );
  return result.rows[0] || null;
}

async function exists(id) {
  const result = await query("SELECT 1 FROM departments WHERE id = $1", [id]);
  return result.rows.length > 0;
}

async function getDashboardSummary() {
  const totals = await query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE gender = 0)::int AS male_count,
      COUNT(*) FILTER (WHERE gender = 1)::int AS female_count
    FROM beneficiaries
  `);
  const departments = await getAll();
  const row = totals.rows[0];
  return {
    totalBeneficiaries: row.total || 0,
    maleCount: row.male_count || 0,
    femaleCount: row.female_count || 0,
    departments
  };
}

module.exports = { getAll, getById, exists, getDashboardSummary };
