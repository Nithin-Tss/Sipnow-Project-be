const Coupon = require("../models/Coupon");

function calculateCouponDiscount(
  coupon,
  subtotal
) {
  let discountAmount = 0;

  if (
    coupon.discountType === "percentage"
  ) {
    discountAmount =
      (subtotal *
        Number(coupon.discountValue)) /
      100;

    if (
      coupon.maxDiscount !== null &&
      coupon.maxDiscount !== undefined &&
      discountAmount >
        Number(coupon.maxDiscount)
    ) {
      discountAmount =
        Number(coupon.maxDiscount);
    }
  } else {
    discountAmount = Math.min(
      Number(coupon.discountValue),
      subtotal
    );
  }

  return Number(
    Math.max(discountAmount, 0).toFixed(2)
  );
}


// ============================================================
// CUSTOMER - VALIDATE COUPON
// POST /api/coupons/validate
// ============================================================

async function validateCoupon(req, res) {
  try {
    const {
      code,
      subtotal = 0,
    } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        valid: false,
        message:
          "Coupon code is required",
      });
    }

    const numericSubtotal =
      Number(subtotal);

    if (
      !Number.isFinite(
        numericSubtotal
      ) ||
      numericSubtotal < 0
    ) {
      return res.status(400).json({
        valid: false,
        message: "Invalid subtotal",
      });
    }

    const cleanCode =
      code.trim().toUpperCase();

    const coupon =
      await Coupon.findOne({
        code: cleanCode,
      });

    if (!coupon) {
      return res.status(404).json({
        valid: false,
        message:
          "Invalid or expired coupon code",
      });
    }

    if (!coupon.active) {
      return res.status(400).json({
        valid: false,
        message:
          "This coupon is no longer active",
      });
    }

    if (
      coupon.expiresAt &&
      new Date(coupon.expiresAt) <
        new Date()
    ) {
      return res.status(400).json({
        valid: false,
        message:
          "This coupon has expired",
      });
    }

    if (
      numericSubtotal <
      Number(coupon.minPurchase || 0)
    ) {
      return res.status(400).json({
        valid: false,
        message: `Minimum purchase amount of $${Number(
          coupon.minPurchase || 0
        ).toFixed(
          2
        )} is required for this coupon`,
      });
    }

    if (
      coupon.usageLimit !== null &&
      coupon.usageLimit !== undefined &&
      coupon.usedCount >=
        coupon.usageLimit
    ) {
      return res.status(400).json({
        valid: false,
        message:
          "Coupon usage limit has been reached",
      });
    }

    const discountAmount =
      calculateCouponDiscount(
        coupon,
        numericSubtotal
      );

    const finalAmount =
      Number(
        Math.max(
          numericSubtotal -
            discountAmount,
          0
        ).toFixed(2)
      );

    return res.status(200).json({
      valid: true,

      message: `Coupon ${coupon.code} applied successfully`,

      coupon: {
        id: coupon._id,
        code: coupon.code,
        discountType:
          coupon.discountType,
        discountValue:
          Number(
            coupon.discountValue
          ),
        discountAmount,
      },

      subtotal: numericSubtotal,

      finalAmount,
    });
  } catch (error) {
    console.error(
      "Validate coupon error:",
      error
    );

    return res.status(500).json({
      valid: false,
      message:
        "Unable to validate coupon",
    });
  }
}


// ============================================================
// ADMIN - GET ALL COUPONS
// GET /api/coupons
// ============================================================

async function getAllCoupons(
  req,
  res
) {
  try {
    const coupons =
      await Coupon.find().sort({
        createdAt: -1,
      });

    return res.status(200).json(
      coupons
    );
  } catch (error) {
    console.error(
      "Get coupons error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to retrieve coupons",
    });
  }
}


// ============================================================
// ADMIN - GET COUPON
// GET /api/coupons/:id
// ============================================================

async function getCouponById(
  req,
  res
) {
  try {
    const coupon =
      await Coupon.findById(
        req.params.id
      );

    if (!coupon) {
      return res.status(404).json({
        message:
          "Coupon not found",
      });
    }

    return res
      .status(200)
      .json(coupon);
  } catch (error) {
    console.error(
      "Get coupon error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to retrieve coupon",
    });
  }
}


// ============================================================
// ADMIN - CREATE COUPON
// POST /api/coupons
// ============================================================

