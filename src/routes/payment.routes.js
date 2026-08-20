const express = require("express");

const router = express.Router();

const {
  createPayment,
  verifyPayment,
  getPaymentStatus,
  refundPayment,
} = require("../controllers/payment.controller");

const { requireAuth } = require("../middleware/auth");

/*
 * ---------------------------------------------------------
 * Create payment
 *
 * POST /api/payments
 * ---------------------------------------------------------
 */
router.post(
  "/",
  requireAuth,
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
  requireAuth,
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
  requireAuth,
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
  requireAuth,
  refundPayment
);

module.exports = router;