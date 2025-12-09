import Product from "../models/Product.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

// Create Product
export const createProduct = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    const { name, model, category, warranty, units, price, description } = req.body;

    let imageUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "my_app_uploads",
        resource_type: "auto"
      });
      console.log("Cloudinary result:", result);
      imageUrl = result.secure_url;

      // Optional: remove local file after upload
      fs.unlink(req.file.path, (err) => {
        if (err) console.log("Failed to delete local file:", err);
      });
    }

    const product = await Product.create({
      name,
      model,
      category,
      warranty,
      units,
      price,
      description,
      image: imageUrl
    });

    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    console.log("Create Product Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.log("Get Products Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    console.log("Get ProductById Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update product
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

      // Optional: remove local file after upload
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

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Delete image from Cloudinary
    if (product.image) {
      try {
        const parts = product.image.split("/");
        const publicIdWithExt = parts.slice(-1)[0]; // filename.ext
        const publicId = publicIdWithExt.split(".")[0]; // filename only
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
