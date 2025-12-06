import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  model: { type: String, required: true },   
  image: { type: String, required: true },
  category: { type: String, required: true },
  warranty: { type: String, required: true },
  units: { type: Number, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
export default Product;
