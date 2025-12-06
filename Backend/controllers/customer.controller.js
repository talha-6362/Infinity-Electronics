import Customer from "../models/customers.js";
import Product from "../models/Product.js";

function generateAccountNo() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}


export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.json({ success: false, message: "Product not found" });

    res.json({ success: true, data: product });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};


export const createCustomer = async (req, res) => {
  try {
    const { accountNo } = req.body; 
    if (!accountNo) {
      return res.json({ success: false, message: "Account number is required" });
    }

    
    const existingCustomer = await Customer.findOne({ accountNo });
    if (existingCustomer) {
      return res.json({ success: false, message: "Customer with this accountNo already exists" });
    }

    const customer = await Customer.create({
      ...req.body,
      accountNo 
    });

    res.json({ success: true, data: customer });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};


export const getAllCustomers = async (req, res) => {
  try {
    const data = await Customer.find().populate("productId").lean();

    const customersWithRemaining = data.map(c => ({
      ...c,
      remainingAmount: c.productPrice - c.advancePayment
    }));

    res.json({ success: true, data: customersWithRemaining });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

export const updateCustomerRemaining = async (req, res) => {
  try {
    const { remainingAmount } = req.body;

    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.json({ success: false, message: "Customer not found" });

    customer.advancePayment = customer.productPrice - remainingAmount;
    await customer.save();

    res.json({ success: true, data: customer });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};


export const getCustomerByAccount = async (req, res) => {
  try {
    const customer = await Customer.findOne({ accountNo: req.params.accountNo })
      .populate("productId");

    if (!customer) {
      return res.json({ success: false, message: "Customer not found" });
    }

    res.json({ success: true, data: customer });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};


export const updateCustomerDetails = async (req, res) => {
  try {
    const updateData = req.body;

    const updated = await Customer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.json({ success: false, message: "Customer not found" });
    }

    res.json({ success: true, data: updated });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
export const getInstallmentSummary = async (req, res) => {
  try {
    const customers = await Customer.find().populate("productId");

    const clean = customers.map(c => {
      const totalPrice = c.productPrice;
      const paid = c.advancePayment;
      const monthly = c.monthlyInstallment;
      const remaining = totalPrice - paid;

      return {
        name: c.custName,
        product: c.productId?.name || "",
        accountNo: c.accountNo,
        phone: c.custPhone,
        totalPrice,
        paid,
        monthly,
        remaining,
        createdAt: c.createdAt
      };
    });

    res.json({ success: true, data: clean });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
