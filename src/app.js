const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const cartRoutes = require("./routes/cart.routes");
const productRoutes = require("./routes/product.routes");
const addressRoutes = require("./routes/address.routes");
const userRoutes = require("./routes/user.routes");
const Product = require("./models/Product");
const User = require("./models/User");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

const allowedOrigins = (
  process.env.CLIENT_URLS ||
  process.env.CLIENT_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.get("/api/v1/admin/stats", async (req, res) => {
  const totalProducts = await Product.countDocuments();
  const totalUsers = await User.countDocuments();
  res.json({
    totalUsers,
    totalProducts,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    ordersByStatus: {},
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
