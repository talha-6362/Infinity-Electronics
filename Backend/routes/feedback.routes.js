import express from "express";
import { createFeedback, getAllFeedbacks, searchFeedbacks } from "../controllers/feedback.controller.js";

const router = express.Router();

router.post("/", createFeedback);

router.get("/all", getAllFeedbacks);

router.get("/search", searchFeedbacks);

export default router;
