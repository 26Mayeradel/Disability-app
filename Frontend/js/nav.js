// Renders the shared nav bar into <div id="navbar"></div> and highlights the
// current page. Call renderNavbar("dashboard" | "department" | "credentials")
// on every authenticated page.
function renderNavbar(active) {
  const el = document.getElementById("navbar");
  if (!el) return;

  const links = [
    { key: "dashboard", href: "dashboard.html", label: "لوحة التحكم" },
    { key: "credentials", href: "change-credentials.html", label: "تغيير بيانات الدخول" }
  ];

  el.innerHTML = links
    .map((l) => `<a href="${l.href}" class="${l.key === active ? "active" : ""}">${l.label}</a>`)
    .join("");
}
