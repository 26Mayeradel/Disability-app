const asyncHandler = require("../utils/asyncHandler");
const departmentModel = require("../models/departmentModel");

function toDto(row) {
  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url,
    beneficiaryCount: row.beneficiary_count
  };
}

const getAll = asyncHandler(async (req, res) => {
  const rows = await departmentModel.getAll();
  res.json(rows.map(toDto));
});

const getById = asyncHandler(async (req, res) => {
  const row = await departmentModel.getById(Number(req.params.id));
  if (!row) return res.status(404).json({ message: "القسم غير موجود" });
  res.json(toDto(row));
});

const getDashboard = asyncHandler(async (req, res) => {
  const summary = await departmentModel.getDashboardSummary();
  res.json({
    totalBeneficiaries: summary.totalBeneficiaries,
    maleCount: summary.maleCount,
    femaleCount: summary.femaleCount,
    departments: summary.departments.map(toDto)
  });
});

module.exports = { getAll, getById, getDashboard };
