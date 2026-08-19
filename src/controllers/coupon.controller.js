const Coupon = require("../models/Coupon");

// @desc    Validate and apply coupon code
// @route   POST /api/coupons/validate or POST /api/coupons/apply
// @access  Public
async function validateCoupon(req, res) {
  try {
    const { code, subtotal = 0 } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid or expired coupon code" });
    }

    if (!coupon.active) {
      return res.status(400).json({ message: "This coupon is no longer active" });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ message: "This coupon has expired" });
    }

    if (subtotal < coupon.minPurchase) {
      return res.status(400).json({
        message: `Minimum purchase amount of $${coupon.minPurchase} is required for this coupon`,
      });
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit has been reached" });
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }

    res.json({
      valid: true,
      message: `Coupon ${coupon.code} applied successfully`,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Number(discountAmount.toFixed(2)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
async function getAllCoupons(req, res) {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Get coupon by ID (Admin)
// @route   GET /api/coupons/:id
// @access  Private/Admin
async function getCouponById(req, res) {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Create new coupon (Admin)
// @route   POST /api/coupons
// @access  Private/Admin
async function createCoupon(req, res) {
  try {
    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      expiresAt,
      active,
      usageLimit,
    } = req.body;

    if (!code || discountValue === undefined) {
      return res
        .status(400)
        .json({ message: "Coupon code and discount value are required" });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(409).json({ message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code: cleanCode,
      discountType: discountType || "percentage",
      discountValue,
      minPurchase: minPurchase || 0,
      maxDiscount,
      expiresAt,
      active: active !== undefined ? Boolean(active) : true,
      usageLimit: usageLimit !== undefined ? usageLimit : null,
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Update an existing coupon (Admin)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
async function updateCoupon(req, res) {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      expiresAt,
      active,
      usageLimit,
      usedCount,
    } = req.body;

    if (code !== undefined) {
      const cleanCode = code.trim().toUpperCase();
      const existing = await Coupon.findOne({
        code: cleanCode,
        _id: { $ne: coupon._id },
      });
      if (existing) {
        return res.status(409).json({ message: "Coupon code already exists" });
      }
      coupon.code = cleanCode;
    }

    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (minPurchase !== undefined) coupon.minPurchase = minPurchase;
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
    if (expiresAt !== undefined) coupon.expiresAt = expiresAt;
    if (active !== undefined) coupon.active = Boolean(active);
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (usedCount !== undefined) coupon.usedCount = usedCount;

    const updated = await coupon.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Delete a coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
async function deleteCoupon(req, res) {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  validateCoupon,
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
