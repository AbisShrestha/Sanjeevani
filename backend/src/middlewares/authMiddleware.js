const jwt = require('jsonwebtoken');

/**
 * Verify JWT token (user must be logged in)
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error(`[AUTH_ERROR] 401 No Token! Route: ${req.method} ${req.originalUrl}`);
    return res
      .status(401)
      .json({ message: 'Access denied. No token provided.' });
  }

  if (!process.env.JWT_SECRET) {
    return res
      .status(500)
      .json({ message: 'JWT configuration error' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: 'Invalid or expired token' });
  }
};

/**
 * Role-based access control
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Forbidden: Access denied' });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles,
};
