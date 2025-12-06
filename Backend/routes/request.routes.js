import express from "express";
import { createRequest,getRequestsByCNIC,getAllRequests,
updateRequestStatus,searchRequests,getRequestsByPhoneOrCNIC }from "../controllers/request.controller.js";

const router = express.Router();

router.post("/", createRequest);

router.get("/search", searchRequests);        
router.put("/status/:id", updateRequestStatus);
router.get("/all", getAllRequests);           

router.get("/customer/:value", getRequestsByPhoneOrCNIC);
router.get("/:cnic", getRequestsByCNIC);



export default router;
