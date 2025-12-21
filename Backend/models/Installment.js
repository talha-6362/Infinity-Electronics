import mongoose from "mongoose";

const installmentSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },

  amountPaid: {
    type: Number,
    required: true
  },

  paidAt: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

export default mongoose.model("Installment", installmentSchema);
