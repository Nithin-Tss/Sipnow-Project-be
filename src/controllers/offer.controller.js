const Offer = require("../models/Offer");

/*
 * GET /api/offers
 * Get all offers
 */
async function list(req, res) {
  const offers = await Offer.find()
    .populate("applicableProducts", "name price image brand category")
    .populate("applicableCategories", "name")
    .sort({ createdAt: -1 });

  res.json({
    offers,
  });
}

/*
 * GET /api/offers/active
 * Get currently active offers
 */
async function getActiveOffers(req, res) {
  const now = new Date();

  const offers = await Offer.find({
    isActive: true,
    $and: [
      {
        $or: [
          { startDate: null },
          { startDate: { $exists: false } },
          { startDate: { $lte: now } },
        ],
      },
      {
        $or: [
          { endDate: null },
          { endDate: { $exists: false } },
          { endDate: { $gte: now } },
        ],
      },
    ],
  })
    .populate("applicableProducts", "name price image brand category")
    .populate("applicableCategories", "name")
    .sort({ createdAt: -1 });

  res.json({
    offers,
  });
}

/*
 * GET /api/offers/:id
 * Get one offer
 */
async function getOne(req, res) {
  const offer = await Offer.findById(req.params.id)
    .populate("applicableProducts", "name price image brand category")
    .populate("applicableCategories", "name");

  if (!offer) {
    return res.status(404).json({
      message: "Offer not found",
    });
  }

  res.json(offer);
}

/*
 * POST /api/offers
 * Create a new offer
 */
async function create(req, res) {
  const {
    title,
    description,
    code,
    discountType,
    discountValue,
    minimumPurchase,
    maximumDiscount,
    startDate,
    endDate,
    applicableProducts,
    applicableCategories,
    isActive,
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      message: "Offer title is required",
    });
  }

  if (!discountType) {
    return res.status(400).json({
      message: "Discount type is required",
    });
  }

  if (!["percentage", "fixed"].includes(discountType)) {
    return res.status(400).json({
      message: "Discount type must be percentage or fixed",
    });
  }

  if (
    discountValue === undefined ||
    discountValue === null
  ) {
    return res.status(400).json({
      message: "Discount value is required",
    });
  }

  const numericDiscount = Number(discountValue);

  if (
    Number.isNaN(numericDiscount) ||
    numericDiscount <= 0
  ) {
    return res.status(400).json({
      message: "Discount value must be greater than 0",
    });
  }

  if (
    discountType === "percentage" &&
    numericDiscount > 100
  ) {
    return res.status(400).json({
      message: "Percentage discount cannot exceed 100",
    });
  }

  if (minimumPurchase !== undefined) {
    const minimum = Number(minimumPurchase);

    if (Number.isNaN(minimum) || minimum < 0) {
      return res.status(400).json({
        message: "Minimum purchase must be a valid positive number",
      });
    }
  }

  if (maximumDiscount !== undefined && maximumDiscount !== null) {
    const maximum = Number(maximumDiscount);

    if (Number.isNaN(maximum) || maximum < 0) {
      return res.status(400).json({
        message: "Maximum discount must be a valid positive number",
      });
    }
  }

  if (startDate && endDate) {
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        message: "Start date cannot be after end date",
      });
    }
  }

  /*
   * Offer codes are stored in uppercase.
   */
  const normalizedCode = code
    ? code.trim().toUpperCase()
    : undefined;

  if (normalizedCode) {
    const existingOffer = await Offer.findOne({
      code: normalizedCode,
    });

    if (existingOffer) {
      return res.status(409).json({
        message: "Offer code already exists",
      });
    }
  }

  const offer = await Offer.create({
    title: title.trim(),

    description: description
      ? description.trim()
      : "",

    code: normalizedCode,

    discountType,

    discountValue: numericDiscount,

    minimumPurchase:
      minimumPurchase !== undefined
        ? Number(minimumPurchase)
        : 0,

    maximumDiscount:
      maximumDiscount !== undefined &&
      maximumDiscount !== null
        ? Number(maximumDiscount)
        : null,

    startDate: startDate || null,

    endDate: endDate || null,

    applicableProducts: Array.isArray(applicableProducts)
      ? applicableProducts
      : [],

    applicableCategories: Array.isArray(
      applicableCategories
    )
      ? applicableCategories
      : [],

    isActive:
      isActive !== undefined
        ? Boolean(isActive)
        : true,
  });

  res.status(201).json({
    message: "Offer created successfully",
    offer,
  });
}

