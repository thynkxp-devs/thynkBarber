const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI não definido no .env");
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log("✅ MongoDB conectado");
}

module.exports = { connectDB };
