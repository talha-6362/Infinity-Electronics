
import User from "../models/User.js";

export const getUsers = async (req, res) => {
  console.log("GET /users called by:", req.user); 
  try {
    const users = await User.find({}, "email role"); 
    console.log("Users fetched:", users); 
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated", user });
  } catch (err) {
    console.error("Update user error:", err); 
    res.status(500).json({ message: err.message });
  }
};
