import React, { useState, useRef } from 'react';
import axios from 'axios';
import {
  Send, CheckCircle, ChevronDown, ChevronUp, Calendar, Users,
  MapPin, Sparkles, User, Phone, Mail, Clock, AlertCircle,
  Home, PartyPopper, Building2, Utensils, Camera, Music,
  Bus, Hotel, Palette, BookOpen
} from 'lucide-react';

const SECTIONS = [
  { id: 1, title: 'Event Details', icon: Calendar, desc: 'Tell us what you\'re planning' },
  { id: 2, title: 'Venue & Logistics', icon: MapPin, desc: 'Where and how' },
  { id: 3, title: 'Special Requests', icon: Sparkles, desc: 'Make it uniquely yours' },
  { id: 4, title: 'Contact Information', icon: User, desc: 'How we can reach you' }
];

const EVENT_CATEGORIES = ['Weddings', 'Traditional Ceremonies', 'Final Rites', 'Corporate Events', 'Social Gatherings'];
const DURATIONS = ['Half Day', 'Full Day', '2 Days', '3+ Days'];
const VENUE_TYPES = ['Convention Hall', 'Kalyana Mantapa', 'Outdoor', 'Hotel Banquet', 'Temple', 'Other'];
const BUDGET_RANGES = ['Under ₹2,00,000', '₹2,00,000 – ₹5,00,000', '₹5,00,000 – ₹10,00,000', '₹10,00,000 – ₹25,00,000', '₹25,00,000+', 'Flexible / Discuss Later'];
const CATERING_OPTIONS = ['Pure Vegetarian (Sattvic)', 'Vegetarian', 'Multi-cuisine', 'No preference'];
const CONTACT_TIMES = ['Morning (9 AM – 12 PM)', 'Afternoon (12 PM – 3 PM)', 'Evening (3 PM – 6 PM)', 'Anytime'];

const SERVICES = [
  { key: 'decor', label: 'Decor & Mandap', icon: Palette },
  { key: 'photo', label: 'Photography / Videography', icon: Camera },
  { key: 'catering', label: 'Catering', icon: Utensils },
  { key: 'priest', label: 'Purohit / Priest Services', icon: BookOpen },
  { key: 'music', label: 'Music & Entertainment', icon: Music },
  { key: 'transport', label: 'Transportation', icon: Bus },
  { key: 'accommodation', label: 'Guest Accommodation', icon: Hotel }
];

// ── Reusable styled input components ──────────────────────────────────

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '8px',
  border: '1px solid rgba(212,175,55,0.35)',
  outline: 'none',
  fontSize: '14px',
  fontFamily: 'var(--font-body)',
  backgroundColor: 'white',
  color: 'var(--text-dark)',
  transition: 'border-color 0.2s, box-shadow 0.2s'
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '600',
  marginBottom: '5px',
  color: 'var(--text-dark)',
  letterSpacing: '0.3px'
};

const requiredStar = { color: 'var(--primary-maroon)', marginLeft: '2px' };

