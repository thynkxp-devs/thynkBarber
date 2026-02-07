const bcrypt = require("bcryptjs");
const Barbearia = require("../models/Barbearia");
const Plan = require("../models/Plan");

const DEFAULT_SHOP_PASSWORD = "thynk@2025(barbearia)";

function slugifyUsername(tradeName) {
  const s = String(tradeName || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .trim()
    .replace(/\s+/g, "_");

  return s || "barbearia";
}

async function generateCode0to999() {
  // pega o menor livre entre 0..999
  const used = await Barbearia.find({}, { code: 1, _id: 0 }).lean();
  const set = new Set(used.map(x => x.code));
  for (let i = 0; i <= 999; i++) {
    if (!set.has(i)) return i;
  }
  const err = new Error("Limite de códigos (0..999) atingido.");
  err.statusCode = 409;
  throw err;
}

async function generateUniqueUsername(tradeName) {
  const base = slugifyUsername(tradeName);
  let candidate = base;
  let n = 1;
  while (await Barbearia.exists({ username: candidate })) {
    n += 1;
    candidate = `${base}_${n}`;
  }
  return candidate;
}

async function listBarbearias() {
  return Barbearia.find().populate("planId").sort({ createdAt: -1 });
}

async function createBarbearia(payload) {
  const code = await generateCode0to999();
  const username = await generateUniqueUsername(payload.tradeName);

  const passwordHash = await bcrypt.hash(DEFAULT_SHOP_PASSWORD, 12);

  let roleKey = null;
  let planId = null;

  if (payload.planId) {
    const plan = await Plan.findById(payload.planId);
    if (!plan) {
      const err = new Error("Plano não encontrado.");
      err.statusCode = 404;
      throw err;
    }
    planId = plan._id;
    roleKey = plan.roleKey;
  }

  const doc = await Barbearia.create({
    code,
    cnpj: payload.cnpj || "",
    tradeName: String(payload.tradeName).trim(),
    phone: payload.phone || "",
    email: payload.email || "",

    address: {
      cep: payload.address?.cep || "",
      state: payload.address?.state || "",
      city: payload.address?.city || "",
      street: payload.address?.street || "",
      number: payload.address?.number || "",
      complement: payload.address?.complement || ""
    },

    membersQty: Number(payload.membersQty || 0),
    avgRevenue: Number(payload.avgRevenue || 0),

    planId,
    roleKey,

    username,
    passwordHash,
    mustChangePassword: true,
    isActive: true
  });

  return {
    barbearia: doc,
    access: {
      username,
      defaultPassword: DEFAULT_SHOP_PASSWORD
    }
  };
}

async function updateBarbearia(id, payload) {
  const shop = await Barbearia.findById(id);
  if (!shop) {
    const err = new Error("Barbearia não encontrada.");
    err.statusCode = 404;
    throw err;
  }

  if (payload.cnpj !== undefined) shop.cnpj = payload.cnpj;
  if (payload.tradeName !== undefined) shop.tradeName = String(payload.tradeName).trim();
  if (payload.phone !== undefined) shop.phone = payload.phone;
  if (payload.email !== undefined) shop.email = payload.email;

  if (payload.address) {
    shop.address.cep = payload.address.cep ?? shop.address.cep;
    shop.address.state = payload.address.state ?? shop.address.state;
    shop.address.city = payload.address.city ?? shop.address.city;
    shop.address.street = payload.address.street ?? shop.address.street;
    shop.address.number = payload.address.number ?? shop.address.number;
    shop.address.complement = payload.address.complement ?? shop.address.complement;
  }

  if (payload.membersQty !== undefined) shop.membersQty = Number(payload.membersQty || 0);
  if (payload.avgRevenue !== undefined) shop.avgRevenue = Number(payload.avgRevenue || 0);

  if (payload.planId !== undefined) {
    if (!payload.planId) {
      shop.planId = null;
      shop.roleKey = null;
    } else {
      const plan = await Plan.findById(payload.planId);
      if (!plan) {
        const err = new Error("Plano não encontrado.");
        err.statusCode = 404;
        throw err;
      }
      shop.planId = plan._id;
      shop.roleKey = plan.roleKey;
    }
  }

  await shop.save();
  return shop;
}

async function toggleBarbearia(id) {
  const shop = await Barbearia.findById(id);
  if (!shop) {
    const err = new Error("Barbearia não encontrada.");
    err.statusCode = 404;
    throw err;
  }
  shop.isActive = !shop.isActive;
  await shop.save();
  return shop;
}

async function deleteBarbearia(id) {
  const shop = await Barbearia.findByIdAndDelete(id);
  if (!shop) {
    const err = new Error("Barbearia não encontrada.");
    err.statusCode = 404;
    throw err;
  }
  return true;
}

// Stats: rosquinha (barbearias por plano)
async function statsByPlan() {
  const agg = await Barbearia.aggregate([
    {
      $group: {
        _id: "$planId",
        total: { $sum: 1 }
      }
    }
  ]);

  // Map id->name (populate manual)
  const planIds = agg.filter(a => a._id).map(a => a._id);
  const plans = await Plan.find({ _id: { $in: planIds } }, { name: 1 }).lean();
  const nameMap = new Map(plans.map(p => [String(p._id), p.name]));

  const labels = agg.map(a => (a._id ? (nameMap.get(String(a._id)) || "Plano") : "Sem plano"));
  const values = agg.map(a => a.total);

  return { labels, values };
}

// Stats: linha (barbearias criadas por mês no ano)
async function statsCreatedByMonth(year) {
  const y = Number(year);
  const start = new Date(Date.UTC(y, 0, 1));
  const end = new Date(Date.UTC(y + 1, 0, 1));

  const agg = await Barbearia.aggregate([
    { $match: { createdAt: { $gte: start, $lt: end } } },
    { $group: { _id: { $month: "$createdAt" }, total: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const monthNames = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const values = Array(12).fill(0);
  for (const row of agg) values[(row._id || 1) - 1] = row.total;

  return { labels: monthNames, values };
}

/* Auth da Barbearia */
async function shopLogin(username, password) {
  const shop = await Barbearia.findOne({ username: String(username).trim() });
  if (!shop) {
    const err = new Error("Usuário ou senha inválidos.");
    err.statusCode = 401;
    throw err;
  }
  if (!shop.isActive) {
    const err = new Error("Barbearia desativada.");
    err.statusCode = 403;
    throw err;
  }

  const ok = await bcrypt.compare(password, shop.passwordHash);
  if (!ok) {
    const err = new Error("Usuário ou senha inválidos.");
    err.statusCode = 401;
    throw err;
  }

  return shop;
}

async function changeShopPassword(shopId, newPassword) {
  if (!newPassword || String(newPassword).length < 8) {
    const err = new Error("Senha muito curta (mínimo 8).");
    err.statusCode = 400;
    throw err;
  }
  const shop = await Barbearia.findById(shopId);
  if (!shop) {
    const err = new Error("Barbearia não encontrada.");
    err.statusCode = 404;
    throw err;
  }

  shop.passwordHash = await bcrypt.hash(String(newPassword), 12);
  shop.mustChangePassword = false;
  await shop.save();
  return true;
}

module.exports = {
  DEFAULT_SHOP_PASSWORD,
  listBarbearias,
  createBarbearia,
  updateBarbearia,
  toggleBarbearia,
  deleteBarbearia,
  statsByPlan,
  statsCreatedByMonth,
  shopLogin,
  changeShopPassword
};
