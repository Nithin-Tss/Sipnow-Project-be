const express = require("express");

const router = express.Router();

const {
  list,
  getOne,
  create,
  update,
  remove,
  updateStatus,
} = require("../controllers/category.controller");

const { requireAuth, requireAdmin } = require("../middleware/auth");

/*
 * ---------------------------------------------------------
 * GET /api/categories
 *
 * Get all categories
 * ---------------------------------------------------------
 */
router.get(
  "/",
  list
);

/*
 * ---------------------------------------------------------
 * GET /api/categories/:id
 *
 * Get one category
 * ---------------------------------------------------------
 */
router.get(
  "/:id",
  getOne
);

/*
 * ---------------------------------------------------------
 * POST /api/categories
 *
 * Create a category
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
 * PUT /api/categories/:id
 *
 * Update category
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
 * PATCH /api/categories/:id/status
 *
 * Activate / deactivate category
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
 * DELETE /api/categories/:id
 *
 * Delete category
 * ---------------------------------------------------------
 */
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  remove
);

module.exports = router;
