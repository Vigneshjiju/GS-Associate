const db = require('../config/db');
const { sendBookingConfirmation } = require('../services/notificationService');

exports.createBooking = async (req, res) => {
  const { name, phone, email, event_type_id, package_id, event_date, guest_count, addons, total_price, discount } = req.body;
  
  if (!name || !phone || !email || !event_type_id || !package_id || !event_date || !guest_count || !total_price) {
    return res.status(400).json({ error: 'Please provide all required booking details' });
  }

  try {
    // Check if event date is already booked (or highly requested, but let's keep it simple)
    const queryStr = `
      INSERT INTO bookings (name, phone, email, event_type_id, package_id, event_date, guest_count, addons, total_price, status, discount)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pending', $10)
      RETURNING *
    `;
    const params = [
      name,
      phone,
      email,
      parseInt(event_type_id),
      parseInt(package_id),
      event_date,
      parseInt(guest_count),
      addons ? (typeof addons === 'string' ? addons : JSON.stringify(addons)) : null,
      parseFloat(total_price),
      parseInt(discount) || 0
    ];

    const result = await db.query(queryStr, params);
    
    console.log(`[BOOKING CREATED]: ${name} on ${event_date} for ₹${total_price}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create booking error:', error.message);
    res.status(500).json({ error: 'Server error saving booking' });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const queryStr = `
      SELECT b.*, et.name as event_type_name, p.name as package_name
      FROM bookings b
      LEFT JOIN event_types et ON b.event_type_id = et.id
      LEFT JOIN packages p ON b.package_id = p.id
      ORDER BY b.event_date ASC
    `;
    const result = await db.query(queryStr);
    res.json(result.rows);
  } catch (error) {
    console.error('Get bookings error:', error.message);
    res.status(500).json({ error: 'Server error fetching bookings' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    // Get booking before update to check old status
    const oldBookingRes = await db.query('SELECT status FROM bookings WHERE id = $1', [id]);
    const oldStatus = oldBookingRes.rows[0]?.status;

    const result = await db.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const updatedBooking = result.rows[0];

    // If status changed to Confirmed, trigger booking confirmation email
    if (status === 'Confirmed' && oldStatus !== 'Confirmed') {
      sendBookingConfirmation(updatedBooking.id);
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error('Update booking status error:', error.message);
    res.status(500).json({ error: 'Server error updating booking status' });
  }
};

exports.updateBookingDiscount = async (req, res) => {
  const { id } = req.params;
  const { discount } = req.body;

  if (discount === undefined || discount === null) {
    return res.status(400).json({ error: 'Discount is required' });
  }

  const discountPercent = Math.min(100, Math.max(0, parseInt(discount) || 0));

  try {
    const result = await db.query(
      'UPDATE bookings SET discount = $1 WHERE id = $2 RETURNING *',
      [discountPercent, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update booking discount error:', error.message);
    res.status(500).json({ error: 'Server error updating booking discount' });
  }
};
