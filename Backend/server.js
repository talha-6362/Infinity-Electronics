import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
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
import uploadRoutes from "./routes/upload.routes.js";
const app = express();
app.use(helmet());
app.use(morgan("combined"));

connectDB();

if (process.env.NODE_ENV !== "production") {
  app.use("/uploads", express.static("uploads"));
}
app.use(express.json({ limit: "10mb" }));

const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  process.env.FRONTEND_URL?.trim()  
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));


app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/installments", installmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/upload", uploadRoutes);
import { authMiddleware } from "./middleware/auth.js";

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "You are authorized", user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
