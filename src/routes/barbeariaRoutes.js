const express = require("express");
const router = express.Router();

const { requireAdmin } = require("../middlewares/requireAdmin");
const { requireShop } = require("../middlewares/requireShop");
const ctrl = require("../controllers/barbeariaController");

// Admin
router.get("/", requireAdmin, ctrl.list);
router.post("/", requireAdmin, ctrl.create);
router.put("/:id", requireAdmin, ctrl.update);
router.patch("/:id/toggle", requireAdmin, ctrl.toggle);
router.delete("/:id", requireAdmin, ctrl.remove);

// Stats (admin)
router.get("/stats/by-plan", requireAdmin, ctrl.statsByPlan);
router.get("/stats/created-by-month", requireAdmin, ctrl.statsByMonth);

// Shop auth (público)
router.post("/auth/login", ctrl.shopLogin);
router.get("/auth/me", requireShop, ctrl.shopMe);
router.post("/auth/logout", requireShop, ctrl.shopLogout);
router.post("/auth/change-password", requireShop, ctrl.shopChangePassword);

module.exports = router;
