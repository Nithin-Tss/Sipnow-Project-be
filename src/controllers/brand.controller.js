const mongoose = require("mongoose");

const Brand = require("../models/Brand");

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

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
 * ---------------------------------------------------------
 */
async function list(req, res) {
  const {
    all,
    search = "",
    page = 1,
    perPage = 20,
  } = req.query;

  const filter = {};

  const isAdminRequest =
    req.user?.role === "admin" &&
    all === "true";

  if (isAdminRequest) {
    // Admin can see both verified and unverified brands.
  } else {
    // Customers can only see active + verified brands.
    filter.isActive = true;
    filter.verified = true;
  }

  if (search.trim()) {
    filter.$or = [
      {
        name: {
          $regex: search.trim(),
          $options: "i",
        },
      },
      {
        slug: {
          $regex: search.trim(),
          $options: "i",
        },
      },
    ];
  }

  const currentPage = Math.max(
    Number(page) || 1,
    1
  );

  const limit = Math.max(
    Number(perPage) || 20,
    1
  );

  const skip = (currentPage - 1) * limit;

  const [brands, total] =
    await Promise.all([
      Brand.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),

      Brand.countDocuments(filter),
    ]);

  res.json({
    items: brands,
    total,
    page: currentPage,
    perPage: limit,
    totalPages: Math.max(
      1,
      Math.ceil(total / limit)
    ),
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

  // Public users cannot access unverified brands.
  if (
    !req.user?.role ||
    req.user.role !== "admin"
  ) {
    if (
      !brand.isActive ||
      !brand.verified
    ) {
      return res.status(404).json({
        message: "Brand not found",
      });
    }
  }

  res.json(brand);
}

/*
 * ---------------------------------------------------------
 * POST /api/brands
 * ---------------------------------------------------------
 */
async function create(req, res) {
  const {
    name,
    description = "",
    logo = "",
    bannerImage = "",
    bestSellingDescription = "",
    bestRatedDescription = "",
    collectionDescription = "",
    isActive = true,
    verified = false,
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: "Brand name is required",
    });
  }

  const cleanName = name.trim();
  const slug = slugify(cleanName);

  const existing = await Brand.findOne({
    $or: [
      { name: cleanName },
      { slug },
    ],
  });

  if (existing) {
    return res.status(409).json({
      message:
        "A brand with this name already exists",
    });
  }

  const verificationEmail =
    verified && req.user?.email
      ? req.user.email
      : "";

  const brand = await Brand.create({
    name: cleanName,
    slug,
    description,
    logo,
    bannerImage,
    bestSellingDescription,
    bestRatedDescription,
    collectionDescription,
    isActive: Boolean(isActive),
    verified: Boolean(verified),
    verificationEmail,
  });

  res.status(201).json({
    message: "Brand created successfully",
    brand,
  });
}

/*
 * ---------------------------------------------------------
 * PUT /api/brands/:id
 * ---------------------------------------------------------
 */
async function update(req, res) {
  const { id } = req.params;

  const {
    name,
    description,
    logo,
    bannerImage,
    bestSellingDescription,
    bestRatedDescription,
    collectionDescription,
    isActive,
    verified,
  } = req.body;

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
        message:
          "Brand name cannot be empty",
      });
    }

    const cleanName = name.trim();
    const slug = slugify(cleanName);

    const duplicate =
      await Brand.findOne({
        _id: { $ne: id },
        $or: [
          { name: cleanName },
          { slug },
        ],
      });

    if (duplicate) {
      return res.status(409).json({
        message:
          "A brand with this name already exists",
      });
    }

    brand.name = cleanName;
    brand.slug = slug;
  }

  if (description !== undefined) {
    brand.description = description;
  }

  if (logo !== undefined) {
    brand.logo = logo;
  }

  if (bannerImage !== undefined) {
    brand.bannerImage = bannerImage;
  }

  if (
    bestSellingDescription !==
    undefined
  ) {
    brand.bestSellingDescription =
      bestSellingDescription;
  }

  if (
    bestRatedDescription !== undefined
  ) {
    brand.bestRatedDescription =
      bestRatedDescription;
  }

  if (
    collectionDescription !== undefined
  ) {
    brand.collectionDescription =
      collectionDescription;
  }

  if (isActive !== undefined) {
    brand.isActive = Boolean(isActive);
  }

  if (verified !== undefined) {
    brand.verified = Boolean(verified);

    if (brand.verified) {
      brand.verificationEmail =
        req.user?.email ||
        brand.verificationEmail ||
        "";
    } else {
      brand.verificationEmail = "";
    }
  }

  await brand.save();

  res.json({
    message: "Brand updated successfully",
    brand,
  });
}

/*
 * ---------------------------------------------------------
 * PATCH /api/brands/:id/verify
 * ---------------------------------------------------------
 */
async function verify(req, res) {
  const { id } = req.params;
  const { verified } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid brand ID",
    });
  }

  if (typeof verified !== "boolean") {
    return res.status(400).json({
      message:
        "verified must be a boolean value",
    });
  }

  const brand =
    await Brand.findById(id);

  if (!brand) {
    return res.status(404).json({
      message: "Brand not found",
    });
  }

  brand.verified = verified;

  if (verified) {
    brand.verificationEmail =
      req.user?.email || "";
  } else {
    brand.verificationEmail = "";
  }

  await brand.save();

  res.json({
    message: verified
      ? "Brand verified successfully"
      : "Brand verification removed successfully",
    ...brand.toObject(),
  });
}

/*
 * ---------------------------------------------------------
 * PATCH /api/brands/:id/status
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
      message:
        "isActive must be a boolean value",
    });
  }

  const brand =
    await Brand.findByIdAndUpdate(
      id,
      { isActive },
      {
        new: true,
        runValidators: true,
      }
    );

  if (!brand) {
    return res.status(404).json({
      message: "Brand not found",
    });
  }

  res.json({
    message:
      "Brand status updated successfully",
    brand,
  });
}

/*
 * ---------------------------------------------------------
 * DELETE /api/brands/:id
 * ---------------------------------------------------------
 */
async function remove(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid brand ID",
    });
  }

  const brand =
    await Brand.findByIdAndDelete(id);

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
  verify,
  remove,
  updateStatus,
};