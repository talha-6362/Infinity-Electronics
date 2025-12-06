import express from "express";
import { getInstallments } from "../controllers/installment.controller.js";

const router = express.Router();

router.get("/", getInstallments);

export default router;
