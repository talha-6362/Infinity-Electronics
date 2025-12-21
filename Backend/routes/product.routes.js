import express from "express";
import { 
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getProductById
} from "../controllers/product.controller.js";

import { authorizeRoles } from "../middleware/adminAuth.js"; 
import { upload } from "../middleware/multer.js";

const router = express.Router();

router.get("/", getProducts);

router.get("/:id", getProductById);

router.post("/", authorizeRoles("admin", "inventory"), upload.single("image"), createProduct);

router.put("/:id", authorizeRoles("admin"), upload.single("image"), updateProduct);

router.delete("/:id", authorizeRoles("admin"), deleteProduct);

export default router;
