// routes/finance.routes.js
import express from "express";
import {
  getWeeklyReport,
  getAvailableMonths,
  getMonthlyReport
} from "../controllers/finance.controller.js";

const router = express.Router();

router.get("/report/weekly", getWeeklyReport);
router.get("/report/months", getAvailableMonths);
router.get("/report/monthly/:month", getMonthlyReport);

export default router;
