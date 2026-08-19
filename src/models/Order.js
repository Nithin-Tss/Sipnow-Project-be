const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine2: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    postalCode: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
      default: "India",
    },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: [
        "card",
        "upi",
        "netbanking",
        "wallet",
        "cod",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded",
      ],
      default: "pending",
    },

    transactionId: {
      type: String,
      trim: true,
      default: "",
    },

    paymentOrderId: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    /*
     * Customer who placed the order
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /*
     * Products purchased
     */
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    /*
     * Shipping / delivery address snapshot
     */
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    /*
     * Price calculation
     */
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    shippingCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    /*
     * Applied offer
     */
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      default: null,
    },

    offerCode: {
      type: String,
      trim: true,
      default: "",
    },

    /*
     * Gift card used for the order
     */
    giftCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GiftCard",
      default: null,
    },

    giftCardAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
     * Payment information
     */
    payment: {
      type: paymentSchema,
      required: true,
    },

    /*
     * Order status
     */
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
      index: true,
    },

    /*
     * Delivery information
     */
    trackingNumber: {
      type: String,
      trim: true,
      default: "",
    },

    estimatedDeliveryDate: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    /*
     * Cancellation information
     */
    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Automatically calculate each item's total
 * and order subtotal before validation.
 */
orderSchema.pre("validate", function (next) {
  if (this.items && this.items.length > 0) {
    this.items.forEach((item) => {
      item.total = item.price * item.quantity;
    });

    this.subtotal = this.items.reduce(
      (sum, item) => sum + item.total,
      0
    );
  }

  const discount = this.discount || 0;
  const shippingCharge = this.shippingCharge || 0;
  const tax = this.tax || 0;

  this.totalAmount = Math.max(
    0,
    this.subtotal - discount + shippingCharge + tax
  );

  next();
});

module.exports = mongoose.model("Order", orderSchema);