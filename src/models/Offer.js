const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    code: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true,
    },

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    minimumPurchase: {
      type: Number,
      default: 0,
      min: 0,
    },

    maximumDiscount: {
      type: Number,
      default: null,
      min: 0,
    },

    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },

    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Validate percentage discounts.
 */
offerSchema.pre("validate", function () {
  if (
    this.discountType === "percentage" &&
    this.discountValue > 100
  ) {
    throw new Error("Percentage discount cannot exceed 100");
  }

  if (
    this.startDate &&
    this.endDate &&
    this.startDate > this.endDate
  ) {
    throw new Error("Start date cannot be after end date");
  }
});

/*
 * Automatically deactivate expired offers when
 * checking whether the offer is active.
 */
offerSchema.methods.isCurrentlyActive = function () {
  const now = new Date();

  if (!this.isActive) {
    return false;
  }

  if (this.startDate && now < this.startDate) {
    return false;
  }

  if (this.endDate && now > this.endDate) {
    return false;
  }

  return true;
};

module.exports = mongoose.model("Offer", offerSchema);