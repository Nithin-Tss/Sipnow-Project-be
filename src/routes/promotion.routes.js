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

const { protect } = require("../middleware/auth.middleware");

/*
 * ---------------------------------------------------------
 * GET /api/promotions
 *
 * Get all promotions
 * ---------------------------------------------------------
 */
router.get(
  "/",
  protect,
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
  protect,
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
  protect,
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
  protect,
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
  protect,
  remove
);

module.exports = router;