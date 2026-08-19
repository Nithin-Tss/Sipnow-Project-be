const express = require("express");

const router = express.Router();

const {
  createPayment,
  verifyPayment,
  getPaymentStatus,
  refundPayment,
} = require("../controllers/payment.controller");

const { protect } = require("../middleware/auth.middleware");

/*
 * ---------------------------------------------------------
 * Create payment
 *
 * POST /api/payments
 * ---------------------------------------------------------
 */
router.post(
  "/",
  protect,
  createPayment
);

/*
 * ---------------------------------------------------------
 * Verify payment
 *
 * POST /api/payments/verify
 * ---------------------------------------------------------
 */
router.post(
  "/verify",
  protect,
  verifyPayment
);

/*
 * ---------------------------------------------------------
 * Get payment status
 *
 * GET /api/payments/:paymentId/status
 * ---------------------------------------------------------
 */
router.get(
  "/:paymentId/status",
  protect,
  getPaymentStatus
);

/*
 * ---------------------------------------------------------
 * Refund payment
 *
 * POST /api/payments/:paymentId/refund
 * ---------------------------------------------------------
 */
router.post(
  "/:paymentId/refund",
  protect,
  refundPayment
);

module.exports = router;