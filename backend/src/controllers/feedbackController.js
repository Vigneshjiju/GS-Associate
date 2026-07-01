/**
 * GS Associates — Feedback Controller
 * Handles post-event feedback submission, admin viewing, stats, and testimonial approval.
 */

const db = require('../config/db');

/**
 * POST /api/feedback
 * Public: Submit feedback for a booking.
 * Body: { bookingId, overallRating, bestComment, improveComment, recommend }
 */
exports.submitFeedback = async (req, res) => {
  const { bookingId, overallRating, bestComment, improveComment, recommend } = req.body;

  if (!bookingId || !overallRating) {
    return res.status(400).json({ error: 'bookingId and overallRating are required' });
  }

  try {
    // Check if feedback already exists for this booking
    const existingCheck = await db.query(
      'SELECT id FROM feedback_surveys WHERE booking_id = $1',
      [parseInt(bookingId)]
    );
    if (existingCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Feedback has already been submitted for this booking.' });
    }

    // Insert feedback
    const result = await db.query(
      `INSERT INTO feedback_surveys (booking_id, overall_rating, best_comment, improve_comment, recommend, status)
       VALUES ($1, $2, $3, $4, $5, 'submitted')`,
      [
        parseInt(bookingId),
        parseInt(overallRating),
        bestComment || null,
        improveComment || null,
        recommend ? 1 : 0
      ]
    );

    const feedbackId = result.lastInsertRowid || result.rows?.[0]?.id;

    // If rating >= 4 AND recommend === true, auto-create a pending testimonial
    if (parseInt(overallRating) >= 4 && recommend) {
      // Fetch booking details for testimonial context
      const bookingRes = await db.query(
        `SELECT b.*, et.name as event_type_name
         FROM bookings b
         LEFT JOIN event_types et ON b.event_type_id = et.id
         WHERE b.id = $1`,
        [parseInt(bookingId)]
      );

      if (bookingRes.rows.length > 0) {
        const booking = bookingRes.rows[0];
        const reviewText = bestComment || 'Wonderful experience with GS Associates!';

        await db.query(
          `INSERT INTO testimonials (client_name, event_type, review_text, rating, event_date, status, feedback_id)
           VALUES ($1, $2, $3, $4, $5, 'pending_approval', $6)`,
          [
            booking.name,
            booking.event_type_name || 'Event',
            reviewText,
            parseInt(overallRating),
            booking.event_date || '',
            feedbackId || null
          ]
        );

        console.log(`[FEEDBACK] Auto-created pending testimonial for ${booking.name}`);
      }
    }

    console.log(`[FEEDBACK RECEIVED] Booking #${bookingId} — Rating: ${overallRating}/5`);
    res.status(201).json({ success: true, message: 'Thank you for your feedback!' });
  } catch (error) {
    console.error('Submit feedback error:', error.message);
    res.status(500).json({ error: 'Server error saving feedback' });
  }
};

/**
 * GET /api/feedback/check/:bookingId
 * Public: Check if feedback already exists for a booking.
 */
exports.checkFeedback = async (req, res) => {
  const { bookingId } = req.params;
  try {
    const result = await db.query(
      'SELECT id FROM feedback_surveys WHERE booking_id = $1',
      [parseInt(bookingId)]
    );
    res.json({ exists: result.rows.length > 0 });
  } catch (error) {
    console.error('Check feedback error:', error.message);
    res.status(500).json({ error: 'Server error checking feedback' });
  }
};

/**
 * GET /api/feedback/booking/:bookingId
 * Public: Get booking details for feedback form.
 */
