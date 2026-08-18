const { Router } = require("express");
const { body } = require("express-validator");
const {
  list,
  getOne,
  create,
  update,
  remove,
} = require("../controllers/product.controller");
const { validate } = require("../middleware/validate");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = Router();

const productValidators = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
];

router.get("/", list);
router.get("/:id", getOne);

router.post("/", requireAuth, requireAdmin, productValidators, validate, create);
router.put("/:id", requireAuth, requireAdmin, productValidators, validate, update);
router.delete("/:id", requireAuth, requireAdmin, remove);

module.exports = router;
