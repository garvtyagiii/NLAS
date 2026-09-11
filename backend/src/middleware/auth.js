const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * authMiddleware — verifies Bearer JWT on every protected route.
 *
 * On success: attaches req.user = { id, name, email, role, state, district }
 * On failure: returns 401 with error code the frontend understands.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'MISSING_TOKEN', message: 'Authentication token required.' },
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_EXPIRED', message: 'Session expired. Please sign in again.' },
      });
    }
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid authentication token.' },
    });
  }
}

/**
 * requireRole — restrict route to specific roles.
 * Usage: router.post('/projects', auth, requireRole('CENTRAL_OFFICER','STATE_OFFICER'), handler)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission for this action.' },
      });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };
