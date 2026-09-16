// Shared client-side validation. Mirrors Backend/services/validationService.js
// so the messages and rules match — but the backend is always the final
// authority; these are only for a smoother UX.

const EGYPTIAN_PHONE_REGEX = /^(010|011|012|015)\d{8}$/;
const NATIONAL_ID_REGEX = /^\d{14}$/;
const FILE_NUMBER_REGEX = /^\d+$/;
const TEXT_ONLY_REGEX = /^[\u0600-\u06FFa-zA-Z\s]+$/;

// Restricts an <input> to digits only while typing (blocks letters/symbols).
function restrictToDigits(input, maxLength) {
  input.addEventListener("input", () => {
    let value = input.value.replace(/[^\d]/g, "");
    if (maxLength) value = value.slice(0, maxLength);
    input.value = value;
  });
}

// Restricts an <input> to Arabic/English letters and spaces while typing.
function restrictToText(input) {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^\u0600-\u06FFa-zA-Z\s]/g, "");
  });
}

function validateEgyptianPhone(value) {
  if (!EGYPTIAN_PHONE_REGEX.test(String(value || "").trim())) {
    return "رقم الهاتف غير صحيح، يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 ويتكون من 11 رقمًا";
  }
  return null;
}

function validateNationalId(value) {
  if (!NATIONAL_ID_REGEX.test(String(value || "").trim())) {
    return "الرقم القومي يجب أن يتكون من 14 رقمًا";
  }
  return null;
}

function validateFileNumber(value) {
  if (!FILE_NUMBER_REGEX.test(String(value || "").trim())) {
    return "رقم الملف يجب أن يحتوي على أرقام فقط";
  }
  return null;
}

function validateTextOnly(value) {
  if (!TEXT_ONLY_REGEX.test(String(value || "").trim())) {
    return "يجب إدخال حروف فقط";
  }
  return null;
}

function validateNotFutureDate(value) {
  if (!value) return "هذا الحقل مطلوب";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "تاريخ الميلاد غير صحيح";
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (date.getTime() > today.getTime()) return "لا يمكن إدخال تاريخ ميلاد في المستقبل";
  return null;
}