/*
 * PUT /api/offers/:id
 * Update an offer
 */
async function update(req, res) {
  const {
    title,
    description,
    code,
    discountType,
    discountValue,
    minimumPurchase,
    maximumDiscount,
    startDate,
    endDate,
    applicableProducts,
    applicableCategories,
    isActive,
  } = req.body;

  const existingOffer = await Offer.findById(req.params.id);

  if (!existingOffer) {
    return res.status(404).json({
      message: "Offer not found",
    });
  }

  const updateData = {};

  if (title !== undefined) {
    if (!title.trim()) {
      return res.status(400).json({
        message: "Offer title cannot be empty",
      });
    }

    updateData.title = title.trim();
  }

  if (description !== undefined) {
    updateData.description = description.trim();
  }

  if (code !== undefined) {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode) {
      const duplicate = await Offer.findOne({
        code: normalizedCode,
        _id: { $ne: req.params.id },
      });

      if (duplicate) {
        return res.status(409).json({
          message: "Offer code already exists",
        });
      }
    }

    updateData.code = normalizedCode || undefined;
  }

  if (discountType !== undefined) {
    if (!["percentage", "fixed"].includes(discountType)) {
      return res.status(400).json({
        message: "Discount type must be percentage or fixed",
      });
    }

    updateData.discountType = discountType;
  }

  const finalDiscountType =
    discountType !== undefined
      ? discountType
      : existingOffer.discountType;

  if (discountValue !== undefined) {
    const numericDiscount = Number(discountValue);

    if (
      Number.isNaN(numericDiscount) ||
      numericDiscount <= 0
    ) {
      return res.status(400).json({
        message: "Discount value must be greater than 0",
      });
    }

    if (
      finalDiscountType === "percentage" &&
      numericDiscount > 100
    ) {
      return res.status(400).json({
        message: "Percentage discount cannot exceed 100",
      });
    }

    updateData.discountValue = numericDiscount;
  }

  if (minimumPurchase !== undefined) {
    const minimum = Number(minimumPurchase);

    if (Number.isNaN(minimum) || minimum < 0) {
      return res.status(400).json({
        message: "Minimum purchase must be a valid positive number",
      });
    }

    updateData.minimumPurchase = minimum;
  }

  if (maximumDiscount !== undefined) {
    if (maximumDiscount === null) {
      updateData.maximumDiscount = null;
    } else {
      const maximum = Number(maximumDiscount);

      if (Number.isNaN(maximum) || maximum < 0) {
        return res.status(400).json({
          message:
            "Maximum discount must be a valid positive number",
        });
      }

      updateData.maximumDiscount = maximum;
    }
  }

  if (startDate !== undefined) {
    updateData.startDate = startDate || null;
  }

  if (endDate !== undefined) {
    updateData.endDate = endDate || null;
  }

  const finalStartDate =
    startDate !== undefined
      ? startDate
      : existingOffer.startDate;

  const finalEndDate =
    endDate !== undefined
      ? endDate
      : existingOffer.endDate;

  if (finalStartDate && finalEndDate) {
    if (
      new Date(finalStartDate) >
      new Date(finalEndDate)
    ) {
      return res.status(400).json({
        message: "Start date cannot be after end date",
      });
    }
  }

  if (applicableProducts !== undefined) {
    updateData.applicableProducts =
      Array.isArray(applicableProducts)
        ? applicableProducts
        : [];
  }

  if (applicableCategories !== undefined) {
    updateData.applicableCategories =
      Array.isArray(applicableCategories)
        ? applicableCategories
        : [];
  }

  if (isActive !== undefined) {
    updateData.isActive = Boolean(isActive);
  }

  const offer = await Offer.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  res.json({
    message: "Offer updated successfully",
    offer,
  });
}