exports.getBookingForFeedback = async (req, res) => {
  const { bookingId } = req.params;
  try {
    const result = await db.query(
      `SELECT b.id, b.name, b.email, b.event_date, b.guest_count,
              et.name as event_type_name, p.name as package_name
       FROM bookings b
       LEFT JOIN event_types et ON b.event_type_id = et.id
       LEFT JOIN packages p ON b.package_id = p.id
       WHERE b.id = $1`,
      [parseInt(bookingId)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get booking for feedback error:', error.message);
    res.status(500).json({ error: 'Server error fetching booking details' });
  }
};

/**
 * GET /api/feedback
 * Admin: Get all feedback with booking details.
 */
exports.getAllFeedback = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT fs.*, b.name as client_name, b.email, b.event_date,
              et.name as event_type_name,
              CASE WHEN t.id IS NOT NULL THEN 1 ELSE 0 END as has_testimonial,
              t.status as testimonial_status
       FROM feedback_surveys fs
       LEFT JOIN bookings b ON fs.booking_id = b.id
       LEFT JOIN event_types et ON b.event_type_id = et.id
       LEFT JOIN testimonials t ON t.feedback_id = fs.id
       ORDER BY fs.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get all feedback error:', error.message);
    res.status(500).json({ error: 'Server error fetching feedback' });
  }
};

/**
 * GET /api/feedback/stats
 * Admin: Aggregate feedback statistics.
 */
exports.getFeedbackStats = async (req, res) => {
  try {
    // Get all feedback ratings
    const allFeedback = await db.query(
      'SELECT overall_rating, recommend FROM feedback_surveys'
    );

    const rows = allFeedback.rows;
    const totalReviews = rows.length;

    if (totalReviews === 0) {
      return res.json({
        avgRating: 0,
        totalReviews: 0,
        recommendPercent: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
    }

    const totalRating = rows.reduce((sum, r) => sum + (r.overall_rating || 0), 0);
    const avgRating = (totalRating / totalReviews).toFixed(1);

    const recommendCount = rows.filter(r => r.recommend === 1 || r.recommend === true).length;
    const recommendPercent = Math.round((recommendCount / totalReviews) * 100);

    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    rows.forEach(r => {
      const star = Math.min(5, Math.max(1, r.overall_rating));
      ratingBreakdown[star] = (ratingBreakdown[star] || 0) + 1;
    });

    res.json({ avgRating: parseFloat(avgRating), totalReviews, recommendPercent, ratingBreakdown });
  } catch (error) {
    console.error('Get feedback stats error:', error.message);
    res.status(500).json({ error: 'Server error fetching feedback stats' });
  }
};

/**
 * PUT /api/feedback/testimonials/:testimonialId/approve
 * Admin: Approve a pending testimonial (looked up by feedback_id).
 */
exports.approveTestimonial = async (req, res) => {
  const { testimonialId } = req.params;
  try {
    // Look up by feedback_id first, fall back to direct id
    let result = await db.query(
      "UPDATE testimonials SET status = 'approved' WHERE feedback_id = $1",
      [parseInt(testimonialId)]
    );
    if (result.rowCount === 0) {
      result = await db.query(
        "UPDATE testimonials SET status = 'approved' WHERE id = $1",
        [parseInt(testimonialId)]
      );
    }
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    console.log(`[TESTIMONIAL APPROVED] feedback_id/id #${testimonialId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Approve testimonial error:', error.message);
    res.status(500).json({ error: 'Server error approving testimonial' });
  }
};

/**
 * PUT /api/feedback/testimonials/:testimonialId/reject
 * Admin: Reject a pending testimonial (looked up by feedback_id).
 */
exports.rejectTestimonial = async (req, res) => {
  const { testimonialId } = req.params;
  try {
    let result = await db.query(
      "UPDATE testimonials SET status = 'rejected' WHERE feedback_id = $1",
      [parseInt(testimonialId)]
    );
    if (result.rowCount === 0) {
      result = await db.query(
        "UPDATE testimonials SET status = 'rejected' WHERE id = $1",
        [parseInt(testimonialId)]
      );
    }
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    console.log(`[TESTIMONIAL REJECTED] feedback_id/id #${testimonialId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Reject testimonial error:', error.message);
    res.status(500).json({ error: 'Server error rejecting testimonial' });
  }
};

