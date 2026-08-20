const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
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

    /*
     * Promotion type
     */
    type: {
      type: String,
      enum: [
        "general",
        "product",
        "category",
        "brand",
        "seasonal",
        "member",
        "clearance",
      ],
      default: "general",
    },

    /*
     * Promotional banner/image
     */
    image: {
      type: String,
      trim: true,
      default: "",
    },

    bannerImage: {
      type: String,
      trim: true,
      default: "",
    },

    /*
     * Optional link used by the frontend
     */
    link: {
      type: String,
      trim: true,
      default: "",
    },

    /*
     * Optional display copy for banner-style promotion cards
     */
    ctaText: {
      type: String,
      trim: true,
      default: "",
    },

    validityLabel: {
      type: String,
      trim: true,
      default: "",
    },

    /*
     * Products included in the promotion
     */
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    /*
     * Categories included in the promotion
     */
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    /*
     * Brands included in the promotion
     */
    brands: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
      },
    ],

    /*
     * Optional discount information
     */
    discountType: {
      type: String,
      enum: ["percentage", "fixed", "none"],
      default: "none",
    },

    discountValue: {
      type: Number,
      min: 0,
      default: 0,
    },

    /*
     * Promotion validity
     */
    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },

    /*
     * Display ordering
     */
    priority: {
      type: Number,
      default: 0,
    },

    /*
     * Whether the promotion is visible
     */
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
 * Validate discount values and dates.
 */
promotionSchema.pre("validate", function () {
  if (
    this.discountType === "percentage" &&
    this.discountValue > 100
  ) {
    throw new Error("Percentage discount cannot exceed 100");
  }

  if (
    this.discountType === "none"
  ) {
    this.discountValue = 0;
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
 * Check whether the promotion is currently active.
 */
promotionSchema.methods.isCurrentlyActive = function () {
  const now = new Date();

  if (!this.isActive) {
    return false;
  }

  if (
    this.startDate &&
    now < this.startDate
  ) {
    return false;
  }

  if (
    this.endDate &&
    now > this.endDate
  ) {
    return false;
  }

  return true;
};

module.exports = mongoose.model(
  "Promotion",
  promotionSchema
);