function requireShop(req, res, next) {
  if (req.session?.shopId) return next();
  return res.status(401).json({ ok: false, message: "Não autenticado (barbearia)." });
}

module.exports = { requireShop };
