const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    /*
     * Product being reviewed
     */
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    /*
     * Author of the review
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    title: {
      type: String,
      trim: true,
      default: "",
    },

    comment: {
      type: String,
      required: true,
      trim: true,
    },

    /*
     * Moderation status
     */
    status: {
      type: String,
      enum: ["pending", "approved", "hidden"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * A user may only leave one review per product.
 */
reviewSchema.index(
  { product: 1, user: 1 },
  { unique: true }
);

module.exports = mongoose.model("Review", reviewSchema);