function FieldGroup({ label, required, children, error }) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
        {required && <span style={requiredStar}>*</span>}
      </label>
      {children}
      {error && (
        <div style={{ fontSize: '11px', color: 'var(--primary-maroon)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={12} /> {error}
        </div>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────

export default function EventSubmissionPage() {
  const [activeSection, setActiveSection] = useState(1);
  const [completedSections, setCompletedSections] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const sectionRefs = useRef({});

  const [form, setForm] = useState({
    // Section 1
    eventName: '',
    eventCategory: 'Weddings',
    preferredDate: '',
    alternateDate: '',
    duration: '',
    guestCount: '',
    // Section 2
    venue: '',
    venueType: '',
    budget: '',
    catering: '',
    // Section 3
    theme: '',
    specialRequests: '',
    services: [],
    // Section 4
    name: '',
    phone: '',
    email: '',
    contactTime: ''
  });

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const toggleService = (key) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(key)
        ? prev.services.filter(s => s !== key)
        : [...prev.services, key]
    }));
  };

  // ── Validation ───────────────────────────────────────────────────────

  const validateSection = (sectionId) => {
    const errs = {};
    if (sectionId === 1) {
      if (!form.eventName.trim()) errs.eventName = 'Please enter an event name';
      if (!form.preferredDate) errs.preferredDate = 'Please select a preferred date';
      if (!form.guestCount || parseInt(form.guestCount) < 10) errs.guestCount = 'Minimum 10 guests required';
      if (parseInt(form.guestCount) > 2000) errs.guestCount = 'Maximum 2000 guests allowed';
    }
    if (sectionId === 4) {
      if (!form.name.trim()) errs.name = 'Your name is required';
      if (!form.phone.trim()) errs.phone = 'Phone number is required';
      if (form.phone.trim() && !/^\d{10}$/.test(form.phone.replace(/[\s-]/g, ''))) errs.phone = 'Enter a valid 10-digit number';
      if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address';
    }
    setErrors(prev => ({ ...prev, ...errs }));
    return Object.keys(errs).length === 0;
  };

  // ── Section Navigation ─────────────────────────────────────────────

  const handleSectionToggle = (id) => {
    // Before leaving current section, validate if going forward
    if (id > activeSection && (activeSection === 1 || activeSection === 4)) {
      if (!validateSection(activeSection)) return;
    }
    if (activeSection !== id) {
      setCompletedSections(prev => new Set([...prev, activeSection]));
    }
    setActiveSection(activeSection === id ? null : id);
    setTimeout(() => {
      sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleNext = () => {
    if (!validateSection(activeSection)) return;
    setCompletedSections(prev => new Set([...prev, activeSection]));
    const next = activeSection + 1;
    if (next <= 4) {
      setActiveSection(next);
      setTimeout(() => {
        sectionRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // ── Build message string ───────────────────────────────────────────

  const buildMessage = () => {
    const parts = [];
    parts.push(`📋 EVENT SUBMISSION FORM`);
    parts.push(`━━━━━━━━━━━━━━━━━━━━━━━━`);
    parts.push(`Event Name: ${form.eventName}`);
    if (form.duration) parts.push(`Duration: ${form.duration}`);
    if (form.alternateDate) parts.push(`Alternate Date: ${form.alternateDate}`);
    parts.push('');
    if (form.venue || form.venueType || form.budget || form.catering) {
      parts.push(`🏛️ VENUE & LOGISTICS`);
      if (form.venue) parts.push(`Preferred Venue: ${form.venue}`);
      if (form.venueType) parts.push(`Venue Type: ${form.venueType}`);
      if (form.budget) parts.push(`Budget Range: ${form.budget}`);
      if (form.catering) parts.push(`Catering: ${form.catering}`);
      parts.push('');
    }
    if (form.theme || form.specialRequests || form.services.length > 0) {
      parts.push(`✨ SPECIAL REQUESTS`);
      if (form.theme) parts.push(`Theme/Style: ${form.theme}`);
      if (form.services.length > 0) {
        const serviceLabels = form.services.map(k => SERVICES.find(s => s.key === k)?.label).filter(Boolean);
        parts.push(`Services Needed: ${serviceLabels.join(', ')}`);
      }
      if (form.specialRequests) parts.push(`Notes: ${form.specialRequests}`);
      parts.push('');
    }
    if (form.contactTime) parts.push(`Preferred Contact Time: ${form.contactTime}`);
    return parts.join('\n');
  };

  // ── Submit ─────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    // Validate required sections
    if (!validateSection(1) || !validateSection(4)) {
      // Jump to first section with error
      if (!form.eventName.trim() || !form.preferredDate || !form.guestCount) {
        setActiveSection(1);
      } else {
        setActiveSection(4);
      }
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/inquiries', {
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        event_type: form.eventCategory,
        tentative_date: form.preferredDate,
        guest_count: parseInt(form.guestCount),
        message: buildMessage()
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Event submission failed:', err.message);
      alert('Unable to submit your event details. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success Screen ─────────────────────────────────────────────────

  if (submitted) {
    return (
      <div style={{ fontFamily: 'var(--font-body)', padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div className="glass-card animate-fade-in" style={{ padding: '48px 32px', textAlign: 'center' }}>
            {/* Animated checkmark circle */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 24px rgba(46,125,50,0.15)',
              animation: 'slideUp 0.6s ease-out'
            }}>
              <CheckCircle size={40} color="#2e7d32" />
            </div>

            <h2 style={{ fontSize: '28px', marginBottom: '8px', color: 'var(--primary-maroon-dark)' }}>
              Event Details Submitted!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.7', marginBottom: '32px' }}>
              Thank you, <strong>{form.name}</strong>! Our planning team will review your event details
              and contact you within <strong>24 hours</strong> with a customized proposal.
            </p>

            {/* Summary Card */}
            <div style={{
              textAlign: 'left',
              padding: '20px',
              backgroundColor: '#FFFDF9',
              border: '1px dashed var(--accent-gold)',
              borderRadius: '12px',
              fontSize: '13px',
              marginBottom: '32px'
            }}>
              <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--primary-maroon)' }}>Submission Summary</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Event</span>
                  <strong>{form.eventName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Category</span>
                  <strong>{form.eventCategory}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Preferred Date</span>
                  <strong>{new Date(form.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Guests</span>
                  <strong>{form.guestCount}</strong>
                </div>
                {form.budget && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Budget</span>
                    <strong>{form.budget}</strong>
                  </div>
                )}
              </div>
            </div>

            <a
              href="/"
              className="btn-primary"
              style={{ textDecoration: 'none', justifyContent: 'center', padding: '12px 32px' }}
            >
              <Home size={16} /> Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Form Render ────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: 'var(--font-body)', padding: '60px 0' }}>
      <div className="container" style={{ maxWidth: '780px', margin: '0 auto' }}>

        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }} className="animate-fade-in">
          <h2 style={{ fontSize: '36px', marginBottom: '12px' }} className="traditional-border">
            Submit Your Event
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.7', maxWidth: '560px', margin: '0 auto' }}>
            Share your event vision with us. Fill in the details below and our expert planning team
            will craft a personalized proposal tailored to your needs.
          </p>
        </div>

        {/* Step Progress Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '40px',
          flexWrap: 'wrap'
        }}>
          {SECTIONS.map((sec, idx) => {
            const isActive = activeSection === sec.id;
            const isCompleted = completedSections.has(sec.id);
            return (
              <div
                key={sec.id}
                onClick={() => handleSectionToggle(sec.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '24px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  border: isActive
                    ? '2px solid var(--primary-maroon)'
                    : isCompleted
                      ? '2px solid #2e7d32'
                      : '1px solid rgba(212,175,55,0.3)',
                  backgroundColor: isActive
                    ? 'var(--primary-maroon)'
                    : isCompleted
                      ? '#e8f5e9'
                      : 'white',
                  color: isActive
                    ? 'white'
                    : isCompleted
                      ? '#2e7d32'
                      : 'var(--text-muted)',
                  boxShadow: isActive
                    ? '0 4px 16px rgba(122,0,30,0.25)'
                    : 'none'
                }}
              >
                {isCompleted && !isActive ? (
                  <CheckCircle size={14} />
                ) : (
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: '700',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--bg-cream-dark)',
                    color: isActive ? 'white' : 'var(--text-muted)'
                  }}>
                    {sec.id}
                  </span>
                )}
                <span className="desktop-step-label" style={{ display: 'none' }}>{sec.title}</span>
                <sec.icon size={14} className="mobile-step-icon" />
              </div>
            );
          })}
        </div>

        {/* ────── SECTION 1: Event Details ────── */}
        <div ref={el => sectionRefs.current[1] = el} style={{ marginBottom: '16px' }}>
          <div
            onClick={() => handleSectionToggle(1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderRadius: activeSection === 1 ? '14px 14px 0 0' : '14px',
              cursor: 'pointer',
              background: activeSection === 1
                ? 'linear-gradient(135deg, var(--primary-maroon) 0%, var(--primary-maroon-dark) 100%)'
                : 'white',
              color: activeSection === 1 ? 'white' : 'var(--text-dark)',
              border: `1px solid ${activeSection === 1 ? 'var(--primary-maroon)' : 'rgba(212,175,55,0.25)'}`,
              borderBottom: activeSection === 1 ? 'none' : undefined,
              transition: 'all 0.3s ease',
              boxShadow: activeSection === 1 ? '0 4px 20px rgba(122,0,30,0.15)' : '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Calendar size={20} />
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px', fontFamily: 'var(--font-title)' }}>① Event Details</div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>Tell us what you're planning</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {completedSections.has(1) && activeSection !== 1 && (
                <CheckCircle size={16} color="#2e7d32" />
              )}
              {activeSection === 1 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>

          {activeSection === 1 && (
            <div className="animate-slide-up" style={{
              padding: '24px 20px',
              backgroundColor: 'white',
              border: '1px solid rgba(212,175,55,0.25)',
              borderTop: 'none',
              borderRadius: '0 0 14px 14px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <FieldGroup label="Event Name / Title" required error={errors.eventName}>
                  <input
                    type="text"
                    placeholder="e.g. Karthik & Priya Wedding Reception"
                    value={form.eventName}
                    onChange={e => set('eventName', e.target.value)}
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'var(--primary-maroon)'; e.target.style.boxShadow = '0 0 0 3px rgba(122,0,30,0.08)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(212,175,55,0.35)'; e.target.style.boxShadow = 'none'; }}
                  />
                </FieldGroup>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <FieldGroup label="Event Category" required>
                    <select
                      value={form.eventCategory}
                      onChange={e => set('eventCategory', e.target.value)}
                      style={{ ...inputStyle, height: '42px', cursor: 'pointer' }}
                    >
                      {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </FieldGroup>

                  <FieldGroup label="Event Duration">
                    <select
                      value={form.duration}
                      onChange={e => set('duration', e.target.value)}
                      style={{ ...inputStyle, height: '42px', cursor: 'pointer' }}
                    >
                      <option value="">— Select —</option>
                      {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </FieldGroup>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <FieldGroup label="Preferred Date" required error={errors.preferredDate}>
                    <input
                      type="date"
                      value={form.preferredDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => set('preferredDate', e.target.value)}
                      style={{ ...inputStyle, height: '42px', cursor: 'pointer' }}
                    />
                  </FieldGroup>

                  <FieldGroup label="Alternate Date">
                    <input
                      type="date"
                      value={form.alternateDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => set('alternateDate', e.target.value)}
                      style={{ ...inputStyle, height: '42px', cursor: 'pointer' }}
                    />
                  </FieldGroup>
                </div>

                <FieldGroup label="Estimated Number of Guests" required error={errors.guestCount}>
                  <input
                    type="number"
                    min="10"
                    max="2000"
                    placeholder="e.g. 250"
                    value={form.guestCount}
                    onChange={e => set('guestCount', e.target.value)}
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'var(--primary-maroon)'; e.target.style.boxShadow = '0 0 0 3px rgba(122,0,30,0.08)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(212,175,55,0.35)'; e.target.style.boxShadow = 'none'; }}
                  />
                </FieldGroup>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  onClick={handleNext}
                  className="btn-primary"
                  style={{ padding: '10px 28px', fontSize: '13px', borderRadius: '24px' }}
                >
                  Continue <ChevronDown size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ────── SECTION 2: Venue & Logistics ────── */}
        <div ref={el => sectionRefs.current[2] = el} style={{ marginBottom: '16px' }}>
          <div
            onClick={() => handleSectionToggle(2)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderRadius: activeSection === 2 ? '14px 14px 0 0' : '14px',
              cursor: 'pointer',
              background: activeSection === 2
                ? 'linear-gradient(135deg, var(--primary-maroon) 0%, var(--primary-maroon-dark) 100%)'
                : 'white',
              color: activeSection === 2 ? 'white' : 'var(--text-dark)',
              border: `1px solid ${activeSection === 2 ? 'var(--primary-maroon)' : 'rgba(212,175,55,0.25)'}`,
              borderBottom: activeSection === 2 ? 'none' : undefined,
              transition: 'all 0.3s ease',
              boxShadow: activeSection === 2 ? '0 4px 20px rgba(122,0,30,0.15)' : '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MapPin size={20} />
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px', fontFamily: 'var(--font-title)' }}>② Venue & Logistics</div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>Where and how</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {completedSections.has(2) && activeSection !== 2 && (
                <CheckCircle size={16} color="#2e7d32" />
              )}
              {activeSection === 2 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>

          {activeSection === 2 && (
            <div className="animate-slide-up" style={{
              padding: '24px 20px',
              backgroundColor: 'white',
              border: '1px solid rgba(212,175,55,0.25)',
              borderTop: 'none',
              borderRadius: '0 0 14px 14px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <FieldGroup label="Preferred Venue / Location">
                  <input
                    type="text"
                    placeholder="e.g. Palace Grounds, Bengaluru or 'Need suggestions'"
                    value={form.venue}
                    onChange={e => set('venue', e.target.value)}
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'var(--primary-maroon)'; e.target.style.boxShadow = '0 0 0 3px rgba(122,0,30,0.08)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(212,175,55,0.35)'; e.target.style.boxShadow = 'none'; }}
                  />
                </FieldGroup>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <FieldGroup label="Venue Type">
                    <select
                      value={form.venueType}
                      onChange={e => set('venueType', e.target.value)}
                      style={{ ...inputStyle, height: '42px', cursor: 'pointer' }}
                    >
                      <option value="">— Select —</option>
                      {VENUE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </FieldGroup>

                  <FieldGroup label="Budget Range">
                    <select
                      value={form.budget}
                      onChange={e => set('budget', e.target.value)}
                      style={{ ...inputStyle, height: '42px', cursor: 'pointer' }}
                    >
                      <option value="">— Select —</option>
                      {BUDGET_RANGES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </FieldGroup>
                </div>

                <FieldGroup label="Catering Preference">
                  <select
                    value={form.catering}
                    onChange={e => set('catering', e.target.value)}
                    style={{ ...inputStyle, height: '42px', cursor: 'pointer' }}
                  >
                    <option value="">— Select —</option>
                    {CATERING_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FieldGroup>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  onClick={handleNext}
                  className="btn-primary"
                  style={{ padding: '10px 28px', fontSize: '13px', borderRadius: '24px' }}
                >
                  Continue <ChevronDown size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ────── SECTION 3: Special Requests ────── */}
        <div ref={el => sectionRefs.current[3] = el} style={{ marginBottom: '16px' }}>
          <div
            onClick={() => handleSectionToggle(3)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderRadius: activeSection === 3 ? '14px 14px 0 0' : '14px',
              cursor: 'pointer',
              background: activeSection === 3
                ? 'linear-gradient(135deg, var(--primary-maroon) 0%, var(--primary-maroon-dark) 100%)'
                : 'white',
              color: activeSection === 3 ? 'white' : 'var(--text-dark)',
              border: `1px solid ${activeSection === 3 ? 'var(--primary-maroon)' : 'rgba(212,175,55,0.25)'}`,
              borderBottom: activeSection === 3 ? 'none' : undefined,
              transition: 'all 0.3s ease',
              boxShadow: activeSection === 3 ? '0 4px 20px rgba(122,0,30,0.15)' : '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Sparkles size={20} />
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px', fontFamily: 'var(--font-title)' }}>③ Special Requests</div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>Make it uniquely yours</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {completedSections.has(3) && activeSection !== 3 && (
                <CheckCircle size={16} color="#2e7d32" />
              )}
              {activeSection === 3 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>

          {activeSection === 3 && (
            <div className="animate-slide-up" style={{
              padding: '24px 20px',
              backgroundColor: 'white',
              border: '1px solid rgba(212,175,55,0.25)',
              borderTop: 'none',
              borderRadius: '0 0 14px 14px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <FieldGroup label="Event Theme / Style">
                  <input
                    type="text"
                    placeholder="e.g. Traditional South Indian, Royal, Minimalist, Garden Theme"
                    value={form.theme}
                    onChange={e => set('theme', e.target.value)}
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'var(--primary-maroon)'; e.target.style.boxShadow = '0 0 0 3px rgba(122,0,30,0.08)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(212,175,55,0.35)'; e.target.style.boxShadow = 'none'; }}
                  />
                </FieldGroup>

                {/* Services multi-select checkboxes */}
                <div>
                  <label style={labelStyle}>Services You'd Like Us to Arrange</label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '10px',
                    marginTop: '4px'
                  }}>
                    {SERVICES.map(svc => {
                      const isSelected = form.services.includes(svc.key);
                      return (
                        <div
                          key={svc.key}
                          onClick={() => toggleService(svc.key)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            border: isSelected
                              ? '1.5px solid var(--primary-maroon)'
                              : '1px solid rgba(212,175,55,0.25)',
                            backgroundColor: isSelected ? '#FFFDF9' : 'white',
                            transition: 'all 0.2s ease',
                            fontSize: '13px'
                          }}
                        >
                          <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            border: isSelected
                              ? '2px solid var(--primary-maroon)'
                              : '1.5px solid #ccc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isSelected ? 'var(--primary-maroon)' : 'white',
                            transition: 'all 0.2s',
                            flexShrink: 0
                          }}>
                            {isSelected && <CheckCircle size={10} color="white" />}
                          </div>
                          <svc.icon size={15} color={isSelected ? 'var(--primary-maroon)' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
                          <span style={{
                            fontWeight: isSelected ? '600' : '400',
                            color: isSelected ? 'var(--primary-maroon-dark)' : 'var(--text-dark)'
                          }}>
                            {svc.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <FieldGroup label="Additional Notes or Special Requests">
                  <textarea
                    rows="4"
                    placeholder="Tell us about any specific rituals, accessibility needs, dietary restrictions, preferred vendors, or anything special you'd like us to know..."
                    value={form.specialRequests}
                    onChange={e => set('specialRequests', e.target.value)}
                    style={{ ...inputStyle, fontFamily: 'var(--font-body)', resize: 'vertical' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--primary-maroon)'; e.target.style.boxShadow = '0 0 0 3px rgba(122,0,30,0.08)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(212,175,55,0.35)'; e.target.style.boxShadow = 'none'; }}
                  />
                </FieldGroup>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  onClick={handleNext}
                  className="btn-primary"
                  style={{ padding: '10px 28px', fontSize: '13px', borderRadius: '24px' }}
                >
                  Continue <ChevronDown size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ────── SECTION 4: Contact Information ────── */}
        <div ref={el => sectionRefs.current[4] = el} style={{ marginBottom: '16px' }}>
          <div
            onClick={() => handleSectionToggle(4)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderRadius: activeSection === 4 ? '14px 14px 0 0' : '14px',
              cursor: 'pointer',
              background: activeSection === 4
                ? 'linear-gradient(135deg, var(--primary-maroon) 0%, var(--primary-maroon-dark) 100%)'
                : 'white',
              color: activeSection === 4 ? 'white' : 'var(--text-dark)',
              border: `1px solid ${activeSection === 4 ? 'var(--primary-maroon)' : 'rgba(212,175,55,0.25)'}`,
              borderBottom: activeSection === 4 ? 'none' : undefined,
              transition: 'all 0.3s ease',
              boxShadow: activeSection === 4 ? '0 4px 20px rgba(122,0,30,0.15)' : '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <User size={20} />
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px', fontFamily: 'var(--font-title)' }}>④ Contact Information</div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>How we can reach you</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {completedSections.has(4) && activeSection !== 4 && (
                <CheckCircle size={16} color="#2e7d32" />
              )}
              {activeSection === 4 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>

          {activeSection === 4 && (
            <div className="animate-slide-up" style={{
              padding: '24px 20px',
              backgroundColor: 'white',
              border: '1px solid rgba(212,175,55,0.25)',
              borderTop: 'none',
              borderRadius: '0 0 14px 14px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <FieldGroup label="Full Name" required error={errors.name}>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'var(--primary-maroon)'; e.target.style.boxShadow = '0 0 0 3px rgba(122,0,30,0.08)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(212,175,55,0.35)'; e.target.style.boxShadow = 'none'; }}
                  />
                </FieldGroup>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <FieldGroup label="Mobile Phone Number" required error={errors.phone}>
                    <input
                      type="tel"
                      placeholder="10-digit number"
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = 'var(--primary-maroon)'; e.target.style.boxShadow = '0 0 0 3px rgba(122,0,30,0.08)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(212,175,55,0.35)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </FieldGroup>

                  <FieldGroup label="Email Address" error={errors.email}>
                    <input
                      type="email"
                      placeholder="name@domain.com"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = 'var(--primary-maroon)'; e.target.style.boxShadow = '0 0 0 3px rgba(122,0,30,0.08)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(212,175,55,0.35)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </FieldGroup>
                </div>

                <FieldGroup label="Preferred Contact Time">
                  <select
                    value={form.contactTime}
                    onChange={e => set('contactTime', e.target.value)}
                    style={{ ...inputStyle, height: '42px', cursor: 'pointer' }}
                  >
                    <option value="">— Select —</option>
                    {CONTACT_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FieldGroup>
              </div>

              {/* Privacy note */}
              <div style={{
                marginTop: '16px',
                padding: '10px 14px',
                backgroundColor: 'var(--bg-cream)',
                borderRadius: '8px',
                fontSize: '11px',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>
                  Your personal information is safe with us. We will only use it to contact you regarding
                  this event inquiry. We do not share your details with third parties.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ────── Submit Button ────── */}
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-gold glow-gold"
            style={{
              padding: '14px 48px',
              fontSize: '16px',
              fontWeight: '700',
              borderRadius: '30px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-flex' }}>⏳</span>
                Submitting...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit Event Details
              </>
            )}
          </button>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px' }}>
            Our team will review your submission and reach out within 24 hours.
          </p>
        </div>

      </div>
    </div>
  );
}
