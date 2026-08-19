const express = require("express");
const router = express.Router();
const {
  list,
  getOne,
  create,
  update,
  validate,
  redeem,
  updateStatus,
  remove,
} = require("../controllers/giftcard.controller");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.post("/validate", validate);
router.post("/redeem", requireAuth, redeem);

router.get("/", requireAuth, list);
router.post("/", requireAuth, create);
router.get("/:id", requireAuth, getOne);
router.patch("/:id", requireAuth, update);

router.patch("/:id/status", requireAuth, requireAdmin, updateStatus);
router.delete("/:id", requireAuth, requireAdmin, remove);

module.exports = router;
