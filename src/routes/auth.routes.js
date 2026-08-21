const { Router } = require("express");
const { body, query } = require("express-validator");
const { checkEmail, register, login, me } = require("../controllers/auth.controller");
const { validate } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");

const router = Router();

router.get(
  "/check-email",
  [query("email").isEmail().withMessage("Valid email is required")],
  validate,
  checkEmail
);

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

router.get("/me", requireAuth, me);

module.exports = router;
