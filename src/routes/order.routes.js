const express = require("express");

const router = express.Router();

const {
  create,
  list,
  getMyOrders,
  getOne,
  updateStatus,
  updatePaymentStatus,
  cancel,
  remove,
  getStatus,
} = require("../controllers/order.controller");

const { requireAuth, requireAdmin } = require("../middleware/auth");

/*
 * ---------------------------------------------------------
 * POST /api/orders
 *
 * Create a new order from the user's cart
 * ---------------------------------------------------------
 */
router.post(
  "/",
  requireAuth,
  create
);

/*
 * ---------------------------------------------------------
 * GET /api/orders
 *
 * Admin: all orders
 * Customer: only their own orders
 * ---------------------------------------------------------
 */
router.get(
  "/",
  requireAuth,
  list
);

/*
 * ---------------------------------------------------------
 * GET /api/orders/my-orders
 *
 * Orders belonging to the logged-in user
 * ---------------------------------------------------------
 */
router.get(
  "/my-orders",
  requireAuth,
  getMyOrders
);

/*
 * ---------------------------------------------------------
 * GET /api/orders/:id
 *
 * Get a single order
 * ---------------------------------------------------------
 */
router.get(
  "/:id",
  requireAuth,
  getOne
);

/*
 * ---------------------------------------------------------
 * GET /api/orders/:id/status
 *
 * Get order status
 * ---------------------------------------------------------
 */
router.get(
  "/:id/status",
  requireAuth,
  getStatus
);

/*
 * ---------------------------------------------------------
 * PATCH /api/orders/:id/status
 *
 * Admin updates order status
 * ---------------------------------------------------------
 */
router.patch(
  "/:id/status",
  requireAuth,
  requireAdmin,
  updateStatus
);

/*
 * ---------------------------------------------------------
 * PATCH /api/orders/:id/payment
 *
 * Update payment information
 * ---------------------------------------------------------
 */
router.patch(
  "/:id/payment",
  requireAuth,
  requireAdmin,
  updatePaymentStatus
);

/*
 * ---------------------------------------------------------
 * PATCH /api/orders/:id/cancel
 *
 * Customer cancels their own order
 * ---------------------------------------------------------
 */
router.patch(
  "/:id/cancel",
  requireAuth,
  cancel
);

/*
 * ---------------------------------------------------------
 * DELETE /api/orders/:id
 *
 * Admin deletes an order
 * ---------------------------------------------------------
 */
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  remove
);

module.exports = router;
