const GiftCard = require("../models/GiftCard");

/*
 * ---------------------------------------------------------
 * Helper: Generate a unique gift card code
 * ---------------------------------------------------------
 */
function generateGiftCardCode() {
  const prefix = "SIP";
  const randomPart = Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase();

  return `${prefix}-${randomPart}`;
}

/*
 * ---------------------------------------------------------
 * GET /api/giftcards
 *
 * Get gift cards
 *
 * Admin:
 *   Gets all gift cards
 *
 * Customer:
 *   Gets gift cards purchased/owned by the user
 * ---------------------------------------------------------
 */
async function list(req, res) {
  const filter = {};

  if (req.user.role !== "admin") {
    filter.user = req.user._id;
  }

  const giftCards = await GiftCard.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json({
    giftCards,
  });
}

/*
 * ---------------------------------------------------------
 * GET /api/giftcards/:id
 *
 * Get one gift card
 * ---------------------------------------------------------
 */
async function getOne(req, res) {
  const giftCard = await GiftCard.findById(req.params.id)
    .populate("user", "name email");

  if (!giftCard) {
    return res.status(404).json({
      message: "Gift card not found",
    });
  }

  if (
    req.user.role !== "admin" &&
    giftCard.user &&
    giftCard.user._id.toString() !==
      req.user._id.toString()
  ) {
    return res.status(403).json({
      message:
        "You are not authorized to view this gift card",
    });
  }

  res.json(giftCard);
}

/*
 * ---------------------------------------------------------
 * POST /api/giftcards
 *
 * Create / purchase a gift card
 * ---------------------------------------------------------
 */
async function create(req, res) {
  const {
    amount,
    recipientName,
    recipientEmail,
    message = "",
    expiryDate,
  } = req.body;

  const numericAmount = Number(amount);

  if (
    Number.isNaN(numericAmount) ||
    numericAmount <= 0
  ) {
    return res.status(400).json({
      message: "Gift card amount must be greater than 0",
    });
  }

  if (!recipientName || !recipientName.trim()) {
    return res.status(400).json({
      message: "Recipient name is required",
    });
  }

  if (!recipientEmail || !recipientEmail.trim()) {
    return res.status(400).json({
      message: "Recipient email is required",
    });
  }

  /*
   * Generate a unique code.
   */
  let code;
  let existingCard;

  do {
    code = generateGiftCardCode();

    existingCard = await GiftCard.findOne({
      code,
    });
  } while (existingCard);

  const giftCard = await GiftCard.create({
    user: req.user._id,

    code,

    amount: numericAmount,

    balance: numericAmount,

    recipientName:
      recipientName.trim(),

    recipientEmail:
      recipientEmail.trim().toLowerCase(),

    message: message.trim(),

    expiryDate:
      expiryDate || null,

    isActive: true,

    isRedeemed: false,
  });

  res.status(201).json({
    message: "Gift card created successfully",
    giftCard,
  });
}

/*
 * ---------------------------------------------------------
 * PATCH /api/giftcards/:id
 *
 * Update gift card information
 * ---------------------------------------------------------
 */
async function update(req, res) {
  const {
    recipientName,
    recipientEmail,
    message,
    expiryDate,
    isActive,
  } = req.body;

  const giftCard = await GiftCard.findById(
    req.params.id
  );

  if (!giftCard) {
    return res.status(404).json({
      message: "Gift card not found",
    });
  }

  if (
    req.user.role !== "admin" &&
    giftCard.user.toString() !==
      req.user._id.toString()
  ) {
    return res.status(403).json({
      message:
        "You are not authorized to update this gift card",
    });
  }

  if (giftCard.isRedeemed) {
    return res.status(400).json({
      message:
        "A redeemed gift card cannot be updated",
    });
  }

  if (recipientName !== undefined) {
    if (!recipientName.trim()) {
      return res.status(400).json({
        message:
          "Recipient name cannot be empty",
      });
    }

    giftCard.recipientName =
      recipientName.trim();
  }

  if (recipientEmail !== undefined) {
    if (!recipientEmail.trim()) {
      return res.status(400).json({
        message:
          "Recipient email cannot be empty",
      });
    }

    giftCard.recipientEmail =
      recipientEmail
        .trim()
        .toLowerCase();
  }

  if (message !== undefined) {
    giftCard.message =
      message.trim();
  }

  if (expiryDate !== undefined) {
    giftCard.expiryDate =
      expiryDate || null;
  }

  if (
    isActive !== undefined &&
    req.user.role === "admin"
  ) {
    giftCard.isActive =
      Boolean(isActive);
  }

  await giftCard.save();

  res.json({
    message:
      "Gift card updated successfully",
    giftCard,
  });
}

