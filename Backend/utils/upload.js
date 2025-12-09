import cloudinary from "./cloudinary.js";
import fs from "fs";

export const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "my_app_uploads",
    });
    fs.unlinkSync(filePath); 
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};
