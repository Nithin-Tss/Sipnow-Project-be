const mongoose = require("mongoose");

const Promotion = require("../models/Promotion");

/*
 * ---------------------------------------------------------
 * Helper: Check whether a value is a valid MongoDB ObjectId
 * ---------------------------------------------------------
 */
function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

/*
 * ---------------------------------------------------------
 * GET /api/promotions
 *
 * Get all promotions (Admin)
 * ---------------------------------------------------------
 */
async function list(req, res) {
  const promotions = await Promotion.find()
    .populate("products", "name image price")
    .populate("categories")
    .populate("brands")
    .sort({ priority: -1, createdAt: -1 });

  res.json({
    promotions,
  });
}

/*
 * ---------------------------------------------------------
 * GET /api/promotions/active
 *
 * Get currently active, publicly visible promotions
 * ---------------------------------------------------------
 */
async function getActivePromotions(req, res) {
  const now = new Date();

  const promotions = await Promotion.find({
    isActive: true,
    $and: [
      {
        $or: [
          { startDate: null },
          { startDate: { $lte: now } },
        ],
      },
      {
        $or: [
          { endDate: null },
          { endDate: { $gte: now } },
        ],
      },
    ],
  })
    .populate("products", "name image price")
    .populate("categories")
    .populate("brands")
    .sort({ priority: -1, createdAt: -1 });

  res.json({
    promotions,
  });
}

/*
 * ---------------------------------------------------------
 * GET /api/promotions/:id
 * ---------------------------------------------------------
 */
async function getOne(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid promotion ID",
    });
  }

  const promotion = await Promotion.findById(id)
    .populate("products", "name image price")
    .populate("categories")
    .populate("brands");

  if (!promotion) {
    return res.status(404).json({
      message: "Promotion not found",
    });
  }

  res.json(promotion);
}

/*
 * ---------------------------------------------------------
 * POST /api/promotions
 *
 * Create a promotion (Admin)
 * ---------------------------------------------------------
 */
async function create(req, res) {
  const {
    title,
    description = "",
    type = "general",
    image = "",
    bannerImage = "",
    link = "",
    ctaText = "",
    validityLabel = "",
    products = [],
    categories = [],
    brands = [],
    discountType = "none",
    discountValue = 0,
    startDate = null,
    endDate = null,
    priority = 0,
    isActive = true,
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      message: "Promotion title is required",
    });
  }

  const promotion = await Promotion.create({
    title: title.trim(),
    description,
    type,
    image,
    bannerImage,
    link,
    ctaText,
    validityLabel,
    products,
    categories,
    brands,
    discountType,
    discountValue,
    startDate,
    endDate,
    priority,
    isActive,
  });

  res.status(201).json({
    message: "Promotion created successfully",
    promotion,
  });
}

/*
 * ---------------------------------------------------------
 * PUT /api/promotions/:id
 *
 * Update a promotion (Admin)
 * ---------------------------------------------------------
 */
async function update(req, res) {
  const { id } = req.params;

  const updatableFields = [
    "title",
    "description",
    "type",
    "image",
    "bannerImage",
    "link",
    "ctaText",
    "validityLabel",
    "products",
    "categories",
    "brands",
    "discountType",
    "discountValue",
    "startDate",
    "endDate",
    "priority",
    "isActive",
  ];

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid promotion ID",
    });
  }

  const promotion = await Promotion.findById(id);

  if (!promotion) {
    return res.status(404).json({
      message: "Promotion not found",
    });
  }

  for (const field of updatableFields) {
    if (req.body[field] !== undefined) {
      promotion[field] = req.body[field];
    }
  }

  await promotion.save();

  res.json({
    message: "Promotion updated successfully",
    promotion,
  });
}

/*
 * ---------------------------------------------------------
 * PATCH /api/promotions/:id/status
 *
 * Activate / deactivate a promotion (Admin)
 * ---------------------------------------------------------
 */
async function updateStatus(req, res) {
  const { id } = req.params;
  const { isActive } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid promotion ID",
    });
  }

  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      message: "isActive must be a boolean value",
    });
  }

  const promotion = await Promotion.findByIdAndUpdate(
    id,
    { isActive },
    { new: true, runValidators: true }
  );

  if (!promotion) {
    return res.status(404).json({
      message: "Promotion not found",
    });
  }

  res.json({
    message: "Promotion status updated successfully",
    promotion,
  });
}

/*
 * ---------------------------------------------------------
 * DELETE /api/promotions/:id
 *
 * Delete a promotion (Admin)
 * ---------------------------------------------------------
 */
async function remove(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid promotion ID",
    });
  }

  const promotion = await Promotion.findByIdAndDelete(id);

  if (!promotion) {
    return res.status(404).json({
      message: "Promotion not found",
    });
  }

  res.json({
    message: "Promotion deleted successfully",
  });
}

module.exports = {
  list,
  getActivePromotions,
  getOne,
  create,
  update,
  updateStatus,
  remove,
};
