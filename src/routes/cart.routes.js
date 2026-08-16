const { Router } = require("express");
const { getCart, addItem, updateItem, removeItem, clearCart } = require("../controllers/cart.controller");
const { requireAuth } = require("../middleware/auth");

const router = Router();

router.use(requireAuth);

router.get("/", getCart);
router.post("/items", addItem);
router.put("/items/:productId", updateItem);
router.delete("/items/:productId", removeItem);
router.delete("/", clearCart);

module.exports = router;
