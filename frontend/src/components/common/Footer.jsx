import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#1E1917',
      color: '#D2C8C4',
      borderTop: '3px solid var(--accent-gold)',
      padding: '50px 0 20px',
      fontFamily: 'var(--font-body)',
      fontSize: '13px'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '30px',
        marginBottom: '40px'
      }}>
        {/* Company profile */}
        <div>
          <h4 style={{ color: 'var(--accent-gold-light)', fontSize: '18px', marginBottom: '16px' }}>GS Associates</h4>
          <p style={{ lineHeight: '1.7', marginBottom: '16px' }}>
            We create seamless, purposeful South Indian gatherings. From Muhurtham planning and traditional catering to polished corporate conferences.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="var(--accent-gold)" /> Bengaluru, South India
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} color="var(--accent-gold)" /> +91 9886781380
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} color="var(--accent-gold)" /> contact@gsassociates.com
            </span>
          </div>
        </div>

        {/* Benefits list */}
        <div>
          <h4 style={{ color: 'var(--accent-gold-light)', fontSize: '16px', marginBottom: '16px' }}>Core Client Benefits</h4>
          <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '8px', padding: 0 }}>
            <li>✓ <strong>Stress Reduction:</strong> End-to-end planning</li>
            <li>✓ <strong>Cost Control:</strong> Transparent package budgets</li>
            <li>✓ <strong>Brand Reputation:</strong> Polished execution</li>
            <li>✓ <strong>Risk Mitigation:</strong> Insured, verified vendors</li>
            <li>✓ <strong>Superior Experiences:</strong> Attendee-focused design</li>
          </ul>
        </div>

        {/* Quick links */}
        <div>
          <h4 style={{ color: 'var(--accent-gold-light)', fontSize: '16px', marginBottom: '16px' }}>Quick Navigation</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/" style={{ color: '#D2C8C4', textDecoration: 'none' }}>Home</Link>
            <Link to="/about" style={{ color: '#D2C8C4', textDecoration: 'none' }}>About Company</Link>
            <Link to="/services" style={{ color: '#D2C8C4', textDecoration: 'none' }}>Our Services</Link>
            <Link to="/ceremonies" style={{ color: '#D2C8C4', textDecoration: 'none' }}>Traditional Ceremonies & Final Rites</Link>
            <Link to="/calculator" style={{ color: '#D2C8C4', textDecoration: 'none' }}>Quote Calculator</Link>
            <Link to="/booking" style={{ color: '#D2C8C4', textDecoration: 'none' }}>Booking Wizard</Link>
          </div>
        </div>

        {/* Operational Guardrails */}
        <div>
          <h4 style={{ color: 'var(--accent-gold-light)', fontSize: '16px', marginBottom: '16px' }}>Our Commitment</h4>
          <p style={{ lineHeight: '1.7', fontSize: '12px' }}>
            All services are available to all communities and individuals. We do not imply restrictions based on caste, religion, or community. Inquiries are processed in the order received. Contact our Priest panel for custom Muhurthams.
          </p>
        </div>
      </div>

      {/* Underbar */}
      <div className="container" style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        paddingTop: '20px',
        textAlign: 'center',
        fontSize: '11px',
        color: '#8b807c',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <span>© {new Date().getFullYear()} GS Associates. All Rights Reserved.</span>
        <span>
          Designed with <Heart size={10} color="var(--primary-maroon-light)" style={{ display: 'inline', margin: '0 2px' }} /> in South India.
        </span>
      </div>
    </footer>
  );
}
