const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const cartRoutes = require("./routes/cart.routes");
const productRoutes = require("./routes/product.routes");
const addressRoutes = require("./routes/address.routes");
const userRoutes = require("./routes/user.routes");
const contactRoutes = require("./routes/contact.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const couponRoutes = require("./routes/coupon.routes");
const giftCardRoutes = require("./routes/giftcard.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const paymentRoutes = require("./routes/payment.routes");
const promotionRoutes = require("./routes/promotion.routes");
const reviewRoutes = require("./routes/review.routes");
const storeRoutes = require("./routes/store.routes");
const offerRoutes = require("./routes/offer.routes");
const orderRoutes = require("./routes/order.routes");
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
app.use("/api/contact", contactRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/giftcards", giftCardRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/orders", orderRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
