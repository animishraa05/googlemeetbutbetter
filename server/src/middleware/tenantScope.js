module.exports = function tenantScope(req, res, next) {
  if (!req.user?.institutionId) {
    return res.status(403).json({ error: "No institution scope on token" });
  }
  req.institutionId = req.user.institutionId;
  next();
};
