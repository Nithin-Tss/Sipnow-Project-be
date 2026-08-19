const express = require("express");
const router = express.Router();
const {
  submitContactMessage,
  getContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  deleteContactMessage,
} = require("../controllers/contact.controller");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.post("/", submitContactMessage);
router.get("/", requireAuth, requireAdmin, getContactMessages);
router.get("/:id", requireAuth, requireAdmin, getContactMessageById);
router.patch("/:id/status", requireAuth, requireAdmin, updateContactMessageStatus);
router.delete("/:id", requireAuth, requireAdmin, deleteContactMessage);

module.exports = router;
