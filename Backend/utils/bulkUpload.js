import fs from "fs";
import path from "path";
import cloudinary from "./cloudinary.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const uploadFolder = path.join(process.cwd(), "uploads");

const uploadImagesAndUpdateDB = async () => {
  try {
    if (!fs.existsSync(uploadFolder)) {
      console.error(`Upload folder does not exist: ${uploadFolder}`);
      return process.exit(1);
    }

    const files = fs.readdirSync(uploadFolder);
    if (files.length === 0) {
      console.log("No files found in the upload folder.");
      return process.exit(0);
    }

    for (const file of files) {
      const filePath = path.join(uploadFolder, file);

      const result = await cloudinary.uploader.upload(filePath, {
        folder: "my_app_uploads",
        resource_type: "auto",
      });

      console.log(`Uploaded: ${file} → ${result.secure_url}`);

      const product = await Product.findOne({ image: { $regex: file, $options: "i" } });
      if (product) {
        product.image = result.secure_url;
        await product.save();
        console.log(`Database updated for product: ${product.name}`);
      } else {
        console.log(`No product found in DB for file: ${file}`);
      }

     fs.unlinkSync(filePath);
    }

    console.log("All images processed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error uploading images:", error);
    process.exit(1);
  }
};

uploadImagesAndUpdateDB();
