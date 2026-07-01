const db = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    // Total inquiries
    const inquiriesRes = await db.query('SELECT COUNT(*) as count FROM inquiries');
    const totalLeads = parseInt(inquiriesRes.rows[0]?.count || inquiriesRes.rows[0]?.COUNT || 0);

    // Converted inquiries (status = 'Converted')
    const convertedRes = await db.query("SELECT COUNT(*) as count FROM inquiries WHERE status = 'Converted'");
    const convertedLeads = parseInt(convertedRes.rows[0]?.count || convertedRes.rows[0]?.COUNT || 0);

    // Total bookings count
    const bookingsCountRes = await db.query('SELECT COUNT(*) as count FROM bookings');
    const totalBookings = parseInt(bookingsCountRes.rows[0]?.count || bookingsCountRes.rows[0]?.COUNT || 0);

    // Confirmed and pending revenue
    const revenueRes = await db.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'Confirmed' THEN total_price ELSE 0 END), 0) as confirmed,
        COALESCE(SUM(CASE WHEN status = 'Pending' THEN total_price ELSE 0 END), 0) as pending
      FROM bookings
    `);
    
    const confirmedRevenue = parseFloat(revenueRes.rows[0]?.confirmed || revenueRes.rows[0]?.CONFIRMED || 0);
    const pendingRevenue = parseFloat(revenueRes.rows[0]?.pending || revenueRes.rows[0]?.PENDING || 0);

    // Conversion rate
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

    // Recent leads (limit 5)
    const recentLeadsRes = await db.query('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 5');
    
    // Recent bookings (limit 5)
    const recentBookingsRes = await db.query(`
      SELECT b.*, et.name as event_type_name, p.name as package_name
      FROM bookings b
      LEFT JOIN event_types et ON b.event_type_id = et.id
      LEFT JOIN packages p ON b.package_id = p.id
      ORDER BY b.created_at DESC
      LIMIT 5
    `);

    res.json({
      summary: {
        totalLeads,
        totalBookings,
        confirmedRevenue,
        pendingRevenue,
        conversionRate: parseFloat(conversionRate)
      },
      recentLeads: recentLeadsRes.rows,
      recentBookings: recentBookingsRes.rows
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error.message);
    res.status(500).json({ error: 'Server error generating dashboard analytics' });
  }
};
