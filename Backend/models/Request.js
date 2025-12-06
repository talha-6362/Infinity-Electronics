import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  accountNo: { type: String, unique:true },  
  custName: { type: String, required: true },   
  phone: { type: String, required: true },
  cnic: { type: String, required: true },
  address: { type: String, required: true },

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  productName: { type: String, required: true },
  productModel: { type: String, required: true },
  productPrice: { type: String, required: true },
  productSpecs: { type: String, required: true },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  createdAt: { type: Date, default: Date.now }
});



const Request = mongoose.model("Request", requestSchema);
export default Request;
