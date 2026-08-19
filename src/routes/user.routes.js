const express = require("express");
const router = express.Router();
const { requireAuth, requireAdmin } = require("../middleware/auth");
const {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require("../controllers/user.controller");

// User profile routes (requires authentication)
router.get("/profile", requireAuth, getProfile);
router.put("/profile", requireAuth, updateProfile);
router.put("/change-password", requireAuth, changePassword);

// Admin user management routes (requires authentication & admin role)
router.get("/", requireAuth, requireAdmin, getAllUsers);
router.put("/:id/role", requireAuth, requireAdmin, updateUserRole);
router.delete("/:id", requireAuth, requireAdmin, deleteUser);

module.exports = router;
