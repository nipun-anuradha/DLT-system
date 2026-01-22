const jwt = require('jsonwebtoken');
const { User, Admin } = require('../models/associations');

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT token for users
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);

    // Verify user still exists in database
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'username', 'mobile', 'department', 'branch', 'auth_provider']
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Middleware to verify JWT token for admins
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required'
      });
    }

    // Verify admin still exists in database
    const admin = await Admin.findByPk(decoded.id, {
      attributes: ['id', 'username']
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

module.exports = { authenticateUser, authenticateAdmin };
