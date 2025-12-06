import express from "express";
import { 
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getProductById
} from "../controllers/product.controller.js";

import { allowCreateRole, adminOnly } from "../middleware/adminAuth.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

router.get("/", getProducts);

router.get("/:id", getProductById);

router.post("/", allowCreateRole, upload.single("image"), createProduct);

router.put("/:id", adminOnly, upload.single("image"), updateProduct);

router.delete("/:id", adminOnly, deleteProduct);

export default router;
