function requireAdmin(req, res, next) {
  if (req.session?.adminId) return next();
  return res.status(401).json({ ok: false, message: "Não autenticado." });
}

// Para páginas HTML (redirect)
function requireAdminPage(req, res, next) {
  if (req.session?.adminId) return next();
  return res.redirect("/login.html");
}

module.exports = { requireAdmin, requireAdminPage };
