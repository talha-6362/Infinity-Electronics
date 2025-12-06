import Installment from "../models/Installment.js";

export const getInstallments = async (req, res) => {
  try {
    const { cnic, accountNo } = req.query;
    if (!cnic && !accountNo) {
      return res.status(400).json({ success: false, message: "CNIC or AccountNo required" });
    }

    const query = {};
    if (cnic) query.cnic = cnic;
    if (accountNo) query.accountNo = accountNo;

    const installments = await Installment.find(query).sort({ dueDate: 1 });

    if (!installments.length) {
      return res.status(404).json({ success: false, message: "No installments found" });
    }

    res.json({ success: true, data: installments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
