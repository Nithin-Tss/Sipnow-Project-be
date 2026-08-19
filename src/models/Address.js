const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    label: {
      type: String,
      trim: true,
      default: "Home",
    },
    fullName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Street address is required"],
      trim: true,
    },
    apartment: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City/Suburb is required"],
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      default: "Australia",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

addressSchema.methods.formattedAddress = function formattedAddress() {
  const parts = [
    this.apartment ? `${this.apartment}, ${this.address}` : this.address,
    this.city,
    this.state,
    this.postalCode,
    this.country,
  ].filter(Boolean);
  return parts.join(", ");
};

module.exports = mongoose.model("Address", addressSchema);
