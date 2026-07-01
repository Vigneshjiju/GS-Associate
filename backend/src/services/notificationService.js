/**
 * GS Associates — Notification Service
 * Orchestrates sending rich notifications with PDF attachments.
 * Prevents circular dependencies between low-level modules.
 */

const db = require('../config/db');
const { sendEmail } = require('./emailService');
const { getBookingConfirmationEmail } = require('./emailTemplates');
const { generateBookingConfirmationPDF } = require('./pdfService');

/**
 * Sends a booking confirmation email with generated PDF attachment to the client.
 * Async fire-and-forget.
 */
async function sendBookingConfirmation(bookingId) {
  try {
    // 1. Fetch joined booking details
    const result = await db.query(`
      SELECT b.*, et.name as event_type_name, p.name as package_name
      FROM bookings b
      LEFT JOIN event_types et ON b.event_type_id = et.id
      LEFT JOIN packages p ON b.package_id = p.id
      WHERE b.id = $1
    `, [parseInt(bookingId)]);

    if (result.rowCount === 0) {
      console.error(`[NOTIFICATION ERROR] Booking #${bookingId} not found`);
      return;
    }

    const booking = result.rows[0];
    if (!booking.email) {
      console.warn(`[NOTIFICATION WARNING] Booking #${bookingId} has no email address. Skipping email.`);
      return;
    }

    console.log(`[NOTIFICATION START]: Sending booking confirmation for Booking #${bookingId} to ${booking.email}`);

    // 2. Generate PDF confirmation in memory
    const pdfBuffer = await generateBookingConfirmationPDF(booking);

    // 3. Generate HTML email body
    const html = getBookingConfirmationEmail(booking);

    // 4. Send the email with the attachment
    const subject = `Booking Confirmed! — GS Associates (Booking #${booking.id})`;
    await sendEmail({
      to: booking.email,
      subject,
      html,
      attachments: [
        {
          filename: `GS_Booking_Confirmation_${booking.id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    console.log(`[NOTIFICATION SUCCESS]: Booking confirmation email sent for Booking #${booking.id}`);
  } catch (error) {
    console.error(`[NOTIFICATION ERROR] Failed to send booking confirmation for Booking #${bookingId}:`, error.message);
  }
}

module.exports = {
  sendBookingConfirmation
};
