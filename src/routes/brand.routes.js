const express = require("express");

const router = express.Router();

const {
  list,
  getOne,
  create,
  update,
  verify,
  remove,
  updateStatus,
} = require("../controllers/brand.controller");

const {
  requireAuth,
  requireAdmin,
  optionalAuth,
} = require("../middleware/auth");

/*
 * ---------------------------------------------------------
 * GET /api/brands
 *
 * Public callers only see active + verified brands; an admin
 * passing ?all=true sees everything. optionalAuth decodes the
 * token when present (without it, req.user is never set and
 * the admin "see everything" branch below can never trigger).
 * ---------------------------------------------------------
 */
router.get(
  "/",
  optionalAuth,
  list
);

/*
 * ---------------------------------------------------------
 * GET /api/brands/:id
 * ---------------------------------------------------------
 */
router.get(
  "/:id",
  optionalAuth,
  getOne
);

/*
 * ---------------------------------------------------------
 * POST /api/brands
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
 * PATCH /api/brands/:id/verify
 * ---------------------------------------------------------
 */
router.patch(
  "/:id/verify",
  requireAuth,
  requireAdmin,
  verify
);

/*
 * ---------------------------------------------------------
 * PATCH /api/brands/:id/status
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
 * ---------------------------------------------------------
 */
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  remove
);

module.exports = router;