const mongoose = require("mongoose");

const inStorePromotionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    displayOrder: {
      type: Number,
      default: 1,
    },
    promoLabel: {
      type: String,
      default: "In-store only",
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed", "none"],
      default: "none",
    },
    discountValue: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InStorePromotion", inStorePromotionSchema);
