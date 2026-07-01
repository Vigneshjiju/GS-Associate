const db = require('../config/db');

exports.getEventTypes = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM event_types ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event types' });
  }
};

exports.getPackages = async (req, res) => {
  const { event_type_id } = req.query;
  try {
    let sql = 'SELECT * FROM packages';
    const params = [];
    if (event_type_id) {
      params.push(event_type_id);
      sql += ' WHERE event_type_id = $1';
    }
    sql += ' ORDER BY id ASC';
    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
};

exports.getAddons = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM package_addons ORDER BY category, id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch addons' });
  }
};

exports.getCeremonies = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM ceremonies ORDER BY category, name ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ceremonies' });
  }
};

exports.getVendors = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM vendors ORDER BY category, rating DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
};

exports.getGallery = async (req, res) => {
  const { event_type_id } = req.query;
  try {
    let sql = 'SELECT * FROM gallery_items';
    const params = [];
    if (event_type_id) {
      params.push(event_type_id);
      sql += ' WHERE event_type_id = $1';
    }
    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
};

exports.getTestimonials = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM testimonials WHERE status = 'approved' OR status IS NULL ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
};
