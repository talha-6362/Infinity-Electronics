import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
accountNo: { type: String, unique: true },
  custName: String,
  custPhone: String,
  custCNIC: String,
  custAddress: String,

  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  productPrice: Number,
  advancePayment: Number,
  monthlyInstallment: Number,

  witnessName: String,
  witnessPhone: String,
  witnessCNIC: String,
  witnessAddress: String,

}, { timestamps: true });

export default mongoose.model("Customer", customerSchema);
