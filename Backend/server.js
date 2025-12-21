// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import morgan from "morgan";
// import cookieParser from "cookie-parser";
// import multer from "multer";
// import connectDB from "./config/db.js";

// import authRoutes from "./routes/auth.routes.js";
// import productRoutes from "./routes/product.routes.js";
// import requestRoutes from "./routes/request.routes.js";
// import installmentRoutes from "./routes/installment.routes.js";
// import userRoutes from "./routes/user.routes.js";
// import feedbackRoutes from "./routes/feedback.routes.js";
// import customerRoutes from "./routes/customer.routes.js";
// import financeRoutes from "./routes/finance.routes.js";
// import uploadRoutes from "./routes/upload.routes.js";

// import { authMiddleware } from "./middleware/auth.js";

// const app = express();


// app.use(helmet());
// app.use(morgan("combined"));


// connectDB();


// if (process.env.NODE_ENV !== "production") {
//   app.use("/uploads", express.static("uploads"));
// }

// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true }));

// const allowedOrigins = [
//   "http://127.0.0.1:5500",
//   "http://localhost:5500",
//   process.env.FRONTEND_URL?.trim()
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
//   allowedHeaders: ["Content-Type", "Authorization"],
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"] 
// }));
// app.options("/*", cors());


// app.use(cookieParser());


// app.use("/api/auth", authRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/requests", requestRoutes);
// app.use("/api/installments", installmentRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/feedback", feedbackRoutes);
// app.use("/api/customers", customerRoutes);
// app.use("/api/finance", financeRoutes);
// app.use("/api/upload", uploadRoutes);


// app.get("/api/protected", authMiddleware, (req, res) => {
//   res.json({ message: "You are authorized", user: req.user });
// });


// app.use((err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     return res.status(400).json({
//       message: err.code === "LIMIT_FILE_SIZE"
//         ? "Image too large (max 8MB)"
//         : err.message
//     });
//   }
//   next(err);
// });

// app.use((req, res) => {
//   res.status(404).json({ message: "Route not found" });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(` Server running on port ${PORT}`);
// });
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import multer from "multer";
import connectDB from "./config/db.js";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import requestRoutes from "./routes/request.routes.js";
import installmentRoutes from "./routes/installment.routes.js";
import userRoutes from "./routes/user.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import financeRoutes from "./routes/finance.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

import { authMiddleware } from "./middleware/auth.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(morgan("combined"));

// Database connection
connectDB();

// Static files
if (process.env.NODE_ENV !== "production") {
  app.use("/uploads", express.static("uploads"));
}

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ **CORS Configuration - SIMPLE & WORKING**
const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL?.trim(),
  "null"
];

// ✅ **OPTION 1: Simple CORS (Recommended)**
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS not allowed for origin: ${origin}`));
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// ✅ **IMPORTANT: app.options() KI ZAROORAT NAHI HAI**
// Line 164 ko COMPLETELY DELETE KAR DEIN

// Cookie parser
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/installments", installmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/upload", uploadRoutes);

// Protected route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "You are authorized", user: req.user });
});

// ✅ **Add OPTIONS handler for all routes (Alternative)**
app.use((req, res, next) => {
  // Handle pre-flight requests
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(200);
  }
  next();
});

// Error handling middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  next();
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Allowed Origins:`, allowedOrigins);
});