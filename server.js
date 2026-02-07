require("dotenv").config();
const { createApp } = require("./app");
const { connectDB } = require("./src/config/db");
const { seedAdminIfNeeded, seedAdminAndExitIfFlag } = require("./src/services/adminService");

(async () => {
  await connectDB();

  // --seed: cria admin e sai
  await seedAdminAndExitIfFlag(process.argv);

  // seed automático no start (se não existir)
  await seedAdminIfNeeded();

  const app = createApp();
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`🚀 Server rodando: http://localhost:${port}`));
})();
