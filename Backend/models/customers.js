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

  payments: [
    {
      amount: { type: Number, required: true },
      paidAt: { type: Date, default: Date.now }
    }
  ],

  witnessName: String,
  witnessPhone: String,
  witnessCNIC: String,
  witnessAddress: String,

}, { timestamps: true });

export default mongoose.model("Customer", customerSchema);
