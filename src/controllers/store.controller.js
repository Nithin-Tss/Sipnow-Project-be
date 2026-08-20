const mongoose = require("mongoose");

const Store = require("../models/Store");

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
 * GET /api/stores
 *
 * Public callers only see active stores.
 * Admins may pass ?all=true to include inactive stores.
 * ---------------------------------------------------------
 */
async function list(req, res) {
  const { all } = req.query;

  const filter = {};

  if (!(req.user?.role === "admin" && all === "true")) {
    filter.isActive = true;
  }

  const stores = await Store.find(filter).sort({
    name: 1,
  });

  res.json({
    stores,
  });
}

/*
 * ---------------------------------------------------------
 * GET /api/stores/:id
 * ---------------------------------------------------------
 */
async function getOne(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid store ID",
    });
  }

  const store = await Store.findById(id);

  if (!store) {
    return res.status(404).json({
      message: "Store not found",
    });
  }

  res.json(store);
}

/*
 * ---------------------------------------------------------
 * POST /api/stores
 *
 * Create a store (Admin)
 * ---------------------------------------------------------
 */
async function create(req, res) {
  const {
    name,
    address,
    phone = "",
    email = "",
    openingHours = [],
    deliveryRadiusKm = 0,
    isActive = true,
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: "Store name is required",
    });
  }

  if (
    !address ||
    !address.addressLine1 ||
    !address.city ||
    !address.state ||
    !address.postalCode
  ) {
    return res.status(400).json({
      message: "A complete store address is required",
    });
  }

  const store = await Store.create({
    name: name.trim(),
    address,
    phone,
    email,
    openingHours,
    deliveryRadiusKm,
    isActive,
  });

  res.status(201).json({
    message: "Store created successfully",
    store,
  });
}

/*
 * ---------------------------------------------------------
 * PUT /api/stores/:id
 *
 * Update a store (Admin)
 * ---------------------------------------------------------
 */
async function update(req, res) {
  const { id } = req.params;

  const {
    name,
    address,
    phone,
    email,
    openingHours,
    deliveryRadiusKm,
    isActive,
  } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid store ID",
    });
  }

  const store = await Store.findById(id);

  if (!store) {
    return res.status(404).json({
      message: "Store not found",
    });
  }

  if (name !== undefined) store.name = name.trim();
  if (address !== undefined) store.address = address;
  if (phone !== undefined) store.phone = phone;
  if (email !== undefined) store.email = email;
  if (openingHours !== undefined) store.openingHours = openingHours;
  if (deliveryRadiusKm !== undefined) store.deliveryRadiusKm = deliveryRadiusKm;
  if (isActive !== undefined) store.isActive = Boolean(isActive);

  await store.save();

  res.json({
    message: "Store updated successfully",
    store,
  });
}

/*
 * ---------------------------------------------------------
 * PATCH /api/stores/:id/status
 *
 * Activate / deactivate a store (Admin)
 * ---------------------------------------------------------
 */
async function updateStatus(req, res) {
  const { id } = req.params;
  const { isActive } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid store ID",
    });
  }

  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      message: "isActive must be a boolean value",
    });
  }

  const store = await Store.findByIdAndUpdate(
    id,
    { isActive },
    { new: true }
  );

  if (!store) {
    return res.status(404).json({
      message: "Store not found",
    });
  }

  res.json({
    message: "Store status updated successfully",
    store,
  });
}

/*
 * ---------------------------------------------------------
 * DELETE /api/stores/:id
 *
 * Delete a store (Admin)
 * ---------------------------------------------------------
 */
async function remove(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid store ID",
    });
  }

  const store = await Store.findByIdAndDelete(id);

  if (!store) {
    return res.status(404).json({
      message: "Store not found",
    });
  }

  res.json({
    message: "Store deleted successfully",
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
