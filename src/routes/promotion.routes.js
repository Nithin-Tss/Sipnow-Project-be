const express = require("express");

const router = express.Router();

const {
  list,
  getActivePromotions,
  getOne,
  create,
  update,
  updateStatus,
  remove,
} = require("../controllers/promotion.controller");

const { requireAuth, requireAdmin } = require("../middleware/auth");

/*
 * ---------------------------------------------------------
 * GET /api/promotions
 *
 * Get all promotions
 * ---------------------------------------------------------
 */
router.get(
  "/",
  requireAuth,
  requireAdmin,
  list
);

/*
 * ---------------------------------------------------------
 * GET /api/promotions/active
 *
 * Get currently active promotions
 * ---------------------------------------------------------
 */
router.get(
  "/active",
  getActivePromotions
);

/*
 * ---------------------------------------------------------
 * GET /api/promotions/:id
 *
 * Get one promotion
 * ---------------------------------------------------------
 */
router.get(
  "/:id",
  getOne
);

/*
 * ---------------------------------------------------------
 * POST /api/promotions
 *
 * Create promotion
 * ---------------------------------------------------------
 */
router.post(
  "/",
  requireAuth,
  requireAdmin,
  create
);

/*
 * ---------------------------------------------------------
 * PUT /api/promotions/:id
 *
 * Update promotion
 * ---------------------------------------------------------
 */
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  update
);

/*
 * ---------------------------------------------------------
 * PATCH /api/promotions/:id/status
 *
 * Activate / deactivate promotion
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
 * DELETE /api/promotions/:id
 *
 * Delete promotion
 * ---------------------------------------------------------
 */
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  remove
);

module.exports = router;