const { verifyToken } = require("./auth");

/**
 * Middleware to protect routes that require authentication.
 * Validates the Authorization header and attaches user to request.
 * 
 * Expected header: Authorization: Bearer <access_token>
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Access denied. No token provided.",
      code: "NO_TOKEN",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token, process.env.JWT_ACCESS_SECRET);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token has expired.",
        code: "TOKEN_EXPIRED",
      });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json({
        error: "Invalid token.",
        code: "INVALID_TOKEN",
      });
    }
    return res.status(403).json({
      error: "Token verification failed.",
      code: "TOKEN_VERIFICATION_FAILED",
    });
  }
};

/**
 * Middleware to restrict access to specific roles.
 * Use after authenticate middleware.
 * 
 * @param  {...string} allowedRoles - Roles that are allowed to access the route
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        error: "Authentication required.",
        code: "NO_AUTH",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "You do not have permission to access this resource.",
        code: "FORBIDDEN",
        requiredRoles: allowedRoles,
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
