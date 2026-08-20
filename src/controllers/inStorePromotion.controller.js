const InStorePromotion = require("../models/InStorePromotion");

async function list(req, res) {
  const promotions = await InStorePromotion.find()
    .populate("product")
    .sort({ displayOrder: 1, createdAt: -1 });

  res.json({ items: promotions });
}

async function getActivePromotions(req, res) {
  const now = new Date();

  const promotions = await InStorePromotion.find({
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
    .populate("product")
    .sort({ displayOrder: 1, createdAt: -1 });

  res.json({ items: promotions });
}

async function getOne(req, res) {
  const promotion = await InStorePromotion.findById(req.params.id).populate("product");
  if (!promotion) {
    return res.status(404).json({ message: "In-Store Promotion not found" });
  }
  res.json(promotion);
}

async function create(req, res) {
  const {
    productId,
    product,
    isActive,
    startDate,
    endDate,
    displayOrder,
    promoLabel,
    discountType,
    discountValue,
  } = req.body;

  const targetProductId = productId || product;
  if (!targetProductId) {
    return res.status(400).json({ message: "Product selection is required" });
  }

  const existing = await InStorePromotion.findOne({
    product: targetProductId,
    isActive: true,
  });

  if (existing) {
    return res.status(400).json({
      message: "This product is already added as an active In-Store Promotion.",
    });
  }

  const promo = await InStorePromotion.create({
    product: targetProductId,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    displayOrder: Number(displayOrder) || 1,
    promoLabel: promoLabel || "In-store only",
    discountType: discountType || "none",
    discountValue: Number(discountValue) || 0,
  });

  const populated = await InStorePromotion.findById(promo._id).populate("product");
  res.status(201).json(populated);
}

async function update(req, res) {
  const {
    productId,
    product,
    isActive,
    startDate,
    endDate,
    displayOrder,
    promoLabel,
    discountType,
    discountValue,
  } = req.body;

  const promo = await InStorePromotion.findById(req.params.id);
  if (!promo) {
    return res.status(404).json({ message: "In-Store Promotion not found" });
  }

  const targetProductId = productId || product || promo.product;

  if (isActive && targetProductId) {
    const existing = await InStorePromotion.findOne({
      _id: { $ne: req.params.id },
      product: targetProductId,
      isActive: true,
    });
    if (existing) {
      return res.status(400).json({
        message: "This product is already added as an active In-Store Promotion.",
      });
    }
  }

  if (targetProductId) promo.product = targetProductId;
  if (isActive !== undefined) promo.isActive = Boolean(isActive);
  if (startDate !== undefined) promo.startDate = startDate ? new Date(startDate) : null;
  if (endDate !== undefined) promo.endDate = endDate ? new Date(endDate) : null;
  if (displayOrder !== undefined) promo.displayOrder = Number(displayOrder) || 1;
  if (promoLabel !== undefined) promo.promoLabel = promoLabel;
  if (discountType !== undefined) promo.discountType = discountType;
  if (discountValue !== undefined) promo.discountValue = Number(discountValue) || 0;

  await promo.save();
  const updated = await InStorePromotion.findById(promo._id).populate("product");
  res.json(updated);
}

async function remove(req, res) {
  const promo = await InStorePromotion.findByIdAndDelete(req.params.id);
  if (!promo) {
    return res.status(404).json({ message: "In-Store Promotion not found" });
  }
  res.status(204).send();
}

module.exports = {
  list,
  getActivePromotions,
  getOne,
  create,
  update,
  remove,
};
