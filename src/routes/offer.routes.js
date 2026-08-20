const express = require("express");

const router = express.Router();

const {
  list,
  getActiveOffers,
  getOne,
  create,
  update,
  remove,
  updateStatus,
  validate,
} = require("../controllers/offer.controller");

const { requireAuth, requireAdmin } = require("../middleware/auth");

/*
 * ---------------------------------------------------------
 * GET /api/offers
 *
 * Get all offers
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
 * GET /api/offers/active
 *
 * Get currently active offers
 * ---------------------------------------------------------
 */
router.get(
  "/active",
  getActiveOffers
);

/*
 * ---------------------------------------------------------
 * POST /api/offers/validate
 *
 * Validate an offer code and calculate discount
 * ---------------------------------------------------------
 */
router.post(
  "/validate",
  requireAuth,
  validate
);

/*
 * ---------------------------------------------------------
 * GET /api/offers/:id
 *
 * Get one offer
 * ---------------------------------------------------------
 */
router.get(
  "/:id",
  getOne
);

/*
 * ---------------------------------------------------------
 * POST /api/offers
 *
 * Create offer
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
 * PUT /api/offers/:id
 *
 * Update offer
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
 * PATCH /api/offers/:id/status
 *
 * Activate / deactivate offer
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
 * DELETE /api/offers/:id
 *
 * Delete offer
 * ---------------------------------------------------------
 */
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  remove
);

module.exports = router;
