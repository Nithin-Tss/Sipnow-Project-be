const { Router } = require("express");
const { body } = require("express-validator");
const { register, login, me } = require("../controllers/auth.controller");
const { validate } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");

const router = Router();

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
