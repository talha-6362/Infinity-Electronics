import Request from "../models/Request.js";
import Product from "../models/Product.js";
export const createRequest = async (req, res) => {
  try {
   const lastRequest = await Request.findOne().sort({ createdAt: -1 });
let newAccountNo = "0001"; 
if (lastRequest && lastRequest.accountNo) {
  let lastNo = parseInt(lastRequest.accountNo, 10);
  let nextNo = lastNo + 1;
  newAccountNo = nextNo.toString().padStart(4, "0");
}


    const newRequest = new Request({
      ...req.body,
      accountNo: newAccountNo
    });

    const savedRequest = await newRequest.save();

    res.status(201).json({
      success: true,
      data: savedRequest
    });

  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getRequestsByCNIC = async (req, res) => {
  try {
    const { cnic } = req.params;
    const requests = await Request.find({ cnic }).populate("productId");

    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find().populate("productId");
    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    const request = await Request.findById(id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    request.status = status;
    await request.save();

    if (status === "approved") {
      const product = await Product.findById(request.productId);
      if (product && product.units > 0) {
        product.units -= 1;
        await product.save();
      }
    }

    res.status(200).json({ success: true, data: request });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const searchRequests = async (req, res) => {
  try {
    const { cnic, productId } = req.query;

    let filter = {};

    if (cnic) filter.cnic = cnic;
    if (productId) filter.productId = productId;

    if (!cnic && !productId) {
      return res.status(400).json({
        success: false,
        message: "Please provide CNIC or Product ID"
      });
    }

    const requests = await Request.find(filter);

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getRequestsByPhoneOrCNIC = async (req, res) => {
  try {
    const { value } = req.params;

    const requests = await Request.find({
      $or: [{ cnic: value }, { phone: value }]
    }).populate("productId");

    let customer;

    if (requests.length > 0) {
      customer = {
        lastAccountNo: requests[requests.length - 1].accountNo,
        custName: requests[0].custName,
        phone: requests[0].phone,
        cnic: requests[0].cnic,
        address: requests[0].address,
        products: requests.map(r => ({
          _id: r.productId?._id,
          productName: r.productName,
          productModel: r.productModel,
          productPrice: r.productPrice
        }))
      };
    } else {
      customer = null;
    }

    res.status(200).json({
      success: true,
      data: customer
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
