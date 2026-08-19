const express = require("express");
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  toggleWishlist,
  removeFromWishlist,
  clearWishlist,
} = require("../controllers/wishlist.controller");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);

router.get("/", getWishlist);
router.post("/", addToWishlist);
router.post("/toggle", toggleWishlist);
router.delete("/:productId", removeFromWishlist);
router.delete("/", clearWishlist);

module.exports = router;
