const mongoose = require("mongoose");

const BarbeariaSchema = new mongoose.Schema(
  {
    code: { type: Number, required: true, unique: true, min: 0, max: 999 }, // 0..999

    cnpj: { type: String, trim: true },
    tradeName: { type: String, required: true, trim: true },   // Nome fantasia
    phone: { type: String, trim: true },
    email: { type: String, trim: true },

    address: {
      cep: { type: String, trim: true },
      state: { type: String, trim: true },
      city: { type: String, trim: true },
      street: { type: String, trim: true },
      number: { type: String, trim: true },
      complement: { type: String, trim: true }
    },

    membersQty: { type: Number, default: 0, min: 0 },
    avgRevenue: { type: Number, default: 0, min: 0 },

    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", default: null },
    roleKey: { type: String, trim: true, default: null },

    // Login da barbearia
    username: { type: String, required: true, unique: true, trim: true }, // ex: barbearia_amaral
    passwordHash: { type: String, required: true },
    mustChangePassword: { type: Boolean, default: true },

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Barbearia", BarbeariaSchema);
