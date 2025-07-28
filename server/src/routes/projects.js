const express = require('express');
const { query } = require('../config/database');
const { verifyToken, requireRole } = require('../middleware/auth');
const { projectValidation, idValidation, paginationValidation } = require('../middleware/validation');
const logger = require('../config/logger');

const router = express.Router();

// Get all projects with filtering and pagination
router.get('/', verifyToken, paginationValidation, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'created_at',
      sortOrder = 'desc',
      status,
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
        whereClause += ` AND id = ANY($${++paramCount})`;
        queryParams.push(userProjectIds);
      } else {
        return res.json({ projects: [], total: 0, page: parseInt(page), totalPages: 0 });
      }
    }
    
    // Apply filters
    if (status) {
      whereClause += ` AND status = $${++paramCount}`;
      queryParams.push(status);
    }
    
    if (search) {
      whereClause += ` AND (name ILIKE $${++paramCount} OR location ILIKE $${++paramCount} OR description ILIKE $${++paramCount})`;
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }
    
    // Count total records
    const countQuery = `SELECT COUNT(*) as total FROM projects ${whereClause}`;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);
    
    // Get projects with pagination
    const projectsQuery = `
      SELECT * FROM projects 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    
    queryParams.push(parseInt(limit), offset);
    
    const projectsResult = await query(projectsQuery, queryParams);
    
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      projects: projectsResult.rows,
      total,
      page: parseInt(page),
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    });
    
  } catch (error) {
    logger.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project by ID
router.get('/:id', verifyToken, idValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    // Check project access
    if (user.role !== 'Admin') {
      const userProjectIds = user.project_ids || [];
      if (!userProjectIds.includes(parseInt(id))) {
        return res.status(403).json({ error: 'Access denied to this project' });
      }
    }
    
    const projectQuery = `
      SELECT p.*,
        (SELECT COUNT(*) FROM leads WHERE project_id = p.id) as total_leads,
        (SELECT COUNT(*) FROM opportunities WHERE project_id = p.id) as total_opportunities,
        (SELECT SUM(value) FROM opportunities WHERE project_id = p.id) as total_pipeline_value
      FROM projects p 
      WHERE p.id = $1
    `;
    
    const result = await query(projectQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(result.rows[0]);
    
  } catch (error) {
    logger.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create new project (Admin only)
router.post('/', verifyToken, requireRole(['Admin']), projectValidation, async (req, res) => {
  try {
    const {
      name,
      location,
      description,
      status = 'Active',
      total_units,
      available_units,
      price_range_min,
      price_range_max
    } = req.body;
    
    const user = req.user;
    
    // Check if project with same name already exists
    const existingProject = await query(
      'SELECT id FROM projects WHERE name = $1',
      [name]
    );
    
    if (existingProject.rows.length > 0) {
      return res.status(409).json({ error: 'Project with this name already exists' });
    }
    
    const insertQuery = `
      INSERT INTO projects (
        name, location, description, status, total_units, available_units,
        price_range_min, price_range_max, created_by, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
      ) RETURNING *
    `;
    
    const values = [
      name, location, description, status, total_units, available_units,
      price_range_min, price_range_max, user.id
    ];
    
    const result = await query(insertQuery, values);
    const newProject = result.rows[0];
    
    logger.info(`New project created: ${name} (ID: ${newProject.id}) by user ${user.email}`);
    
    res.status(201).json(newProject);
    
  } catch (error) {
    logger.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project (Admin only)
router.put('/:id', verifyToken, requireRole(['Admin']), idValidation, projectValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    // Check if project exists
    const existingProject = await query('SELECT name FROM projects WHERE id = $1', [id]);
    
    if (existingProject.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const {
      name,
      location,
      description,
      status,
      total_units,
      available_units,
      price_range_min,
      price_range_max
    } = req.body;
    
    const updateQuery = `
      UPDATE projects SET
        name = $1, location = $2, description = $3, status = $4,
        total_units = $5, available_units = $6, price_range_min = $7,
        price_range_max = $8, updated_at = NOW()
      WHERE id = $9
      RETURNING *
    `;
    
    const values = [
      name, location, description, status, total_units, available_units,
      price_range_min, price_range_max, id
    ];
    
    const result = await query(updateQuery, values);
    
    logger.info(`Project updated: ${name} (ID: ${id}) by user ${user.email}`);
    
    res.json(result.rows[0]);
    
  } catch (error) {
    logger.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project (Admin only)
router.delete('/:id', verifyToken, requireRole(['Admin']), idValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    // Check if project exists
    const existingProject = await query('SELECT name FROM projects WHERE id = $1', [id]);
    
    if (existingProject.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if project has associated leads or opportunities
    const associatedData = await query(
      'SELECT (SELECT COUNT(*) FROM leads WHERE project_id = $1) as leads_count, (SELECT COUNT(*) FROM opportunities WHERE project_id = $1) as opportunities_count',
      [id]
    );
    
    const { leads_count, opportunities_count } = associatedData.rows[0];
    
    if (parseInt(leads_count) > 0 || parseInt(opportunities_count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete project with associated leads or opportunities',
        details: {
          leads: parseInt(leads_count),
          opportunities: parseInt(opportunities_count)
        }
      });
    }
    
    // Delete project
    await query('DELETE FROM projects WHERE id = $1', [id]);
    
    logger.info(`Project deleted: ${existingProject.rows[0].name} (ID: ${id}) by user ${user.email}`);
    
    res.json({ success: true, message: 'Project deleted successfully' });
    
  } catch (error) {
    logger.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Get project statistics
router.get('/:id/stats', verifyToken, idValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    // Check project access
    if (user.role !== 'Admin') {
      const userProjectIds = user.project_ids || [];
      if (!userProjectIds.includes(parseInt(id))) {
        return res.status(403).json({ error: 'Access denied to this project' });
      }
    }
    
    const statsQuery = `
      SELECT 
        p.name,
        p.total_units,
        p.available_units,
        (SELECT COUNT(*) FROM leads WHERE project_id = p.id) as total_leads,
        (SELECT COUNT(*) FROM leads WHERE project_id = p.id AND status = 'New') as new_leads,
        (SELECT COUNT(*) FROM leads WHERE project_id = p.id AND status = 'Qualified') as qualified_leads,
        (SELECT COUNT(*) FROM opportunities WHERE project_id = p.id) as total_opportunities,
        (SELECT COUNT(*) FROM opportunities WHERE project_id = p.id AND stage = 'Booking') as closed_opportunities,
        (SELECT SUM(value) FROM opportunities WHERE project_id = p.id) as total_pipeline_value,
        (SELECT SUM(value) FROM opportunities WHERE project_id = p.id AND stage = 'Booking') as closed_value,
        (SELECT COUNT(*) FROM site_visits WHERE project_id = p.id) as total_site_visits,
        (SELECT COUNT(*) FROM site_visits WHERE project_id = p.id AND status = 'Completed') as completed_visits
      FROM projects p 
      WHERE p.id = $1
    `;
    
    const result = await query(statsQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const stats = result.rows[0];
    
    // Calculate conversion rates
    stats.lead_conversion_rate = stats.total_leads > 0 ? 
      (stats.qualified_leads / stats.total_leads) * 100 : 0;
    
    stats.opportunity_conversion_rate = stats.total_opportunities > 0 ? 
      (stats.closed_opportunities / stats.total_opportunities) * 100 : 0;
    
    stats.visit_completion_rate = stats.total_site_visits > 0 ? 
      (stats.completed_visits / stats.total_site_visits) * 100 : 0;
    
    res.json(stats);
    
  } catch (error) {
    logger.error('Get project stats error:', error);
    res.status(500).json({ error: 'Failed to fetch project statistics' });
  }
});

module.exports = router;