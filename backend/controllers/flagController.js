const db = require('../config/database');

// Create a flag
exports.createFlag = async (req, res) => {
  try {
    const flaggerId = req.user.id;
    const { targetType, targetId, reason, severity } = req.body;

    // Check if user has already flagged this target
    const existingFlag = await db.query(
      `SELECT id FROM flags 
       WHERE flagger_id = $1 AND target_type = $2 AND target_id = $3`,
      [flaggerId, targetType, targetId]
    );

    if (existingFlag.rows.length > 0) {
      return res.status(400).json({ error: 'You have already flagged this item' });
    }

    const result = await db.query(
      `INSERT INTO flags (flagger_id, target_type, target_id, reason, severity, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [flaggerId, targetType, targetId, reason, severity || 'medium', 'pending']
    );

    res.status(201).json({
      message: 'Flag submitted successfully',
      flag: result.rows[0]
    });
  } catch (error) {
    console.error('Create flag error:', error);
    res.status(500).json({ error: 'Failed to create flag' });
  }
};

// Get all flags (Admin only)
exports.getAllFlags = async (req, res) => {
  try {
    const { 
      status, 
      targetType, 
      severity,
      limit = 50, 
      offset = 0 
    } = req.query;

    let query = `
      SELECT f.*, 
             u.username as flagger_username,
             u.email as flagger_email,
             CASE 
               WHEN f.target_type = 'item' THEN (SELECT title FROM items WHERE id = f.target_id)
               WHEN f.target_type = 'donated_item' THEN (SELECT title FROM donated_items WHERE id = f.target_id)
               WHEN f.target_type = 'reported_item' THEN (SELECT title FROM reported_items WHERE id = f.target_id)
               WHEN f.target_type = 'user' THEN (SELECT username FROM users WHERE id = f.target_id)
             END as target_title,
             CASE 
               WHEN f.target_type = 'item' THEN (SELECT category FROM items WHERE id = f.target_id)
               WHEN f.target_type = 'donated_item' THEN (SELECT category FROM donated_items WHERE id = f.target_id)
               WHEN f.target_type = 'reported_item' THEN (SELECT category FROM reported_items WHERE id = f.target_id)
             END as target_category,
             CASE 
               WHEN f.target_type = 'item' THEN (SELECT location FROM items WHERE id = f.target_id)
               WHEN f.target_type = 'donated_item' THEN (SELECT pickup_location FROM donated_items WHERE id = f.target_id)
               WHEN f.target_type = 'reported_item' THEN (SELECT location FROM reported_items WHERE id = f.target_id)
             END as target_location,
             CASE 
               WHEN f.target_type = 'item' THEN (SELECT image_urls FROM items WHERE id = f.target_id)
               WHEN f.target_type = 'donated_item' THEN (SELECT image_urls FROM donated_items WHERE id = f.target_id)
               WHEN f.target_type = 'reported_item' THEN (SELECT image_urls FROM reported_items WHERE id = f.target_id)
               WHEN f.target_type = 'user' THEN ARRAY[(SELECT profile_image FROM users WHERE id = f.target_id)]
             END as target_images,
             CASE 
               WHEN f.target_type = 'item' THEN (SELECT user_id FROM items WHERE id = f.target_id)
               WHEN f.target_type = 'donated_item' THEN (SELECT donor_id FROM donated_items WHERE id = f.target_id)
               WHEN f.target_type = 'reported_item' THEN (SELECT reporter_id FROM reported_items WHERE id = f.target_id)
             END as target_user_id,
             CASE 
               WHEN f.target_type = 'item' THEN (SELECT u2.username FROM items i JOIN users u2 ON i.user_id = u2.id WHERE i.id = f.target_id)
               WHEN f.target_type = 'donated_item' THEN (SELECT u2.username FROM donated_items d JOIN users u2 ON d.donor_id = u2.id WHERE d.id = f.target_id)
               WHEN f.target_type = 'reported_item' THEN (SELECT u2.username FROM reported_items r JOIN users u2 ON r.reporter_id = u2.id WHERE r.id = f.target_id)
               WHEN f.target_type = 'user' THEN (SELECT username FROM users WHERE id = f.target_id)
             END as target_username
      FROM flags f
      LEFT JOIN users u ON f.flagger_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND f.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (targetType) {
      query += ` AND f.target_type = $${paramIndex}`;
      params.push(targetType);
      paramIndex++;
    }

    if (severity) {
      query += ` AND f.severity = $${paramIndex}`;
      params.push(severity);
      paramIndex++;
    }

    query += ` ORDER BY 
      CASE f.severity 
        WHEN 'critical' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
        WHEN 'low' THEN 4 
      END,
      f.created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({ flags: result.rows });
  } catch (error) {
    console.error('Get all flags error:', error);
    res.status(500).json({ error: 'Failed to get flags' });
  }
};

// Get flags by user
exports.getUserFlags = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Only allow users to see their own flags, or admin to see all
    if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const result = await db.query(
      `SELECT * FROM flags 
       WHERE flagger_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({ flags: result.rows });
  } catch (error) {
    console.error('Get user flags error:', error);
    res.status(500).json({ error: 'Failed to get user flags' });
  }
};

// Get flags for a specific target
exports.getTargetFlags = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const { status, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT f.*, u.username as flagger_username
      FROM flags f
      LEFT JOIN users u ON f.flagger_id = u.id
      WHERE f.target_type = $1 AND f.target_id = $2
    `;
    const params = [targetType, targetId];
    let paramIndex = 3;

    if (status) {
      query += ` AND f.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY f.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({ flags: result.rows });
  } catch (error) {
    console.error('Get target flags error:', error);
    res.status(500).json({ error: 'Failed to get target flags' });
  }
};

