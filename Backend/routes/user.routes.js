import express from "express";
import { getUsers, updateUser } from "../controllers/user.controller.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, verifyAdmin, getUsers);

router.put("/:id", verifyToken, verifyAdmin, updateUser);

export default router;
