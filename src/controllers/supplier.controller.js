const mongoose = require("mongoose");

const Supplier = require("../models/Supplier");

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

/*
 * ---------------------------------------------------------
 * GET /api/suppliers
 *
 * Get all suppliers (Admin)
 * ---------------------------------------------------------
 */
async function list(req, res) {
  const suppliers = await Supplier.find().sort({ name: 1 });

  res.json({
    suppliers,
  });
}

/*
 * ---------------------------------------------------------
 * GET /api/suppliers/:id
 * ---------------------------------------------------------
 */
async function getOne(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid supplier ID",
    });
  }

  const supplier = await Supplier.findById(id);

  if (!supplier) {
    return res.status(404).json({
      message: "Supplier not found",
    });
  }

  res.json(supplier);
}

/*
 * ---------------------------------------------------------
 * POST /api/suppliers
 *
 * Create a supplier (Admin)
 * ---------------------------------------------------------
 */
async function create(req, res) {
  const {
    name,
    contactEmail = "",
    phone = "",
    region = "",
    isActive = true,
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: "Supplier name is required",
    });
  }

  const supplier = await Supplier.create({
    name: name.trim(),
    contactEmail,
    phone,
    region,
    isActive,
  });

  res.status(201).json({
    message: "Supplier created successfully",
    supplier,
  });
}

/*
 * ---------------------------------------------------------
 * PUT /api/suppliers/:id
 *
 * Update a supplier (Admin)
 * ---------------------------------------------------------
 */
async function update(req, res) {
  const { id } = req.params;

  const { name, contactEmail, phone, region, isActive } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid supplier ID",
    });
  }

  const supplier = await Supplier.findById(id);

  if (!supplier) {
    return res.status(404).json({
      message: "Supplier not found",
    });
  }

  if (name !== undefined) {
    if (!name.trim()) {
      return res.status(400).json({
        message: "Supplier name cannot be empty",
      });
    }

    supplier.name = name.trim();
  }

  if (contactEmail !== undefined) supplier.contactEmail = contactEmail;
  if (phone !== undefined) supplier.phone = phone;
  if (region !== undefined) supplier.region = region;
  if (isActive !== undefined) supplier.isActive = Boolean(isActive);

  await supplier.save();

  res.json({
    message: "Supplier updated successfully",
    supplier,
  });
}

/*
 * ---------------------------------------------------------
 * DELETE /api/suppliers/:id
 *
 * Delete a supplier (Admin)
 * ---------------------------------------------------------
 */
async function remove(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid supplier ID",
    });
  }

  const supplier = await Supplier.findByIdAndDelete(id);

  if (!supplier) {
    return res.status(404).json({
      message: "Supplier not found",
    });
  }

  res.json({
    message: "Supplier deleted successfully",
  });
}

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
};
