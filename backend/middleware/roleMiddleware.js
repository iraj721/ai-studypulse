const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    console.log("=== ROLE CHECK ===");
    console.log("User role:", req.user.role);
    console.log("Required role:", requiredRole);
    console.log("==================");

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ 
        message: `Access denied. ${requiredRole} role required. Your role: ${req.user.role}`,
        userRole: req.user.role,
        requiredRole: requiredRole
      });
    }

    next();
  };
};

module.exports = roleMiddleware;