async function createCoupon(
  req,
  res
) {
  try {
    const {
      code,
      discountType = "percentage",
      discountValue,
      minPurchase = 0,
      maxDiscount = null,
      expiresAt = null,
      active = true,
      usageLimit = null,
    } = req.body;

    if (
      !code ||
      !code.trim()
    ) {
      return res.status(400).json({
        message:
          "Coupon code is required",
      });
    }

    const numericDiscountValue =
      Number(discountValue);

    const numericMinPurchase =
      Number(minPurchase);

    const numericMaxDiscount =
      maxDiscount === null ||
      maxDiscount === ""
        ? null
        : Number(maxDiscount);

    const numericUsageLimit =
      usageLimit === null ||
      usageLimit === ""
        ? null
        : Number(usageLimit);

    if (
      !Number.isFinite(
        numericDiscountValue
      ) ||
      numericDiscountValue < 0
    ) {
      return res.status(400).json({
        message:
          "A valid discount value is required",
      });
    }

    if (
      ![
        "percentage",
        "fixed",
      ].includes(
        discountType
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid discount type",
      });
    }

    if (
      discountType ===
        "percentage" &&
      numericDiscountValue > 100
    ) {
      return res.status(400).json({
        message:
          "Percentage discount cannot exceed 100%",
      });
    }

    if (
      !Number.isFinite(
        numericMinPurchase
      ) ||
      numericMinPurchase < 0
    ) {
      return res.status(400).json({
        message:
          "Invalid minimum purchase amount",
      });
    }

    if (
      numericMaxDiscount !==
        null &&
      (!Number.isFinite(
        numericMaxDiscount
      ) ||
        numericMaxDiscount < 0)
    ) {
      return res.status(400).json({
        message:
          "Invalid maximum discount amount",
      });
    }

    if (
      numericUsageLimit !==
        null &&
      (!Number.isInteger(
        numericUsageLimit
      ) ||
        numericUsageLimit < 0)
    ) {
      return res.status(400).json({
        message:
          "Invalid usage limit",
      });
    }

    const cleanCode =
      code.trim().toUpperCase();

    const existing =
      await Coupon.findOne({
        code: cleanCode,
      });

    if (existing) {
      return res.status(409).json({
        message:
          "Coupon code already exists",
      });
    }

    const coupon =
      await Coupon.create({
        code: cleanCode,

        discountType,

        discountValue:
          numericDiscountValue,

        minPurchase:
          numericMinPurchase,

        maxDiscount:
          numericMaxDiscount,

        expiresAt:
          expiresAt || null,

        active:
          Boolean(active),

        usageLimit:
          numericUsageLimit,

        usedCount: 0,
      });

    return res.status(201).json(
      coupon
    );
  } catch (error) {
    console.error(
      "Create coupon error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to create coupon",
    });
  }
}


// ============================================================
// ADMIN - UPDATE COUPON
// PUT /api/coupons/:id
// ============================================================

async function updateCoupon(
  req,
  res
) {
  try {
    const coupon =
      await Coupon.findById(
        req.params.id
      );

    if (!coupon) {
      return res.status(404).json({
        message:
          "Coupon not found",
      });
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
    } = req.body;

    if (
      code !== undefined
    ) {
      if (
        !String(code).trim()
      ) {
        return res.status(400).json({
          message:
            "Coupon code is required",
        });
      }

      const cleanCode =
        String(code)
          .trim()
          .toUpperCase();

      const existing =
        await Coupon.findOne({
          code: cleanCode,
          _id: {
            $ne: coupon._id,
          },
        });

      if (existing) {
        return res.status(409).json({
          message:
            "Coupon code already exists",
        });
      }

      coupon.code =
        cleanCode;
    }

    if (
      discountType !==
      undefined
    ) {
      if (
        ![
          "percentage",
          "fixed",
        ].includes(
          discountType
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid discount type",
        });
      }

      coupon.discountType =
        discountType;
    }

    if (
      discountValue !==
      undefined
    ) {
      const value =
        Number(discountValue);

      if (
        !Number.isFinite(value) ||
        value < 0
      ) {
        return res.status(400).json({
          message:
            "Invalid discount value",
        });
      }

      if (
        coupon.discountType ===
          "percentage" &&
        value > 100
      ) {
        return res.status(400).json({
          message:
            "Percentage discount cannot exceed 100%",
        });
      }

      coupon.discountValue =
        value;
    }

    if (
      minPurchase !==
      undefined
    ) {
      const value =
        Number(minPurchase);

      if (
        !Number.isFinite(value) ||
        value < 0
      ) {
        return res.status(400).json({
          message:
            "Invalid minimum purchase amount",
        });
      }

      coupon.minPurchase =
        value;
    }

    if (
      maxDiscount !==
      undefined
    ) {
      if (
        maxDiscount === "" ||
        maxDiscount === null
      ) {
        coupon.maxDiscount =
          null;
      } else {
        const value =
          Number(maxDiscount);

        if (
          !Number.isFinite(value) ||
          value < 0
        ) {
          return res.status(400).json({
            message:
              "Invalid maximum discount amount",
          });
        }

        coupon.maxDiscount =
          value;
      }
    }

    if (
      expiresAt !==
      undefined
    ) {
      coupon.expiresAt =
        expiresAt || null;
    }

    if (
      active !== undefined
    ) {
      coupon.active =
        Boolean(active);
    }

    if (
      usageLimit !==
      undefined
    ) {
      if (
        usageLimit === "" ||
        usageLimit === null
      ) {
        coupon.usageLimit =
          null;
      } else {
        const value =
          Number(usageLimit);

        if (
          !Number.isInteger(
            value
          ) ||
          value < 0
        ) {
          return res.status(400).json({
            message:
              "Invalid usage limit",
          });
        }

        if (
          value <
          coupon.usedCount
        ) {
          return res.status(400).json({
            message:
              "Usage limit cannot be lower than the current usage count",
          });
        }

        coupon.usageLimit =
          value;
      }
    }

    const updated =
      await coupon.save();

    return res.status(200).json(
      updated
    );
  } catch (error) {
    console.error(
      "Update coupon error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to update coupon",
    });
  }
}


// ============================================================
// ADMIN - DELETE COUPON
// DELETE /api/coupons/:id
// ============================================================

async function deleteCoupon(
  req,
  res
) {
  try {
    const coupon =
      await Coupon.findByIdAndDelete(
        req.params.id
      );

    if (!coupon) {
      return res.status(404).json({
        message:
          "Coupon not found",
      });
    }

    return res.status(200).json({
      message:
        "Coupon deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete coupon error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to delete coupon",
    });
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