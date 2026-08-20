const express = require("express");

const router = express.Router();

const {
  getStats,
  getRecentOrders,
  getSalesOverview,
} = require("../controllers/dashboard.controller");

const { requireAuth, requireAdmin } = require("../middleware/auth");

/*
 * ---------------------------------------------------------
 * GET /api/dashboard/stats
 *
 * Admin dashboard summary
 * ---------------------------------------------------------
 */
router.get(
  "/stats",
  requireAuth,
  requireAdmin,
  getStats
);

/*
 * ---------------------------------------------------------
 * GET /api/dashboard/recent-orders
 *
 * Most recently placed orders
 * ---------------------------------------------------------
 */
router.get(
  "/recent-orders",
  requireAuth,
  requireAdmin,
  getRecentOrders
);

/*
 * ---------------------------------------------------------
 * GET /api/dashboard/sales-overview
 *
 * Daily revenue trend
 * ---------------------------------------------------------
 */
router.get(
  "/sales-overview",
  requireAuth,
  requireAdmin,
  getSalesOverview
);

module.exports = router;
