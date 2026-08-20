const mongoose = require("mongoose");

const Review = require("../models/Review");

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
 * GET /api/reviews
 *
 * Public callers only see approved reviews.
 * Admins may pass ?status=pending|approved|hidden
 * to see reviews in other states.
 * ---------------------------------------------------------
 */
async function list(req, res) {
  const { product, status } = req.query;

  const filter = {};

  if (product) {
    if (!isValidObjectId(product)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    filter.product = product;
  }

  if (req.user?.role === "admin" && status) {
    filter.status = status;
  } else {
    filter.status = "approved";
  }

  const reviews = await Review.find(filter)
    .populate("user", "name")
    .populate("product", "name image")
    .sort({ createdAt: -1 });

  res.json({
    reviews,
  });
}

/*
 * ---------------------------------------------------------
 * GET /api/reviews/:id
 * ---------------------------------------------------------
 */
async function getOne(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid review ID",
    });
  }

  const review = await Review.findById(id)
    .populate("user", "name")
    .populate("product", "name image");

  if (!review) {
    return res.status(404).json({
      message: "Review not found",
    });
  }

  res.json(review);
}

/*
 * ---------------------------------------------------------
 * POST /api/reviews
 *
 * Create a review for a product
 * ---------------------------------------------------------
 */
async function create(req, res) {
  const { product, rating, title = "", comment } = req.body;

  if (!product || !isValidObjectId(product)) {
    return res.status(400).json({
      message: "A valid product ID is required",
    });
  }

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      message: "Rating must be between 1 and 5",
    });
  }

  if (!comment || !comment.trim()) {
    return res.status(400).json({
      message: "Comment is required",
    });
  }

  const existing = await Review.findOne({
    product,
    user: req.user._id,
  });

  if (existing) {
    return res.status(409).json({
      message: "You have already reviewed this product",
    });
  }

  const review = await Review.create({
    product,
    user: req.user._id,
    rating,
    title: title.trim(),
    comment: comment.trim(),
    status: "pending",
  });

  const populatedReview = await Review.findById(
    review._id
  )
    .populate("user", "name")
    .populate("product", "name image");

  res.status(201).json({
    message: "Review submitted successfully",
    review: populatedReview,
  });
}

/*
 * ---------------------------------------------------------
 * PUT /api/reviews/:id
 *
 * Owner updates their own review. Editing resets the
 * review back to pending for re-moderation.
 * ---------------------------------------------------------
 */
async function update(req, res) {
  const { id } = req.params;
  const { rating, title, comment } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid review ID",
    });
  }

  const review = await Review.findById(id);

  if (!review) {
    return res.status(404).json({
      message: "Review not found",
    });
  }

  if (
    req.user.role !== "admin" &&
    review.user.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      message: "You are not authorized to update this review",
    });
  }

  if (rating !== undefined) {
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }
    review.rating = rating;
  }

  if (title !== undefined) {
    review.title = title.trim();
  }

  if (comment !== undefined) {
    if (!comment.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }
    review.comment = comment.trim();
  }

  if (req.user.role !== "admin") {
    review.status = "pending";
  }

  await review.save();

  const updatedReview = await Review.findById(
    review._id
  )
    .populate("user", "name")
    .populate("product", "name image");

  res.json({
    message: "Review updated successfully",
    review: updatedReview,
  });
}

/*
 * ---------------------------------------------------------
 * PATCH /api/reviews/:id/status
 *
 * Admin approves or hides a review
 * ---------------------------------------------------------
 */
async function updateStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ["pending", "approved", "hidden"];

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid review ID",
    });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid review status",
      allowedStatuses,
    });
  }

  const review = await Review.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  )
    .populate("user", "name")
    .populate("product", "name image");

  if (!review) {
    return res.status(404).json({
      message: "Review not found",
    });
  }

  res.json({
    message: "Review status updated successfully",
    review,
  });
}

/*
 * ---------------------------------------------------------
 * DELETE /api/reviews/:id
 *
 * Owner or admin deletes a review
 * ---------------------------------------------------------
 */
async function remove(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid review ID",
    });
  }

  const review = await Review.findById(id);

  if (!review) {
    return res.status(404).json({
      message: "Review not found",
    });
  }

  if (
    req.user.role !== "admin" &&
    review.user.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      message: "You are not authorized to delete this review",
    });
  }

  await review.deleteOne();

  res.json({
    message: "Review deleted successfully",
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
