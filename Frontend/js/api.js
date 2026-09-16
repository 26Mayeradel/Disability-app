// Thin wrapper around fetch(). The backend uses an HttpOnly session cookie,
// so every request must include credentials. No API keys or DB credentials
// ever live in this file or anywhere in the frontend.

const API_BASE = "/api";

async function apiRequest(path, options = {}) {
  const response = await fetch(API_BASE + path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (response.status === 401) {
    // Session missing or expired -> back to login.
    if (!location.pathname.endsWith("login.html")) {
      location.href = "login.html";
    }
    throw new Error("غير مصرح بالدخول");
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = null; }
  }

  if (!response.ok) {
    const message = (data && (data.message || data.title)) || "حدث خطأ غير متوقع";
    const error = new Error(message);
    if (data && data.errors) error.fields = data.errors; // ASP.NET Core ValidationProblem field errors
    throw error;
  }

  return data;
}

// Enum value <-> Arabic label maps, shared by department.js and beneficiary.js.
// Numeric values must match the C# enums exactly (Models/Beneficiary.cs).
const GENDER_LABELS = { 0: "ذكر", 1: "أنثى" };
const DISABILITY_TYPE_LABELS = { 0: "حركية", 1: "بصرية", 2: "سمعية", 3: "ذهنية", 4: "أخرى" };
const DISABILITY_DEGREE_LABELS = { 0: "بسيطة", 1: "متوسطة", 2: "شديدة" };

const api = {
  login: (username, password) =>
    apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),

  logout: () => apiRequest("/auth/logout", { method: "POST" }),

  changeCredentials: (payload) =>
    apiRequest("/auth/change-credentials", { method: "POST", body: JSON.stringify(payload) }),

  getDashboard: () => apiRequest("/dashboard"),

  getDepartments: () => apiRequest("/departments"),

  getDepartment: (id) => apiRequest(`/departments/${id}`),

  getBeneficiaries: (departmentId, search) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiRequest(`/departments/${departmentId}/beneficiaries${query}`);
  },

  getBeneficiary: (id) => apiRequest(`/beneficiaries/${id}`),

  createBeneficiary: (payload) =>
    apiRequest("/beneficiaries", { method: "POST", body: JSON.stringify(payload) }),

  updateBeneficiary: (id, payload) =>
    apiRequest(`/beneficiaries/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  deleteBeneficiary: (id) =>
    apiRequest(`/beneficiaries/${id}`, { method: "DELETE" })
};
