const mongoose = require("mongoose");

const HeroSlide = require("../models/HeroSlide");

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

/*
 * ---------------------------------------------------------
 * GET /api/hero-slides
 *
 * Get all hero slides (Admin)
 * ---------------------------------------------------------
 */
async function list(req, res) {
  const slides = await HeroSlide.find().sort({ order: 1, createdAt: 1 });

  res.json({
    slides,
  });
}

/*
 * ---------------------------------------------------------
 * GET /api/hero-slides/active
 *
 * Get currently active, publicly visible hero slides
 * ---------------------------------------------------------
 */
async function getActiveSlides(req, res) {
  const slides = await HeroSlide.find({ isActive: true }).sort({
    order: 1,
    createdAt: 1,
  });

  res.json({
    slides,
  });
}

/*
 * ---------------------------------------------------------
 * GET /api/hero-slides/:id
 * ---------------------------------------------------------
 */
async function getOne(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid hero slide ID",
    });
  }

  const slide = await HeroSlide.findById(id);

  if (!slide) {
    return res.status(404).json({
      message: "Hero slide not found",
    });
  }

  res.json(slide);
}

/*
 * ---------------------------------------------------------
 * POST /api/hero-slides
 *
 * Create a hero slide (Admin)
 * ---------------------------------------------------------
 */
async function create(req, res) {
  const { bgImage, card } = req.body;

  if (!bgImage || !bgImage.trim()) {
    return res.status(400).json({
      message: "Slide background image is required",
    });
  }

  if (!card || !card.title || !card.title.trim()) {
    return res.status(400).json({
      message: "Slide card title is required",
    });
  }

  const slide = await HeroSlide.create(req.body);

  res.status(201).json({
    message: "Hero slide created successfully",
    slide,
  });
}

/*
 * ---------------------------------------------------------
 * PUT /api/hero-slides/:id
 *
 * Update a hero slide (Admin)
 * ---------------------------------------------------------
 */
async function update(req, res) {
  const { id } = req.params;

  const updatableFields = [
    "bgImage",
    "bgAlt",
    "imageOnly",
    "membership",
    "quiz",
    "showPromotions",
    "tag",
    "badge",
    "titleLines",
    "description",
    "primaryCta",
    "secondaryCta",
    "targetPage",
    "card",
    "order",
    "isActive",
  ];

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid hero slide ID",
    });
  }

  const slide = await HeroSlide.findById(id);

  if (!slide) {
    return res.status(404).json({
      message: "Hero slide not found",
    });
  }

  for (const field of updatableFields) {
    if (req.body[field] !== undefined) {
      slide[field] = req.body[field];
    }
  }

  await slide.save();

  res.json({
    message: "Hero slide updated successfully",
    slide,
  });
}

/*
 * ---------------------------------------------------------
 * PATCH /api/hero-slides/:id/status
 *
 * Activate / deactivate a hero slide (Admin)
 * ---------------------------------------------------------
 */
async function updateStatus(req, res) {
  const { id } = req.params;
  const { isActive } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid hero slide ID",
    });
  }

  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      message: "isActive must be a boolean value",
    });
  }

  const slide = await HeroSlide.findByIdAndUpdate(
    id,
    { isActive },
    { new: true, runValidators: true }
  );

  if (!slide) {
    return res.status(404).json({
      message: "Hero slide not found",
    });
  }

  res.json({
    message: "Hero slide status updated successfully",
    slide,
  });
}

/*
 * ---------------------------------------------------------
 * DELETE /api/hero-slides/:id
 *
 * Delete a hero slide (Admin)
 * ---------------------------------------------------------
 */
async function remove(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid hero slide ID",
    });
  }

  const slide = await HeroSlide.findByIdAndDelete(id);

  if (!slide) {
    return res.status(404).json({
      message: "Hero slide not found",
    });
  }

  res.json({
    message: "Hero slide deleted successfully",
  });
}

module.exports = {
  list,
  getActiveSlides,
  getOne,
  create,
  update,
  updateStatus,
  remove,
};
