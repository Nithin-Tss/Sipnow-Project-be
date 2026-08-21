const express = require("express");

const router = express.Router();

const {
  list,
  getOne,
  create,
  update,
  remove,
} = require("../controllers/supplier.controller");

const { requireAuth, requireAdmin } = require("../middleware/auth");

/*
 * ---------------------------------------------------------
 * GET /api/suppliers
 * ---------------------------------------------------------
 */
router.get("/", requireAuth, requireAdmin, list);

/*
 * ---------------------------------------------------------
 * GET /api/suppliers/:id
 * ---------------------------------------------------------
 */
router.get("/:id", requireAuth, requireAdmin, getOne);

/*
 * ---------------------------------------------------------
 * POST /api/suppliers
 * ---------------------------------------------------------
 */
router.post("/", requireAuth, requireAdmin, create);

/*
 * ---------------------------------------------------------
 * PUT /api/suppliers/:id
 * ---------------------------------------------------------
 */
router.put("/:id", requireAuth, requireAdmin, update);

/*
 * ---------------------------------------------------------
 * DELETE /api/suppliers/:id
 * ---------------------------------------------------------
 */
router.delete("/:id", requireAuth, requireAdmin, remove);

module.exports = router;
