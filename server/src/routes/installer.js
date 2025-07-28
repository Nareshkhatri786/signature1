const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const logger = require('../config/logger');

const router = express.Router();

// Installation lock file path
const INSTALL_LOCK_FILE = path.join(__dirname, '../../.install-lock');

// Check if installation is already completed
const isInstalled = async () => {
  try {
    await fs.access(INSTALL_LOCK_FILE);
    return true;
  } catch (error) {
    return false;
  }
};

// Create installation lock file
const createInstallLock = async () => {
  try {
    await fs.writeFile(INSTALL_LOCK_FILE, JSON.stringify({
      installed: true,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    logger.error('Failed to create install lock file:', error);
  }
};

// Middleware to check if installation is already completed
const checkInstallationLock = async (req, res, next) => {
  const installed = await isInstalled();
  
  if (installed && req.path !== '/status') {
    return res.status(423).json({
      error: 'Installation already completed',
      message: 'The CRM has already been installed. Please remove the .install-lock file to reinstall.'
    });
  }
  
  next();
};

// Get installation status
router.get('/status', async (req, res) => {
  try {
    const installed = await isInstalled();
    
    res.json({
      installed,
      timestamp: installed ? new Date().toISOString() : null
    });
  } catch (error) {
    logger.error('Installation status check error:', error);
    res.status(500).json({
      error: 'Failed to check installation status'
    });
  }
});

// Test database connection
router.post('/test-database', checkInstallationLock, async (req, res) => {
  try {
    const { host, port, name, username, password } = req.body;
    
    if (!host || !port || !name || !username || !password) {
      return res.status(400).json({
        error: 'All database fields are required'
      });
    }
    
    // Test connection
    const testPool = new Pool({
      host,
      port: parseInt(port),
      database: name,
      user: username,
      password,
      max: 1,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 5000
    });
    
    const client = await testPool.connect();
    await client.query('SELECT 1');
    client.release();
    await testPool.end();
    
    res.json({
      success: true,
      message: 'Database connection successful'
    });
    
  } catch (error) {
    logger.error('Database test error:', error);
    
    let errorMessage = 'Database connection failed';
    
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Unable to connect to database. Please check host and port.';
    } else if (error.code === '28P01') {
      errorMessage = 'Invalid database credentials.';
    } else if (error.code === '3D000') {
      errorMessage = 'Database does not exist.';
    }
    
    res.status(400).json({
      error: errorMessage,
      details: error.message
    });
  }
});

// Complete installation
router.post('/complete', checkInstallationLock, async (req, res) => {
  try {
    const { database, application, admin } = req.body;
    
    // Validate required fields
    if (!database || !application || !admin) {
      return res.status(400).json({
        error: 'All configuration sections are required'
      });
    }
    
    if (!database.host || !database.port || !database.name || !database.username || !database.password) {
      return res.status(400).json({
        error: 'All database fields are required'
      });
    }
    
    if (!application.jwtSecret) {
      return res.status(400).json({
        error: 'JWT secret is required'
      });
    }
    
    if (!admin.name || !admin.email || !admin.password) {
      return res.status(400).json({
        error: 'All admin user fields are required'
      });
    }
    
    // Test database connection first
    const pool = new Pool({
      host: database.host,
      port: parseInt(database.port),
      database: database.name,
      user: database.username,
      password: database.password,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });
    
    let client;
    try {
      client = await pool.connect();
      await client.query('SELECT 1');
    } catch (error) {
      await pool.end();
      throw new Error('Database connection failed: ' + error.message);
    }
    
    // Create .env file
    const envContent = `
# Database Configuration
DB_HOST=${database.host}
DB_PORT=${database.port}
DB_NAME=${database.name}
DB_USER=${database.username}
DB_PASSWORD=${database.password}

# Application Configuration
JWT_SECRET=${application.jwtSecret}
NODE_ENV=production
PORT=3001

# CORS Configuration
CORS_ORIGIN=${application.corsOrigin || 'http://localhost'}

# Frontend Configuration
REACT_APP_API_URL=${application.corsOrigin || 'http://localhost'}/api
REACT_APP_ENVIRONMENT=production

# Email Configuration (Optional - configure later)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
FROM_EMAIL=noreply@signatureproperties.com
FROM_NAME=Signature Properties CRM

# WhatsApp Configuration (Optional - configure later)
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
`;
    
    await fs.writeFile(path.join(__dirname, '../../.env'), envContent);
    
    // Run database schema
    const schemaSQL = await fs.readFile(path.join(__dirname, '../database/schema.sql'), 'utf8');
    await client.query(schemaSQL);
    
    // Create admin user
    const hashedPassword = await bcrypt.hash(admin.password, 12);
    
    await client.query(`
      INSERT INTO users (name, email, password_hash, role, project_ids, active, created_at, updated_at)
      VALUES ($1, $2, $3, 'Admin', ARRAY[1,2,3,4], true, NOW(), NOW())
    `, [admin.name, admin.email, hashedPassword]);
    
    // Insert sample projects if they don't exist
    const projectCheck = await client.query('SELECT COUNT(*) FROM projects');
    if (parseInt(projectCheck.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO projects (name, location, description, status, total_units, available_units, price_range_min, price_range_max, created_by, created_at, updated_at) VALUES
        ('Skyline Residences', 'Whitefield, Bangalore', 'Premium residential apartments with modern amenities', 'Active', 120, 45, 2500000, 3500000, 1, NOW(), NOW()),
        ('Green Valley Apartments', 'Electronic City, Bangalore', 'Eco-friendly apartments with solar power', 'Active', 80, 32, 1800000, 2800000, 1, NOW(), NOW()),
        ('Premium Villas', 'Sarjapur Road, Bangalore', 'Luxury independent villas with private gardens', 'Active', 24, 8, 6000000, 8500000, 1, NOW(), NOW()),
        ('Commercial Complex', 'MG Road, Bangalore', 'Prime commercial spaces for offices and retail', 'Active', 50, 15, 4000000, 12000000, 1, NOW(), NOW())
      `);
    }
    
    client.release();
    await pool.end();
    
    // Create installation lock file
    await createInstallLock();
    
    logger.info('Installation completed successfully');
    
    res.json({
      success: true,
      message: 'Installation completed successfully',
      adminUser: {
        name: admin.name,
        email: admin.email
      }
    });
    
  } catch (error) {
    logger.error('Installation error:', error);
    
    res.status(500).json({
      error: 'Installation failed',
      message: error.message
    });
  }
});

// Remove installation (for development/testing)
router.delete('/remove', async (req, res) => {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        error: 'Installation removal not allowed in production'
      });
    }
    
    await fs.unlink(INSTALL_LOCK_FILE);
    
    res.json({
      success: true,
      message: 'Installation removed successfully'
    });
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        error: 'Installation lock file not found'
      });
    }
    
    logger.error('Installation removal error:', error);
    res.status(500).json({
      error: 'Failed to remove installation'
    });
  }
});

module.exports = router;