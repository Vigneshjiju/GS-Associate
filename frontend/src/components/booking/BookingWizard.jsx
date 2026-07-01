import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ChevronRight, ChevronLeft, Check, Calendar, Users, Award, ShieldAlert, BadgeInfo, CreditCard, ShieldCheck, Loader2 } from 'lucide-react';

export default function BookingWizard() {
  const [step, setStep] = useState(1);
  
  // Catalog states
  const [eventTypes, setEventTypes] = useState([]);
  const [packages, setPackages] = useState([]);
  const [addonsCatalog, setAddonsCatalog] = useState([]);
  const [panchangDates, setPanchangDates] = useState([]);

  // Selections state
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [guestCount, setGuestCount] = useState(150);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [contactInfo, setContactInfo] = useState({ name: '', phone: '', email: '' });
  
  // Response states
  const [bookingResult, setBookingResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Payment states
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);

  const TOKEN_AMOUNT = 10000; // ₹10,000 advance token

  useEffect(() => {
    fetchCatalogs();
  }, []);

  useEffect(() => {
    if (selectedEventType) {
      fetchPackages(selectedEventType.id);
      fetchPanchangDates(selectedEventType.name);
    }
  }, [selectedEventType]);

  const fetchCatalogs = async () => {
    try {
      const etRes = await axios.get('/api/catalog/event-types');
      setEventTypes(etRes.data);
      const adRes = await axios.get('/api/catalog/addons');
      setAddonsCatalog(adRes.data);
    } catch (err) {
      console.error('Error fetching catalog data:', err.message);
    }
  };

  const fetchPackages = async (eventTypeId) => {
    try {
      const pkRes = await axios.get(`/api/catalog/packages?event_type_id=${eventTypeId}`);
      setPackages(pkRes.data);
    } catch (err) {
      console.error('Error fetching packages:', err.message);
    }
  };

  const fetchPanchangDates = async (eventTypeName) => {
    try {
      const pcRes = await axios.get('/api/panchang/dates');
      // Filter dates applicable to this event type
      const relevant = pcRes.data.filter(d => 
        d.event_type.toLowerCase() === eventTypeName.toLowerCase() || 
        eventTypeName.toLowerCase().includes(d.event_type.toLowerCase())
      );
      setPanchangDates(relevant);
    } catch (err) {
      console.warn('Error fetching panchang dates:', err.message);
    }
  };

  const calculateTotalPrice = () => {
    if (!selectedPackage) return 0;
    
    // Parse package price (e.g. ₹5,00,000 -> 500000)
    let basePrice = 500000;
    if (selectedPackage.price_range.includes('₹')) {
      const firstPart = selectedPackage.price_range.split('-')[0];
      const cleanStr = firstPart.replace(/[^\d]/g, '');
      const parsed = parseInt(cleanStr);
      if (!isNaN(parsed)) basePrice = parsed;
    }

    // Addons calculation
    let addonsTotal = 0;
    selectedAddons.forEach(id => {
      const item = addonsCatalog.find(a => a.id === id);
      if (item) {
        if (item.category === 'catering') {
          // Plate cost * guests
          addonsTotal += item.base_price * guestCount;
        } else {
          addonsTotal += item.base_price;
        }
      }
    });

    return basePrice + addonsTotal;
  };

  const handleNext = () => {
    if (step === 1 && !selectedEventType) return;
    if (step === 2 && !selectedDate) return;
    if (step === 4 && !selectedPackage) return;
    if (step === 6 && (!contactInfo.name || !contactInfo.phone || !contactInfo.email)) return;
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleAddonToggle = (addonId) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  const submitBooking = async () => {
    setLoading(true);
    try {
      const price = calculateTotalPrice();
      const res = await axios.post('/api/bookings', {
        name: contactInfo.name,
        phone: contactInfo.phone,
        email: contactInfo.email,
        event_type_id: selectedEventType.id,
        package_id: selectedPackage.id,
        event_date: selectedDate,
        guest_count: guestCount,
        addons: JSON.stringify(selectedAddons),
        total_price: price
      });
      
      // Auto register a lead too
      await axios.post('/api/inquiries', {
        name: contactInfo.name,
        phone: contactInfo.phone,
        email: contactInfo.email,
        event_type: selectedEventType.name,
        tentative_date: selectedDate,
        guest_count: guestCount,
        message: `Booking Wizard Completed for ${selectedPackage.name}. Total quote: ₹${price.toLocaleString('en-IN')}`
      });

      setBookingResult(res.data);
      setStep(7); // Move to payment step
    } catch (err) {
      console.error('Failed to save booking:', err.message);
      alert('Unable to process booking. Please check database configuration or contact support.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Razorpay Payment Logic ──────────────────────────────────────────

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = useCallback(async (amount) => {
    setPaymentLoading(true);
    setPaymentError('');

    try {
      // 1. Load Razorpay checkout script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      // 2. Create order on backend
      const bookingId = bookingResult?.id || bookingResult?.lastInsertRowid;
      const { data: orderData } = await axios.post('/api/payments/create-order', {
        bookingId,
        amount
      });

      // 3. Open Razorpay checkout modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'GS Associates',
        description: selectedEventType?.name || 'Event Booking',
        order_id: orderData.orderId,
        prefill: {
          name: contactInfo.name,
          email: contactInfo.email,
          contact: contactInfo.phone
        },
        theme: {
          color: '#7A001E'
        },
        handler: async function (response) {
          // 4. Verify payment on backend
          try {
            const { data: verifyData } = await axios.post('/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId
            });

            setPaymentDetails({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              amount
            });
            setPaymentSuccess(true);
            setStep(8); // Move to confirmation
          } catch (verifyErr) {
            console.error('Payment verification failed:', verifyErr);
            setPaymentError('Payment verification failed. Please contact support with your payment ID: ' + response.razorpay_payment_id);
          } finally {
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setPaymentError(`Payment failed: ${response.error.description}`);
        setPaymentLoading(false);
      });
      rzp.open();

    } catch (err) {
      console.error('Payment initiation error:', err);
      setPaymentError(err?.response?.data?.error || err.message || 'Something went wrong initiating payment.');
      setPaymentLoading(false);
    }
  }, [bookingResult, contactInfo, selectedEventType]);

  const skipPayment = () => {
    setStep(8);
  };

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div className="glass-card" style={{ padding: '24px', fontFamily: 'var(--font-body)', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Wizard Progress Bar */}
      {step < 8 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '1px solid var(--accent-gold-light)', paddingBottom: '12px' }}>
          {[1, 2, 3, 4, 5, 6, 7].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: step >= s ? 'var(--primary-maroon)' : '#e0e0e0',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '600'
                }}
              >
                {step > s ? <Check size={12} /> : s}
              </div>
              <span style={{ fontSize: '11px', fontWeight: step === s ? '600' : '400', display: 'none', md: 'inline' }}>
                {s === 1 && 'Type'}
                {s === 2 && 'Date'}
                {s === 3 && 'Guests'}
                {s === 4 && 'Package'}
                {s === 5 && 'Add-ons'}
                {s === 6 && 'Contact'}
                {s === 7 && 'Payment'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Step 1: Select Event Type */}
      {step === 1 && (
        <div>
          <h3 style={{ marginBottom: '16px' }}>Select Event Category</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {eventTypes.map(et => (
              <div
                key={et.id}
                onClick={() => setSelectedEventType(et)}
                style={{
                  border: selectedEventType?.id === et.id ? '2px solid var(--primary-maroon)' : '1px solid var(--bg-cream-dark)',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  backgroundColor: selectedEventType?.id === et.id ? '#FFFDF9' : 'white',
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                  {et.slug === 'weddings' && '💍'}
                  {et.slug === 'corporate' && '💼'}
                  {et.slug === 'social' && '🎉'}
                  {et.slug === 'ceremonies' && '📿'}
                </div>
                <h4 style={{ margin: 0, fontSize: '16px' }}>{et.name}</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>{et.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Date & Auspicious Muhurtham */}
      {step === 2 && (
        <div>
          <h3 style={{ marginBottom: '10px' }}>Select Event Date</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Choose your custom date, or click one of our upcoming pre-calculated **auspicious Muhurthams** to auto-fill.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {/* Custom Input */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Custom Date Selection</label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--accent-gold)',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Auspicious list */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Auspicious Muhurthams (Panchang)</label>
              {panchangDates.length === 0 ? (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '10px', backgroundColor: 'var(--bg-cream-dark)', borderRadius: '8px' }}>
                  No precalculated dates listed for this category. Select a custom date above.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {panchangDates.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedDate(p.date)}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: selectedDate === p.date ? '1px solid var(--primary-maroon)' : '1px solid var(--bg-cream-dark)',
                        backgroundColor: selectedDate === p.date ? 'var(--accent-gold-light)' : 'white',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong>{new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '6px' }}>({p.tithi} • {p.nakshatram})</span>
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--primary-maroon-dark)', fontWeight: '600' }}>{p.auspicious_time}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Guest Count */}
      {step === 3 && (
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '16px' }}>Estimate Guest Count</h3>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary-maroon)', marginBottom: '10px' }}>
            {guestCount} Guests
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '30px' }}>
            This helps us estimate catering, table seating setups, and venue parameters.
          </p>
          <input
            type="range"
            min="20"
            max="1500"
            step="10"
            value={guestCount}
            onChange={(e) => setGuestCount(parseInt(e.target.value))}
            style={{ width: '80%', maxW: '400px', accentColor: 'var(--primary-maroon)', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '80%', margin: '10px auto 0', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>Min: 20</span>
            <span>Intimate: 100-300</span>
            <span>Grand: 500-1000</span>
            <span>Max: 1500+</span>
          </div>
        </div>
      )}

      {/* Step 4: Package Tiers */}
      {step === 4 && (
        <div>
          <h3 style={{ marginBottom: '16px' }}>Choose Package Tier</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {packages.map(p => (
              <div
                key={p.id}
                onClick={() => setSelectedPackage(p)}
                style={{
                  border: selectedPackage?.id === p.id ? '2px solid var(--accent-gold)' : '1px solid var(--bg-cream-dark)',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  backgroundColor: selectedPackage?.id === p.id ? '#FFFDF9' : 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s'
                }}
              >
                <div>
                  <h4 style={{ color: 'var(--primary-maroon-dark)', margin: 0, fontSize: '18px' }}>{p.name}</h4>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary-maroon)', margin: '8px 0' }}>{p.price_range}</div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>{p.description}</p>
                </div>
                <div style={{ borderTop: '1px solid #eee', paddingTop: '10px', fontSize: '11px' }}>
                  <strong>Includes:</strong>
                  <ul style={{ paddingLeft: '14px', marginTop: '4px', listStyleType: 'disc' }}>
                    {p.features.split(',').map((f, idx) => <li key={idx}>{f.trim()}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Add-ons Selector */}
      {step === 5 && (
        <div>
          <h3 style={{ marginBottom: '10px' }}>Select Individual Add-ons</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Customize your event package with verified vendor integrations.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {addonsCatalog.map(a => {
              // Hide priest services for corporate
              if (selectedEventType?.slug === 'corporate' && a.category === 'priest') return null;
              
              const isSelected = selectedAddons.includes(a.id);
              return (
                <div
                  key={a.id}
                  onClick={() => handleAddonToggle(a.id)}
                  style={{
                    border: isSelected ? '1px solid var(--primary-maroon)' : '1px solid var(--bg-cream-dark)',
                    borderRadius: '10px',
                    padding: '14px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#FFFDF9' : 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.15s'
                  }}
                >
                  <div>
                    <h5 style={{ margin: 0, fontSize: '14px' }}>{a.name}</h5>
                    <p style={{ margin: '2px 0 0', fontSize: '10px', color: 'var(--text-muted)' }}>{a.description}</p>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-maroon)', display: 'block', marginTop: '4px' }}>
                      {a.category === 'catering' ? `₹${a.base_price} / Guest` : `₹${a.base_price.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      border: '1px solid var(--accent-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? 'var(--primary-maroon)' : 'white'
                    }}
                  >
                    {isSelected && <Check size={12} color="white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 6: Contact details */}
      {step === 6 && (
        <div>
          <h3 style={{ marginBottom: '16px' }}>Client Verification</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px', margin: '0 auto' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Full Name</label>
              <input
                type="text"
                required
                value={contactInfo.name}
                onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Mobile Phone Number</label>
              <input
                type="tel"
                required
                value={contactInfo.phone}
                onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="10-digit number"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Email Address</label>
              <input
                type="email"
                required
                value={contactInfo.email}
                onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="name@domain.com"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 7: Payment — Razorpay Checkout */}
      {step === 7 && bookingResult && (
        <div style={{ textAlign: 'center', padding: '20px 10px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7A001E 0%, #D4AF37 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 16px rgba(122, 0, 30, 0.25)'
          }}>
            <CreditCard size={26} color="white" />
          </div>

          <h2 style={{ marginBottom: '4px', color: 'var(--primary-maroon-dark)' }}>Secure Payment</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
            Complete your booking by paying the token advance or the full amount.
          </p>

          {/* Booking Summary Card */}
          <div style={{
            margin: '0 auto 24px',
            padding: '20px',
            backgroundColor: '#FFFDF9',
            border: '1px solid var(--accent-gold)',
            borderRadius: '12px',
            maxWidth: '440px',
            fontSize: '13px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Booking ID:</span>
              <strong>GSB-2026-{bookingResult.id || bookingResult.lastInsertRowid}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Event:</span>
              <strong>{selectedEventType?.name}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Package:</span>
              <strong>{selectedPackage?.name}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Date:</span>
              <strong>{new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
            </div>
            <div style={{
              borderTop: '1px solid var(--accent-gold)',
              paddingTop: '10px',
              marginTop: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '16px'
            }}>
              <strong>Total Amount:</strong>
              <strong style={{ color: 'var(--primary-maroon)' }}>₹{calculateTotalPrice().toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Payment Error */}
          {paymentError && (
            <div style={{
              maxWidth: '440px',
              margin: '0 auto 16px',
              padding: '12px 16px',
              backgroundColor: '#fff0f0',
              border: '1px solid #ffcdd2',
              borderRadius: '8px',
              color: '#c62828',
              fontSize: '12px',
              textAlign: 'left'
            }}>
              ⚠️ {paymentError}
            </div>
          )}

          {/* Payment Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '440px', margin: '0 auto' }}>
            
            {/* Token Amount Button */}
            <button
              onClick={() => initiatePayment(TOKEN_AMOUNT)}
              disabled={paymentLoading}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '10px',
                border: '2px solid var(--primary-maroon)',
                backgroundColor: 'var(--primary-maroon)',
                color: 'white',
                fontSize: '15px',
                fontWeight: '700',
                cursor: paymentLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.2s',
                opacity: paymentLoading ? 0.7 : 1,
                boxShadow: '0 4px 16px rgba(122, 0, 30, 0.3)'
              }}
            >
              {paymentLoading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Processing...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Pay Token Amount — ₹{TOKEN_AMOUNT.toLocaleString('en-IN')}
                </>
              )}
            </button>

            {/* Full Amount Button */}
            <button
              onClick={() => initiatePayment(calculateTotalPrice())}
              disabled={paymentLoading}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '10px',
                border: '2px solid var(--accent-gold)',
                backgroundColor: 'transparent',
                color: 'var(--primary-maroon-dark)',
                fontSize: '15px',
                fontWeight: '700',
                cursor: paymentLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.2s',
                opacity: paymentLoading ? 0.5 : 1,
                background: 'linear-gradient(135deg, #FFFDF9 0%, #FFF8E7 100%)'
              }}
            >
              <CreditCard size={18} />
              Pay Full Amount — ₹{calculateTotalPrice().toLocaleString('en-IN')}
            </button>

            {/* Skip / Pay Later */}
            <button
              onClick={skipPayment}
              disabled={paymentLoading}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--text-muted)',
                fontSize: '12px',
                cursor: 'pointer',
                textDecoration: 'underline',
                opacity: paymentLoading ? 0.4 : 1
              }}
            >
              Skip payment for now — Pay later at the office
            </button>
          </div>

          {/* Secure Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '20px',
            fontSize: '11px',
            color: 'var(--text-muted)'
          }}>
            <ShieldCheck size={14} color="#27ae60" />
            <span>Secured by Razorpay • 256-bit SSL Encryption</span>
          </div>
        </div>
      )}

      {/* Step 8: Confirmation / Thank you */}
      {step === 8 && (
        <div style={{ textAlign: 'center', padding: '30px 10px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: paymentSuccess ? '#e8f5e9' : 'var(--accent-gold-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Check size={32} color={paymentSuccess ? '#2e7d32' : 'var(--primary-maroon-dark)'} />
          </div>

          <h2>{paymentSuccess ? 'Booking Confirmed & Paid!' : 'Booking Request Submitted!'}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>
            Thank you, <strong>{contactInfo.name}</strong>.
            {paymentSuccess
              ? ' Your payment has been received and booking is confirmed.'
              : ' Your reservation block has been placed in pending status.'}
          </p>
          
          <div style={{
            margin: '24px auto',
            padding: '20px',
            backgroundColor: 'white',
            border: '1px dashed var(--accent-gold)',
            borderRadius: '12px',
            maxWidth: '400px',
            fontSize: '13px',
            textAlign: 'left'
          }}>
            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Reference Booking ID:</span>
              <strong>GSB-2026-{bookingResult?.id || bookingResult?.lastInsertRowid}</strong>
            </div>
            <div><strong>Event:</strong> {selectedEventType?.name}</div>
            <div><strong>Package:</strong> {selectedPackage?.name}</div>
            <div><strong>Locked Date:</strong> {new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div><strong>Guest Count:</strong> {guestCount}</div>

            {/* Payment info */}
            {paymentSuccess && paymentDetails && (
              <div style={{
                borderTop: '1px solid #eee',
                paddingTop: '10px',
                marginTop: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#27ae60', fontWeight: '600' }}>✓ Payment Received</span>
                  <strong style={{ color: '#27ae60' }}>₹{paymentDetails.amount.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Payment ID: {paymentDetails.paymentId}
                </div>
              </div>
            )}

            <div style={{ borderTop: '1px solid #eee', paddingTop: '8px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
              <strong>Total Invoice Estimate:</strong>
              <strong style={{ color: 'var(--primary-maroon)' }}>₹{calculateTotalPrice().toLocaleString('en-IN')}</strong>
            </div>

            {paymentSuccess && paymentDetails && paymentDetails.amount < calculateTotalPrice() && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '13px',
                marginTop: '4px',
                color: '#e65100'
              }}>
                <span>Balance Due:</span>
                <strong>₹{(calculateTotalPrice() - paymentDetails.amount).toLocaleString('en-IN')}</strong>
              </div>
            )}
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {paymentSuccess
              ? 'A payment receipt and booking confirmation has been sent to your email. Our team will contact you for further details.'
              : 'An confirmation SMS alert and PDF estimate sheet has been queued. Our customer desk will call you to finalize priest consultation timings.'}
          </p>
        </div>
      )}

      {/* Controls buttons */}
      {step < 7 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
          {step > 1 ? (
            <button onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'var(--primary-maroon)', fontWeight: '600', cursor: 'pointer' }}>
              <ChevronLeft size={16} /> Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 6 ? (
            <button
              onClick={handleNext}
              className="btn-primary"
              style={{
                fontSize: '14px',
                padding: '8px 24px',
                opacity: (
                  (step === 1 && !selectedEventType) ||
                  (step === 2 && !selectedDate) ||
                  (step === 4 && !selectedPackage)
                ) ? 0.5 : 1,
                cursor: 'pointer'
              }}
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={submitBooking}
              disabled={loading}
              className="btn-gold animate-bounce"
              style={{
                fontSize: '14px',
                padding: '8px 24px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Processing...' : 'Lock Calendar & Book Now'}
            </button>
          )}
        </div>
      )}

      {/* Spinner animation for payment loading */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
}
