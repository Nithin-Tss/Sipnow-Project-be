const express = require("express");
const router = express.Router();
const {
  validateCoupon,
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/coupon.controller");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.post("/validate", validateCoupon);
router.post("/apply", validateCoupon);

router.get("/", requireAuth, requireAdmin, getAllCoupons);
router.get("/:id", requireAuth, requireAdmin, getCouponById);
router.post("/", requireAuth, requireAdmin, createCoupon);
router.put("/:id", requireAuth, requireAdmin, updateCoupon);
router.delete("/:id", requireAuth, requireAdmin, deleteCoupon);

module.exports = router;
