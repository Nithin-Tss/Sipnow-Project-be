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

const {
  requireAuth,
  requireAdmin,
} = require("../middleware/auth");


// ============================================================
// CUSTOMER
// ============================================================

// Customer can validate a coupon during checkout.
router.post(
  "/validate",
  validateCoupon
);

// Keep /apply for compatibility
// if another frontend call already uses it.
router.post(
  "/apply",
  validateCoupon
);


// ============================================================
// ADMIN ONLY
// ============================================================

// Get all coupons
router.get(
  "/",
  requireAuth,
  requireAdmin,
  getAllCoupons
);

// Get one coupon
router.get(
  "/:id",
  requireAuth,
  requireAdmin,
  getCouponById
);

// Create coupon
router.post(
  "/",
  requireAuth,
  requireAdmin,
  createCoupon
);

// Update coupon
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  updateCoupon
);

// Delete coupon
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  deleteCoupon
);

module.exports = router;