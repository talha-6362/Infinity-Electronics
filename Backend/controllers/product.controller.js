import Product from "../models/Product.js";
import fs from "fs";
export const createProduct = async (req, res) => {
  try {
    const { name, model,  category, warranty, units, price, description } = req.body;

    const imagePath = req.file ? req.file.path : null;

    const product = await Product.create({
      name,
       model, 
      category,
      warranty,
      units,
      price,
      description,
      image: imagePath
    });

    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const data = await Product.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) return res.status(404).json({ message: "Product not found" });

   if (req.file && existingProduct.image) {
  try {
    await fs.promises.unlink(existingProduct.image);
    console.log("Old image deleted ");
  } catch (err) {
    console.log("Failed to delete old image:", err);
  }
}


    const { name, model,  category, warranty, units, price, description } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
      if (model) updateData.model = model;
    if (category) updateData.category = category;
    if (warranty) updateData.warranty = warranty;
    if (units) updateData.units = units;
    if (price) updateData.price = price;
    if (description) updateData.description = description;

    if (req.file) updateData.image = req.file.path;

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.json({ message: "Product updated", product: updated });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.image) {
      fs.unlink(product.image, (err) => {
        if (err) console.log("Image delete failed:", err);
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

