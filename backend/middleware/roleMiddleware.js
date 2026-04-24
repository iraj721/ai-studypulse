const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    console.log("User role:", req.user.role, "Required role:", requiredRole);

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ 
        message: `Access denied. ${requiredRole} role required. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

module.exports = roleMiddleware;