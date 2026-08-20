const express = require("express");

const router = express.Router();

const {
  list,
  getOne,
  create,
  update,
  remove,
  updateStatus,
} = require("../controllers/store.controller");

const { requireAuth, requireAdmin } = require("../middleware/auth");

/*
 * ---------------------------------------------------------
 * GET /api/stores
 *
 * Get all stores
 * ---------------------------------------------------------
 */
router.get(
  "/",
  list
);

/*
 * ---------------------------------------------------------
 * GET /api/stores/:id
 *
 * Get one store
 * ---------------------------------------------------------
 */
router.get(
  "/:id",
  getOne
);

/*
 * ---------------------------------------------------------
 * POST /api/stores
 *
 * Create a store
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
 * PUT /api/stores/:id
 *
 * Update store
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
 * PATCH /api/stores/:id/status
 *
 * Activate / deactivate store
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
 * DELETE /api/stores/:id
 *
 * Delete store
 * ---------------------------------------------------------
 */
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  remove
);

module.exports = router;