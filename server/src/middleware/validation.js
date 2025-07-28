const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  
  next();
};

// Common validation rules
const emailValidation = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Valid email is required');

const phoneValidation = body('phone')
  .isMobilePhone()
  .withMessage('Valid phone number is required');

const passwordValidation = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long');

const idValidation = param('id')
  .isInt({ min: 1 })
  .withMessage('Valid ID is required');

// Lead validation
const leadValidation = [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('email').optional().isEmail().normalizeEmail(),
  body('source').trim().isLength({ min: 1 }).withMessage('Source is required'),
  body('project_id').isInt({ min: 1 }).withMessage('Valid project ID is required'),
  body('priority').isIn(['High', 'Medium', 'Low']).withMessage('Valid priority is required'),
  body('notes').optional().trim(),
  body('budget_min').optional().isNumeric(),
  body('budget_max').optional().isNumeric(),
  handleValidationErrors
];

// Opportunity validation
const opportunityValidation = [
  body('lead_id').isInt({ min: 1 }).withMessage('Valid lead ID is required'),
  body('project_id').isInt({ min: 1 }).withMessage('Valid project ID is required'),
  body('stage').isIn(['Scheduled', 'Visit Done', 'Negotiation', 'Booking', 'Lost']).withMessage('Valid stage is required'),
  body('value').isNumeric({ min: 0 }).withMessage('Valid value is required'),
  body('probability').isInt({ min: 0, max: 100 }).withMessage('Probability must be between 0 and 100'),
  body('visit_date').optional().isISO8601(),
  body('expected_close_date').optional().isISO8601(),
  body('notes').optional().trim(),
  handleValidationErrors
];

// Site visit validation
const siteVisitValidation = [
  body('lead_id').optional().isInt({ min: 1 }),
  body('opportunity_id').optional().isInt({ min: 1 }),
  body('project_id').isInt({ min: 1 }).withMessage('Valid project ID is required'),
  body('visit_date').isISO8601().withMessage('Valid visit date is required'),
  body('status').isIn(['Scheduled', 'Completed', 'Cancelled', 'Rescheduled']).withMessage('Valid status is required'),
  body('notes').optional().trim(),
  body('feedback').optional().trim(),
  handleValidationErrors
];

// User validation
const userValidation = [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  emailValidation,
  body('role').isIn(['Admin', 'Project Manager', 'Sales Executive', 'Telecaller']).withMessage('Valid role is required'),
  body('project_ids').optional().isArray(),
  handleValidationErrors
];

// Project validation
const projectValidation = [
  body('name').trim().isLength({ min: 1 }).withMessage('Project name is required'),
  body('location').trim().isLength({ min: 1 }).withMessage('Location is required'),
  body('description').optional().trim(),
  body('status').optional().trim(),
  body('total_units').optional().isInt({ min: 0 }),
  body('available_units').optional().isInt({ min: 0 }),
  body('price_range_min').optional().isNumeric({ min: 0 }),
  body('price_range_max').optional().isNumeric({ min: 0 }),
  handleValidationErrors
];

// Login validation
const loginValidation = [
  body('email').trim().isLength({ min: 1 }).withMessage('Email is required'),
  passwordValidation,
  handleValidationErrors
];

// Pagination validation
const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().trim(),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  emailValidation,
  phoneValidation,
  passwordValidation,
  idValidation,
  leadValidation,
  opportunityValidation,
  siteVisitValidation,
  userValidation,
  projectValidation,
  loginValidation,
  paginationValidation
};