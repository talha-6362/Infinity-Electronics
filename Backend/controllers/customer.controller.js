import Customer from "../models/customers.js";
import Product from "../models/Product.js";




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
    let { accountNo, custCNIC, productId, advancePayment } = req.body;
    const lastCustomer = await Customer.findOne({ custCNIC }).sort({ createdAt: -1 });
    if (lastCustomer) {
      accountNo = Number(lastCustomer.accountNo) + 1000;
    } else if (!accountNo) {
      accountNo = generateAccountNo();
    }

    const customer = await Customer.create({
      ...req.body,
      accountNo,
      payments: advancePayment ? [{ amount: advancePayment }] : []
    });

    res.json({ success: true, data: customer });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};


export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .populate("productId")
      .lean();

    const result = customers.map(c => {
      const payments = c.payments || [];
      const totalPaid = payments.reduce((s, p) => s + p.amount, 0);

      return {
        _id: c._id,
        accountNo: c.accountNo,
        custName: c.custName,
        custPhone: c.custPhone,
        custCNIC: c.custCNIC,

        productName: c.productId?.name || "",
        productModel: c.productId?.model || "",
        productPrice: c.productPrice,

        totalPaid,
        remainingAmount: c.productPrice - totalPaid,
        monthlyInstallment: c.monthlyInstallment,

        witness: {
          name: c.witnessName,
          phone: c.witnessPhone,
          cnic: c.witnessCNIC,
          address: c.witnessAddress
        },

        payments,
        createdAt: c.createdAt
      };
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};


export const updateCustomerRemaining = async (req, res) => {
  try {
    const { paidAmount } = req.body;

    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res.json({ success: false, message: "Customer not found" });

    customer.payments.push({ amount: paidAmount });
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
      {
        custName: updateData.custName,
        custPhone: updateData.custPhone,
        custCNIC: updateData.custCNIC,
        witnessName: updateData.witnessName,
        witnessPhone: updateData.witnessPhone,
        witnessCNIC: updateData.witnessCNIC,
        witnessAddress: updateData.witnessAddress
      },
      { new: true }
    );

    if (!updated) return res.json({ success: false, message: "Customer not found" });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
export const getInstallmentSummary = async (req, res) => {
  try {
    const customers = await Customer.find().populate("productId");

    const clean = customers.map(c => {
      const payments = c.payments || [];
      const totalPaid = payments.reduce((s, p) => s + p.amount, 0);

      return {
        name: c.custName,
        product: c.productId?.name || "",
        accountNo: c.accountNo,
        phone: c.custPhone,
        totalPrice: c.productPrice,
        paid: totalPaid,
        monthly: c.monthlyInstallment,
        remaining: c.productPrice - totalPaid,
        payments, 
        remaining: Math.max(c.productPrice - totalPaid, 0),
        createdAt: c.createdAt
      };
    });

    res.json({ success: true, data: clean });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export const getHistoryByCNIC = async (req, res) => {
  try {
    const customers = await Customer
      .find({ custCNIC: req.params.cnic })
      .populate("productId");

    const result = customers.map(c => {
      const payments = c.payments || [];
      const paid = payments.reduce((s, p) => s + p.amount, 0);

      return {
        accountNo: c.accountNo,
        product: c.productId?.name,
        model: c.productId?.model,
        totalPrice: c.productPrice,
        totalPaid: paid,
        remaining: c.productPrice - paid,
        installments: payments
      };
    });

    res.json({ success: true, data: result });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
