const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    categoryGroup: {
      type: String,
      enum: ["wine", "spirits", "beer", "offers"],
      default: "wine",
    },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    inStock: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 0, min: 0 },
    abv: { type: String, default: "" },
    volume: { type: String, default: "" },
    manufacturer: { type: String, default: "" },
    brand: { type: String, default: "" },
    origin: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
