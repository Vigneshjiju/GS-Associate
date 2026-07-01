/**
 * GS Associates — Email Templates
 * Defines styled HTML templates matching the maroon/gold brand theme.
 * All templates are wrapped in wrapInBrandTemplate from emailService.js.
 */

const { wrapInBrandTemplate } = require('./emailService');

/**
 * 1. New Inquiry Confirmation
 */
function getInquiryConfirmationEmail(name, eventType, tentativeDate, phone, guestCount, message) {
  const title = 'Inquiry Received';
  const bodyContent = `
    <h2>Namaskaram, ${name}!</h2>
    <p>Thank you for reaching out to GS Associates. We have received your inquiry and our team is already excited to help you plan your event.</p>
    
    <div class="detail-card">
      <h3 style="margin-top:0;">Inquiry Details</h3>
      <div class="detail-row">
        <span class="detail-label">Event Type</span>
        <span class="detail-value">${eventType}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Tentative Date</span>
        <span class="detail-value">${tentativeDate || 'TBD'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Guest Count</span>
        <span class="detail-value">${guestCount || 'Not Specified'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Contact Phone</span>
        <span class="detail-value">${phone}</span>
      </div>
      ${message ? `
      <div style="margin-top:12px; font-size:12px; color:#666; border-top:1px solid #f0e8d0; padding-top:10px;">
        <strong>Your Message:</strong><br/>
        <em>"${message}"</em>
      </div>` : ''}
    </div>

    <p>One of our senior event coordinators will call you at <strong>${phone}</strong> within 24 hours to discuss options, custom packages, and auspicious timings.</p>
    <p>We look forward to crafting a memorable celebration for you!</p>
  `;

  return wrapInBrandTemplate(title, bodyContent);
}

/**
 * 2. Booking Confirmed
 */
function getBookingConfirmationEmail(booking) {
  const title = 'Booking Confirmed';
  const eventDateStr = booking.event_date || 'TBD';
  const priceStr = parseFloat(booking.total_price || 0).toLocaleString('en-IN');
  const discountStr = booking.discount ? ` (Discount Applied: ${booking.discount}%)` : '';

  const bodyContent = `
    <h2>Your Booking is Confirmed! 🎉</h2>
    <p>Dear ${booking.name},</p>
    <p>Namaskaram! We are absolutely delighted to confirm your booking for your upcoming event. Our event managers are ready to bring your vision to life.</p>
    
    <p>Please find your official <strong>Booking Confirmation Certificate PDF</strong> attached to this email.</p>

    <div class="detail-card">
      <h3 style="margin-top:0;">Event Booking Summary</h3>
      <div class="detail-row">
        <span class="detail-label">Booking ID</span>
        <span class="detail-value">GS-BKG-${booking.id}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Event Type</span>
        <span class="detail-value">${booking.event_type_name || booking.eventType || 'Event'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Package Plan</span>
        <span class="detail-value">${booking.package_name || booking.tier || 'Custom'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Event Date</span>
        <span class="detail-value">${eventDateStr}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Guest Count</span>
        <span class="detail-value">${booking.guest_count} Guests</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status</span>
        <span class="detail-value"><span class="status-badge badge-confirmed">CONFIRMED</span></span>
      </div>
      <div class="detail-row" style="border-bottom:none; margin-top:8px;">
        <span class="detail-label" style="font-size:14px; font-weight:bold; color:#7A001E;">Total Amount</span>
        <span class="detail-value" style="font-size:16px; color:#7A001E; font-weight:800;">₹${priceStr}${discountStr}</span>
      </div>
    </div>

    <p>If you have any questions or would like to discuss customizations (catering menu selection, decorators, vendor setups), please reach out to your assigned coordinator or call us directly.</p>
  `;

  return wrapInBrandTemplate(title, bodyContent);
}

/**
 * 3. 7 Days Before Event Reminder
 */
