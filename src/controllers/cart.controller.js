const Cart = require("../models/Cart");

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

async function getCart(req, res) {
  const cart = await getOrCreateCart(req.user._id);
  res.json({ cart });
}

async function addItem(req, res) {
  const { productId, name, image, category, price, quantity = 1, packSize = 1 } = req.body;

  if (!productId || !name || price == null) {
    return res.status(400).json({ message: "productId, name and price are required" });
  }

  const cart = await getOrCreateCart(req.user._id);
  const existing = cart.items.find(
    (item) => item.productId === productId && item.packSize === packSize
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ productId, name, image, category, price, quantity, packSize });
  }

  await cart.save();
  res.status(201).json({ cart });
}

async function updateItem(req, res) {
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((item) => item.productId === productId);
  if (!item) {
    return res.status(404).json({ message: "Item not in cart" });
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter((item) => item.productId !== productId);
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  res.json({ cart });
}

async function removeItem(req, res) {
  const { productId } = req.params;
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((item) => item.productId !== productId);
  await cart.save();
  res.json({ cart });
}

async function clearCart(req, res) {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  res.json({ cart });
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
