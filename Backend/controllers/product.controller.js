import Product from "../models/Product.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
export const createProduct = async (req, res) => {
  try {
    const { name, model, category, warranty, units, price, description } = req.body;

    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }
    
    const userId = req.user.userId || req.user.id;
    const userRole = req.user.role;
    
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User ID not found in token" 
      });
    }

    if (!name || !model || !category || !units || !price) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields"
      });
    }

    let imageUrl = null;
    if (req.file) {
      console.log("Uploading image to Cloudinary...");
      
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "my_app_uploads",
          resource_type: "auto"
        });
        
        imageUrl = result.secure_url;

        try {
          await fs.promises.unlink(req.file.path);
        } catch (unlinkErr) {
          console.warn(" Could not delete local file:", unlinkErr.message);
        }
        
      } catch (cloudinaryErr) {
        console.error(" Cloudinary upload failed:", cloudinaryErr);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image to Cloudinary"
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Product image is required"
      });
    }

    const product = await Product.create({
      name, 
      model, 
      category, 
      warranty, 
      units: parseInt(units), 
      price: parseFloat(price), 
      description, 
      image: imageUrl,
      addedBy: userId,
      addedByRole: userRole
    });

    return res.status(201).json({ 
      success: true,
      message: "Product created successfully", 
      product: {
        id: product._id,
        name: product.name,
        model: product.model,
        category: product.category,
        price: product.price,
        image: product.image,
        addedBy: product.addedBy,
        addedByRole: product.addedByRole
      }
    });
    
  } catch (error) {
    console.error(" Create Product Error:", error);
    
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ 
        success: false,
        message: "File too large. Maximum 8MB allowed." 
      });
    }
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: "Server error while creating product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.log("Get Products Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) 
      return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, data: product });
  } catch (error) {
    console.log("Get ProductById Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) return res.status(404).json({ message: "Product not found" });

    const { name, model, category, warranty, units, price, description } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (model) updateData.model = model;
    if (category) updateData.category = category;
    if (warranty) updateData.warranty = warranty;
    if (units) updateData.units = units;
    if (price) updateData.price = price;
    if (description) updateData.description = description;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "my_app_uploads",
        resource_type: "auto"
      });
      updateData.image = result.secure_url;

      fs.unlink(req.file.path, (err) => {
        if (err) console.log("Failed to delete local file:", err);
      });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ message: "Product updated", product: updated });
  } catch (error) {
    console.log("Update Product Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.image) {
      try {
        const parts = product.image.split("/");
        const publicIdWithExt = parts.slice(-1)[0]; 
        const publicId = publicIdWithExt.split(".")[0]; 
        await cloudinary.uploader.destroy(`my_app_uploads/${publicId}`);
      } catch (err) {
        console.log("Cloudinary delete failed:", err);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product Deleted" });
  } catch (error) {
    console.log("Delete Product Error:", error);
    res.status(500).json({ message: error.message });
  }
};