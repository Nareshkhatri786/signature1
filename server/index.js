const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

// Import configurations and middleware
const { testConnection } = require('./src/config/database');
const logger = require('./src/config/logger');

// Import routes
const installerRoutes = require('./src/routes/installer');
const authRoutes = require('./src/routes/auth');
const leadsRoutes = require('./src/routes/leads');
const opportunitiesRoutes = require('./src/routes/opportunities');
const projectsRoutes = require('./src/routes/projects');
// const siteVisitsRoutes = require('./src/routes/site-visits');
// const usersRoutes = require('./src/routes/users');
// const reportsRoutes = require('./src/routes/reports');
// const interactionsRoutes = require('./src/routes/interactions');

const app = express();
const PORT = process.env.PORT || 3001;

// Installation lock file path
const INSTALL_LOCK_FILE = path.join(__dirname, '.install-lock');

// Check if installation is completed
const isInstalled = async () => {
  try {
    await fs.access(INSTALL_LOCK_FILE);
    return true;
  } catch (error) {
    return false;
  }
};

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      process.env.CORS_ORIGIN
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// More strict rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later'
  }
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
} else {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Installation routes (always available)
app.use('/api/install', installerRoutes);

// Middleware to check installation for protected routes
const requireInstallation = async (req, res, next) => {
  const installed = await isInstalled();
  
  if (!installed) {
    return res.status(503).json({
      error: 'Installation required',
      message: 'Please complete the installation first'
    });
  }
  
  next();
};

// Protected API routes (require installation)
app.use('/api/auth', authLimiter, requireInstallation, authRoutes);
app.use('/api/leads', requireInstallation, leadsRoutes);
app.use('/api/opportunities', requireInstallation, opportunitiesRoutes);
app.use('/api/projects', requireInstallation, projectsRoutes);
// app.use('/api/site-visits', requireInstallation, siteVisitsRoutes);
// app.use('/api/users', requireInstallation, usersRoutes);
// app.use('/api/reports', requireInstallation, reportsRoutes);
// app.use('/api/interactions', requireInstallation, interactionsRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  // Catch all handler for React Router
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }
  
  if (err.code === '23505') { // PostgreSQL unique constraint violation
    return res.status(409).json({
      error: 'Duplicate entry',
      details: 'A record with this information already exists'
    });
  }
  
  if (err.code === '23503') { // PostgreSQL foreign key constraint violation
    return res.status(400).json({
      error: 'Invalid reference',
      details: 'Referenced record does not exist'
    });
  }
  
  // Default error response
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    const installed = await isInstalled();
    
    if (installed) {
      // Test database connection only if installed
      const dbConnected = await testConnection();
      
      if (!dbConnected) {
        logger.error('Failed to connect to database');
        logger.info('Please check your database configuration in .env file');
        // Continue startup anyway for installation purposes
      } else {
        logger.info('💾 Database: Connected');
      }
    } else {
      logger.info('🔧 Installation: Required - Visit /install to set up your CRM');
    }
    
    // Start HTTP server
    app.listen(PORT, () => {
      logger.info(`🚀 Signature Properties CRM API server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'localhost'}`);
      logger.info(`⚙️  Installation: ${installed ? 'Complete' : 'Required'}`);
      
      if (process.env.NODE_ENV !== 'production') {
        logger.info(`🔗 API Documentation: http://localhost:${PORT}/api/health`);
        if (!installed) {
          logger.info(`🔧 Installation URL: http://localhost:${PORT}/install`);
        }
      }
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Initialize server
startServer();

module.exports = app;