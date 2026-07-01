import React from 'react';
import BookingWizard from '../components/booking/BookingWizard';

export default function BookingPage() {
  return (
    <div style={{ fontFamily: 'var(--font-body)', padding: '60px 0', backgroundColor: 'var(--bg-cream)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '36px' }} className="traditional-border">Event Booking Wizard</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '10px' }}>
            Book your event date, select your custom package, and schedule Vedic consults step-by-step.
          </p>
        </div>

        <BookingWizard />
      </div>
    </div>
  );
}
