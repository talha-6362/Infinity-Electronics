
import jwt from "jsonwebtoken";

/**
 * Middleware to authorize users based on allowed roles
 * @param  {...string} roles - Allowed roles 
 */
export const authorizeRoles = (...roles) => (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.role || !(decoded.userId || decoded.id)) {
      return res.status(401).json({ message: "Invalid token structure" });
    }

    if (!roles.includes(decoded.role)) {
      return res.status(403).json({ 
        message: "Access denied: insufficient permissions",
        yourRole: decoded.role,
        requiredRoles: roles 
      });
    }

    req.user = {
      userId: decoded.userId || decoded.id,  
      role: decoded.role,
      email: decoded.email,
      name: decoded.name
    };
    
    
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
