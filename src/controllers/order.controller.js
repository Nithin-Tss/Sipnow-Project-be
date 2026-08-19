const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

/*
 * ---------------------------------------------------------
 * Helper: Check whether a value is a valid MongoDB ObjectId
 * ---------------------------------------------------------
 */
function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

/*
 * ---------------------------------------------------------
 * POST /api/orders
 *
 * Create a new order from the user's cart
 * ---------------------------------------------------------
 */
async function create(req, res) {
  const userId = req.user._id;

  const {
    shippingAddress,
    payment,
    discount = 0,
    shippingCharge = 0,
    tax = 0,
    offer = null,
    offerCode = "",
    giftCard = null,
    giftCardAmount = 0,
  } = req.body;

  if (!shippingAddress) {
    return res.status(400).json({
      message: "Shipping address is required",
    });
  }

  if (!payment || !payment.method) {
    return res.status(400).json({
      message: "Payment method is required",
    });
  }

  /*
   * Get user's cart
   */
  const cart = await Cart.findOne({
    user: userId,
  }).populate("items.product");

  if (!cart || !cart.items || cart.items.length === 0) {
    return res.status(400).json({
      message: "Your cart is empty",
    });
  }

  /*
   * Validate products and stock
   */
  const orderItems = [];

  for (const cartItem of cart.items) {
    const product = cartItem.product;

    if (!product) {
      return res.status(400).json({
        message: "One or more products in the cart no longer exist",
      });
    }

    if (product.inStock === false) {
      return res.status(400).json({
        message: `${product.name} is currently out of stock`,
      });
    }

    if (
      product.stockQuantity !== undefined &&
      product.stockQuantity < cartItem.quantity
    ) {
      return res.status(400).json({
        message: `Only ${product.stockQuantity} units of ${product.name} are available`,
      });
    }

    const price = Number(product.price) || 0;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.image || "",
      price,
      quantity: cartItem.quantity,
      total: price * cartItem.quantity,
    });
  }

  /*
   * Calculate subtotal
   */
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.total,
    0
  );

  const safeDiscount = Math.max(
    0,
    Number(discount) || 0
  );

  const safeShippingCharge = Math.max(
    0,
    Number(shippingCharge) || 0
  );

  const safeTax = Math.max(
    0,
    Number(tax) || 0
  );

  const safeGiftCardAmount = Math.max(
    0,
    Number(giftCardAmount) || 0
  );

  /*
   * Prevent discount + gift card from exceeding subtotal
   */
  const totalDiscount = Math.min(
    subtotal,
    safeDiscount + safeGiftCardAmount
  );

  const totalAmount = Math.max(
    0,
    subtotal -
      totalDiscount +
      safeShippingCharge +
      safeTax
  );

  /*
   * Validate offer ID if provided
   */
  if (offer && !isValidObjectId(offer)) {
    return res.status(400).json({
      message: "Invalid offer ID",
    });
  }

  /*
   * Validate gift card ID if provided
   */
  if (giftCard && !isValidObjectId(giftCard)) {
    return res.status(400).json({
      message: "Invalid gift card ID",
    });
  }

  /*
   * Create order
   */
  const order = await Order.create({
    user: userId,

    items: orderItems,

    shippingAddress,

    subtotal,

    discount: safeDiscount,

    shippingCharge: safeShippingCharge,

    tax: safeTax,

    totalAmount,

    offer: offer || null,

    offerCode: offerCode
      ? offerCode.trim().toUpperCase()
      : "",

    giftCard: giftCard || null,

    giftCardAmount: safeGiftCardAmount,

    payment: {
      method: payment.method,
      status: payment.status || "pending",
      transactionId:
        payment.transactionId || "",
      paymentOrderId:
        payment.paymentOrderId || "",
    },

    status: "pending",
  });

  /*
   * Reduce product stock
   */
  for (const item of orderItems) {
    const product = await Product.findById(
      item.product
    );

    if (!product) {
      continue;
    }

    if (
      product.stockQuantity !== undefined
    ) {
      product.stockQuantity = Math.max(
        0,
        product.stockQuantity - item.quantity
      );

      if (product.stockQuantity === 0) {
        product.inStock = false;
      }

      await product.save();
    }
  }

  /*
   * Clear cart after successful order creation
   */
  cart.items = [];
  await cart.save();

  const populatedOrder = await Order.findById(
    order._id
  )
    .populate("user", "name email")
    .populate(
      "items.product",
      "name price image brand"
    )
    .populate("offer")
    .populate("giftCard");

  res.status(201).json({
    message: "Order created successfully",
    order: populatedOrder,
  });
}

