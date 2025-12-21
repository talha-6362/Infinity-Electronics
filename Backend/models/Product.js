// import mongoose from "mongoose";

// const productSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   model: { type: String, required: true },   
//   image: { type: String, required: true },
//   category: { type: String, required: true },
//   warranty: { type: String, required: true },
//   units: { type: Number, required: true },
  
//   price: { type: Number, required: true },
//   description: { type: String, required: true }
// }, { timestamps: true });

// const Product = mongoose.model("Product", productSchema);
// export default Product;
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  model: { 
    type: String, 
    required: true 
  },   
  image: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  warranty: { 
    type: String, 
    required: true 
  },
  units: { 
    type: Number, 
    required: true,
    min: 0
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  description: { 
    type: String, 
    required: true 
  },
  // ✅ **ADDED FIELDS for permissions:**
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  addedByRole: {
    type: String,
    enum: ["admin", "inventory"],
    required: true
  }
}, { 
  timestamps: true 
});

const Product = mongoose.model("Product", productSchema);
export default Product;