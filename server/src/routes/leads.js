const express = require('express');
const { query, transaction } = require('../config/database');
const { verifyToken, requireRole } = require('../middleware/auth');
const { leadValidation, idValidation, paginationValidation } = require('../middleware/validation');
const logger = require('../config/logger');

const router = express.Router();

// Get all leads with filtering and pagination
router.get('/', verifyToken, paginationValidation, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'created_at',
      sortOrder = 'desc',
      status,
      source,
      priority,
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
        whereClause += ` AND l.project_id = ANY($${++paramCount})`;
        queryParams.push(userProjectIds);
      } else {
        // No project access
        return res.json({ leads: [], total: 0, page: parseInt(page), totalPages: 0 });
      }
    }
    
    // Apply filters
    if (status) {
      whereClause += ` AND l.status = $${++paramCount}`;
      queryParams.push(status);
    }
    
    if (source) {
      whereClause += ` AND l.source = $${++paramCount}`;
      queryParams.push(source);
    }
    
    if (priority) {
      whereClause += ` AND l.priority = $${++paramCount}`;
      queryParams.push(priority);
    }
    
    if (project_id) {
      whereClause += ` AND l.project_id = $${++paramCount}`;
      queryParams.push(parseInt(project_id));
    }
    
    if (assigned_to) {
      whereClause += ` AND l.assigned_to = $${++paramCount}`;
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
      FROM leads l
      LEFT JOIN projects p ON l.project_id = p.id
      LEFT JOIN users u ON l.assigned_to = u.id
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);
    
    // Get leads with pagination
    const leadsQuery = `
      SELECT 
        l.*,
        p.name as project_name,
        u.name as assigned_to_name
      FROM leads l
      LEFT JOIN projects p ON l.project_id = p.id
      LEFT JOIN users u ON l.assigned_to = u.id
      ${whereClause}
      ORDER BY l.${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    
    queryParams.push(parseInt(limit), offset);
    
    const leadsResult = await query(leadsQuery, queryParams);
    
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      leads: leadsResult.rows,
      total,
      page: parseInt(page),
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    });
    
  } catch (error) {
    logger.error('Get leads error:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Get single lead by ID
router.get('/:id', verifyToken, idValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    let whereClause = 'WHERE l.id = $1';
    let queryParams = [id];
    
    // Apply project access restrictions
    if (user.role !== 'Admin') {
      const userProjectIds = user.project_ids || [];
      if (userProjectIds.length > 0) {
        whereClause += ' AND l.project_id = ANY($2)';
        queryParams.push(userProjectIds);
      } else {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    const leadQuery = `
      SELECT 
        l.*,
        p.name as project_name,
        p.location as project_location,
        u.name as assigned_to_name
      FROM leads l
      LEFT JOIN projects p ON l.project_id = p.id
      LEFT JOIN users u ON l.assigned_to = u.id
      ${whereClause}
    `;
    
    const result = await query(leadQuery, queryParams);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json(result.rows[0]);
    
  } catch (error) {
    logger.error('Get lead error:', error);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

// Create new lead
router.post('/', verifyToken, leadValidation, async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      source,
      project_id,
      priority = 'Medium',
      notes,
      budget_min,
      budget_max,
      requirements,
      next_follow_up
    } = req.body;
    
    const user = req.user;
    
    // Check project access
    if (user.role !== 'Admin') {
      const userProjectIds = user.project_ids || [];
      if (!userProjectIds.includes(parseInt(project_id))) {
        return res.status(403).json({ error: 'Access denied to this project' });
      }
    }
    
    // Check if lead with same phone already exists
    const existingLead = await query(
      'SELECT id FROM leads WHERE phone = $1',
      [phone]
    );
    
    if (existingLead.rows.length > 0) {
      return res.status(409).json({ error: 'Lead with this phone number already exists' });
    }
    
    const insertQuery = `
      INSERT INTO leads (
        name, phone, email, source, project_id, priority, notes, 
        budget_min, budget_max, requirements, next_follow_up, 
        assigned_to, created_by, status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12, 'New', NOW(), NOW()
      ) RETURNING *
    `;
    
    const values = [
      name, phone, email, source, project_id, priority, notes,
      budget_min, budget_max, requirements, next_follow_up, user.id
    ];
    
    const result = await query(insertQuery, values);
    const newLead = result.rows[0];
    
    // Get the complete lead data with joined tables
    const leadWithDetails = await query(`
      SELECT 
        l.*,
        p.name as project_name,
        u.name as assigned_to_name
      FROM leads l
      LEFT JOIN projects p ON l.project_id = p.id
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.id = $1
    `, [newLead.id]);
    
    logger.info(`New lead created: ${name} (ID: ${newLead.id}) by user ${user.email}`);
    
    res.status(201).json(leadWithDetails.rows[0]);
    
  } catch (error) {
    logger.error('Create lead error:', error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// Update lead
router.put('/:id', verifyToken, idValidation, leadValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    // Check if lead exists and user has access
    const existingLead = await query(
      'SELECT project_id FROM leads WHERE id = $1',
      [id]
    );
    
    if (existingLead.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    // Check project access
    if (user.role !== 'Admin') {
      const userProjectIds = user.project_ids || [];
      if (!userProjectIds.includes(existingLead.rows[0].project_id)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    const {
      name,
      phone,
      email,
      source,
      project_id,
      priority,
      status,
      notes,
      budget_min,
      budget_max,
      requirements,
      next_follow_up
    } = req.body;
    
    const updateQuery = `
      UPDATE leads SET
        name = $1, phone = $2, email = $3, source = $4, project_id = $5,
        priority = $6, status = $7, notes = $8, budget_min = $9, budget_max = $10,
        requirements = $11, next_follow_up = $12, updated_at = NOW()
      WHERE id = $13
      RETURNING *
    `;
    
    const values = [
      name, phone, email, source, project_id, priority, status, notes,
      budget_min, budget_max, requirements, next_follow_up, id
    ];
    
    const result = await query(updateQuery, values);
    
    // Get updated lead with details
    const leadWithDetails = await query(`
      SELECT 
        l.*,
        p.name as project_name,
        u.name as assigned_to_name
      FROM leads l
      LEFT JOIN projects p ON l.project_id = p.id
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.id = $1
    `, [id]);
    
    logger.info(`Lead updated: ${name} (ID: ${id}) by user ${user.email}`);
    
    res.json(leadWithDetails.rows[0]);
    
  } catch (error) {
    logger.error('Update lead error:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Delete lead
router.delete('/:id', verifyToken, requireRole(['Admin', 'Project Manager']), idValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    // Check if lead exists and user has access
    const existingLead = await query(
      'SELECT project_id, name FROM leads WHERE id = $1',
      [id]
    );
    
    if (existingLead.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    // Check project access
    if (user.role !== 'Admin') {
      const userProjectIds = user.project_ids || [];
      if (!userProjectIds.includes(existingLead.rows[0].project_id)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    // Delete lead (this will cascade to related records)
    await query('DELETE FROM leads WHERE id = $1', [id]);
    
    logger.info(`Lead deleted: ${existingLead.rows[0].name} (ID: ${id}) by user ${user.email}`);
    
    res.json({ success: true, message: 'Lead deleted successfully' });
    
  } catch (error) {
    logger.error('Delete lead error:', error);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

// Assign lead to user
router.post('/:id/assign', verifyToken, requireRole(['Admin', 'Project Manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;
    
    if (!assigned_to) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Check if lead exists
    const leadResult = await query('SELECT project_id FROM leads WHERE id = $1', [id]);
    
    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    // Check if user exists and has access to project
    const userResult = await query(
      'SELECT id, name, project_ids FROM users WHERE id = $1 AND active = true',
      [assigned_to]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const assignUser = userResult.rows[0];
    const projectId = leadResult.rows[0].project_id;
    
    // Check if user has access to the project
    if (assignUser.project_ids && !assignUser.project_ids.includes(projectId)) {
      return res.status(400).json({ error: 'User does not have access to this project' });
    }
    
    // Update lead assignment
    await query(
      'UPDATE leads SET assigned_to = $1, updated_at = NOW() WHERE id = $2',
      [assigned_to, id]
    );
    
    logger.info(`Lead ${id} assigned to user ${assignUser.name} (${assigned_to})`);
    
    res.json({ success: true, message: `Lead assigned to ${assignUser.name}` });
    
  } catch (error) {
    logger.error('Assign lead error:', error);
    res.status(500).json({ error: 'Failed to assign lead' });
  }
});

module.exports = router;