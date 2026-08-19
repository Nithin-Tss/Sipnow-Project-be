const ContactMessage = require("../models/ContactMessage");

// @desc    Submit a new contact message/inquiry
// @route   POST /api/contact
// @access  Public
async function submitContactMessage(req, res) {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ message: "Name, email, and message are required" });
    }

    const contactDoc = await ContactMessage.create({
      user: req.user ? req.user._id : undefined,
      name,
      email,
      phone,
      subject: subject || "",
      message,
    });

    res.status(201).json({
      message: "Your message has been submitted successfully",
      contact: contactDoc,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Get all contact messages (Admin)
// @route   GET /api/contact
// @access  Private/Admin
async function getContactMessages(req, res) {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const messages = await ContactMessage.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Get contact message by ID (Admin)
// @route   GET /api/contact/:id
// @access  Private/Admin
async function getContactMessageById(req, res) {
  try {
    const contactMessage = await ContactMessage.findById(
      req.params.id
    ).populate("user", "name email");

    if (!contactMessage) {
      return res.status(404).json({ message: "Contact message not found" });
    }

    res.json(contactMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Update contact message status (Admin)
// @route   PATCH /api/contact/:id/status
// @access  Private/Admin
async function updateContactMessageStatus(req, res) {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "in-progress", "resolved"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
      });
    }

    const contactMessage = await ContactMessage.findById(req.params.id);

    if (!contactMessage) {
      return res.status(404).json({ message: "Contact message not found" });
    }

    contactMessage.status = status;
    const updatedMessage = await contactMessage.save();

    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Delete a contact message (Admin)
// @route   DELETE /api/contact/:id
// @access  Private/Admin
async function deleteContactMessage(req, res) {
  try {
    const contactMessage = await ContactMessage.findByIdAndDelete(
      req.params.id
    );

    if (!contactMessage) {
      return res.status(404).json({ message: "Contact message not found" });
    }

    res.json({ message: "Contact message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  submitContactMessage,
  getContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  deleteContactMessage,
};
