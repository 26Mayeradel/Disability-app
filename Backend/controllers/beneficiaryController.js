const asyncHandler = require("../utils/asyncHandler");
const beneficiaryModel = require("../models/beneficiaryModel");
const departmentModel = require("../models/departmentModel");
const { validateBeneficiary } = require("../services/validationService");

function toDto(row) {
  return {
    id: row.id,
    departmentId: row.department_id,
    fileNumber: row.file_number,
    fullName: row.full_name,
    nationalId: row.national_id,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    phone: row.phone,
    address: row.address,
    disabilityType: row.disability_type,
    disabilityDegree: row.disability_degree,
    guardianName: row.guardian_name,
    guardianRelation: row.guardian_relation,
    guardianPhone: row.guardian_phone,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

const getByDepartment = asyncHandler(async (req, res) => {
  const departmentId = Number(req.params.departmentId);
  const exists = await departmentModel.exists(departmentId);
  if (!exists) return res.status(404).json({ message: "القسم غير موجود" });

  const rows = await beneficiaryModel.getByDepartment(departmentId, req.query.search);
  res.json(rows.map(toDto));
});

const getById = asyncHandler(async (req, res) => {
  const row = await beneficiaryModel.getById(Number(req.params.id));
  if (!row) return res.status(404).json({ message: "المستفيد غير موجود" });
  res.json(toDto(row));
});

const create = asyncHandler(async (req, res) => {
  const data = req.body;
  const { valid, errors } = validateBeneficiary(data);
  if (!valid) return res.status(400).json({ message: "يوجد خطأ في البيانات المدخلة", errors });

  const departmentExists = await departmentModel.exists(Number(data.departmentId));
  if (!departmentExists) {
    return res.status(400).json({ message: "القسم المحدد غير صحيح", errors: { departmentId: "القسم المحدد غير صحيح" } });
  }

  if (await beneficiaryModel.fileNumberExists(data.fileNumber)) {
    return res.status(400).json({
      message: "رقم الملف موجود بالفعل، برجاء إدخال رقم آخر",
      errors: { fileNumber: "رقم الملف موجود بالفعل، برجاء إدخال رقم آخر" }
    });
  }

  if (await beneficiaryModel.nationalIdExists(data.nationalId)) {
    return res.status(400).json({
      message: "الرقم القومي مستخدم بالفعل",
      errors: { nationalId: "الرقم القومي مستخدم بالفعل" }
    });
  }

  const created = await beneficiaryModel.create(data);
  res.status(201).json(toDto(created));
});

const update = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const existing = await beneficiaryModel.getById(id);
  if (!existing) return res.status(404).json({ message: "المستفيد غير موجود" });

  const data = req.body;
  const { valid, errors } = validateBeneficiary(data);
  if (!valid) return res.status(400).json({ message: "يوجد خطأ في البيانات المدخلة", errors });

  const departmentExists = await departmentModel.exists(Number(data.departmentId));
  if (!departmentExists) {
    return res.status(400).json({ message: "القسم المحدد غير صحيح", errors: { departmentId: "القسم المحدد غير صحيح" } });
  }

  if (await beneficiaryModel.fileNumberExists(data.fileNumber, id)) {
    return res.status(400).json({
      message: "رقم الملف موجود بالفعل، برجاء إدخال رقم آخر",
      errors: { fileNumber: "رقم الملف موجود بالفعل، برجاء إدخال رقم آخر" }
    });
  }

  if (await beneficiaryModel.nationalIdExists(data.nationalId, id)) {
    return res.status(400).json({
      message: "الرقم القومي مستخدم بالفعل",
      errors: { nationalId: "الرقم القومي مستخدم بالفعل" }
    });
  }

  const updated = await beneficiaryModel.update(id, data);
  res.json(toDto(updated));
});

const remove = asyncHandler(async (req, res) => {
  const deleted = await beneficiaryModel.remove(Number(req.params.id));
  if (!deleted) return res.status(404).json({ message: "المستفيد غير موجود" });
  res.json({ message: "تم حذف البيانات بنجاح" });
});

module.exports = { getByDepartment, getById, create, update, remove };
