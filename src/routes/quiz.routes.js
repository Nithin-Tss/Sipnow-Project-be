const express = require("express");

const router = express.Router();

const { getQuiz, updateQuiz } = require("../controllers/quiz.controller");

const { requireAuth, requireAdmin } = require("../middleware/auth");

/*
 * ---------------------------------------------------------
 * GET /api/quiz
 *
 * Get the storefront taste quiz
 * ---------------------------------------------------------
 */
router.get(
  "/",
  getQuiz
);

/*
 * ---------------------------------------------------------
 * PUT /api/quiz
 *
 * Replace the storefront taste quiz (Admin)
 * ---------------------------------------------------------
 */
router.put(
  "/",
  requireAuth,
  requireAdmin,
  updateQuiz
);

module.exports = router;
