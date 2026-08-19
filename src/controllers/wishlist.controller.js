const Wishlist = require("../models/Wishlist");

// Helper to find or create wishlist for user
async function findOrCreateWishlist(userId) {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }
  return wishlist;
}

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
async function getWishlist(req, res) {
  try {
    const wishlist = await findOrCreateWishlist(req.user._id);
    await wishlist.populate("products");
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
async function addToWishlist(req, res) {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const wishlist = await findOrCreateWishlist(req.user._id);

    const exists = wishlist.products.some(
      (id) => id.toString() === productId.toString()
    );

    if (!exists) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    await wishlist.populate("products");
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Toggle product in wishlist (add if missing, remove if present)
// @route   POST /api/wishlist/toggle
// @access  Private
async function toggleWishlist(req, res) {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const wishlist = await findOrCreateWishlist(req.user._id);

    const index = wishlist.products.findIndex(
      (id) => id.toString() === productId.toString()
    );

    let isWishlisted = false;

    if (index > -1) {
      wishlist.products.splice(index, 1);
      isWishlisted = false;
    } else {
      wishlist.products.push(productId);
      isWishlisted = true;
    }

    await wishlist.save();
    await wishlist.populate("products");

    res.json({
      isWishlisted,
      wishlist,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
async function removeFromWishlist(req, res) {
  try {
    const { productId } = req.params;

    const wishlist = await findOrCreateWishlist(req.user._id);

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId.toString()
    );

    await wishlist.save();
    await wishlist.populate("products");

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Clear all items from wishlist
// @route   DELETE /api/wishlist
// @access  Private
async function clearWishlist(req, res) {
  try {
    const wishlist = await findOrCreateWishlist(req.user._id);
    wishlist.products = [];
    await wishlist.save();
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getWishlist,
  addToWishlist,
  toggleWishlist,
  removeFromWishlist,
  clearWishlist,
};
