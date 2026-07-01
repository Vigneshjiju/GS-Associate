const db = require('../config/db');
const { sendEmail } = require('../services/emailService');
const { getInquiryConfirmationEmail } = require('../services/emailTemplates');

exports.createInquiry = async (req, res) => {
  const { name, phone, email, event_type, tentative_date, guest_count, message } = req.body;
  if (!name || !phone || !event_type) {
    return res.status(400).json({ error: 'Name, Phone, and Event Type are required.' });
  }

  try {
    const queryStr = `
      INSERT INTO inquiries (name, phone, email, event_type, tentative_date, guest_count, message)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const params = [
      name,
      phone,
      email || null,
      event_type,
      tentative_date || null,
      guest_count ? parseInt(guest_count) : null,
      message || null
    ];

    const result = await db.query(queryStr, params);
    
    // Trigger automated inquiry confirmation email
    if (email) {
      try {
        const html = getInquiryConfirmationEmail(name, event_type, tentative_date, phone, guest_count, message);
        sendEmail({
          to: email,
          subject: 'Thank you for your inquiry — GS Associates',
          html
        }).catch(err => console.error('[EMAIL ERROR] Failed to send inquiry confirmation email:', err.message));
      } catch (err) {
        console.error('[EMAIL TEMPLATE ERROR] Failed to build inquiry template:', err.message);
      }
    }

    console.log(`[LEAD RECEIVED]: ${name} (${phone}) - Event: ${event_type}`);

    res.status(201).json(result.rows[0] || { success: true, message: 'Inquiry received' });
  } catch (error) {
    console.error('Create inquiry error:', error.message);
    res.status(500).json({ error: 'Server error saving inquiry' });
  }
};

exports.getInquiries = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM inquiries ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get inquiries error:', error.message);
    res.status(500).json({ error: 'Server error fetching inquiries' });
  }
};

exports.updateInquiryStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const result = await db.query(
      'UPDATE inquiries SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update inquiry status error:', error.message);
    res.status(500).json({ error: 'Server error updating status' });
  }
};

exports.deleteInquiry = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'DELETE FROM inquiries WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    res.json({ success: true, message: 'Inquiry deleted successfully', deleted: result.rows[0] });
  } catch (error) {
    console.error('Delete inquiry error:', error.message);
    res.status(500).json({ error: 'Server error deleting inquiry' });
  }
};

exports.convertInquiryToBooking = async (req, res) => {
  const { id } = req.params;
  const {
    event_type_id,
    package_id,
    event_date,
    guest_count,
    addons,
    total_price,
    discount
  } = req.body;

  try {
    // 1. Fetch the inquiry details
    const inquiryRes = await db.query('SELECT * FROM inquiries WHERE id = $1', [id]);
    if (inquiryRes.rowCount === 0) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    const inquiry = inquiryRes.rows[0];

    // 2. Insert details into bookings table
    const insertBookingQuery = `
      INSERT INTO bookings (name, phone, email, event_type_id, package_id, event_date, guest_count, addons, total_price, status, discount)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pending', $10)
      RETURNING *
    `;
    
    const bookingParams = [
      inquiry.name,
      inquiry.phone,
      inquiry.email || 'client@gsassociates.com',
      event_type_id ? parseInt(event_type_id) : null,
      package_id ? parseInt(package_id) : null,
      event_date || 'TBD',
      guest_count ? parseInt(guest_count) : 0,
      addons ? (typeof addons === 'string' ? addons : JSON.stringify(addons)) : null,
      total_price ? parseFloat(total_price) : 0.0,
      parseInt(discount) || 0
    ];

    const newBookingRes = await db.query(insertBookingQuery, bookingParams);
    const newBookingId = newBookingRes.rows[0].id;

    // 3. Fetch the fully joined booking details to include catalog names
    const joinedBookingRes = await db.query(`
      SELECT b.*, et.name as event_type_name, p.name as package_name
      FROM bookings b
      LEFT JOIN event_types et ON b.event_type_id = et.id
      LEFT JOIN packages p ON b.package_id = p.id
      WHERE b.id = $1
    `, [newBookingId]);
    const joinedBooking = joinedBookingRes.rows[0];

    // 4. Delete the inquiry from the inbox table
    await db.query('DELETE FROM inquiries WHERE id = $1', [id]);

    res.status(201).json({
      success: true,
      message: 'Inquiry successfully converted to booking.',
      booking: joinedBooking
    });
  } catch (error) {
    console.error('Convert inquiry to booking error:', error.message);
    res.status(500).json({ error: 'Server error during inquiry conversion' });
  }
};
