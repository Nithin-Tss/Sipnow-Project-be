const { Router } = require("express");
const {
  list,
  getActivePromotions,
  getOne,
  create,
  update,
  remove,
} = require("../controllers/inStorePromotion.controller");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = Router();

router.get("/", list);
router.get("/active", getActivePromotions);
router.get("/:id", getOne);

router.post("/", requireAuth, requireAdmin, create);
router.put("/:id", requireAuth, requireAdmin, update);
router.delete("/:id", requireAuth, requireAdmin, remove);

module.exports = router;