/*
 * ---------------------------------------------------------
 * POST /api/giftcards/validate
 *
 * Validate a gift card before applying it to an order
 * ---------------------------------------------------------
 */
async function validate(req, res) {
  const { code } = req.body;

  if (!code || !code.trim()) {
    return res.status(400).json({
      message: "Gift card code is required",
    });
  }

  const giftCard =
    await GiftCard.findOne({
      code: code.trim().toUpperCase(),
    });

  if (!giftCard) {
    return res.status(404).json({
      valid: false,
      message: "Invalid gift card code",
    });
  }

  if (!giftCard.isActive) {
    return res.status(400).json({
      valid: false,
      message:
        "This gift card is inactive",
    });
  }

  if (giftCard.isRedeemed) {
    return res.status(400).json({
      valid: false,
      message:
        "This gift card has already been redeemed",
    });
  }

  if (
    giftCard.expiryDate &&
    new Date() > giftCard.expiryDate
  ) {
    return res.status(400).json({
      valid: false,
      message:
        "This gift card has expired",
    });
  }

  if (giftCard.balance <= 0) {
    return res.status(400).json({
      valid: false,
      message:
        "This gift card has no remaining balance",
    });
  }

  res.json({
    valid: true,

    giftCard: {
      id: giftCard._id,
      code: giftCard.code,
      balance: giftCard.balance,
      expiryDate:
        giftCard.expiryDate,
    },
  });
}

/*
 * ---------------------------------------------------------
 * POST /api/giftcards/redeem
 *
 * Redeem/use a gift card
 * ---------------------------------------------------------
 */
async function redeem(req, res) {
  const {
    code,
    amount,
  } = req.body;

  if (!code || !code.trim()) {
    return res.status(400).json({
      message: "Gift card code is required",
    });
  }

  const requestedAmount =
    Number(amount);

  if (
    Number.isNaN(requestedAmount) ||
    requestedAmount <= 0
  ) {
    return res.status(400).json({
      message:
        "Redeem amount must be greater than 0",
    });
  }

  const giftCard =
    await GiftCard.findOne({
      code: code.trim().toUpperCase(),
    });

  if (!giftCard) {
    return res.status(404).json({
      message:
        "Gift card not found",
    });
  }

  if (!giftCard.isActive) {
    return res.status(400).json({
      message:
        "This gift card is inactive",
    });
  }

  if (giftCard.isRedeemed) {
    return res.status(400).json({
      message:
        "This gift card has already been redeemed",
    });
  }

  if (
    giftCard.expiryDate &&
    new Date() > giftCard.expiryDate
  ) {
    return res.status(400).json({
      message:
        "This gift card has expired",
    });
  }

  if (
    requestedAmount >
    giftCard.balance
  ) {
    return res.status(400).json({
      message:
        "Redeem amount exceeds available gift card balance",
    });
  }

  giftCard.balance -=
    requestedAmount;

  if (giftCard.balance === 0) {
    giftCard.isRedeemed = true;
  }

  await giftCard.save();

  res.json({
    message:
      "Gift card redeemed successfully",

    giftCard: {
      id: giftCard._id,
      code: giftCard.code,
      remainingBalance:
        giftCard.balance,
      isRedeemed:
        giftCard.isRedeemed,
    },
  });
}

/*
 * ---------------------------------------------------------
 * PATCH /api/giftcards/:id/status
 *
 * Admin activates/deactivates a gift card
 * ---------------------------------------------------------
 */
async function updateStatus(req, res) {
  const {
    isActive,
  } = req.body;

  if (
    typeof isActive !==
    "boolean"
  ) {
    return res.status(400).json({
      message:
        "isActive must be a boolean",
    });
  }

  const giftCard =
    await GiftCard.findByIdAndUpdate(
      req.params.id,
      {
        isActive,
      },
      {
        new: true,
        runValidators: true,
      }
    );

  if (!giftCard) {
    return res.status(404).json({
      message:
        "Gift card not found",
    });
  }

  res.json({
    message: isActive
      ? "Gift card activated successfully"
      : "Gift card deactivated successfully",

    giftCard,
  });
}

/*
 * ---------------------------------------------------------
 * DELETE /api/giftcards/:id
 *
 * Admin deletes a gift card
 * ---------------------------------------------------------
 */
async function remove(req, res) {
  const giftCard =
    await GiftCard.findById(
      req.params.id
    );

  if (!giftCard) {
    return res.status(404).json({
      message:
        "Gift card not found",
    });
  }

  if (giftCard.isRedeemed) {
    return res.status(400).json({
      message:
        "A redeemed gift card cannot be deleted",
    });
  }

  await giftCard.deleteOne();

  res.json({
    message:
      "Gift card deleted successfully",
  });
}

module.exports = {
  list,
  getOne,
  create,
  update,
  validate,
  redeem,
  updateStatus,
  remove,
};