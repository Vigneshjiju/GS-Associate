const crypto = require('crypto');
const db = require('../config/db');
const { sendBookingConfirmation } = require('../services/notificationService');

// Lazily initialize Razorpay to avoid crashing if the package isn't installed yet
let razorpayInstance = null;

function getRazorpay() {
  if (!razorpayInstance) {
    const Razorpay = require('razorpay');
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpayInstance;
}

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order and saves a pending payment record.
 * Body: { bookingId, amount }   (amount in INR, not paise)
 */
exports.createOrder = async (req, res) => {
  const { bookingId, amount } = req.body;

  if (!bookingId || !amount) {
    return res.status(400).json({ error: 'bookingId and amount are required' });
  }

  try {
    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: `GS${Date.now()}`
    });

    // Save pending payment record
    await db.query(
      `INSERT INTO payments (booking_id, razorpay_order_id, amount, status)
       VALUES ($1, $2, $3, 'pending')`,
      [parseInt(bookingId), order.id, Math.round(amount)]
    );

    console.log(`[PAYMENT ORDER CREATED]: Booking #${bookingId} — ₹${amount} — Order ${order.id}`);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error.message);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

/**
 * POST /api/payments/verify
 * Verifies Razorpay payment signature and updates booking status.
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId }
 */
exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
    return res.status(400).json({ error: 'All payment verification fields are required' });
  }

  try {
    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Mark payment as failed
      await db.query(
        `UPDATE payments SET status = 'failed' WHERE razorpay_order_id = $1`,
        [razorpay_order_id]
      );
      console.warn(`[PAYMENT FAILED]: Invalid signature for order ${razorpay_order_id}`);
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Signature valid — update payment record
    await db.query(
      `UPDATE payments SET razorpay_payment_id = $1, razorpay_signature = $2, status = 'paid'
       WHERE razorpay_order_id = $3`,
      [razorpay_payment_id, razorpay_signature, razorpay_order_id]
    );

    // Update booking status to 'Confirmed'
    await db.query(
      `UPDATE bookings SET status = 'Confirmed' WHERE id = $1`,
      [parseInt(bookingId)]
    );

    // Trigger confirmation email with PDF
    sendBookingConfirmation(parseInt(bookingId));

    console.log(`[PAYMENT VERIFIED]: Booking #${bookingId} confirmed — Payment ${razorpay_payment_id}`);

    res.json({
      success: true,
      message: 'Payment verified and booking confirmed',
      paymentId: razorpay_payment_id,
      bookingId
    });
  } catch (error) {
    console.error('Verify payment error:', error.message);
    res.status(500).json({ error: 'Server error verifying payment' });
  }
};

/**
 * GET /api/payments/:bookingId
 * Returns payment status for a given booking.
 */
exports.getPaymentStatus = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const result = await db.query(
      `SELECT * FROM payments WHERE booking_id = $1 ORDER BY created_at DESC`,
      [parseInt(bookingId)]
    );

    if (result.rows.length === 0) {
      return res.json({ status: 'no_payment', payments: [] });
    }

    res.json({
      status: result.rows[0].status,
      payments: result.rows
    });
  } catch (error) {
    console.error('Get payment status error:', error.message);
    res.status(500).json({ error: 'Server error fetching payment status' });
  }
};
