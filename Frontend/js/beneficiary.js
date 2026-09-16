const qs = new URLSearchParams(location.search);
const beneficiaryId = qs.get("id");          // present in edit mode
let queryDepartmentId = qs.get("departmentId"); // present in add mode
let currentDepartmentId = queryDepartmentId;
const isEditMode = Boolean(beneficiaryId);

document.addEventListener("DOMContentLoaded", async () => {
  wireLogoutButton();
  renderNavbar(null);
  wireInputRestrictions();

  // Never allow a future date of birth to even be picked.
  const dobInput = document.getElementById("dateOfBirth");
  dobInput.max = new Date().toISOString().split("T")[0];

  document.getElementById("cancel-btn").addEventListener("click", goBack);
  document.getElementById("back-link").addEventListener("click", (e) => {
    e.preventDefault();
    goBack();
  });

  document.getElementById("beneficiary-form").addEventListener("submit", onSubmit);

  if (isEditMode) {
    const heading = document.getElementById("page-heading");
    const originalHeading = heading.textContent;
    heading.textContent = "جاري تحميل البيانات...";
    try {
      const b = await api.getBeneficiary(beneficiaryId);
      currentDepartmentId = b.departmentId;
      fillForm(b);
      heading.textContent = originalHeading;
    } catch (err) {
      showFormError(err.message || "تعذر تحميل بيانات المستفيد");
      notify.error(err.message || "تعذر تحميل بيانات المستفيد");
      heading.textContent = originalHeading;
    }
  } else if (!currentDepartmentId) {
    location.href = "dashboard.html";
  }
});

function wireInputRestrictions() {
  restrictToDigits(document.getElementById("fileNumber"));
  restrictToDigits(document.getElementById("nationalId"), 14);
  restrictToDigits(document.getElementById("phone"), 11);
  restrictToDigits(document.getElementById("guardianPhone"), 11);
  restrictToText(document.getElementById("fullName"));
  restrictToText(document.getElementById("guardianName"));
  restrictToText(document.getElementById("guardianRelation"));
}

function fillForm(b) {
  document.getElementById("fileNumber").value = b.fileNumber || "";
  document.getElementById("fullName").value = b.fullName || "";
  document.getElementById("nationalId").value = b.nationalId || "";
  document.getElementById("dateOfBirth").value = (b.dateOfBirth || "").substring(0, 10);
  document.getElementById("gender").value = String(b.gender);
  document.getElementById("phone").value = b.phone || "";
  document.getElementById("address").value = b.address || "";
  document.getElementById("disabilityType").value = String(b.disabilityType);
  document.getElementById("disabilityDegree").value = String(b.disabilityDegree);
  document.getElementById("guardianName").value = b.guardianName || "";
  document.getElementById("guardianRelation").value = b.guardianRelation || "";
  document.getElementById("guardianPhone").value = b.guardianPhone || "";
  document.getElementById("notes").value = b.notes || "";
}

function readForm() {
  return {
    departmentId: Number(currentDepartmentId),
    fileNumber: document.getElementById("fileNumber").value.trim(),
    fullName: document.getElementById("fullName").value.trim(),
    nationalId: document.getElementById("nationalId").value.trim(),
    dateOfBirth: document.getElementById("dateOfBirth").value,
    gender: Number(document.getElementById("gender").value),
    phone: document.getElementById("phone").value.trim(),
    address: document.getElementById("address").value.trim(),
    disabilityType: Number(document.getElementById("disabilityType").value),
    disabilityDegree: Number(document.getElementById("disabilityDegree").value),
    guardianName: document.getElementById("guardianName").value.trim(),
    guardianRelation: document.getElementById("guardianRelation").value.trim(),
    guardianPhone: document.getElementById("guardianPhone").value.trim(),
    notes: document.getElementById("notes").value.trim()
  };
}

function clearErrors() {
  document.querySelectorAll(".field").forEach((f) => {
    f.classList.remove("has-error");
    const err = f.querySelector(".error");
    if (err) err.textContent = "";
  });
  document.getElementById("form-error").style.display = "none";
}

// Mirrors Backend/services/validationService.js. The backend is still the
// final authority — this only gives the person faster, in-place feedback.
function validateClientSide(payload) {
  const errors = {};

  if (!payload.fileNumber) errors.fileNumber = "هذا الحقل مطلوب";
  else {
    const err = validateFileNumber(payload.fileNumber);
    if (err) errors.fileNumber = err;
  }

  if (!payload.fullName) errors.fullName = "هذا الحقل مطلوب";
  else {
    const err = validateTextOnly(payload.fullName);
    if (err) errors.fullName = err;
  }

  if (!payload.nationalId) errors.nationalId = "هذا الحقل مطلوب";
  else {
    const err = validateNationalId(payload.nationalId);
    if (err) errors.nationalId = err;
  }

  const dobErr = validateNotFutureDate(payload.dateOfBirth);
  if (dobErr) errors.dateOfBirth = dobErr;

  if (!payload.phone) errors.phone = "هذا الحقل مطلوب";
  else {
    const err = validateEgyptianPhone(payload.phone);
    if (err) errors.phone = err;
  }

  if (payload.guardianPhone) {
    const err = validateEgyptianPhone(payload.guardianPhone);
    if (err) errors.guardianPhone = err;
  }

  if (payload.guardianName) {
    const err = validateTextOnly(payload.guardianName);
    if (err) errors.guardianName = err;
  }

  if (payload.guardianRelation) {
    const err = validateTextOnly(payload.guardianRelation);
    if (err) errors.guardianRelation = err;
  }

  Object.entries(errors).forEach(([field, message]) => showFieldError(field, message));
  return Object.keys(errors).length === 0;
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(`field-${fieldId}`);
  if (!field) return;
  field.classList.add("has-error");
  const err = field.querySelector(".error");
  if (err) err.textContent = message;
}

function showFormError(message) {
  const box = document.getElementById("form-error");
  box.textContent = message;
  box.style.display = "block";
}

async function onSubmit(e) {
  e.preventDefault();
  clearErrors();

  const payload = readForm();
  if (!validateClientSide(payload)) {
    notify.error("يوجد خطأ في البيانات المدخلة");
    return;
  }

  const saveBtn = document.getElementById("save-btn");
  saveBtn.disabled = true;
  saveBtn.textContent = "جاري الحفظ...";

  try {
    if (isEditMode) {
      await api.updateBeneficiary(beneficiaryId, payload);
      notify.flash("success", "تم تحديث البيانات بنجاح");
    } else {
      await api.createBeneficiary(payload);
      notify.flash("success", "تم حفظ البيانات بنجاح");
    }
    location.href = `department.html?id=${currentDepartmentId}`;
  } catch (err) {
    // Backend field-level errors use the same camelCase keys as our field ids
    // (fileNumber, fullName, ...), so they map straight onto field-<key>.
    if (err.fields) {
      Object.entries(err.fields).forEach(([key, message]) => {
        showFieldError(key, Array.isArray(message) ? message[0] : message);
      });
    } else {
      showFormError(err.message || "تعذر حفظ البيانات");
    }
    notify.error(err.message || "يوجد خطأ في البيانات المدخلة");
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "حفظ";
  }
}

function goBack() {
  location.href = currentDepartmentId ? `department.html?id=${currentDepartmentId}` : "dashboard.html";
}
