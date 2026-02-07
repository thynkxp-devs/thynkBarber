const { asyncHandler } = require("../utils/asyncHandler");
const { requireFields } = require("../utils/validators");
const planService = require("../services/planService");

const list = asyncHandler(async (req, res) => {
  const plans = await planService.listPlans();
  res.json({ ok: true, plans });
});

const stats = asyncHandler(async (req, res) => {
  const out = await planService.statsActiveByCategory();
  res.json({ ok: true, ...out });
});

const create = asyncHandler(async (req, res) => {
  requireFields(req.body, ["name", "startAt", "endAt", "responsible", "price"]);
  const plan = await planService.createPlan(req.body);
  res.json({ ok: true, plan });
});

const update = asyncHandler(async (req, res) => {
  const plan = await planService.updatePlan(req.params.id, req.body);
  res.json({ ok: true, plan });
});

const toggle = asyncHandler(async (req, res) => {
  const plan = await planService.togglePlan(req.params.id);
  res.json({ ok: true, plan });
});

const remove = asyncHandler(async (req, res) => {
  await planService.deletePlan(req.params.id);
  res.json({ ok: true });
});

const statsByMonth = asyncHandler(async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  const out = await planService.statsActiveByMonth(year);
  res.json({ ok: true, year: Number(year), ...out });
});

const statsActiveInBarbearias = asyncHandler(async (req, res) => {
  const out = await planService.statsActivePlansInBarbearias();
  res.json({ ok: true, ...out });
});

module.exports = { list, stats, create, update, toggle, remove, statsByMonth, statsActiveInBarbearias };
