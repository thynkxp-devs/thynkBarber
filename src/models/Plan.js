const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },

    category: { type: String, default: "Sem categoria", trim: true },

    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },

    responsible: { type: String, required: true, trim: true },

    // 0 = infinito
    planQtyLimit: { type: Number, default: 0, min: 0 },

    price: { type: Number, required: true, min: 0 },
    promoPrice: { type: Number, default: null, min: 0 },

    // Role do plano
    roleKey: { type: String, required: true, unique: true, uppercase: true, trim: true },
    roleName: { type: String, required: true, trim: true },

    isActive: { type: Boolean, default: true },

    permissions: {
      metas: { type: Boolean, default: false },
      crm: { type: Boolean, default: false },
      inovacao: { type: Boolean, default: false },
      educacao: { type: Boolean, default: false },
      suporteEspecializado: { type: Boolean, default: false },
      assinaturas: { type: Boolean, default: false },
      integracoes: { type: Boolean, default: false }
    },

    areaRules: {
      crmApps: {
        type: [String],
        enum: ["instagram", "whatsapp", "tiktok", "telegram"],
        default: []
      },
      // 0 = infinito
      assinaturasLimit: { type: Number, default: 0, min: 0 },

      integracoesEnabled: { type: Boolean, default: false },
      suporteEnabled: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", PlanSchema);
