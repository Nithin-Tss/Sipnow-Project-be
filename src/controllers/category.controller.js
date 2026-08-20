const mongoose = require("mongoose");

const Category = require("../models/Category");

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
 * Helper: Turn a category name into a URL-safe slug
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
 * GET /api/categories
 *
 * Public callers only see active categories.
 * Admins may pass ?all=true to include inactive categories.
 * ---------------------------------------------------------
 */
async function list(req, res) {
  const { all } = req.query;

  const filter = {};

  if (!(req.user?.role === "admin" && all === "true")) {
    filter.isActive = true;
  }

  const categories = await Category.find(filter).sort({
    name: 1,
  });

  res.json({
    categories,
  });
}

/*
 * ---------------------------------------------------------
 * GET /api/categories/:id
 * ---------------------------------------------------------
 */
async function getOne(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid category ID",
    });
  }

  const category = await Category.findById(id);

  if (!category) {
    return res.status(404).json({
      message: "Category not found",
    });
  }

  res.json(category);
}

/*
 * ---------------------------------------------------------
 * POST /api/categories
 *
 * Create a category (Admin)
 * ---------------------------------------------------------
 */
async function create(req, res) {
  const {
    name,
    description = "",
    image = "",
    isActive = true,
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: "Category name is required",
    });
  }

  const slug = slugify(name);

  const existing = await Category.findOne({
    $or: [{ name: name.trim() }, { slug }],
  });

  if (existing) {
    return res.status(409).json({
      message: "A category with this name already exists",
    });
  }

  const category = await Category.create({
    name: name.trim(),
    slug,
    description,
    image,
    isActive,
  });

  res.status(201).json({
    message: "Category created successfully",
    category,
  });
}

/*
 * ---------------------------------------------------------
 * PUT /api/categories/:id
 *
 * Update a category (Admin)
 * ---------------------------------------------------------
 */
async function update(req, res) {
  const { id } = req.params;

  const { name, description, image, isActive } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid category ID",
    });
  }

  const category = await Category.findById(id);

  if (!category) {
    return res.status(404).json({
      message: "Category not found",
    });
  }

  if (name !== undefined) {
    if (!name.trim()) {
      return res.status(400).json({
        message: "Category name cannot be empty",
      });
    }

    const slug = slugify(name);

    const duplicate = await Category.findOne({
      _id: { $ne: id },
      $or: [{ name: name.trim() }, { slug }],
    });

    if (duplicate) {
      return res.status(409).json({
        message: "A category with this name already exists",
      });
    }

    category.name = name.trim();
    category.slug = slug;
  }

  if (description !== undefined) category.description = description;
  if (image !== undefined) category.image = image;
  if (isActive !== undefined) category.isActive = Boolean(isActive);

  await category.save();

  res.json({
    message: "Category updated successfully",
    category,
  });
}

/*
 * ---------------------------------------------------------
 * PATCH /api/categories/:id/status
 *
 * Activate / deactivate a category (Admin)
 * ---------------------------------------------------------
 */
async function updateStatus(req, res) {
  const { id } = req.params;
  const { isActive } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid category ID",
    });
  }

  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      message: "isActive must be a boolean value",
    });
  }

  const category = await Category.findByIdAndUpdate(
    id,
    { isActive },
    { new: true, runValidators: true }
  );

  if (!category) {
    return res.status(404).json({
      message: "Category not found",
    });
  }

  res.json({
    message: "Category status updated successfully",
    category,
  });
}

/*
 * ---------------------------------------------------------
 * DELETE /api/categories/:id
 *
 * Delete a category (Admin)
 * ---------------------------------------------------------
 */
async function remove(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid category ID",
    });
  }

  const category = await Category.findByIdAndDelete(id);

  if (!category) {
    return res.status(404).json({
      message: "Category not found",
    });
  }

  res.json({
    message: "Category deleted successfully",
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
