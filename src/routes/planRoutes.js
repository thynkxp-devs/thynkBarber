const express = require("express");
const router = express.Router();

const { requireAdmin } = require("../middlewares/requireAdmin");
const planController = require("../controllers/planController");

router.get("/", requireAdmin, planController.list);
router.get("/stats/active-by-category", requireAdmin, planController.stats);
router.get("/stats/active-by-month", requireAdmin, planController.statsByMonth);
router.get("/stats/active-in-barbearias", requireAdmin, planController.statsActiveInBarbearias);

router.post("/", requireAdmin, planController.create);
router.put("/:id", requireAdmin, planController.update);
router.patch("/:id/toggle", requireAdmin, planController.toggle);
router.delete("/:id", requireAdmin, planController.remove);

module.exports = router;
