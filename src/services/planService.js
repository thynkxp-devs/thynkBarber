const Plan = require("../models/Plan");
const { makePlanCode, makeRoleKey } = require("../utils/idGenerator");
const Barbearia = require("../models/Barbearia");

async function generatePlanIdentifiers() {
  // MVP simples: seq por contagem
  // depois, se quiser, faço "counters" para evitar concorrência em alta escala
  const count = await Plan.countDocuments();
  const seq = count + 1;

  return {
    seq,
    code: makePlanCode(seq),
    roleKey: makeRoleKey(seq)
  };
}

async function listPlans() {
  return Plan.find().sort({ createdAt: -1 });
}

async function createPlan(payload) {
  const { code, roleKey } = await generatePlanIdentifiers();

  const name = String(payload.name).trim();
  const roleName = `Plano: ${name} (${code})`;

  const doc = await Plan.create({
    code,
    roleKey,
    roleName,

    name,
    category: (payload.category && String(payload.category).trim()) || "Sem categoria",

    startAt: new Date(payload.startAt),
    endAt: new Date(payload.endAt),

    responsible: String(payload.responsible).trim(),
    planQtyLimit: Number(payload.planQtyLimit || 0),

    price: Number(payload.price),
    promoPrice:
      payload.promoPrice === "" || payload.promoPrice === null || payload.promoPrice === undefined
        ? null
        : Number(payload.promoPrice),

    permissions: payload.permissions || {},
    areaRules: payload.areaRules || {}
  });

  return doc;
}

async function updatePlan(id, payload) {
  const plan = await Plan.findById(id);
  if (!plan) {
    const err = new Error("Plano não encontrado.");
    err.statusCode = 404;
    throw err;
  }

  if (payload.name !== undefined) plan.name = String(payload.name).trim();
  if (payload.category !== undefined) plan.category = String(payload.category).trim() || "Sem categoria";
  if (payload.startAt !== undefined) plan.startAt = new Date(payload.startAt);
  if (payload.endAt !== undefined) plan.endAt = new Date(payload.endAt);
  if (payload.responsible !== undefined) plan.responsible = String(payload.responsible).trim();

  if (payload.planQtyLimit !== undefined) plan.planQtyLimit = Number(payload.planQtyLimit || 0);
  if (payload.price !== undefined) plan.price = Number(payload.price);
  if (payload.promoPrice !== undefined) {
    plan.promoPrice = payload.promoPrice === "" || payload.promoPrice === null ? null : Number(payload.promoPrice);
  }

  if (payload.permissions) {
    for (const k of Object.keys(plan.permissions.toObject())) {
      if (payload.permissions[k] !== undefined) plan.permissions[k] = !!payload.permissions[k];
    }
  }

  if (payload.areaRules) {
    if (Array.isArray(payload.areaRules.crmApps)) plan.areaRules.crmApps = payload.areaRules.crmApps;
    if (payload.areaRules.assinaturasLimit !== undefined)
      plan.areaRules.assinaturasLimit = Number(payload.areaRules.assinaturasLimit || 0);
    if (payload.areaRules.integracoesEnabled !== undefined)
      plan.areaRules.integracoesEnabled = !!payload.areaRules.integracoesEnabled;
    if (payload.areaRules.suporteEnabled !== undefined)
      plan.areaRules.suporteEnabled = !!payload.areaRules.suporteEnabled;
  }

  // mantém roleName coerente
  plan.roleName = `Plano: ${plan.name} (${plan.code})`;

  await plan.save();
  return plan;
}

async function togglePlan(id) {
  const plan = await Plan.findById(id);
  if (!plan) {
    const err = new Error("Plano não encontrado.");
    err.statusCode = 404;
    throw err;
  }
  plan.isActive = !plan.isActive;
  await plan.save();
  return plan;
}

async function deletePlan(id) {
  const plan = await Plan.findByIdAndDelete(id);
  if (!plan) {
    const err = new Error("Plano não encontrado.");
    err.statusCode = 404;
    throw err;
  }
  return true;
}

async function statsActiveByCategory() {
  const stats = await Plan.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: { $ifNull: ["$category", "Sem categoria"] },
        total: { $sum: 1 }
      }
    },
    { $sort: { total: -1 } }
  ]);

  return {
    labels: stats.map(s => s._id || "Sem categoria"),
    values: stats.map(s => s.total)
  };
}

async function statsActiveByMonth(year) {
  const y = Number(year);
  const start = new Date(Date.UTC(y, 0, 1));
  const end = new Date(Date.UTC(y + 1, 0, 1));

  const agg = await Plan.aggregate([
    { $match: { isActive: true, createdAt: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: { $month: "$createdAt" }, // 1..12
        total: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const values = Array(12).fill(0);
  for (const row of agg) {
    values[(row._id || 1) - 1] = row.total;
  }

  return { labels: monthNames, values };
}

async function statsActivePlansInBarbearias() {
  // conta barbearias que possuem um plano ATIVO associado
  const activePlans = await Plan.find({ isActive: true }, { _id: 1 }).lean();
  const activePlanIds = activePlans.map(p => p._id);

  if (!activePlanIds.length) return { count: 0 };

  const count = await Barbearia.countDocuments({ planId: { $in: activePlanIds } });
  return { count };
}

module.exports = {
  listPlans,
  createPlan,
  updatePlan,
  togglePlan,
  deletePlan,
  statsActiveByCategory,
  statsActiveByMonth,
  statsActivePlansInBarbearias
};