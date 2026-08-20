const { Router } = require("express");
const {
  list,
  getActivePromotions,
  getOne,
  create,
  update,
  remove,
} = require("../controllers/inStorePromotion.controller");
const { optionalAuth, requireAdmin } = require("../middleware/auth");

const router = Router();

router.get("/", list);
router.get("/active", getActivePromotions);
router.get("/:id", getOne);

router.post("/", optionalAuth, requireAdmin, create);
router.put("/:id", optionalAuth, requireAdmin, update);
router.delete("/:id", optionalAuth, requireAdmin, remove);

module.exports = router;
