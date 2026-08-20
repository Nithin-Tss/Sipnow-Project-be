const mongoose = require("mongoose");

const Brand = require("../models/Brand");

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
 * Helper: Turn a brand name into a URL-safe slug
 * ---------------------------------------------------------
 */
function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/*
 * ---------------------------------------------------------
 * GET /api/brands
 *
 * Public callers only see active brands.
 * Admins may pass ?all=true to include inactive brands.
 * ---------------------------------------------------------
 */
async function list(req, res) {
  const { all } = req.query;

  const filter = {};

  if (!(req.user?.role === "admin" && all === "true")) {
    filter.isActive = true;
  }

  const brands = await Brand.find(filter).sort({
    name: 1,
  });

  res.json({
    brands,
  });
}

/*
 * ---------------------------------------------------------
 * GET /api/brands/:id
 * ---------------------------------------------------------
 */
async function getOne(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid brand ID",
    });
  }

  const brand = await Brand.findById(id);

  if (!brand) {
    return res.status(404).json({
      message: "Brand not found",
    });
  }

  res.json(brand);
}

/*
 * ---------------------------------------------------------
 * POST /api/brands
 *
 * Create a brand (Admin)
 * ---------------------------------------------------------
 */
async function create(req, res) {
  const {
    name,
    description = "",
    logo = "",
    isActive = true,
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: "Brand name is required",
    });
  }

  const slug = slugify(name);

  const existing = await Brand.findOne({
    $or: [{ name: name.trim() }, { slug }],
  });

  if (existing) {
    return res.status(409).json({
      message: "A brand with this name already exists",
    });
  }

  const brand = await Brand.create({
    name: name.trim(),
    slug,
    description,
    logo,
    isActive,
  });

  res.status(201).json({
    message: "Brand created successfully",
    brand,
  });
}

/*
 * ---------------------------------------------------------
 * PUT /api/brands/:id
 *
 * Update a brand (Admin)
 * ---------------------------------------------------------
 */
async function update(req, res) {
  const { id } = req.params;

  const { name, description, logo, isActive } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid brand ID",
    });
  }

  const brand = await Brand.findById(id);

  if (!brand) {
    return res.status(404).json({
      message: "Brand not found",
    });
  }

  if (name !== undefined) {
    if (!name.trim()) {
      return res.status(400).json({
        message: "Brand name cannot be empty",
      });
    }

    const slug = slugify(name);

    const duplicate = await Brand.findOne({
      _id: { $ne: id },
      $or: [{ name: name.trim() }, { slug }],
    });

    if (duplicate) {
      return res.status(409).json({
        message: "A brand with this name already exists",
      });
    }

    brand.name = name.trim();
    brand.slug = slug;
  }

  if (description !== undefined) brand.description = description;
  if (logo !== undefined) brand.logo = logo;
  if (isActive !== undefined) brand.isActive = Boolean(isActive);

  await brand.save();

  res.json({
    message: "Brand updated successfully",
    brand,
  });
}

/*
 * ---------------------------------------------------------
 * PATCH /api/brands/:id/status
 *
 * Activate / deactivate a brand (Admin)
 * ---------------------------------------------------------
 */
async function updateStatus(req, res) {
  const { id } = req.params;
  const { isActive } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid brand ID",
    });
  }

  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      message: "isActive must be a boolean value",
    });
  }

  const brand = await Brand.findByIdAndUpdate(
    id,
    { isActive },
    { new: true, runValidators: true }
  );

  if (!brand) {
    return res.status(404).json({
      message: "Brand not found",
    });
  }

  res.json({
    message: "Brand status updated successfully",
    brand,
  });
}

/*
 * ---------------------------------------------------------
 * DELETE /api/brands/:id
 *
 * Delete a brand (Admin)
 * ---------------------------------------------------------
 */
async function remove(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid brand ID",
    });
  }

  const brand = await Brand.findByIdAndDelete(id);

  if (!brand) {
    return res.status(404).json({
      message: "Brand not found",
    });
  }

  res.json({
    message: "Brand deleted successfully",
  });
}

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
  updateStatus,
};
