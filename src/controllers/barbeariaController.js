const { asyncHandler } = require("../utils/asyncHandler");
const { requireFields } = require("../utils/validators");
const service = require("../services/barbeariaService");

/* Admin CRUD */
const list = asyncHandler(async (req, res) => {
  const shops = await service.listBarbearias();
  res.json({ ok: true, barbearias: shops });
});

const create = asyncHandler(async (req, res) => {
  requireFields(req.body, ["tradeName"]);
  const out = await service.createBarbearia(req.body);
  res.json({ ok: true, ...out });
});

const update = asyncHandler(async (req, res) => {
  const shop = await service.updateBarbearia(req.params.id, req.body);
  res.json({ ok: true, barbearia: shop });
});

const toggle = asyncHandler(async (req, res) => {
  const shop = await service.toggleBarbearia(req.params.id);
  res.json({ ok: true, barbearia: shop });
});

const remove = asyncHandler(async (req, res) => {
  await service.deleteBarbearia(req.params.id);
  res.json({ ok: true });
});

/* Stats */
const statsByPlan = asyncHandler(async (req, res) => {
  const out = await service.statsByPlan();
  res.json({ ok: true, ...out });
});

const statsByMonth = asyncHandler(async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  const out = await service.statsCreatedByMonth(year);
  res.json({ ok: true, year: Number(year), ...out });
});

/* Shop auth */
const shopLogin = asyncHandler(async (req, res) => {
  requireFields(req.body, ["username", "password"]);
  const shop = await service.shopLogin(req.body.username, req.body.password);

  req.session.shopId = shop._id.toString();
  req.session.shopUsername = shop.username;

  res.json({
    ok: true,
    mustChangePassword: !!shop.mustChangePassword,
    redirectTo: shop.mustChangePassword ? "/barbearia-change-password.html" : "/barbearia.html"
  });
});

const shopMe = asyncHandler(async (req, res) => {
  if (!req.session?.shopId) return res.status(401).json({ ok: false });
  res.json({ ok: true, username: req.session.shopUsername });
});

const shopLogout = asyncHandler(async (req, res) => {
  req.session.destroy(() => res.json({ ok: true, redirectTo: "/barbearia-login.html" }));
});

const shopChangePassword = asyncHandler(async (req, res) => {
  requireFields(req.body, ["newPassword"]);
  await service.changeShopPassword(req.session.shopId, req.body.newPassword);
  res.json({ ok: true, redirectTo: "/barbearia.html" });
});

module.exports = {
  list, create, update, toggle, remove,
  statsByPlan, statsByMonth,
  shopLogin, shopMe, shopLogout, shopChangePassword
};
