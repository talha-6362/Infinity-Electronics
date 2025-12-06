import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import requestRoutes from "./routes/request.routes.js";
import installmentRoutes from "./routes/installment.routes.js";
import userRoutes from "./routes/user.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import financeRoutes from "./routes/finance.routes.js";

const app = express();

connectDB();

app.use("/uploads", express.static("uploads"));

const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  process.env.FRONTEND_URL   
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/installments", installmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/finance", financeRoutes);

import { authMiddleware } from "./middleware/auth.js";

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "You are authorized", user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
