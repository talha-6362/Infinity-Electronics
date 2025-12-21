import Customer from "../models/customers.js";

function formatMonthYear(date) {
  return date.toLocaleString("en-US", { month: "short", year: "numeric" });
}

export const getWeeklyReport = async (req, res) => {
  try {
    const data = await Customer.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$productId",
          product: {
            $first: {
              $concat: [
                { $ifNull: ["$productInfo.name", "Unknown"] },
                " (",
                { $ifNull: ["$productInfo.model", "N/A"] },
                ")"
              ]
            }
          },
          units: { $sum: 1 },
          total: { $sum: { $ifNull: ["$productPrice", 0] } }
        }
      }
    ]);

    const totalWeekly = data.reduce((sum, v) => sum + (v.total || 0), 0);

    res.json({
      success: true,
      data: {
        rows: data,
        totalWeekly,
        topItem: data.length > 0 ? data[0] : null
      }
    });
  } catch (err) {
    console.error("Weekly Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAvailableMonths = async (req, res) => {
  try {
    const pipeline = [
      {
        $project: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        }
      },
      {
        $group: { _id: { year: "$year", month: "$month" } }
      },
      {
        $project: { year: "$_id.year", month: "$_id.month", _id: 0 }
      },
      { $sort: { year: -1, month: -1 } }
    ];

    const months = await Customer.aggregate(pipeline);

    const result = months.map(m => {
      const d = new Date(m.year, m.month - 1, 1);
      return { label: formatMonthYear(d), month: m.month, year: m.year };
    });

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Month Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMonthlyReport = async (req, res) => {
  try {
    const month = parseInt(req.params.month);
    const year = parseInt(req.query.year);

    if (isNaN(month) || isNaN(year)) {
      return res.status(400).json({ success: false, message: "Invalid month or year" });
    }

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const data = await Customer.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$productId",
          product: {
            $first: {
              $concat: [
                { $ifNull: ["$productInfo.name", "Unknown"] },
                " (",
                { $ifNull: ["$productInfo.model", "N/A"] },
                ")"
              ]
            }
          },
          units: { $sum: 1 },
          total: { $sum: { $ifNull: ["$productPrice", 0] } }
        }
      }
    ]);

    const totalMonthly = data.reduce((sum, v) => sum + (v.total || 0), 0);

    res.json({
      success: true,
      data: {
        rows: data,
        totalMonthly,
        topItem: data.length > 0 ? data[0] : null
      }
    });
  } catch (err) {
    console.error("Monthly Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
