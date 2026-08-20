const crypto = require("crypto");
const mongoose = require("mongoose");

const Order = require("../models/Order");

/*
 * ---------------------------------------------------------
 * Mock payment gateway
 *
 * No real payment provider is wired up yet. These helpers
 * simulate gateway order creation and signature
 * verification so the rest of the checkout flow can be
 * built and tested end-to-end.
 * ---------------------------------------------------------
 */
const MOCK_GATEWAY_SECRET =
  process.env.MOCK_PAYMENT_SECRET || "mock-payment-secret";

function generatePaymentOrderId() {
  return `mock_order_${crypto.randomBytes(12).toString("hex")}`;
}

function generateSignature(paymentOrderId, transactionId) {
  return crypto
    .createHmac("sha256", MOCK_GATEWAY_SECRET)
    .update(`${paymentOrderId}|${transactionId}`)
    .digest("hex");
}

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
 * Helper: Load an order and confirm the requester may
 * access it.
 * ---------------------------------------------------------
 */
async function loadAuthorizedOrder(orderQuery, req, res) {
  const order = await Order.findOne(orderQuery);

  if (!order) {
    res.status(404).json({
      message: "Order not found",
    });
    return null;
  }

  if (
    req.user.role !== "admin" &&
    order.user.toString() !== req.user._id.toString()
  ) {
    res.status(403).json({
      message: "You are not authorized to access this payment",
    });
    return null;
  }

  return order;
}

/*
 * ---------------------------------------------------------
 * POST /api/payments
 *
 * Create a payment for an order (mock gateway order)
 * ---------------------------------------------------------
 */
async function createPayment(req, res) {
  const { orderId } = req.body;

  if (!orderId || !isValidObjectId(orderId)) {
    return res.status(400).json({
      message: "A valid order ID is required",
    });
  }

  const order = await loadAuthorizedOrder(
    { _id: orderId },
    req,
    res
  );

  if (!order) {
    return;
  }

  if (order.payment.status === "paid") {
    return res.status(400).json({
      message: "This order has already been paid for",
    });
  }

  const paymentOrderId = generatePaymentOrderId();

  order.payment.paymentOrderId = paymentOrderId;
  order.payment.status = "pending";

  await order.save();

  res.status(201).json({
    message: "Payment order created successfully",
    paymentOrderId,
    amount: order.totalAmount,
    currency: "INR",
    orderId: order._id,
  });
}

/*
 * ---------------------------------------------------------
 * POST /api/payments/verify
 *
 * Verify a payment against the mock gateway signature
 * ---------------------------------------------------------
 */
async function verifyPayment(req, res) {
  const { orderId, paymentOrderId, transactionId, signature } = req.body;

  if (!orderId || !isValidObjectId(orderId)) {
    return res.status(400).json({
      message: "A valid order ID is required",
    });
  }

  if (!paymentOrderId || !transactionId || !signature) {
    return res.status(400).json({
      message:
        "paymentOrderId, transactionId and signature are required",
    });
  }

  const order = await loadAuthorizedOrder(
    { _id: orderId },
    req,
    res
  );

  if (!order) {
    return;
  }

  if (order.payment.paymentOrderId !== paymentOrderId) {
    return res.status(400).json({
      message: "Payment order ID does not match this order",
    });
  }

  const expectedSignature = generateSignature(
    paymentOrderId,
    transactionId
  );

  if (expectedSignature !== signature) {
    order.payment.status = "failed";
    await order.save();

    return res.status(400).json({
      message: "Payment verification failed",
    });
  }

  order.payment.status = "paid";
  order.payment.transactionId = transactionId;

  if (order.status === "pending") {
    order.status = "confirmed";
  }

  await order.save();

  res.json({
    message: "Payment verified successfully",
    order,
  });
}

/*
 * ---------------------------------------------------------
 * GET /api/payments/:paymentId/status
 *
 * Get the status of a payment by its gateway order ID
 * ---------------------------------------------------------
 */
async function getPaymentStatus(req, res) {
  const { paymentId } = req.params;

  if (!paymentId) {
    return res.status(400).json({
      message: "Payment ID is required",
    });
  }

  const order = await loadAuthorizedOrder(
    { "payment.paymentOrderId": paymentId },
    req,
    res
  );

  if (!order) {
    return;
  }

  res.json({
    orderId: order._id,
    paymentOrderId: order.payment.paymentOrderId,
    status: order.payment.status,
    transactionId: order.payment.transactionId,
    amount: order.totalAmount,
  });
}

/*
 * ---------------------------------------------------------
 * POST /api/payments/:paymentId/refund
 *
 * Refund a paid order (Admin)
 * ---------------------------------------------------------
 */
async function refundPayment(req, res) {
  const { paymentId } = req.params;
  const { reason = "" } = req.body;

  if (!paymentId) {
    return res.status(400).json({
      message: "Payment ID is required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Only admins can issue refunds",
    });
  }

  const order = await Order.findOne({
    "payment.paymentOrderId": paymentId,
  });

  if (!order) {
    return res.status(404).json({
      message: "Payment not found",
    });
  }

  if (order.payment.status !== "paid") {
    return res.status(400).json({
      message: "Only paid orders can be refunded",
    });
  }

  order.payment.status = "refunded";
  order.status = "cancelled";
  order.cancelledAt = new Date();
  order.cancellationReason = reason.trim() || "Refunded";

  await order.save();

  res.json({
    message: "Payment refunded successfully",
    order,
  });
}

module.exports = {
  createPayment,
  verifyPayment,
  getPaymentStatus,
  refundPayment,
};
