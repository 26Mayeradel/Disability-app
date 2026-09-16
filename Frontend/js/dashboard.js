document.addEventListener("DOMContentLoaded", async () => {
  wireLogoutButton();
  renderNavbar("dashboard");
  notify.consumeFlash();

  const loading = document.getElementById("loading");
  const content = document.getElementById("content");

  try {
    const summary = await api.getDashboard();

    document.getElementById("stat-total").textContent = summary.totalBeneficiaries;
    document.getElementById("stat-male").textContent = summary.maleCount;
    document.getElementById("stat-female").textContent = summary.femaleCount;

    const grid = document.getElementById("dept-grid");
    grid.innerHTML = "";
    summary.departments.forEach((dept) => {
      const card = document.createElement("div");
      card.className = "dept-card";
      card.innerHTML = `
        <div class="dept-logo">🏢</div>
        <h3>${escapeHtml(dept.name)}</h3>
        <div class="count">${dept.beneficiaryCount} مستفيد</div>
        <button class="btn-secondary btn-block open-dept" data-id="${dept.id}">فتح</button>
      `;
      grid.appendChild(card);
    });

    grid.querySelectorAll(".open-dept").forEach((btn) => {
      btn.addEventListener("click", () => {
        location.href = `department.html?id=${btn.dataset.id}`;
      });
    });

    loading.style.display = "none";
    content.style.display = "block";
  } catch (err) {
    loading.textContent = err.message || "تعذر تحميل البيانات";
    notify.error(err.message || "تعذر تحميل البيانات");
  }
});

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
