const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, default: "" },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    categoryGroup: {
      type: String,
      enum: ["wine", "spirits", "beer", "offers"],
      default: "wine",
    },
    brand: { type: String, default: "" },
    maker: { type: String, default: "" },
    country: { type: String, default: "" },
    region: { type: String, default: "" },

    price: { type: Number, required: true, min: 0 },
    offerPrice: { type: Number, default: 0, min: 0 },
    membersPrice: { type: Number, default: 0, min: 0 },
    clearancePrice: { type: Number, default: 0, min: 0 },
    packOf: { type: Number, default: 0, min: 0 },
    packPrice: { type: Number, default: 0, min: 0 },
    caseOf: { type: Number, default: 0, min: 0 },
    casePrice: { type: Number, default: 0, min: 0 },

    image: { type: String, default: "" },
    inStock: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 0, min: 0 },

    volumeMl: { type: Number, default: 0, min: 0 },
    abv: { type: String, default: "" },
    vintage: { type: String, default: "" },
    wineBody: { type: String, default: "" },
    sweetness: { type: String, default: "" },
    grapeVariety: { type: String, default: "" },
    closure: { type: String, default: "" },

    description: { type: String, default: "" },
    flavorNotes: { type: String, default: "" },
    aroma: { type: String, default: "" },
    ingredients: { type: String, default: "" },
    storageInstructions: { type: String, default: "" },
    foodRecommendations: { type: String, default: "" },

    verified: { type: Boolean, default: false },
    verificationEmail: { type: String, default: "" },

    // Derived display fields consumed by the storefront frontend.
    manufacturer: { type: String, default: "" },
    origin: { type: String, default: "" },
    volume: { type: String, default: "" },
  },
  { timestamps: true },
);

function deriveDisplayFields(data) {
  if (data.maker !== undefined) data.manufacturer = data.maker;
  if (data.country !== undefined || data.region !== undefined) {
    data.origin = [data.country, data.region].filter(Boolean).join(", ");
  }
  if (data.volumeMl !== undefined) {
    data.volume = data.volumeMl ? `${data.volumeMl}mL` : "";
  }
}

productSchema.pre("save", function (next) {
  deriveDisplayFields(this);
  next();
});

productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  deriveDisplayFields(update);
  next();
});

module.exports = mongoose.model("Product", productSchema);
