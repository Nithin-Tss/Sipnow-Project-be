const mongoose = require("mongoose");

const giftCardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    code: {
      type: String,
      required: [true, "Gift card code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    balance: {
      type: Number,
      required: [true, "Balance is required"],
      min: [0, "Balance cannot be negative"],
    },
    recipientName: {
      type: String,
      required: [true, "Recipient name is required"],
      trim: true,
    },
    recipientEmail: {
      type: String,
      required: [true, "Recipient email is required"],
      lowercase: true,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isRedeemed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GiftCard", giftCardSchema);
