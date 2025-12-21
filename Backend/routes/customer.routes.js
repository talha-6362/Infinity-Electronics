import express from "express";
import { 
  createCustomer, 
  getAllCustomers, 
  getProductById, 
  updateCustomerRemaining,
  getCustomerByAccount,
  updateCustomerDetails,
  getInstallmentSummary,
  getHistoryByCNIC
} from "../controllers/customer.controller.js";

const router = express.Router();

router.get("/all", getAllCustomers); 
router.post("/add", createCustomer);  
router.get("/product/:id", getProductById);   
router.get("/history/:cnic", getHistoryByCNIC);
router.get("/account/:accountNo", getCustomerByAccount);   
router.put("/update/:id", updateCustomerDetails);          
router.put("/:id", updateCustomerRemaining);               
router.get("/installments/summary", getInstallmentSummary);

export default router;
