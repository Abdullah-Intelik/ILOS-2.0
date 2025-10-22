const express = require('express');
const router = express.Router();
const db = require('../db1'); // Use db1 for ILOS database

/**
 * GET /api/agents
 * Fetch all EAMVU agents
 */
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT 
        agent_id, name, email, phone, cnic, location, status,
        specialization, max_assignments, current_assignments,
        total_completed, avg_completion_days, performance_rating,
        last_assignment_date, notes, created_at, updated_at
      FROM eamvu_agents
    `;
    
    const params = [];
    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }
    
    query += ' ORDER BY name ASC';
    
    const result = await db.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ 
      error: 'Failed to fetch agents',
      message: error.message 
    });
  }
});

/**
 * GET /api/agents/:agentId
 * Get specific agent details (supports both numeric ID and string ID)
 */
router.get('/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    
    // Try to parse as number, if fails treat as string
    const isNumeric = !isNaN(agentId);
    
    const result = await db.query(
      isNumeric 
        ? `SELECT * FROM eamvu_agents WHERE agent_id = $1`
        : `SELECT * FROM eamvu_agents WHERE agent_id_str = $1`,
      [agentId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ 
      error: 'Failed to fetch agent',
      message: error.message 
    });
  }
});

/**
 * GET /api/agents/:agentId/statistics
 * Get agent statistics
 */
router.get('/:agentId/statistics', async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const result = await db.query(
      `SELECT * FROM agent_statistics WHERE agent_id = $1`,
      [agentId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching agent statistics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch agent statistics',
      message: error.message 
    });
  }
});

/**
 * GET /api/agents/:agentId/assignments
 * Get all assignments for a specific agent (supports both numeric ID and string ID)
 */
router.get('/:agentId/assignments', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { status } = req.query;
    
    const isNumeric = !isNaN(agentId);
    
    let query = `
      SELECT aa.*, 
             ea.name as agent_name,
             ea.location as agent_location
      FROM agent_assignments aa
      JOIN eamvu_agents ea ON aa.agent_id = ea.agent_id
      WHERE ${isNumeric ? 'aa.agent_id = $1' : 'ea.agent_id_str = $1'}
    `;
    
    const params = [agentId];
    if (status) {
      query += ' AND aa.assignment_status = $2';
      params.push(status);
    }
    
    query += ' ORDER BY aa.assigned_date DESC NULLS LAST';
    
    const result = await db.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching agent assignments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch agent assignments',
      message: error.message 
    });
  }
});

/**
 * POST /api/agents
 * Create a new agent
 */
router.post('/', async (req, res) => {
  try {
    const {
      agent_id, name, email, phone, cnic, location,
      specialization, max_assignments
    } = req.body;
    
    if (!agent_id || !name) {
      return res.status(400).json({ error: 'agent_id and name are required' });
    }
    
    const result = await db.query(
      `INSERT INTO eamvu_agents (
        agent_id, name, email, phone, cnic, location,
        specialization, max_assignments, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
      RETURNING *`,
      [agent_id, name, email, phone, cnic, location, specialization, max_assignments || 10]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating agent:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Agent ID already exists' });
    }
    res.status(500).json({ 
      error: 'Failed to create agent',
      message: error.message 
    });
  }
});

/**
 * PUT /api/agents/:agentId
 * Update agent information
 */
router.put('/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const {
      name, email, phone, cnic, location, status,
      specialization, max_assignments, notes
    } = req.body;
    
    const result = await db.query(
      `UPDATE eamvu_agents SET
        name = COALESCE($2, name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        cnic = COALESCE($5, cnic),
        location = COALESCE($6, location),
        status = COALESCE($7, status),
        specialization = COALESCE($8, specialization),
        max_assignments = COALESCE($9, max_assignments),
        notes = COALESCE($10, notes)
      WHERE agent_id = $1
      RETURNING *`,
      [agentId, name, email, phone, cnic, location, status, specialization, max_assignments, notes]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ 
      error: 'Failed to update agent',
      message: error.message 
    });
  }
});

/**
 * POST /api/agents/assign
 * Assign an application to an agent
 */
router.post('/assign', async (req, res) => {
  try {
    const { los_id, agent_id, application_type, priority, assigned_by } = req.body;
    
    if (!los_id || !agent_id) {
      return res.status(400).json({ error: 'los_id and agent_id are required' });
    }
    
    // Check if agent exists and is active
    const agentCheck = await db.query(
      'SELECT * FROM eamvu_agents WHERE agent_id = $1 AND status = $2',
      [agent_id, 'active']
    );
    
    if (agentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Active agent not found' });
    }
    
    // Check if already assigned
    const existingAssignment = await db.query(
      'SELECT * FROM application_assignments WHERE los_id = $1 AND assignment_status = $2',
      [los_id, 'active']
    );
    
    if (existingAssignment.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Application is already assigned',
        assigned_to: existingAssignment.rows[0].agent_id
      });
    }
    
    // Create assignment
    const result = await db.query(
      `INSERT INTO application_assignments (
        los_id, agent_id, application_type, priority, assigned_by, assignment_status
      ) VALUES ($1, $2, $3, $4, $5, 'active')
      RETURNING *`,
      [los_id, agent_id, application_type, priority || 'medium', assigned_by || 'System']
    );
    
    // Update agent's current assignments
    await db.query(
      `UPDATE eamvu_agents 
       SET current_assignments = current_assignments + 1,
           last_assignment_date = CURRENT_TIMESTAMP
       WHERE agent_id = $1`,
      [agent_id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error assigning application:', error);
    res.status(500).json({ 
      error: 'Failed to assign application',
      message: error.message 
    });
  }
});

/**
 * POST /api/agents/complete-assignment
 * Mark an assignment as completed
 */
router.post('/complete-assignment', async (req, res) => {
  try {
    const { los_id, agent_id, investigation_notes, verification_status } = req.body;
    
    if (!los_id || !agent_id) {
      return res.status(400).json({ error: 'los_id and agent_id are required' });
    }
    
    // Update assignment
    const result = await db.query(
      `UPDATE application_assignments
       SET assignment_status = 'completed',
           completion_date = CURRENT_TIMESTAMP,
           investigation_notes = $3,
           verification_status = $4
       WHERE los_id = $1 AND agent_id = $2 AND assignment_status = 'active'
       RETURNING *`,
      [los_id, agent_id, investigation_notes, verification_status || 'verified']
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Active assignment not found' });
    }
    
    // Update agent stats
    await db.query(
      `UPDATE eamvu_agents
       SET current_assignments = GREATEST(current_assignments - 1, 0),
           total_completed = total_completed + 1
       WHERE agent_id = $1`,
      [agent_id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error completing assignment:', error);
    res.status(500).json({ 
      error: 'Failed to complete assignment',
      message: error.message 
    });
  }
});

/**
 * POST /api/agents/auto-assign
 * Auto-assign application to best available agent
 */
router.post('/auto-assign', async (req, res) => {
  try {
    const { los_id, application_type, priority } = req.body;
    
    if (!los_id) {
      return res.status(400).json({ error: 'los_id is required' });
    }
    
    const result = await db.query(
      'SELECT assign_application_to_agent($1, $2, $3) as agent_id',
      [los_id, application_type, priority || 'medium']
    );
    
    res.json({ 
      success: true,
      agent_id: result.rows[0].agent_id,
      los_id: los_id
    });
  } catch (error) {
    console.error('Error auto-assigning application:', error);
    res.status(500).json({ 
      error: 'Failed to auto-assign application',
      message: error.message 
    });
  }
});

/**
 * GET /api/agents/statistics/overview
 * Get overview statistics for all agents
 */
router.get('/statistics/overview', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_agents,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_agents,
        SUM(current_assignments) as total_active_assignments,
        SUM(total_completed) as total_completed_assignments,
        AVG(avg_completion_days) as overall_avg_days
      FROM eamvu_agents
    `);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching agents overview:', error);
    res.status(500).json({ 
      error: 'Failed to fetch agents overview',
      message: error.message 
    });
  }
});

module.exports = router;

