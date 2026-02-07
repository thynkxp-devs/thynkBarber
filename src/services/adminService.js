const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const DEFAULT_ADMIN = {
  username: "hey.arrthur",
  password: "0201ArthuR"
};

async function seedAdminIfNeeded() {
  const existing = await Admin.findOne({ username: DEFAULT_ADMIN.username });
  if (existing) {
    console.log("ℹ️ Admin já existe:", DEFAULT_ADMIN.username);
    return;
  }

  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, 12);
  await Admin.create({ username: DEFAULT_ADMIN.username, passwordHash });

  console.log("✅ Admin criado!");
  console.log("   Usuário:", DEFAULT_ADMIN.username);
  console.log("   Senha:", DEFAULT_ADMIN.password);
}

async function seedAdminAndExitIfFlag(argv) {
  if (!argv.includes("--seed")) return;
  await seedAdminIfNeeded();
  process.exit(0);
}

async function loginWithUsernamePassword(username, password) {
  const admin = await Admin.findOne({ username: String(username).trim() });
  if (!admin) {
    const err = new Error("Usuário ou senha inválidos.");
    err.statusCode = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, admin.passwordHash);
  if (!match) {
    const err = new Error("Usuário ou senha inválidos.");
    err.statusCode = 401;
    throw err;
  }

  return admin;
}

module.exports = {
  seedAdminIfNeeded,
  seedAdminAndExitIfFlag,
  loginWithUsernamePassword
};
