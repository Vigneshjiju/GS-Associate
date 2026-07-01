const db = require('../config/db');

exports.getAuspiciousDates = async (req, res) => {
  const { event_type, month } = req.query; // optional filters
  
  try {
    let queryStr = 'SELECT * FROM panchang_entries';
    const params = [];
    
    if (event_type) {
      params.push(event_type);
      queryStr += ` WHERE event_type = $${params.length}`;
    }
    
    queryStr += ' ORDER BY date ASC';
    const result = await db.query(queryStr, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get auspicious dates error:', error.message);
    res.status(500).json({ error: 'Server error fetching Panchang entries' });
  }
};

exports.createAuspiciousDate = async (req, res) => {
  const { date, tithi, nakshatram, lagnam, auspicious_time, event_type } = req.body;
  
  if (!date || !event_type) {
    return res.status(400).json({ error: 'Date and Event Type are required fields.' });
  }
  
  try {
    const result = await db.query(
      `INSERT INTO panchang_entries (date, tithi, nakshatram, lagnam, auspicious_time, event_type) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [date, tithi || '', nakshatram || '', lagnam || '', auspicious_time || '', event_type]
    );
    
    let insertedRow;
    if (result.rows && result.rows.length > 0) {
      insertedRow = result.rows[0];
    } else {
      insertedRow = {
        id: result.lastInsertRowid,
        date,
        tithi: tithi || '',
        nakshatram: nakshatram || '',
        lagnam: lagnam || '',
        auspicious_time: auspicious_time || '',
        event_type
      };
    }
    
    res.status(201).json(insertedRow);
  } catch (error) {
    console.error('Create auspicious date error:', error.message);
    res.status(500).json({ error: 'Server error creating Panchang entry' });
  }
};

exports.deleteAuspiciousDate = async (req, res) => {
  const { id } = req.params;
  
  try {
    await db.query('DELETE FROM panchang_entries WHERE id = $1', [id]);
    res.json({ success: true, message: 'Panchang entry deleted successfully' });
  } catch (error) {
    console.error('Delete auspicious date error:', error.message);
    res.status(500).json({ error: 'Server error deleting Panchang entry' });
  }
};
