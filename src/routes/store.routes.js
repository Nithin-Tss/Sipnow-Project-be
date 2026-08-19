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

const { protect } = require("../middleware/auth.middleware");

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
  protect,
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
  protect,
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
  protect,
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
  protect,
  remove
);

module.exports = router;