/*
 * ---------------------------------------------------------
 * GET /api/orders
 *
 * Get all orders
 *
 * Admin:
 *   Gets all orders
 *
 * Customer:
 *   Gets only their own orders
 * ---------------------------------------------------------
 */
async function list(req, res) {
  const filter = {};

  /*
   * Non-admin users can only access their own orders.
   */
  if (req.user.role !== "admin") {
    filter.user = req.user._id;
  }

  const orders = await Order.find(filter)
    .populate("user", "name email")
    .populate(
      "items.product",
      "name price image brand"
    )
    .populate("offer")
    .populate("giftCard")
    .sort({ createdAt: -1 });

  res.json({
    orders,
  });
}

/*
 * ---------------------------------------------------------
 * GET /api/orders/my-orders
 *
 * Get orders belonging to logged-in user
 * ---------------------------------------------------------
 */
async function getMyOrders(req, res) {
  const orders = await Order.find({
    user: req.user._id,
  })
    .populate(
      "items.product",
      "name price image brand"
    )
    .populate("offer")
    .populate("giftCard")
    .sort({ createdAt: -1 });

  res.json({
    orders,
  });
}

/*
 * ---------------------------------------------------------
 * GET /api/orders/:id
 *
 * Get a single order
 * ---------------------------------------------------------
 */
async function getOne(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid order ID",
    });
  }

  const order = await Order.findById(id)
    .populate("user", "name email")
    .populate(
      "items.product",
      "name price image brand category"
    )
    .populate("offer")
    .populate("giftCard");

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  /*
   * Customers can only view their own orders.
   * Admins can view any order.
   */
  if (
    req.user.role !== "admin" &&
    order.user._id.toString() !==
      req.user._id.toString()
  ) {
    return res.status(403).json({
      message: "You are not authorized to view this order",
    });
  }

  res.json(order);
}

/*
 * ---------------------------------------------------------
 * PATCH /api/orders/:id/status
 *
 * Admin updates order status
 * ---------------------------------------------------------
 */
async function updateStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
  ];

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid order ID",
    });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid order status",
      allowedStatuses,
    });
  }

  const order = await Order.findById(id);

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  /*
   * Prevent changing a completed/cancelled order
   * unnecessarily.
   */
  if (
    order.status === "delivered" &&
    status !== "returned"
  ) {
    return res.status(400).json({
      message:
        "A delivered order cannot be moved to this status",
    });
  }

  if (
    order.status === "cancelled" &&
    status !== "cancelled"
  ) {
    return res.status(400).json({
      message:
        "A cancelled order cannot be moved to another status",
    });
  }

  order.status = status;

  if (status === "delivered") {
    order.deliveredAt = new Date();
  }

  if (status === "cancelled") {
    order.cancelledAt = new Date();
  }

  await order.save();

  const updatedOrder = await Order.findById(
    order._id
  )
    .populate("user", "name email")
    .populate(
      "items.product",
      "name price image brand"
    )
    .populate("offer")
    .populate("giftCard");

  res.json({
    message: "Order status updated successfully",
    order: updatedOrder,
  });
}

