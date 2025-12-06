import Request from "../models/Request.js";

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

    const updated = await Request.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
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

    if (!requests || requests.length === 0) {
      return res.status(404).json({ success: false, data: [] });
    }

    // Single customer format
    const customer = {
      accountNo: requests[0].accountNo,
      custName: requests[0].custName,
      phone: requests[0].phone,
      cnic: requests[0].cnic,
      address: requests[0].address,

      // Collect all products from all requests
      products: requests.map(r => ({
        _id: r.productId?._id,
        productName: r.productName,
        productModel: r.productModel,
        productPrice: r.productPrice
      }))
    };

    res.status(200).json({
      success: true,
      data: customer
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
