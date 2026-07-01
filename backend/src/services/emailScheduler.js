/**
 * GS Associates — Email Scheduler
 * Periodically checks the database for events requiring reminders or feedback requests.
 * Uses lightweight setInterval to run database-agnostic date queries.
 */

const db = require('../config/db');
const { sendEmail } = require('./emailService');
const { getEventReminderEmail, getFeedbackRequestEmail } = require('./emailTemplates');

/**
 * Main routine to query database and send pending scheduler emails.
 */
async function checkAndSendSchedulerEmails() {
  console.log('[SCHEDULER] Running scheduled email check...');

  try {
    await send7DayReminders();
    await sendPostEventFeedbacks();
  } catch (error) {
    console.error('[SCHEDULER ERROR] Failed in scheduler run:', error.message);
  }
}

/**
 * 1. Send reminders 7 days before event date
 */
async function send7DayReminders() {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 7);
  const dateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD

  const queryStr = `
    SELECT b.*, et.name as event_type_name, p.name as package_name
    FROM bookings b
    LEFT JOIN event_types et ON b.event_type_id = et.id
    LEFT JOIN packages p ON b.package_id = p.id
    WHERE b.event_date = $1 
      AND b.status = 'Confirmed' 
      AND (b.reminder_sent IS NULL OR b.reminder_sent = 0)
  `;

  try {
    const result = await db.query(queryStr, [dateStr]);
    const bookings = result.rows || [];

    if (bookings.length === 0) {
      console.log(`[SCHEDULER] No 7-day reminders needed for date: ${dateStr}`);
      return;
    }

    console.log(`[SCHEDULER] Found ${bookings.length} confirmed bookings for date: ${dateStr} requiring reminders.`);

    for (const booking of bookings) {
      if (!booking.email) {
        console.warn(`[SCHEDULER] Booking #${booking.id} has no email address. Skipping.`);
        continue;
      }

      try {
        const html = getEventReminderEmail(booking);
        const subject = `Upcoming Event Checklist — GS Associates`;
        
        await sendEmail({
          to: booking.email,
          subject,
          html
        });

        // Mark as sent
        await db.query('UPDATE bookings SET reminder_sent = 1 WHERE id = $1', [booking.id]);
        console.log(`[SCHEDULER] Sent 7-day reminder to ${booking.email} for booking #${booking.id}`);
      } catch (err) {
        console.error(`[SCHEDULER ERROR] Failed to send reminder for booking #${booking.id}:`, err.message);
      }
    }
  } catch (error) {
    console.error('[SCHEDULER ERROR] Failed querying 7-day reminders:', error.message);
  }
}

/**
 * 2. Send feedback link 1 day after event date
 */
async function sendPostEventFeedbacks() {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - 1);
  const dateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD

  const queryStr = `
    SELECT b.*, et.name as event_type_name, p.name as package_name
    FROM bookings b
    LEFT JOIN event_types et ON b.event_type_id = et.id
    LEFT JOIN packages p ON b.package_id = p.id
    WHERE b.event_date = $1 
      AND (b.status = 'Confirmed' OR b.status = 'Completed') 
      AND (b.feedback_sent IS NULL OR b.feedback_sent = 0)
  `;

  try {
    const result = await db.query(queryStr, [dateStr]);
    const bookings = result.rows || [];

    if (bookings.length === 0) {
      console.log(`[SCHEDULER] No post-event feedback emails needed for date: ${dateStr}`);
      return;
    }

    console.log(`[SCHEDULER] Found ${bookings.length} completed bookings for date: ${dateStr} requiring feedback email.`);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    for (const booking of bookings) {
      if (!booking.email) {
        console.warn(`[SCHEDULER] Booking #${booking.id} has no email address. Skipping.`);
        continue;
      }

      try {
        const feedbackUrl = `${frontendUrl}/feedback/${booking.id}`;
        const html = getFeedbackRequestEmail(booking, feedbackUrl);
        const subject = `How was your event? Share your feedback — GS Associates`;
        
        await sendEmail({
          to: booking.email,
          subject,
          html
        });

        // Mark as sent
        await db.query('UPDATE bookings SET feedback_sent = 1 WHERE id = $1', [booking.id]);
        console.log(`[SCHEDULER] Sent feedback request email to ${booking.email} for booking #${booking.id}`);
      } catch (err) {
        console.error(`[SCHEDULER ERROR] Failed to send feedback request for booking #${booking.id}:`, err.message);
      }
    }
  } catch (error) {
    console.error('[SCHEDULER ERROR] Failed querying post-event feedback emails:', error.message);
  }
}

/**
 * Start the scheduler loop
 */
function startEmailScheduler() {
  // Execute a check 5 seconds after startup
  setTimeout(checkAndSendSchedulerEmails, 5000);

  // Check every 12 hours (43,200,000 milliseconds)
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;
  setInterval(checkAndSendSchedulerEmails, TWELVE_HOURS);

  console.log('[SCHEDULER] Email scheduler registered to execute daily (checked every 12h).');
}

module.exports = {
  startEmailScheduler,
  checkAndSendSchedulerEmails // exposed for manual trigger verification
};
