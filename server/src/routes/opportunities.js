const express = require('express');
const { query, transaction } = require('../config/database');
const { verifyToken, requireRole } = require('../middleware/auth');
const { opportunityValidation, idValidation, paginationValidation } = require('../middleware/validation');
const logger = require('../config/logger');

const router = express.Router();

// Get all opportunities with filtering and pagination
router.get('/', verifyToken, paginationValidation, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'created_at',
      sortOrder = 'desc',
      stage,
      project_id,
      assigned_to,
      search
    } = req.query;
    
    const offset = (page - 1) * limit;
    const user = req.user;
    
    // Build WHERE clause based on filters and user permissions
    let whereClause = 'WHERE 1=1';
    let queryParams = [];
    let paramCount = 0;
    
    // Apply project access restrictions
    if (user.role !== 'Admin') {
      const userProjectIds = user.project_ids || [];
      if (userProjectIds.length > 0) {
        whereClause += ` AND o.project_id = ANY($${++paramCount})`;
        queryParams.push(userProjectIds);
      } else {
        return res.json({ opportunities: [], total: 0, page: parseInt(page), totalPages: 0 });
      }
    }
    
    // Apply filters
    if (stage) {
      whereClause += ` AND o.stage = $${++paramCount}`;
      queryParams.push(stage);
    }
    
    if (project_id) {
      whereClause += ` AND o.project_id = $${++paramCount}`;
      queryParams.push(parseInt(project_id));
    }
    
    if (assigned_to) {
      whereClause += ` AND o.assigned_to = $${++paramCount}`;
      queryParams.push(parseInt(assigned_to));
    }
    
    if (search) {
      whereClause += ` AND (l.name ILIKE $${++paramCount} OR l.email ILIKE $${++paramCount} OR l.phone ILIKE $${++paramCount})`;
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }
    
    // Count total records
    const countQuery = `
      SELECT COUNT(*) as total
      FROM opportunities o
      LEFT JOIN leads l ON o.lead_id = l.id
      LEFT JOIN projects p ON o.project_id = p.id
      LEFT JOIN users u ON o.assigned_to = u.id
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);
    
    // Get opportunities with pagination
    const opportunitiesQuery = `
      SELECT 
        o.*,
        l.name as lead_name,
        l.phone as lead_phone,
        l.email as lead_email,
        p.name as project_name,
        u.name as assigned_to_name
      FROM opportunities o
      LEFT JOIN leads l ON o.lead_id = l.id
      LEFT JOIN projects p ON o.project_id = p.id
      LEFT JOIN users u ON o.assigned_to = u.id
      ${whereClause}
      ORDER BY o.${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    
    queryParams.push(parseInt(limit), offset);
    
    const opportunitiesResult = await query(opportunitiesQuery, queryParams);
    
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      opportunities: opportunitiesResult.rows,
      total,
      page: parseInt(page),
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    });
    
  } catch (error) {
    logger.error('Get opportunities error:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

// Get single opportunity by ID
router.get('/:id', verifyToken, idValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    let whereClause = 'WHERE o.id = $1';
    let queryParams = [id];
    
    // Apply project access restrictions
    if (user.role !== 'Admin') {
      const userProjectIds = user.project_ids || [];
      if (userProjectIds.length > 0) {
        whereClause += ' AND o.project_id = ANY($2)';
        queryParams.push(userProjectIds);
      } else {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    const opportunityQuery = `
      SELECT 
        o.*,
        l.name as lead_name,
        l.phone as lead_phone,
        l.email as lead_email,
        p.name as project_name,
        p.location as project_location,
        u.name as assigned_to_name
      FROM opportunities o
      LEFT JOIN leads l ON o.lead_id = l.id
      LEFT JOIN projects p ON o.project_id = p.id
      LEFT JOIN users u ON o.assigned_to = u.id
      ${whereClause}
    `;
    
    const result = await query(opportunityQuery, queryParams);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    
    res.json(result.rows[0]);
    
  } catch (error) {
    logger.error('Get opportunity error:', error);
    res.status(500).json({ error: 'Failed to fetch opportunity' });
  }
});

// Create new opportunity
router.post('/', verifyToken, opportunityValidation, async (req, res) => {
  try {
    const {
      lead_id,
      project_id,
      stage = 'Scheduled',
      value,
      probability = 50,
      visit_date,
      expected_close_date,
      notes
    } = req.body;
    
    const user = req.user;
    
    // Check project access
    if (user.role !== 'Admin') {
      const userProjectIds = user.project_ids || [];
      if (!userProjectIds.includes(parseInt(project_id))) {
        return res.status(403).json({ error: 'Access denied to this project' });
      }
    }
    
    // Verify lead exists and belongs to the project
    const leadResult = await query(
      'SELECT id, project_id FROM leads WHERE id = $1',
      [lead_id]
    );
    
    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    if (leadResult.rows[0].project_id !== parseInt(project_id)) {
      return res.status(400).json({ error: 'Lead does not belong to the specified project' });
    }
    
    // Check if opportunity already exists for this lead
    const existingOpportunity = await query(
      'SELECT id FROM opportunities WHERE lead_id = $1',
      [lead_id]
    );
    
    if (existingOpportunity.rows.length > 0) {
      return res.status(409).json({ error: 'Opportunity already exists for this lead' });
    }
    
    const insertQuery = `
      INSERT INTO opportunities (
        lead_id, project_id, stage, value, probability, visit_date,
        expected_close_date, notes, assigned_to, created_by, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $9, NOW(), NOW()
      ) RETURNING *
    `;
    
    const values = [
      lead_id, project_id, stage, value, probability, visit_date,
      expected_close_date, notes, user.id
    ];
    
    const result = await query(insertQuery, values);
    const newOpportunity = result.rows[0];
    
    // Get the complete opportunity data with joined tables
    const opportunityWithDetails = await query(`
      SELECT 
        o.*,
        l.name as lead_name,
        l.phone as lead_phone,
        l.email as lead_email,
        p.name as project_name,
        u.name as assigned_to_name
      FROM opportunities o
      LEFT JOIN leads l ON o.lead_id = l.id
      LEFT JOIN projects p ON o.project_id = p.id
      LEFT JOIN users u ON o.assigned_to = u.id
      WHERE o.id = $1
    `, [newOpportunity.id]);
    
    logger.info(`New opportunity created (ID: ${newOpportunity.id}) for lead ${lead_id} by user ${user.email}`);
    
    res.status(201).json(opportunityWithDetails.rows[0]);
    
  } catch (error) {
    logger.error('Create opportunity error:', error);
    res.status(500).json({ error: 'Failed to create opportunity' });
  }
});

// Update opportunity
router.put('/:id', verifyToken, idValidation, opportunityValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    // Check if opportunity exists and user has access
    const existingOpportunity = await query(
      'SELECT project_id FROM opportunities WHERE id = $1',
      [id]
    );
    
    if (existingOpportunity.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    
    // Check project access
    if (user.role !== 'Admin') {
      const userProjectIds = user.project_ids || [];
      if (!userProjectIds.includes(existingOpportunity.rows[0].project_id)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    const {
      stage,
      value,
      probability,
      visit_date,
      expected_close_date,
      notes
    } = req.body;
    
    const updateQuery = `
      UPDATE opportunities SET
        stage = $1, value = $2, probability = $3, visit_date = $4,
        expected_close_date = $5, notes = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `;
    
    const values = [stage, value, probability, visit_date, expected_close_date, notes, id];
    
    const result = await query(updateQuery, values);
    
    // Get updated opportunity with details
    const opportunityWithDetails = await query(`
      SELECT 
        o.*,
        l.name as lead_name,
        l.phone as lead_phone,
        l.email as lead_email,
        p.name as project_name,
        u.name as assigned_to_name
      FROM opportunities o
      LEFT JOIN leads l ON o.lead_id = l.id
      LEFT JOIN projects p ON o.project_id = p.id
      LEFT JOIN users u ON o.assigned_to = u.id
      WHERE o.id = $1
    `, [id]);
    
    logger.info(`Opportunity updated (ID: ${id}) by user ${user.email}`);
    
    res.json(opportunityWithDetails.rows[0]);
    
  } catch (error) {
    logger.error('Update opportunity error:', error);
    res.status(500).json({ error: 'Failed to update opportunity' });
  }
});

// Delete opportunity
router.delete('/:id', verifyToken, requireRole(['Admin', 'Project Manager']), idValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    // Check if opportunity exists and user has access
    const existingOpportunity = await query(
      'SELECT project_id, lead_id FROM opportunities WHERE id = $1',
      [id]
    );
    
    if (existingOpportunity.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    
    // Check project access
    if (user.role !== 'Admin') {
      const userProjectIds = user.project_ids || [];
      if (!userProjectIds.includes(existingOpportunity.rows[0].project_id)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    // Delete opportunity
    await query('DELETE FROM opportunities WHERE id = $1', [id]);
    
    logger.info(`Opportunity deleted (ID: ${id}) by user ${user.email}`);
    
    res.json({ success: true, message: 'Opportunity deleted successfully' });
    
  } catch (error) {
    logger.error('Delete opportunity error:', error);
    res.status(500).json({ error: 'Failed to delete opportunity' });
  }
});

// Update opportunity stage
router.patch('/:id/stage', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;
    
    const validStages = ['Scheduled', 'Visit Done', 'Negotiation', 'Booking', 'Lost'];
    
    if (!validStages.includes(stage)) {
      return res.status(400).json({ error: 'Invalid stage' });
    }
    
    // Check if opportunity exists and user has access
    const existingOpportunity = await query(
      'SELECT project_id FROM opportunities WHERE id = $1',
      [id]
    );
    
    if (existingOpportunity.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    
    // Check project access
    const user = req.user;
    if (user.role !== 'Admin') {
      const userProjectIds = user.project_ids || [];
      if (!userProjectIds.includes(existingOpportunity.rows[0].project_id)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    // Update stage
    await query(
      'UPDATE opportunities SET stage = $1, updated_at = NOW() WHERE id = $2',
      [stage, id]
    );
    
    logger.info(`Opportunity ${id} stage updated to ${stage} by user ${user.email}`);
    
    res.json({ success: true, message: `Stage updated to ${stage}` });
    
  } catch (error) {
    logger.error('Update opportunity stage error:', error);
    res.status(500).json({ error: 'Failed to update stage' });
  }
});

// Get pipeline statistics
router.get('/stats/pipeline', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    const { project_id } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let queryParams = [];
    let paramCount = 0;
    
    // Apply project access restrictions
    if (user.role !== 'Admin') {
      const userProjectIds = user.project_ids || [];
      if (userProjectIds.length > 0) {
        whereClause += ` AND project_id = ANY($${++paramCount})`;
        queryParams.push(userProjectIds);
      } else {
        return res.json({});
      }
    }
    
    if (project_id) {
      whereClause += ` AND project_id = $${++paramCount}`;
      queryParams.push(parseInt(project_id));
    }
    
    const statsQuery = `
      SELECT 
        stage,
        COUNT(*) as count,
        SUM(value) as total_value,
        AVG(probability) as avg_probability
      FROM opportunities 
      ${whereClause}
      GROUP BY stage
      ORDER BY 
        CASE stage
          WHEN 'Scheduled' THEN 1
          WHEN 'Visit Done' THEN 2
          WHEN 'Negotiation' THEN 3
          WHEN 'Booking' THEN 4
          WHEN 'Lost' THEN 5
        END
    `;
    
    const result = await query(statsQuery, queryParams);
    
    const stats = {
      total_opportunities: 0,
      total_pipeline_value: 0,
      conversion_rate: 0,
      stages: {}
    };
    
    let totalOpportunities = 0;
    let closedWon = 0;
    let totalValue = 0;
    
    result.rows.forEach(row => {
      const count = parseInt(row.count);
      const value = parseFloat(row.total_value) || 0;
      
      totalOpportunities += count;
      totalValue += value;
      
      if (row.stage === 'Booking') {
        closedWon += count;
      }
      
      stats.stages[row.stage] = {
        count,
        total_value: value,
        avg_probability: parseFloat(row.avg_probability) || 0
      };
    });
    
    stats.total_opportunities = totalOpportunities;
    stats.total_pipeline_value = totalValue;
    stats.conversion_rate = totalOpportunities > 0 ? (closedWon / totalOpportunities) * 100 : 0;
    
    res.json(stats);
    
  } catch (error) {
    logger.error('Get pipeline stats error:', error);
    res.status(500).json({ error: 'Failed to fetch pipeline statistics' });
  }
});

module.exports = router;