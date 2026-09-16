document.addEventListener("DOMContentLoaded", () => {
  wireLogoutButton();
  renderNavbar("credentials");

  document.getElementById("cancel-btn").addEventListener("click", () => {
    location.href = "dashboard.html";
  });

  document.getElementById("credentials-form").addEventListener("submit", onSubmit);
});

function clearErrors() {
  document.querySelectorAll(".field").forEach((f) => {
    f.classList.remove("has-error");
    const err = f.querySelector(".error");
    if (err) err.textContent = "";
  });
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(`field-${fieldId}`);
  if (!field) return;
  field.classList.add("has-error");
  const err = field.querySelector(".error");
  if (err) err.textContent = message;
}

async function onSubmit(e) {
  e.preventDefault();
  clearErrors();

  const currentPassword = document.getElementById("currentPassword").value;
  const newUsername = document.getElementById("newUsername").value.trim();
  const newPassword = document.getElementById("newPassword").value;
  const confirmNewPassword = document.getElementById("confirmNewPassword").value;

  let valid = true;
  if (!currentPassword) {
    showFieldError("currentPassword", "هذا الحقل مطلوب");
    valid = false;
  }
  if (!newUsername) {
    showFieldError("newUsername", "هذا الحقل مطلوب");
    valid = false;
  }
  if (!newPassword) {
    showFieldError("newPassword", "برجاء إدخال كلمة مرور جديدة");
    valid = false;
  } else if (newPassword.length < 8) {
    showFieldError("newPassword", "كلمة المرور يجب أن تتكون من 8 أحرف على الأقل");
    valid = false;
  }
  if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
    showFieldError("confirmNewPassword", "كلمتا المرور غير متطابقتين");
    valid = false;
  } else if (!confirmNewPassword) {
    showFieldError("confirmNewPassword", "هذا الحقل مطلوب");
    valid = false;
  }

  if (!valid) {
    notify.error("يوجد خطأ في البيانات المدخلة");
    return;
  }

  const saveBtn = document.getElementById("save-btn");
  saveBtn.disabled = true;
  saveBtn.textContent = "جاري الحفظ...";

  try {
    await api.changeCredentials({ currentPassword, newUsername, newPassword, confirmNewPassword });
    notify.flash("success", "تم تغيير بيانات الدخول بنجاح، يرجى تسجيل الدخول مرة أخرى");
    location.href = "login.html";
  } catch (err) {
    if (err.message && err.message.includes("الحالية")) {
      showFieldError("currentPassword", err.message);
    }
    notify.error(err.message || "تعذر تغيير بيانات الدخول");
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "حفظ التغييرات";
  }
}
