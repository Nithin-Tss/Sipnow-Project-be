const express = require("express");

const router = express.Router();

const {
  list,
  getOne,
  create,
  update,
  remove,
  updateStatus,
} = require("../controllers/review.controller");

const { requireAuth, requireAdmin } = require("../middleware/auth");

/*
 * ---------------------------------------------------------
 * GET /api/reviews
 *
 * Get reviews
 * ---------------------------------------------------------
 */
router.get(
  "/",
  list
);

/*
 * ---------------------------------------------------------
 * GET /api/reviews/:id
 *
 * Get one review
 * ---------------------------------------------------------
 */
router.get(
  "/:id",
  getOne
);

/*
 * ---------------------------------------------------------
 * POST /api/reviews
 *
 * Create a review
 * ---------------------------------------------------------
 */
router.post(
  "/",
  requireAuth,
  create
);

/*
 * ---------------------------------------------------------
 * PUT /api/reviews/:id
 *
 * Update own review
 * ---------------------------------------------------------
 */
router.put(
  "/:id",
  requireAuth,
  update
);

/*
 * ---------------------------------------------------------
 * PATCH /api/reviews/:id/status
 *
 * Admin approve / hide review
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
 * DELETE /api/reviews/:id
 *
 * Delete review
 * ---------------------------------------------------------
 */
router.delete(
  "/:id",
  requireAuth,
  remove
);

module.exports = router;