function getEventReminderEmail(booking) {
  const title = 'Upcoming Event Checklist';
  const eventDateStr = booking.event_date || 'TBD';

  const bodyContent = `
    <h2>7 Days to Your Auspicious Event! 🌸</h2>
    <p>Dear ${booking.name},</p>
    <p>Namaskaram! With just one week remaining until your <strong>${booking.event_type_name || booking.eventType || 'Event'}</strong> on <strong>${eventDateStr}</strong>, we are in the final stages of preparations.</p>
    
    <p>To ensure flawless execution, please review this essential checklist and align with your coordinator:</p>

    <ul class="checklist">
      <li><strong>Confirm Guest Count</strong>: Finalize headcount for seating and catering arrangements.</li>
      <li><strong>Catering & Menu Details</strong>: Confirm specific menu choices, welcome drinks, and coffee station timings.</li>
      <li><strong>Priest & Ritual Timings</strong>: Verify muhurtham and pooja timings with the family priest.</li>
      <li><strong>Vendor Coordination</strong>: Confirm decor layout setups, photography timings, and audio setup times.</li>
      <li><strong>Guest Logistics & Seating</strong>: Review seating layouts, VIP coordinates, and entrance signage.</li>
      <li><strong>Family Point of Contact (SPOC)</strong>: Appoint one family member to coordinate with our on-ground crew.</li>
      <li><strong>Onsite Settlements</strong>: Arrange cash/payment details for any direct helper tips or vendor balances.</li>
    </ul>

    <p>Your coordinator will call you in the next 24 hours to go through this checklist step-by-step. Let's make this day perfect!</p>
  `;

  return wrapInBrandTemplate(title, bodyContent);
}

/**
 * 4. Day After Event Feedback Request
 */
function getFeedbackRequestEmail(booking, feedbackUrl) {
  const title = 'Share Your Experience';
  const eventTypeName = booking.event_type_name || booking.eventType || 'Event';

  const bodyContent = `
    <h2>How was your ${eventTypeName} experience? 🙏</h2>
    <p>Dear ${booking.name},</p>
    <p>Namaskaram! We hope you and your family had a beautiful and spiritually enriching experience at your ${eventTypeName} yesterday.</p>
    
    <p>At GS Associates, we strive to deliver the highest standard of hospitality and tradition. Your feedback is extremely valuable to help us improve and serve our community better.</p>
    
    <p>Please take 2 minutes to fill out our quick feedback form by clicking the link below:</p>
    
    <div style="text-align: center; margin: 24px 0;">
      <a href="${feedbackUrl}" class="cta-button-gold" style="color: #1A1A1A !important;">⭐ Share Feedback & Rating</a>
    </div>

    <p>Thank you for making us a part of your milestone celebrations.</p>
    <p>Wishing you and your family abundant peace and prosperity.</p>
  `;

  return wrapInBrandTemplate(title, bodyContent);
}

/**
 * 5. Bill / Invoice Email
 */
function getBillNotificationEmail(billData) {
  const title = 'Your GS Associates Invoice';
  const eventDateStr = billData.eventDate || 'TBD';
  const grandTotalStr = parseFloat(billData.grandTotal || 0).toLocaleString('en-IN');
  const balanceDueStr = parseFloat(billData.balanceDue || 0).toLocaleString('en-IN');
  const amountReceivedStr = parseFloat(billData.amountReceived || 0).toLocaleString('en-IN');

  const bodyContent = `
    <h2>Invoice Bill Ready</h2>
    <p>Dear ${billData.clientName},</p>
    <p>Namaskaram! Please find attached the official invoice (Bill: <strong>${billData.billNo}</strong>) for the event services provided for your ${billData.eventType || 'Event'} on ${eventDateStr}.</p>
    
    <div class="detail-card">
      <h3 style="margin-top:0;">Payment Summary</h3>
      <div class="detail-row">
        <span class="detail-label">Invoice Number</span>
        <span class="detail-value">${billData.billNo}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Event Date</span>
        <span class="detail-value">${eventDateStr}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Total Invoice Value</span>
        <span class="detail-value">₹${grandTotalStr}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Amount Paid</span>
        <span class="detail-value" style="color: #27ae60;">₹${amountReceivedStr}</span>
      </div>
      <div class="detail-row" style="border-bottom:none; margin-top:8px;">
        <span class="detail-label" style="font-size:14px; font-weight:bold; color:#7A001E;">Balance Due</span>
        <span class="detail-value" style="font-size:16px; color:#7A001E; font-weight:800;">₹${balanceDueStr}</span>
      </div>
    </div>

    ${parseFloat(billData.balanceDue || 0) > 0 ? `
    <p>If there is an outstanding balance, please complete the payment at your earliest convenience or contact our billing desk.</p>` : `
    <p>Thank you! Your bill has been fully settled. We appreciate your timely payments.</p>`}
    
    <p>Thank you for choosing GS Associates. Please find the detailed PDF receipt attached.</p>
  `;

  return wrapInBrandTemplate(title, bodyContent);
}

module.exports = {
  getInquiryConfirmationEmail,
  getBookingConfirmationEmail,
  getEventReminderEmail,
  getFeedbackRequestEmail,
  getBillNotificationEmail
};