// Get flag counts for a target (public)
exports.getFlagCounts = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    const result = await db.query(
      `SELECT 
         COUNT(*) as total_flags,
         COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_flags,
         COUNT(CASE WHEN status = 'reviewed' THEN 1 END) as reviewed_flags,
         COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_flags
       FROM flags 
       WHERE target_type = $1 AND target_id = $2`,
      [targetType, targetId]
    );

    res.json({ 
      counts: {
        total: parseInt(result.rows[0].total_flags),
        pending: parseInt(result.rows[0].pending_flags),
        reviewed: parseInt(result.rows[0].reviewed_flags),
        critical: parseInt(result.rows[0].critical_flags)
      }
    });
  } catch (error) {
    console.error('Get flag counts error:', error);
    res.status(500).json({ error: 'Failed to get flag counts' });
  }
};

// Update flag (Admin only)
exports.updateFlag = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, actionTaken, severity } = req.body;

    const result = await db.query(
      `UPDATE flags 
       SET status = COALESCE($1, status),
           admin_notes = COALESCE($2, admin_notes),
           action_taken = COALESCE($3, action_taken),
           severity = COALESCE($4, severity),
           reviewed_at = CASE WHEN $1 IN ('reviewed', 'resolved') THEN CURRENT_TIMESTAMP ELSE reviewed_at END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [status, adminNotes, actionTaken, severity, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    res.json({
      message: 'Flag updated successfully',
      flag: result.rows[0]
    });
  } catch (error) {
    console.error('Update flag error:', error);
    res.status(500).json({ error: 'Failed to update flag' });
  }
};

// Delete flag
exports.deleteFlag = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if flag exists
    const checkResult = await db.query(
      'SELECT * FROM flags WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    // Only admin or flagger can delete
    if (req.user.role !== 'admin' && checkResult.rows[0].flagger_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this flag' });
    }

    await db.query('DELETE FROM flags WHERE id = $1', [id]);

    res.json({ message: 'Flag deleted successfully' });
  } catch (error) {
    console.error('Delete flag error:', error);
    res.status(500).json({ error: 'Failed to delete flag' });
  }
};
