// Simple toast notification system shared by every page.
// Usage: notify.success("تم الحفظ بنجاح"); notify.error("حدث خطأ ما");

const notify = (() => {
  let container = null;

  function ensureContainer() {
    if (container) return container;
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
    return container;
  }

  function show(message, type = "success", duration = 4000) {
    const el = ensureContainer();
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.setAttribute("role", "alert");
    toast.textContent = message;
    el.appendChild(toast);

    // Trigger the enter transition on the next frame.
    requestAnimationFrame(() => toast.classList.add("toast-visible"));

    setTimeout(() => {
      toast.classList.remove("toast-visible");
      toast.addEventListener("transitionend", () => toast.remove(), { once: true });
      setTimeout(() => toast.remove(), 500); // fallback if transitionend doesn't fire
    }, duration);
  }

  return {
    success: (message) => show(message, "success"),
    error: (message) => show(message, "error", 6000),
    // Stores a message to show right after the next page loads (used when we
    // redirect immediately after a successful save/delete).
    flash: (type, message) => sessionStorage.setItem("flashMessage", JSON.stringify({ type, message })),
    consumeFlash: () => {
      const raw = sessionStorage.getItem("flashMessage");
      if (!raw) return;
      sessionStorage.removeItem("flashMessage");
      try {
        const { type, message } = JSON.parse(raw);
        show(message, type);
      } catch { /* ignore malformed flash */ }
    }
  };
})();
