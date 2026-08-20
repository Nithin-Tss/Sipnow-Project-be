const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const LOW_STOCK_THRESHOLD = 5;

/*
 * ---------------------------------------------------------
 * GET /api/dashboard/stats
 *
 * High level admin dashboard summary
 * ---------------------------------------------------------
 */
async function getStats(req, res) {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    lowStockProducts,
    revenueResult,
    ordersByStatusResult,
  ] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Product.countDocuments({
      stockQuantity: { $lte: LOW_STOCK_THRESHOLD },
    }),
    Order.aggregate([
      { $match: { "payment.status": "paid" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]),
    Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  const ordersByStatus = ordersByStatusResult.reduce(
    (acc, entry) => {
      acc[entry._id] = entry.count;
      return acc;
    },
    {}
  );

  res.json({
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    lowStockProducts,
    ordersByStatus,
  });
}

/*
 * ---------------------------------------------------------
 * GET /api/dashboard/recent-orders
 *
 * Most recently placed orders
 * ---------------------------------------------------------
 */
async function getRecentOrders(req, res) {
  const limit = Math.min(
    Number(req.query.limit) || 10,
    50
  );

  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json({
    orders,
  });
}

/*
 * ---------------------------------------------------------
 * GET /api/dashboard/sales-overview
 *
 * Daily revenue trend for the last N days (default 7)
 * ---------------------------------------------------------
 */
async function getSalesOverview(req, res) {
  const days = Math.min(
    Number(req.query.days) || 7,
    90
  );

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - (days - 1));

  const overview = await Order.aggregate([
    {
      $match: {
        "payment.status": "paid",
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    days,
    overview: overview.map((entry) => ({
      date: entry._id,
      revenue: entry.revenue,
      orders: entry.orders,
    })),
  });
}

module.exports = {
  getStats,
  getRecentOrders,
  getSalesOverview,
};
