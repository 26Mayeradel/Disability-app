// Login page logic
document.addEventListener("DOMContentLoaded", () => {
  if (typeof notify !== "undefined") notify.consumeFlash();

  const form = document.getElementById("login-form");
  if (!form) return;

  const errorBox = document.getElementById("login-error");
  const submitBtn = form.querySelector("button[type=submit]");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.style.display = "none";

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
      errorBox.textContent = "يرجى إدخال اسم المستخدم وكلمة المرور";
      errorBox.style.display = "block";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "جاري الدخول...";

    try {
      await api.login(username, password);
      location.href = "dashboard.html";
    } catch (err) {
      const message = err.message || "اسم المستخدم أو كلمة المرور غير صحيحة";
      errorBox.textContent = message;
      errorBox.style.display = "block";
      notify.error(message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "دخول";
    }
  });
});

// Shared logout button wired on every authenticated page.
function wireLogoutButton() {
  const btn = document.getElementById("logout-btn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    try { await api.logout(); } catch { /* ignore, redirect anyway */ }
    location.href = "login.html";
  });
}
