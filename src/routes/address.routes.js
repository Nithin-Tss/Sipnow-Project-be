const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/address.controller");

router.use(requireAuth);

router.route("/").get(getAddresses).post(createAddress);
router.route("/:id").get(getAddressById).put(updateAddress).delete(deleteAddress);
router.patch("/:id/default", setDefaultAddress);

module.exports = router;
