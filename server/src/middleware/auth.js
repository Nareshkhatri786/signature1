const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const logger = require('../config/logger');

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Generate JWT token
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    projectIds: user.project_ids || []
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Verify JWT token middleware
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const token = authHeader.substring(7);
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get fresh user data from database
    const result = await query(
      'SELECT id, email, role, project_ids, name, avatar FROM users WHERE id = $1 AND active = true',
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    
    req.user = result.rows[0];
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Check user role middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Check project access middleware
const requireProjectAccess = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const user = req.user;
    
    // Admin has access to all projects
    if (user.role === 'Admin') {
      return next();
    }
    
    // Check if user has access to this project
    const userProjectIds = user.project_ids || [];
    
    if (!userProjectIds.includes(parseInt(projectId))) {
      return res.status(403).json({ error: 'Access denied to this project' });
    }
    
    next();
  } catch (error) {
    logger.error('Project access check error:', error);
    return res.status(500).json({ error: 'Access check failed' });
  }
};

module.exports = {
  generateToken,
  verifyToken,
  requireRole,
  requireProjectAccess
};