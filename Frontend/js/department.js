const params = new URLSearchParams(location.search);
const departmentId = params.get("id");
let pendingDeleteId = null;

document.addEventListener("DOMContentLoaded", async () => {
  wireLogoutButton();
  renderNavbar("department");
  notify.consumeFlash();

  if (!departmentId) {
    location.href = "dashboard.html";
    return;
  }

  document.getElementById("add-btn").addEventListener("click", () => {
    location.href = `add-beneficiary.html?departmentId=${departmentId}`;
  });

  document.getElementById("search-btn").addEventListener("click", () => loadBeneficiaries());
  document.getElementById("search-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") loadBeneficiaries();
  });

  document.getElementById("cancel-delete").addEventListener("click", closeDeleteModal);
  document.getElementById("confirm-delete").addEventListener("click", confirmDelete);

  try {
    const dept = await api.getDepartment(departmentId);
    document.getElementById("dept-name").textContent = dept.name;
  } catch {
    document.getElementById("dept-name").textContent = "قسم غير موجود";
  }

  await loadBeneficiaries();
});

async function loadBeneficiaries() {
  const loading = document.getElementById("loading");
  const tableWrap = document.getElementById("table-wrap");
  const emptyState = document.getElementById("empty-state");
  const search = document.getElementById("search-input").value.trim();
  const searchBtn = document.getElementById("search-btn");

  loading.style.display = "block";
  loading.textContent = search ? "جاري البحث..." : "جاري التحميل...";
  tableWrap.style.display = "none";
  emptyState.style.display = "none";
  searchBtn.disabled = true;

  try {
    const list = await api.getBeneficiaries(departmentId, search);
    loading.style.display = "none";

    if (list.length === 0) {
      emptyState.style.display = "block";
      return;
    }

    const body = document.getElementById("table-body");
    body.innerHTML = "";
    list.forEach((b) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(b.fileNumber)}</td>
        <td>${escapeHtml(b.fullName)}</td>
        <td>${escapeHtml(b.nationalId)}</td>
        <td>${GENDER_LABELS[b.gender] ?? ""}</td>
        <td>${formatDate(b.dateOfBirth)}</td>
        <td>${DISABILITY_TYPE_LABELS[b.disabilityType] ?? ""}</td>
        <td>${escapeHtml(b.phone || "-")}</td>
        <td class="actions">
          <button class="btn-secondary edit-btn" data-id="${b.id}">تعديل</button>
          <button class="btn-danger delete-btn" data-id="${b.id}">حذف</button>
        </td>
      `;
      body.appendChild(tr);
    });

    body.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        location.href = `edit-beneficiary.html?id=${btn.dataset.id}`;
      });
    });
    body.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => openDeleteModal(btn.dataset.id));
    });

    tableWrap.style.display = "block";
  } catch (err) {
    loading.textContent = err.message || "تعذر تحميل البيانات";
    notify.error(err.message || "تعذر تحميل البيانات");
  } finally {
    searchBtn.disabled = false;
  }
}

function openDeleteModal(id) {
  pendingDeleteId = id;
  document.getElementById("delete-modal").classList.add("open");
}
function closeDeleteModal() {
  pendingDeleteId = null;
  document.getElementById("delete-modal").classList.remove("open");
}
async function confirmDelete() {
  if (!pendingDeleteId) return;
  const confirmBtn = document.getElementById("confirm-delete");
  confirmBtn.disabled = true;
  confirmBtn.textContent = "جاري الحذف...";
  try {
    const result = await api.deleteBeneficiary(pendingDeleteId);
    closeDeleteModal();
    notify.success((result && result.message) || "تم حذف البيانات بنجاح");
    await loadBeneficiaries();
  } catch (err) {
    closeDeleteModal();
    notify.error(err.message || "تعذر حذف المستفيد");
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = "حذف";
  }
}

function formatDate(iso) {
  if (!iso) return "-";
  return iso.substring(0, 10);
}
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
