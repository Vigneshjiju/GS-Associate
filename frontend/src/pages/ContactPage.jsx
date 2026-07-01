import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Phone, MapPin, CheckCircle, Send } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    event_type: 'Weddings',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/inquiries', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        event_type: formData.event_type,
        message: formData.message
      });
      setSuccess(true);
    } catch (err) {
      console.error('Error submitting contact form:', err.message);
      alert('Unable to send inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'var(--font-body)', padding: '60px 0' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>

        {/* Contact info */}
        <div>
          <h2 style={{ fontSize: '32px', marginBottom: '16px' }} className="traditional-border">Get in Touch</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.7', marginBottom: '30px' }}>
            Planning a traditional South Indian wedding, life-cycle ceremony, or a corporate conference? Our office coordinators are ready to help.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent-gold-light)', display: 'flex', alignItems: 'center', justify: 'center', flexShrink: 0 }}>
                <MapPin size={18} color="var(--primary-maroon)" />
              </div>
              <div>
                <strong>Bengaluru Office</strong>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Lingarajapuram, Bengaluru - 560084</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent-gold-light)', display: 'flex', alignItems: 'center', justify: 'center', flexShrink: 0 }}>
                <Phone size={18} color="var(--primary-maroon)" />
              </div>
              <div>
                <strong>Call Support</strong>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>+91 9886781380</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent-gold-light)', display: 'flex', alignItems: 'center', justify: 'center', flexShrink: 0 }}>
                <Mail size={18} color="var(--primary-maroon)" />
              </div>
              <div>
                <strong>Email Address</strong>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>contact@gsassociates.com / quotes@gsassociates.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="glass-card" style={{ padding: '30px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Send a Message</h3>

          {success ? (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <CheckCircle size={48} color="var(--primary-maroon)" style={{ marginBottom: '12px' }} />
              <h4>Inquiry Received Successfully!</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>
                Thank you for contacting GS Associates. Our planning team will review your requirements and reach out to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Mobile Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit number"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Event Category</label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, event_type: e.target.value }))}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none', height: '38px', backgroundColor: 'white' }}
                  >
                    <option value="Weddings">Weddings</option>
                    <option value="Traditional Ceremonies">Traditional Ceremonies</option>
                    <option value="Final Rites">Final Rites</option>
                    <option value="Corporate Events">Corporate Events</option>
                    <option value="Social Gatherings">Social Gatherings</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Specific Requirements</label>
                <textarea
                  rows="4"
                  placeholder="Tell us about guests count, preferred location, auspicious date timing limits, etc."
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none', fontFamily: 'inherit' }}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  justifyContent: 'center',
                  padding: '12px',
                  borderRadius: '30px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                <Send size={16} /> {loading ? 'Sending...' : 'Send Inquiry'}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
