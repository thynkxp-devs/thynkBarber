async function loadAdminUser() {
  try {
    const res = await fetch("/api/admin/me");
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) return;

    const el = document.getElementById("adminUsername");
    if (el) el.textContent = data.username || "-";
  } catch {}
}

function setActiveNav() {
  const path = window.location.pathname.toLowerCase();
  const navDashboard = document.getElementById("navDashboard");
  const navPlanos = document.getElementById("navPlanos");

  if (navDashboard && path.includes("dashboard")) navDashboard.classList.add("active");
  if (navPlanos && path.includes("planos")) navPlanos.classList.add("active");
}

async function doLogout() {
  try {
    const res = await fetch("/api/admin/logout", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    window.location.href = data.redirectTo || "/login.html";
  } catch {
    window.location.href = "/login.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadAdminUser();
  setActiveNav();

  const btn = document.getElementById("btnLogout");
  if (btn) btn.addEventListener("click", doLogout);
});
