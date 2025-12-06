import mongoose from "mongoose";

const installmentSchema = new mongoose.Schema({
  accountNo: { type: String, required: true },
  cnic: { type: String, required: true },
  productName: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ["Paid", "Pending"], default: "Pending" }
});

const Installment = mongoose.model("Installment", installmentSchema);
export default Installment;