/*
 * ---------------------------------------------------------
 * PATCH /api/orders/:id/payment
 *
 * Update payment information
 * ---------------------------------------------------------
 */
async function updatePaymentStatus(req, res) {
  const { id } = req.params;

  const {
    status,
    transactionId,
    paymentOrderId,
  } = req.body;

  const allowedPaymentStatuses = [
    "pending",
    "paid",
    "failed",
    "refunded",
  ];

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid order ID",
    });
  }

  if (!allowedPaymentStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid payment status",
      allowedStatuses: allowedPaymentStatuses,
    });
  }

  const order = await Order.findById(id);

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  order.payment.status = status;

  if (transactionId !== undefined) {
    order.payment.transactionId =
      transactionId;
  }

  if (paymentOrderId !== undefined) {
    order.payment.paymentOrderId =
      paymentOrderId;
  }

  /*
   * Automatically confirm an order after
   * successful payment.
   */
  if (
    status === "paid" &&
    order.status === "pending"
  ) {
    order.status = "confirmed";
  }

  await order.save();

  res.json({
    message: "Payment status updated successfully",
    order,
  });
}

/*
 * ---------------------------------------------------------
 * PATCH /api/orders/:id/cancel
 *
 * Customer cancels their own order
 * ---------------------------------------------------------
 */
async function cancel(req, res) {
  const { id } = req.params;
  const {
    reason = "",
  } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid order ID",
    });
  }

  const order = await Order.findById(id);

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  /*
   * Only the order owner can cancel
   * unless the user is an admin.
   */
  if (
    req.user.role !== "admin" &&
    order.user.toString() !==
      req.user._id.toString()
  ) {
    return res.status(403).json({
      message:
        "You are not authorized to cancel this order",
    });
  }

  /*
   * Only pending, confirmed and processing
   * orders can be cancelled.
   */
  const cancellableStatuses = [
    "pending",
    "confirmed",
    "processing",
  ];

  if (!cancellableStatuses.includes(order.status)) {
    return res.status(400).json({
      message:
        "This order cannot be cancelled at its current status",
    });
  }

  order.status = "cancelled";
  order.cancelledAt = new Date();
  order.cancellationReason =
    reason.trim();

  await order.save();

  /*
   * Restore product stock.
   */
  for (const item of order.items) {
    const product = await Product.findById(
      item.product
    );

    if (!product) {
      continue;
    }

    if (
      product.stockQuantity !== undefined
    ) {
      product.stockQuantity += item.quantity;
      product.inStock = true;

      await product.save();
    }
  }

  const cancelledOrder =
    await Order.findById(order._id)
      .populate(
        "items.product",
        "name price image brand"
      )
      .populate("offer")
      .populate("giftCard");

  res.json({
    message: "Order cancelled successfully",
    order: cancelledOrder,
  });
}

/*
 * ---------------------------------------------------------
 * DELETE /api/orders/:id
 *
 * Admin deletes an order
 * ---------------------------------------------------------
 */
async function remove(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid order ID",
    });
  }

  const order = await Order.findByIdAndDelete(id);

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  res.json({
    message: "Order deleted successfully",
  });
}

/*
 * ---------------------------------------------------------
 * GET /api/orders/:id/status
 *
 * Get order status
 * ---------------------------------------------------------
 */
async function getStatus(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid order ID",
    });
  }

  const order = await Order.findById(id).select(
    "status payment trackingNumber estimatedDeliveryDate deliveredAt cancelledAt"
  );

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  res.json({
    orderId: order._id,
    status: order.status,
    payment: order.payment,
    trackingNumber:
      order.trackingNumber,
    estimatedDeliveryDate:
      order.estimatedDeliveryDate,
    deliveredAt: order.deliveredAt,
    cancelledAt: order.cancelledAt,
  });
}

module.exports = {
  create,
  list,
  getMyOrders,
  getOne,
  updateStatus,
  updatePaymentStatus,
  cancel,
  remove,
  getStatus,
};