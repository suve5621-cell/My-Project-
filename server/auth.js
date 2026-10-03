const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.JWT_SECRET || 'ai-resume-scorer-super-secret-key-2026';
const TOKEN_EXPIRY = '7d';

/**
 * Hash a plain password using bcrypt
 */
async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

/**
 * Compare plain password with stored hash
 */
async function comparePassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

/**
 * Generate a JWT token for an authenticated user
 */
function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name
    },
    AUTH_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

/**
 * Express middleware to authenticate JWT token
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : req.query.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in.'
    });
  }

  try {
    const decoded = jwt.verify(token, AUTH_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Session expired. Please log in again.'
      });
    }
    return res.status(403).json({
      success: false,
      error: 'Invalid authentication token.'
    });
  }
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  authenticateToken,
  AUTH_SECRET
};
