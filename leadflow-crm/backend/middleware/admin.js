const adminOnly = (req, res, next) => {
  try {
    // req.user comes from auth middleware
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = adminOnly;