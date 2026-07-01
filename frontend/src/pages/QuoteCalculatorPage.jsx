import React from 'react';
import QuoteCalculator from '../components/quote-calculator/QuoteCalculator';

export default function QuoteCalculatorPage() {
  return (
    <div style={{ fontFamily: 'var(--font-body)', padding: '60px 0', backgroundColor: 'var(--bg-cream)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '36px' }} className="traditional-border">Quote & Budget Calculator</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '10px' }}>
            Build a live estimate structure for catering, decorations, photographers, and priest booking.
          </p>
        </div>

        <QuoteCalculator />
      </div>
    </div>
  );
}
