const express = require("express");

const router = express.Router();

const {
  list,
  getOne,
  create,
  update,
  remove,
  updateStatus,
} = require("../controllers/brand.controller");

const { requireAuth, requireAdmin } = require("../middleware/auth");

/*
 * ---------------------------------------------------------
 * GET /api/brands
 *
 * Get all brands
 * ---------------------------------------------------------
 */
router.get(
  "/",
  list
);

/*
 * ---------------------------------------------------------
 * GET /api/brands/:id
 *
 * Get one brand
 * ---------------------------------------------------------
 */
router.get(
  "/:id",
  getOne
);

/*
 * ---------------------------------------------------------
 * POST /api/brands
 *
 * Create a brand
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
 * PUT /api/brands/:id
 *
 * Update brand
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
 * PATCH /api/brands/:id/status
 *
 * Activate / deactivate brand
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
 * DELETE /api/brands/:id
 *
 * Delete brand
 * ---------------------------------------------------------
 */
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  remove
);

module.exports = router;
