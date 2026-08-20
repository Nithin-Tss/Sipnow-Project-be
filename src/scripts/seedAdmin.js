require("dotenv").config({ path: require("path").join(__dirname, "..", "..", ".env") });

const connectDB = require("../config/db");
const User = require("../models/User");

const ROOT_ADMIN_EMAIL = "root@sipnow.com";
const ROOT_ADMIN_PASSWORD = "SipNow@Root2026";
const ROOT_ADMIN_NAME = "Root Admin";

async function seedAdmin() {
  await connectDB();

  const existing = await User.findOne({ email: ROOT_ADMIN_EMAIL }).select("+password");

  if (existing) {
    existing.name = ROOT_ADMIN_NAME;
    existing.role = "admin";
    existing.password = ROOT_ADMIN_PASSWORD;
    await existing.save();
    console.log(`Root admin updated: ${ROOT_ADMIN_EMAIL}`);
  } else {
    await User.create({
      name: ROOT_ADMIN_NAME,
      email: ROOT_ADMIN_EMAIL,
      password: ROOT_ADMIN_PASSWORD,
      role: "admin",
    });
    console.log(`Root admin created: ${ROOT_ADMIN_EMAIL}`);
  }

  await require("mongoose").disconnect();
}

seedAdmin().catch((err) => {
  console.error("Failed to seed root admin:", err);
  process.exit(1);
});
