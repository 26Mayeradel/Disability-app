const { query } = require("../config/db");

const SELECT_COLUMNS = `
  id, department_id, file_number, full_name, national_id, date_of_birth, gender,
  phone, address, disability_type, disability_degree,
  guardian_name, guardian_relation, guardian_phone, notes, created_at, updated_at
`;

async function getByDepartment(departmentId, search) {
  const params = [departmentId];
  let where = "WHERE department_id = $1";

  if (search) {
    params.push(`%${search}%`);
    where += ` AND (full_name ILIKE $2 OR file_number ILIKE $2 OR national_id ILIKE $2)`;
  }

  const result = await query(
    `SELECT ${SELECT_COLUMNS} FROM beneficiaries ${where} ORDER BY full_name`,
    params
  );
  return result.rows;
}

async function getById(id) {
  const result = await query(`SELECT ${SELECT_COLUMNS} FROM beneficiaries WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function fileNumberExists(fileNumber, excludeId) {
  const params = [fileNumber];
  let sql = "SELECT 1 FROM beneficiaries WHERE file_number = $1";
  if (excludeId) {
    params.push(excludeId);
    sql += " AND id <> $2";
  }
  const result = await query(sql, params);
  return result.rows.length > 0;
}

async function nationalIdExists(nationalId, excludeId) {
  const params = [nationalId];
  let sql = "SELECT 1 FROM beneficiaries WHERE national_id = $1";
  if (excludeId) {
    params.push(excludeId);
    sql += " AND id <> $2";
  }
  const result = await query(sql, params);
  return result.rows.length > 0;
}

function toParams(data) {
  return [
    data.departmentId,
    data.fileNumber,
    data.fullName,
    data.nationalId,
    data.dateOfBirth,
    data.gender,
    data.phone || null,
    data.address || null,
    data.disabilityType,
    data.disabilityDegree,
    data.guardianName || null,
    data.guardianRelation || null,
    data.guardianPhone || null,
    data.notes || null
  ];
}

async function create(data) {
  const result = await query(
    `
    INSERT INTO beneficiaries
      (department_id, file_number, full_name, national_id, date_of_birth, gender, phone, address,
       disability_type, disability_degree, guardian_name, guardian_relation, guardian_phone, notes,
       created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
    RETURNING id
    `,
    toParams(data)
  );
  return getById(result.rows[0].id);
}

async function update(id, data) {
  const params = [...toParams(data), id];
  await query(
    `
    UPDATE beneficiaries SET
      department_id = $1, file_number = $2, full_name = $3, national_id = $4,
      date_of_birth = $5, gender = $6, phone = $7, address = $8,
      disability_type = $9, disability_degree = $10, guardian_name = $11,
      guardian_relation = $12, guardian_phone = $13, notes = $14,
      updated_at = NOW()
    WHERE id = $15
    `,
    params
  );
  return getById(id);
}

async function remove(id) {
  const result = await query("DELETE FROM beneficiaries WHERE id = $1", [id]);
  return result.rowCount > 0;
}

module.exports = {
  getByDepartment,
  getById,
  fileNumberExists,
  nationalIdExists,
  create,
  update,
  remove
};
