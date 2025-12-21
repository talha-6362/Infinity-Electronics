// migrateProducts.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";
import User from "./models/User.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");
    
    const adminUser = await User.findOne({ role: "admin" });
    
    if (!adminUser) {
      console.log("❌ No admin user found!");
      
      const firstUser = await User.findOne();
      if (firstUser) {
        console.log(`Using first user as admin: ${firstUser.email}`);
        
        const result = await Product.updateMany(
          { addedBy: { $exists: false } },
          {
            $set: {
              addedBy: firstUser._id,
              addedByRole: "admin"
            }
          }
        );
        
        console.log(`✅ Updated ${result.modifiedCount} products with user: ${firstUser.email}`);
      } else {
        console.log("❌ No users found in database!");
      }
      
      process.exit(1);
    }
    
    console.log(`✅ Found admin user: ${adminUser.email} (ID: ${adminUser._id})`);
    
    // Update all existing products that don't have addedBy field
    const result = await Product.updateMany(
      { 
        $or: [
          { addedBy: { $exists: false } },
          { addedBy: null },
          { addedByRole: { $exists: false } }
        ]
      },
      {
        $set: {
          addedBy: adminUser._id,
          addedByRole: "admin"
        }
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} products`);
    
    // Verify the update
    const productCount = await Product.countDocuments();
    const productsWithAddedBy = await Product.countDocuments({ addedBy: { $exists: true } });
    
    console.log(`📊 Total products: ${productCount}`);
    console.log(`📊 Products with addedBy field: ${productsWithAddedBy}`);
    
    // Show some sample products
    const sampleProducts = await Product.find().limit(3);
    console.log("\n📋 Sample products after migration:");
    sampleProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - AddedBy: ${product.addedBy}, Role: ${product.addedByRole}`);
    });
    
    mongoose.connection.close();
    console.log("\n✅ Migration completed successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Migration error:", err);
    process.exit(1);
  });