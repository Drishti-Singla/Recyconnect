const db = require('../config/database');

// Get all donated items
exports.getAllDonatedItems = async (req, res) => {
  try {
    const { 
      category, 
      status = 'available', 
      search, 
      limit = 50, 
      offset = 0 
    } = req.query;

    let query = `
      SELECT d.*, u.username, u.phone as user_phone, u.profile_image as user_profile_image
      FROM donated_items d
      LEFT JOIN users u ON d.donor_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND d.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (category) {
      query += ` AND d.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      query += ` AND (d.title ILIKE $${paramIndex} OR d.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY d.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({ donatedItems: result.rows });
  } catch (error) {
    console.error('Get all donated items error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      query: error.query
    });
    res.status(500).json({ 
      error: 'Failed to get donated items',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get donated item by ID
exports.getDonatedItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT d.*, u.username, u.email as donor_email, u.phone as donor_phone, u.profile_image as user_profile_image
       FROM donated_items d
       LEFT JOIN users u ON d.donor_id = u.id
       WHERE d.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Donated item not found' });
    }

    res.json({ donatedItem: result.rows[0] });
  } catch (error) {
    console.error('Get donated item by ID error:', error);
    res.status(500).json({ error: 'Failed to get donated item' });
  }
};

// Create new donated item
exports.createDonatedItem = async (req, res) => {
  try {
    const donorId = req.user.id;
    const { 
      title, 
      description, 
      category, 
      condition, 
      pickup_location,
      is_anonymous,
      anonymity, 
      image_urls,
      quantity
    } = req.body;

    // Support both is_anonymous (boolean) and anonymity (string) for backward compatibility
    const anonymityValue = is_anonymous !== undefined 
      ? (is_anonymous ? 'anonymous' : 'public')
      : (anonymity || 'public');

    console.log('Creating donated item with data:', {
      donorId,
      title,
      description,
      category,
      condition,
      pickup_location,
      is_anonymous,
      anonymity: anonymityValue,
      image_urls,
      quantity
    });

    // Insert without anonymity and quantity columns (will use defaults if they exist)
    const result = await db.query(
      `INSERT INTO donated_items (donor_id, title, description, category, condition, pickup_location, image_urls, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [donorId, title, description, category, condition || 'good', pickup_location, image_urls || [], 'available']
    );

    console.log('Donated item created successfully:', result.rows[0]);

    res.status(201).json({
      message: 'Donated item created successfully',
      donatedItem: result.rows[0]
    });
  } catch (error) {
    console.error('Create donated item error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to create donated item', details: error.message });
  }
};

// Get user's donated items
exports.getUserDonatedItems = async (req, res) => {
  try {
    const donorId = req.user.id;
    const { status, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT * FROM donated_items 
      WHERE donor_id = $1
    `;
    const params = [donorId];
    let paramIndex = 2;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({ donatedItems: result.rows });
  } catch (error) {
    console.error('Get user donated items error:', error);
    res.status(500).json({ error: 'Failed to get user donated items' });
  }
};

// Update donated item
exports.updateDonatedItem = async (req, res) => {
  try {
    const { id } = req.params;
    const donorId = req.user.id;
    const { title, description, category, condition, pickup_location, image_urls, status } = req.body;

    // Check if item exists and belongs to user
    const checkResult = await db.query(
      'SELECT * FROM donated_items WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Donated item not found' });
    }

    if (req.user.role !== 'admin' && checkResult.rows[0].donor_id !== donorId) {
      return res.status(403).json({ error: 'Not authorized to update this item' });
    }

    const result = await db.query(
      `UPDATE donated_items 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           condition = COALESCE($4, condition),
           pickup_location = COALESCE($5, pickup_location),
           image_urls = COALESCE($6, image_urls),
           status = COALESCE($7, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [title, description, category, condition, pickup_location, image_urls, status, id]
    );

    res.json({
      message: 'Donated item updated successfully',
      donatedItem: result.rows[0]
    });
  } catch (error) {
    console.error('Update donated item error:', error);
    res.status(500).json({ error: 'Failed to update donated item' });
  }
};

// Update donated item status (simplified for admin or owner)
exports.updateDonatedItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if item exists
    const checkResult = await db.query(
      'SELECT * FROM donated_items WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Donated item not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && checkResult.rows[0].donor_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this item' });
    }

    const result = await db.query(
      `UPDATE donated_items 
       SET status = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    res.json({
      message: 'Donated item status updated successfully',
      donatedItem: result.rows[0]
    });
  } catch (error) {
    console.error('Update donated item status error:', error);
    res.status(500).json({ error: 'Failed to update donated item status' });
  }
};

// Delete donated item
exports.deleteDonatedItem = async (req, res) => {
  try {
    const { id } = req.params;
    const donorId = req.user.id;

    // Check if item exists and belongs to user
    const checkResult = await db.query(
      'SELECT * FROM donated_items WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Donated item not found' });
    }

    if (req.user.role !== 'admin' && checkResult.rows[0].donor_id !== donorId) {
      return res.status(403).json({ error: 'Not authorized to delete this item' });
    }

    await db.query('DELETE FROM donated_items WHERE id = $1', [id]);

    res.json({ message: 'Donated item deleted successfully' });
  } catch (error) {
    console.error('Delete donated item error:', error);
    res.status(500).json({ error: 'Failed to delete donated item' });
  }
};
