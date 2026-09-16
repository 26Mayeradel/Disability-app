// Central place for every validation rule so frontend and backend messages
// stay in sync, and so no controller has to re-invent a regex.

const EGYPTIAN_PHONE_REGEX = /^(010|011|012|015)\d{8}$/;
const NATIONAL_ID_REGEX = /^\d{14}$/;
const FILE_NUMBER_REGEX = /^\d+$/;
const TEXT_ONLY_REGEX = /^[\u0600-\u06FFa-zA-Z\s]+$/; // Arabic + English letters and spaces
const DIGITS_ONLY_REGEX = /^\d+$/;

const GENDER_VALUES = [0, 1];
const DISABILITY_TYPE_VALUES = [0, 1, 2, 3, 4];
const DISABILITY_DEGREE_VALUES = [0, 1, 2];

function isValidDate(value) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function isFutureDate(value) {
  const date = new Date(value);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // allow today
  return date.getTime() > today.getTime();
}

// Validates a beneficiary create/update payload.
// Returns { valid: boolean, errors: { fieldId: message } }
function validateBeneficiary(data) {
  const errors = {};

  const required = (value) => value !== undefined && value !== null && String(value).trim() !== "";

  if (!required(data.fileNumber)) {
    errors.fileNumber = "هذا الحقل مطلوب";
  } else if (!FILE_NUMBER_REGEX.test(String(data.fileNumber).trim())) {
    errors.fileNumber = "رقم الملف يجب أن يحتوي على أرقام فقط";
  }

  if (!required(data.fullName)) {
    errors.fullName = "هذا الحقل مطلوب";
  } else if (!TEXT_ONLY_REGEX.test(String(data.fullName).trim())) {
    errors.fullName = "يجب إدخال حروف فقط";
  }

  if (!required(data.nationalId)) {
    errors.nationalId = "هذا الحقل مطلوب";
  } else if (!NATIONAL_ID_REGEX.test(String(data.nationalId).trim())) {
    errors.nationalId = "الرقم القومي يجب أن يتكون من 14 رقمًا";
  }

  if (!required(data.dateOfBirth)) {
    errors.dateOfBirth = "هذا الحقل مطلوب";
  } else if (!isValidDate(data.dateOfBirth)) {
    errors.dateOfBirth = "تاريخ الميلاد غير صحيح";
  } else if (isFutureDate(data.dateOfBirth)) {
    errors.dateOfBirth = "لا يمكن إدخال تاريخ ميلاد في المستقبل";
  }

  if (!required(data.gender) && data.gender !== 0) {
    errors.gender = "هذا الحقل مطلوب";
  } else if (!GENDER_VALUES.includes(Number(data.gender))) {
    errors.gender = "برجاء إدخال بيانات صحيحة";
  }

  if (!required(data.phone)) {
    errors.phone = "هذا الحقل مطلوب";
  } else if (!EGYPTIAN_PHONE_REGEX.test(String(data.phone).trim())) {
    errors.phone = "رقم الهاتف غير صحيح، يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 ويتكون من 11 رقمًا";
  }

  if (required(data.guardianPhone) && !EGYPTIAN_PHONE_REGEX.test(String(data.guardianPhone).trim())) {
    errors.guardianPhone = "رقم الهاتف غير صحيح، يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 ويتكون من 11 رقمًا";
  }

  if (required(data.guardianName) && !TEXT_ONLY_REGEX.test(String(data.guardianName).trim())) {
    errors.guardianName = "يجب إدخال حروف فقط";
  }

  if (required(data.guardianRelation) && !TEXT_ONLY_REGEX.test(String(data.guardianRelation).trim())) {
    errors.guardianRelation = "يجب إدخال حروف فقط";
  }

  if (!required(data.disabilityType) && data.disabilityType !== 0) {
    errors.disabilityType = "هذا الحقل مطلوب";
  } else if (!DISABILITY_TYPE_VALUES.includes(Number(data.disabilityType))) {
    errors.disabilityType = "برجاء إدخال بيانات صحيحة";
  }

  if (!required(data.disabilityDegree) && data.disabilityDegree !== 0) {
    errors.disabilityDegree = "هذا الحقل مطلوب";
  } else if (!DISABILITY_DEGREE_VALUES.includes(Number(data.disabilityDegree))) {
    errors.disabilityDegree = "برجاء إدخال بيانات صحيحة";
  }

  if (!required(data.departmentId)) {
    errors.departmentId = "القسم المحدد غير صحيح";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

module.exports = {
  EGYPTIAN_PHONE_REGEX,
  NATIONAL_ID_REGEX,
  FILE_NUMBER_REGEX,
  TEXT_ONLY_REGEX,
  DIGITS_ONLY_REGEX,
  isValidDate,
  isFutureDate,
  validateBeneficiary
};
