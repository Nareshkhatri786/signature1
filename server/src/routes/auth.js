const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { generateToken, verifyToken } = require('../middleware/auth');
const { loginValidation } = require('../middleware/validation');
const logger = require('../config/logger');

const router = express.Router();

// Login endpoint
router.post('/login', loginValidation, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Demo credentials for development
    const demoCredentials = [
      { email: 'admin@signatureproperties.com', password: 'admin123', role: 'Admin' },
      { email: 'admin', password: 'admin', role: 'Admin' },
      { email: 'demo@signatureproperties.com', password: 'demo123', role: 'Admin' },
      { email: 'manager@signatureproperties.com', password: 'manager123', role: 'Project Manager' },
      { email: 'sales@signatureproperties.com', password: 'sales123', role: 'Sales Executive' }
    ];
    
    // Check demo credentials first
    const demoUser = demoCredentials.find(
      cred => cred.email === email && cred.password === password
    );
    
    if (demoUser) {
      const mockUser = {
        id: 1,
        email: email,
        name: demoUser.role === 'Admin' ? 'Admin User' : 
              demoUser.role === 'Project Manager' ? 'Project Manager' : 
              demoUser.role === 'Sales Executive' ? 'Sales Executive' : 'Demo User',
        role: demoUser.role,
        project_ids: [1, 2, 3, 4],
        avatar: null,
        active: true
      };
      
      const token = generateToken(mockUser);
      
      logger.info(`Demo user ${email} logged in successfully`);
      
      return res.json({
        success: true,
        token,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          projectIds: mockUser.project_ids,
          avatar: mockUser.avatar
        }
      });
    }
    
    // Check database for real users
    const result = await query(
      'SELECT id, email, password_hash, name, role, project_ids, avatar, active FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = result.rows[0];
    
    if (!user.active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate token
    const token = generateToken(user);
    
    // Log successful login
    logger.info(`User ${email} logged in successfully`);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        projectIds: user.project_ids || [],
        avatar: user.avatar
      }
    });
    
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token endpoint
router.get('/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      projectIds: req.user.project_ids || [],
      avatar: req.user.avatar
    }
  });
});

// Logout endpoint (optional - mainly for logging)
router.post('/logout', verifyToken, (req, res) => {
  logger.info(`User ${req.user.email} logged out`);
  res.json({ success: true, message: 'Logged out successfully' });
});

// Change password endpoint
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    
    // Get current password hash
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    
    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, req.user.id]
    );
    
    logger.info(`User ${req.user.email} changed password`);
    
    res.json({ success: true, message: 'Password changed successfully' });
    
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({ error: 'Password change failed' });
  }
});

module.exports = router;