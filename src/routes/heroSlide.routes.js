const express = require("express");

const router = express.Router();

const {
  list,
  getActiveSlides,
  getOne,
  create,
  update,
  updateStatus,
  remove,
} = require("../controllers/heroSlide.controller");

const { requireAuth, requireAdmin } = require("../middleware/auth");

/*
 * ---------------------------------------------------------
 * GET /api/hero-slides
 *
 * Get all hero slides
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
 * GET /api/hero-slides/active
 *
 * Get currently active hero slides
 * ---------------------------------------------------------
 */
router.get(
  "/active",
  getActiveSlides
);

/*
 * ---------------------------------------------------------
 * GET /api/hero-slides/:id
 *
 * Get one hero slide
 * ---------------------------------------------------------
 */
router.get(
  "/:id",
  getOne
);

/*
 * ---------------------------------------------------------
 * POST /api/hero-slides
 *
 * Create hero slide
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
 * PUT /api/hero-slides/:id
 *
 * Update hero slide
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
 * PATCH /api/hero-slides/:id/status
 *
 * Activate / deactivate hero slide
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
 * DELETE /api/hero-slides/:id
 *
 * Delete hero slide
 * ---------------------------------------------------------
 */
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  remove
);

module.exports = router;
