import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calculator, Download, Check, PhoneCall, CheckCircle } from 'lucide-react';

export default function QuoteCalculator() {
  const [eventType, setEventType] = useState('Weddings');
  const [tier, setTier] = useState('Premium');
  const [guests, setGuests] = useState(200);
  const [days, setDays] = useState(1);

  // Selected add-ons
  const [addons, setAddons] = useState({
    decor: true,
    catering: true,
    photography: true,
    priest: false
  });

  const [estimate, setEstimate] = useState({
    base: 0,
    decor: 0,
    catering: 0,
    photography: 0,
    priest: 0,
    total: 0
  });

  // Lead inquiry form state
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    submitted: false,
    loading: false
  });

  // Persistent reference number for the print session
  const [refNumber] = useState(() => `GS${Math.floor(100000 + Math.random() * 900000)}`);

  // Dynamic pricing matrix
  const pricingData = {
    Weddings: {
      Basic: { base: 100000, decor: 35000, catering: 450, photography: 25000, priest: 10000 },
      Premium: { base: 600000, decor: 85000, catering: 750, photography: 60000, priest: 18000 },
      Luxury: { base: 1200000, decor: 180000, catering: 1500, photography: 120000, priest: 35000 }
    },
    Corporate: {
      Basic: { base: 150000, decor: 25000, catering: 400, photography: 20000, priest: 0 },
      Premium: { base: 350000, decor: 60000, catering: 700, photography: 45000, priest: 0 },
      Luxury: { base: 700000, decor: 130000, catering: 1300, photography: 90000, priest: 0 }
    },
    Social: {
      Basic: { base: 75000, decor: 15000, catering: 350, photography: 15000, priest: 5000 },
      Premium: { base: 180000, decor: 40000, catering: 600, photography: 35000, priest: 12000 },
      Luxury: { base: 350000, decor: 90000, catering: 1200, photography: 75000, priest: 25000 }
    },
    Ceremonies: {
      Basic: { base: 40000, decor: 10000, catering: 400, photography: 15000, priest: 8000 },
      Premium: { base: 90000, decor: 25000, catering: 750, photography: 30000, priest: 15000 },
      Luxury: { base: 200000, decor: 60000, catering: 1400, photography: 65000, priest: 30000 }
    },
    'Final Rites': {
      Basic: { base: 35000, decor: 8000, catering: 350, photography: 12000, priest: 10000 },
      Premium: { base: 80000, decor: 20000, catering: 650, photography: 25000, priest: 20000 },
      Luxury: { base: 150000, decor: 45000, catering: 1100, photography: 50000, priest: 38000 }
    }
  };

  useEffect(() => {
    calculateTotal();
  }, [eventType, tier, guests, days, addons]);

  const calculateTotal = () => {
    const config = pricingData[eventType][tier];

    // Base cost scaled by days (with small multi-day discount)
    const baseCost = config.base * days * (days > 1 ? 0.85 : 1.0);

    // Add-on costs
    const decorCost = addons.decor ? config.decor * days : 0;
    const cateringCost = addons.catering ? config.catering * guests * days : 0;
    const photoCost = addons.photography ? config.photography * (days > 1 ? days * 0.75 : 1) : 0;
    const priestCost = addons.priest ? config.priest * (days > 1 ? days * 0.6 : 1) : 0;

    const total = baseCost + decorCost + cateringCost + photoCost + priestCost;

    setEstimate({
      base: baseCost,
      decor: decorCost,
      catering: cateringCost,
      photography: photoCost,
      priest: priestCost,
      total
    });
  };

  const handleAddonClick = (key) => {
    setAddons(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone) return;

    setContactForm(prev => ({ ...prev, loading: true }));
    try {
      const summaryMsg = `Dynamic Quote Submitted. Ref: #${refNumber}. Category: ${eventType}, Tier: ${tier}, Guests: ${guests}, Days: ${days}. Calculated estimate: ₹${estimate.total.toLocaleString('en-IN')}.`;
      await axios.post('/api/inquiries', {
        name: contactForm.name,
        phone: contactForm.phone,
        email: contactForm.email || null,
        event_type: eventType,
        tentative_date: `Plan for ${days} days`,
        guest_count: guests,
        message: summaryMsg
      });
      setContactForm(prev => ({ ...prev, submitted: true, loading: false }));
    } catch (err) {
      console.error('Failed to submit quote lead:', err.message);
      setContactForm(prev => ({ ...prev, loading: false }));
      alert('Failed to submit inquiry. Please try again or connect via WhatsApp.');
    }
  };

  // Build the line items array dynamically matching the print rules
  const lineItems = [
    {
      label: `Base Event Coordination & Management (${tier})`,
      qty: `${days} ${days === 1 ? 'Day' : 'Days'}`,
      amount: estimate.base
    }
  ];

  if (addons.decor) {
    lineItems.push({
      label: 'Thematic Decor Add-on',
      qty: `${days} ${days === 1 ? 'Day' : 'Days'}`,
      amount: estimate.decor
    });
  }

  if (addons.catering) {
    lineItems.push({
      label: `Traditional Sattvic Catering (₹${pricingData[eventType][tier].catering}/plate)`,
      qty: `${guests} Guests`,
      amount: estimate.catering
    });
  }

  if (addons.photography) {
    lineItems.push({
      label: 'Photography & Cinema Showcase',
      qty: `${days} ${days === 1 ? 'Day' : 'Days'}`,
      amount: estimate.photography
    });
  }

  if (addons.priest && eventType !== 'Corporate') {
    lineItems.push({
      label: 'Vedic Purohit & Ritual Samagri',
      qty: `${days} ${days === 1 ? 'Day' : 'Days'}`,
      amount: estimate.priest
    });
  }

  // Helper row component for client details box
  const DetailRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0', borderBottom: '1px dotted #D4AF37' }}>
      <span style={{ fontSize: '11px', color: '#666666', fontWeight: '500' }}>{label}</span>
      <span style={{ fontSize: '12px', color: '#1A1A1A', fontWeight: '600', textAlign: 'right' }}>{value || 'Not Entered'}</span>
    </div>
  );

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      {/* Stylesheet specifically for centering preview and handling A4 print rules */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-invoice-wrapper, #print-invoice-wrapper * {
            visibility: visible !important;
          }
          #print-invoice-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 794px !important;
            height: 1123px !important;
            padding: 60px 64px !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>

      <div className="container" style={{ padding: '40px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>

        {/* Left Column: Event Controls & Customer Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Controls Panel */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={22} color="var(--primary-maroon)" />
              Configure Your Event
            </h3>

            {/* Event type */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Event Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
                {Object.keys(pricingData).map(type => (
                  <button
                    key={type}
                    onClick={() => setEventType(type)}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: eventType === type ? 'var(--primary-maroon)' : 'var(--accent-gold-light)',
                      backgroundColor: eventType === type ? 'var(--primary-maroon)' : 'white',
                      color: eventType === type ? 'white' : 'var(--text-dark)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '550',
                      transition: 'all 0.2s'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Package tier */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Package Tier</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {['Basic', 'Premium', 'Luxury'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTier(t)}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: tier === t ? 'var(--accent-gold)' : 'var(--bg-cream-dark)',
                      backgroundColor: tier === t ? 'var(--accent-gold-light)' : 'white',
                      color: 'var(--text-dark)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                <span>Expected Guests</span>
                <span style={{ color: 'var(--primary-maroon)', fontWeight: '700' }}>{guests} Guests</span>
              </div>
              <input
                type="range"
                min="20"
                max="1500"
                step="10"
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--primary-maroon)',
                  cursor: 'pointer'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                <span>Duration (Days)</span>
                <span style={{ color: 'var(--primary-maroon)', fontWeight: '700' }}>{days} {days === 1 ? 'Day' : 'Days'}</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--primary-maroon)',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Add-ons checkboxes */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '10px' }}>Optional Add-ons</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => handleAddonClick('decor')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--bg-cream-dark)',
                    backgroundColor: addons.decor ? '#FFFDF9' : 'white',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>Thematic Decor</span>
                  {addons.decor ? <Check size={16} color="var(--primary-maroon)" /> : <span style={{ width: '16px' }}></span>}
                </button>

                <button
                  onClick={() => handleAddonClick('catering')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--bg-cream-dark)',
                    backgroundColor: addons.catering ? '#FFFDF9' : 'white',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>Traditional Catering</span>
                  {addons.catering ? <Check size={16} color="var(--primary-maroon)" /> : <span style={{ width: '16px' }}></span>}
                </button>

                <button
                  onClick={() => handleAddonClick('photography')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--bg-cream-dark)',
                    backgroundColor: addons.photography ? '#FFFDF9' : 'white',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>Photography & Cinema Showcase</span>
                  {addons.photography ? <Check size={16} color="var(--primary-maroon)" /> : <span style={{ width: '16px' }}></span>}
                </button>

                {eventType !== 'Corporate' && (
                  <button
                    onClick={() => handleAddonClick('priest')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--bg-cream-dark)',
                      backgroundColor: addons.priest ? '#FFFDF9' : 'white',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>Vedic Purohit & Ritual Samagri</span>
                    {addons.priest ? <Check size={16} color="var(--primary-maroon)" /> : <span style={{ width: '16px' }}></span>}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Lead submission form & print triggers */}
          <div className="glass-card" style={{ padding: '24px' }}>
            {!contactForm.submitted ? (
              <form onSubmit={handleLeadSubmit}>
                <h5 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--primary-maroon-dark)', fontWeight: '600' }}>Lock in this Estimate?</h5>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>Submit this quote to our desk, and our coordinators will contact you to lock slots.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px', outline: 'none' }}
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Contact Number (WhatsApp)"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px', outline: 'none' }}
                  />
                  <button
                    type="submit"
                    disabled={contactForm.loading}
                    className="btn-primary"
                    style={{
                      padding: '12px',
                      borderRadius: '25px',
                      fontSize: '13px',
                      fontWeight: '600',
                      justifyContent: 'center',
                      cursor: contactForm.loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <PhoneCall size={14} />
                    {contactForm.loading ? 'Submitting...' : 'Submit Quote as Inquiry'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <CheckCircle size={28} color="var(--primary-maroon)" style={{ marginBottom: '6px', display: 'inline' }} />
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary-maroon-dark)' }}>Quote Registered Successfully!</div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Our coordinators will verify Muhurtham dates and contact you shortly.</p>
              </div>
            )}

            <button
              onClick={handlePrint}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '12px',
                borderRadius: '25px',
                border: '2px solid var(--primary-maroon)',
                backgroundColor: 'transparent',
                color: 'var(--primary-maroon)',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Download size={16} />
              Print Quote / Export PDF
            </button>
          </div>
        </div>

        {/* Right Column: High Fidelity A4 Print Preview Sheet */}
        <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', padding: '10px' }}>
          <div
            id="print-invoice-wrapper"
            style={{
              width: '794px',
              height: '1123px',
              backgroundColor: 'white',
              fontFamily: 'Georgia, serif',
              padding: '60px 64px',
              margin: '0 auto',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
              border: '1px solid #f0e8d0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
              borderRadius: '8px',
              color: '#1A1A1A'
            }}
          >
            <div>
              {/* Header section */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #7A001E', paddingBottom: '16px', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 'bold', color: '#7A001E', fontFamily: 'Georgia, serif' }}>Cost Estimation Invoice</h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#666666', letterSpacing: '2px', textTransform: 'uppercase' }}>GS ASSOCIATES – DETAILED QUOTE BREAKDOWN</p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '12px', color: '#666666' }}>
                  <div><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}</div>
                  <div style={{ marginTop: '2px' }}><strong>Invoice Ref:</strong> #{refNumber}</div>
                </div>
              </div>

              {/* Client Details Grid Box */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px 32px',
                border: '1px solid #D4AF37',
                borderRadius: '8px',
                backgroundColor: '#FFFDF9',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <DetailRow label="Client Name" value={contactForm.name} />
                <DetailRow label="Package Tier" value={tier} />
                <DetailRow label="WhatsApp Contact" value={contactForm.phone} />
                <DetailRow label="Guest Count" value={`${guests} Guests`} />
                <DetailRow label="Event Type" value={eventType} />
                <DetailRow label="Event Duration" value={`${days} ${days === 1 ? 'Day' : 'Days'}`} />
              </div>

              {/* Line Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', marginBottom: '30px' }}>
                <colgroup>
                  <col style={{ width: '60%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '20%' }} />
                </colgroup>
                <thead>
                  <tr style={{ backgroundColor: '#7A001E', color: 'white', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Service / Item</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Qty / Unit</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, idx) => (
                    <tr key={idx} style={{
                      backgroundColor: idx % 2 === 0 ? 'white' : '#FFFDF9',
                      borderBottom: '1px solid #f0e8d0'
                    }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#1A1A1A', wordBreak: 'break-word', textAlign: 'left' }}>
                        {item.label}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#666666', textAlign: 'left' }}>
                        {item.qty}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#1A1A1A', fontWeight: '600', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        ₹{item.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Section */}
              <div style={{ borderTop: '2px solid #7A001E', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#1A1A1A' }}>Estimated Total Cost:</span>
                <strong style={{ fontSize: '28px', color: '#7A001E', fontFamily: 'Georgia, serif' }}>
                  ₹{estimate.total.toLocaleString('en-IN')}
                </strong>
              </div>
              <p style={{ fontSize: '11px', color: '#666666', fontStyle: 'italic', textAlign: 'center', margin: 0 }}>
                *Estimate is tax-exclusive and subject to seasonal vendor availability.
              </p>
            </div>

            {/* Footer Section */}
            <div style={{ borderTop: '1px solid #f0e8d0', paddingTop: '16px', textAlign: 'center', fontSize: '12px', color: '#666666' }}>
              <p style={{ margin: 0, fontWeight: '600', color: '#7A001E' }}>Thank you for choosing GS Associates 🌸</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#888888' }}>
                Our team will contact you within 24 hours | Namaskaram 🙏
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
);
}
