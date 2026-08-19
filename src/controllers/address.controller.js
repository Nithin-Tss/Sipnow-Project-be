const Address = require("../models/Address");

// @desc    Get all addresses for the logged in user
// @route   GET /api/addresses
// @access  Private
async function getAddresses(req, res) {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Get address by ID
// @route   GET /api/addresses/:id
// @access  Private
async function getAddressById(req, res) {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Create new address
// @route   POST /api/addresses
// @access  Private
async function createAddress(req, res) {
  try {
    const {
      label,
      fullName,
      phone,
      address,
      apartment,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    if (!address || !city) {
      return res
        .status(400)
        .json({ message: "Street address and city/suburb are required" });
    }

    const existingCount = await Address.countDocuments({ user: req.user._id });
    const shouldBeDefault = existingCount === 0 || Boolean(isDefault);

    if (shouldBeDefault && existingCount > 0) {
      await Address.updateMany(
        { user: req.user._id },
        { isDefault: false }
      );
    }

    const newAddress = await Address.create({
      user: req.user._id,
      label: label || "Home",
      fullName: fullName || req.user.name,
      phone: phone || req.user.phone,
      address,
      apartment,
      city,
      state,
      postalCode,
      country: country || "Australia",
      isDefault: shouldBeDefault,
    });

    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Update an existing address
// @route   PUT /api/addresses/:id
// @access  Private
async function updateAddress(req, res) {
  try {
    const existing = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!existing) {
      return res.status(404).json({ message: "Address not found" });
    }

    const {
      label,
      fullName,
      phone,
      address,
      apartment,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    if (isDefault) {
      await Address.updateMany(
        { user: req.user._id },
        { isDefault: false }
      );
    }

    if (label !== undefined) existing.label = label;
    if (fullName !== undefined) existing.fullName = fullName;
    if (phone !== undefined) existing.phone = phone;
    if (address !== undefined) existing.address = address;
    if (apartment !== undefined) existing.apartment = apartment;
    if (city !== undefined) existing.city = city;
    if (state !== undefined) existing.state = state;
    if (postalCode !== undefined) existing.postalCode = postalCode;
    if (country !== undefined) existing.country = country;
    if (isDefault !== undefined) existing.isDefault = Boolean(isDefault);

    const updated = await existing.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Delete an address
// @route   DELETE /api/addresses/:id
// @access  Private
async function deleteAddress(req, res) {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (address.isDefault) {
      const remainingAddress = await Address.findOne({ user: req.user._id });
      if (remainingAddress) {
        remainingAddress.isDefault = true;
        await remainingAddress.save();
      }
    }

    res.json({ message: "Address removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Set address as default
// @route   PATCH /api/addresses/:id/default
// @access  Private
async function setDefaultAddress(req, res) {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    await Address.updateMany(
      { user: req.user._id },
      { isDefault: false }
    );

    address.isDefault = true;
    await address.save();

    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