/*
 * DELETE /api/offers/:id
 * Delete an offer
 */
async function remove(req, res) {
  const offer = await Offer.findByIdAndDelete(
    req.params.id
  );

  if (!offer) {
    return res.status(404).json({
      message: "Offer not found",
    });
  }

  res.json({
    message: "Offer deleted successfully",
  });
}

/*
 * PATCH /api/offers/:id/status
 * Activate or deactivate an offer
 */
async function updateStatus(req, res) {
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      message: "isActive must be a boolean",
    });
  }

  const offer = await Offer.findByIdAndUpdate(
    req.params.id,
    { isActive },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!offer) {
    return res.status(404).json({
      message: "Offer not found",
    });
  }

  res.json({
    message: isActive
      ? "Offer activated successfully"
      : "Offer deactivated successfully",
    offer,
  });
}

/*
 * POST /api/offers/validate
 * Validate an offer code and calculate discount
 */
async function validate(req, res) {
  const {
    code,
    cartTotal = 0,
    productIds = [],
    categoryIds = [],
  } = req.body;

  if (!code || !code.trim()) {
    return res.status(400).json({
      message: "Offer code is required",
    });
  }

  const offer = await Offer.findOne({
    code: code.trim().toUpperCase(),
    isActive: true,
  });

  if (!offer) {
    return res.status(404).json({
      message: "Invalid or inactive offer code",
    });
  }

  const now = new Date();

  if (
    offer.startDate &&
    now < offer.startDate
  ) {
    return res.status(400).json({
      message: "This offer is not active yet",
    });
  }

  if (
    offer.endDate &&
    now > offer.endDate
  ) {
    return res.status(400).json({
      message: "This offer has expired",
    });
  }

  const total = Number(cartTotal);

  if (Number.isNaN(total) || total < 0) {
    return res.status(400).json({
      message: "Cart total must be a valid number",
    });
  }

  if (
    offer.minimumPurchase > 0 &&
    total < offer.minimumPurchase
  ) {
    return res.status(400).json({
      message: `Minimum purchase of ${offer.minimumPurchase} is required`,
    });
  }

  /*
   * Check whether the offer is restricted to
   * particular products or categories.
   */
  const hasProductRestrictions =
    offer.applicableProducts.length > 0;

  const hasCategoryRestrictions =
    offer.applicableCategories.length > 0;

  if (hasProductRestrictions) {
    const matchingProduct = productIds.some((id) =>
      offer.applicableProducts.some(
        (productId) =>
          productId.toString() === id.toString()
      )
    );

    if (!matchingProduct) {
      return res.status(400).json({
        message:
          "This offer is not applicable to the selected products",
      });
    }
  }

  if (hasCategoryRestrictions) {
    const matchingCategory = categoryIds.some((id) =>
      offer.applicableCategories.some(
        (categoryId) =>
          categoryId.toString() === id.toString()
      )
    );

    if (!matchingCategory) {
      return res.status(400).json({
        message:
          "This offer is not applicable to the selected categories",
      });
    }
  }

  let discountAmount = 0;

  if (offer.discountType === "percentage") {
    discountAmount =
      (total * offer.discountValue) / 100;

    if (
      offer.maximumDiscount !== null &&
      offer.maximumDiscount !== undefined
    ) {
      discountAmount = Math.min(
        discountAmount,
        offer.maximumDiscount
      );
    }
  }

  if (offer.discountType === "fixed") {
    discountAmount = offer.discountValue;
  }

  discountAmount = Math.min(
    discountAmount,
    total
  );

  const finalTotal =
    total - discountAmount;

  res.json({
    valid: true,
    message: "Offer applied successfully",

    offer: {
      id: offer._id,
      title: offer.title,
      code: offer.code,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
    },

    calculation: {
      cartTotal: total,
      discountAmount,
      finalTotal,
    },
  });
}

module.exports = {
  list,
  getActiveOffers,
  getOne,
  create,
  update,
  remove,
  updateStatus,
  validate,
};