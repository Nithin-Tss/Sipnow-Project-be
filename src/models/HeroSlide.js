const mongoose = require("mongoose");

const heroSlideSchema = new mongoose.Schema(
  {
    bgImage: {
      type: String,
      required: true,
      trim: true,
    },

    bgAlt: {
      type: String,
      trim: true,
      default: "",
    },

    imageOnly: {
      type: Boolean,
      default: false,
    },

    membership: {
      type: Boolean,
      default: false,
    },

    quiz: {
      type: Boolean,
      default: false,
    },

    showPromotions: {
      type: Boolean,
      default: false,
    },

    tag: {
      type: String,
      trim: true,
      default: "",
    },

    badge: {
      type: String,
      trim: true,
      default: "",
    },

    titleLines: {
      type: [String],
      default: [],
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    primaryCta: {
      type: String,
      trim: true,
      default: "",
    },

    secondaryCta: {
      type: String,
      trim: true,
      default: "",
    },

    targetPage: {
      type: String,
      trim: true,
      default: "",
    },

    card: {
      image: { type: String, trim: true, default: "" },
      tag: { type: String, trim: true, default: "" },
      title: { type: String, trim: true, required: true },
    },

    order: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("HeroSlide", heroSlideSchema);
