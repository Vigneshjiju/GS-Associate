import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { Heart, Calendar, Compass, Shield, Award, ArrowRight, Star, Film } from 'lucide-react';

export default function HomePage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ leads: 154, bookings: 542 });
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const res = await axios.get('/api/catalog/testimonials');
      setTestimonials(res.data.slice(0, 3));
    } catch (err) {
      console.warn('Failed to load testimonials');
    }
  };

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary-maroon-dark) 0%, #30000A 100%)',
        color: 'white',
        padding: '100px 0 80px',
        textAlign: 'center',
        borderBottom: '4px solid var(--accent-gold)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow decoration */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-30%',
          width: '80%',
          height: '150%',
          background: 'radial-gradient(circle, rgba(214,175,55,0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <span style={{
            fontSize: '11px',
            color: 'var(--accent-gold)',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            fontWeight: '600',
            display: 'block',
            marginBottom: '16px'
          }}>
            Vedic Traditions • Modern Corporate Execution
          </span>
          <h2 style={{
            fontFamily: 'var(--font-title)',
            fontSize: '44px',
            color: 'var(--accent-gold-light)',
            fontWeight: '700',
            lineHeight: '1.2',
            maxWidth: '850px',
            margin: '0 auto 20px',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            {t('heroTitle')}
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#D8C9C4',
            maxWidth: '650px',
            margin: '0 auto 30px',
            lineHeight: '1.7'
          }}>
            {t('heroSubtitle')}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/booking" className="btn-gold glow-gold" style={{ textDecoration: 'none' }}>
              Launch Booking Wizard <ArrowRight size={16} />
            </Link>
            <Link to="/calculator" className="btn-secondary" style={{ color: 'white', borderColor: 'var(--accent-gold)', textDecoration: 'none' }}>
              Get Instant Cost Estimate
            </Link>
          </div>
        </div>
      </section>

      {/* Stats counter strip */}
      <section style={{ backgroundColor: 'var(--bg-cream-dark)', padding: '24px 0', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px', textAlign: 'center' }}>
          <div>
            <h3 style={{ fontSize: '28px', color: 'var(--primary-maroon)', margin: 0 }}>50+</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Events Curated</span>
          </div>
          <div>
            <h3 style={{ fontSize: '28px', color: 'var(--primary-maroon)', margin: 0 }}>100%</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sattvic/Traditional Purity</span>
          </div>
          <div>
            <h3 style={{ fontSize: '28px', color: 'var(--primary-maroon)', margin: 0 }}>24/7</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Vedic Priest Panel</span>
          </div>
          <div>
            <h3 style={{ fontSize: '28px', color: 'var(--primary-maroon)', margin: 0 }}>South India</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Key Operation Hubs</span>
          </div>
        </div>
      </section>

      {/* Why Choose Us (Core Benefits) */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--bg-cream)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '32px' }} className="traditional-border">{t('whyChooseUs')}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '10px' }}>Our client relationships are designed around peace of mind, financial transparency, and premium guest experiences.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '24px', alignItems: 'stretch' }}>
            {/* Stress reduction */}
            <div className="glass-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '28px', borderRadius: '16px', height: '100%' }}>
              <div style={{ width: '56px', height: '56px', minWidth: '56px', minHeight: '56px', borderRadius: '50%', backgroundColor: 'var(--accent-gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Heart size={24} color="var(--primary-maroon)" />
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>{t('stressReduction')}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{t('stressReductionDesc')}</p>
            </div>

            {/* Cost control */}
            <div className="glass-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '28px', borderRadius: '16px', height: '100%' }}>
              <div style={{ width: '56px', height: '56px', minWidth: '56px', minHeight: '56px', borderRadius: '50%', backgroundColor: 'var(--accent-gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Calendar size={24} color="var(--primary-maroon)" />
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>{t('costControl')}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{t('costControlDesc')}</p>
            </div>

            {/* Brand rep */}
            <div className="glass-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '28px', borderRadius: '16px', height: '100%' }}>
              <div style={{ width: '56px', height: '56px', minWidth: '56px', minHeight: '56px', borderRadius: '50%', backgroundColor: 'var(--accent-gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Compass size={24} color="var(--primary-maroon)" />
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>{t('brandRep')}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{t('brandRepDesc')}</p>
            </div>

            {/* Risk mit */}
            <div className="glass-card" style={{ gridColumn: '2 / span 2', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '28px', borderRadius: '16px', height: '100%' }}>
              <div style={{ width: '56px', height: '56px', minWidth: '56px', minHeight: '56px', borderRadius: '50%', backgroundColor: 'var(--accent-gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Shield size={24} color="var(--primary-maroon)" />
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>{t('riskMitigation')}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{t('riskMitigationDesc')}</p>
            </div>

            {/* Guest exp */}
            <div className="glass-card" style={{ gridColumn: '4 / span 2', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '28px', borderRadius: '16px', height: '100%' }}>
              <div style={{ width: '56px', height: '56px', minWidth: '56px', minHeight: '56px', borderRadius: '50%', backgroundColor: 'var(--accent-gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Award size={24} color="var(--primary-maroon)" />
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>{t('guestExp')}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{t('guestExpDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Showcase Segment */}
      <section style={{
        padding: '80px 0',
        backgroundColor: 'var(--primary-maroon-dark)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '2px solid var(--accent-gold)',
        borderBottom: '2px solid var(--accent-gold)'
      }}>
        {/* Subtle background glow */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto 40px' }}>
            <span style={{
              fontSize: '11px',
              color: 'var(--accent-gold)',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '12px'
            }}>
              <Film size={14} /> Experience The Grandeur
            </span>
            <h2 style={{ fontSize: '36px', color: 'var(--accent-gold-light)', marginBottom: '14px' }}>
              Capturing Timeless Celebrations
            </h2>
            <p style={{ color: '#D8C9C4', fontSize: '15px', lineHeight: '1.7' }}>
              Take a peek into our authentic Vedic ritual setups, royal mandap styling, and flawless event coordination.
            </p>
          </div>

          {/* Video Container Frame */}
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            borderRadius: '20px',
            padding: '12px',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.4) 0%, rgba(122,0,30,0.4) 100%)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            border: '1px solid var(--accent-gold-light)'
          }}>
            <div style={{
              position: 'relative',
              paddingTop: '56.25%', /* 16:9 Aspect Ratio */
              borderRadius: '14px',
              overflow: 'hidden',
              backgroundColor: '#110004'
            }}>
              {/* 
                =================================================================
                VIDEO COMPONENT (Replace the `src` attribute below with your video link or file path)
                Example: src="/videos/hero-highlight.mp4" or an external MP4 link
                =================================================================
              */}
              <video
                controls
                playsInline
                preload="metadata"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '14px'
                }}
              >
                <source src="/Introduction of GS .mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Services blocks */}
      <section style={{ padding: '60px 0', backgroundColor: '#FFFDF9', borderTop: '1px solid #eee' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div style={{ borderLeft: '4px solid var(--primary-maroon)', padding: '16px' }}>
            <h4 style={{ fontSize: '16px', color: 'var(--primary-maroon-dark)' }}>South Indian Weddings</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '6px 0 10px' }}>Traditional Muhurtham calendar coordination, Mandaps, and Sattvic catering.</p>
            <Link to="/services" style={{ fontSize: '12px', color: 'var(--primary-maroon)', fontWeight: '600', textDecoration: 'none' }}>Learn more →</Link>
          </div>
          <div style={{ borderLeft: '4px solid var(--primary-maroon)', padding: '16px' }}>
            <h4 style={{ fontSize: '16px', color: 'var(--primary-maroon-dark)' }}>Traditional Ceremonies</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '6px 0 10px' }}>Upanayanam, Seemantham, Griha Pravesh with Vedic priest panel booking.</p>
            <Link to="/ceremonies" style={{ fontSize: '12px', color: 'var(--primary-maroon)', fontWeight: '600', textDecoration: 'none' }}>Learn more →</Link>
          </div>
          <div style={{ borderLeft: '4px solid var(--primary-maroon)', padding: '16px' }}>
            <h4 style={{ fontSize: '16px', color: 'var(--primary-maroon-dark)' }}>Final Rites & Memorials</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '6px 0 10px' }}>Apara Kriya, Asthi Visarjan, and Karumandhiram guided by dignified priests.</p>
            <Link to="/ceremonies" style={{ fontSize: '12px', color: 'var(--primary-maroon)', fontWeight: '600', textDecoration: 'none' }}>Learn more →</Link>
          </div>
          <div style={{ borderLeft: '4px solid var(--primary-maroon)', padding: '16px' }}>
            <h4 style={{ fontSize: '16px', color: 'var(--primary-maroon-dark)' }}>Corporate Events</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '6px 0 10px' }}>Seamless conferences, brand launches, backup plans, AV infrastructure.</p>
            <Link to="/services" style={{ fontSize: '12px', color: 'var(--primary-maroon)', fontWeight: '600', textDecoration: 'none' }}>Learn more →</Link>
          </div>
        </div>
      </section>

      {/* Testimonials Slider */}
      {testimonials.length > 0 && (
        <section style={{ padding: '80px 0', backgroundColor: 'var(--bg-cream-dark)', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '32px' }} className="traditional-border">Client Reviews</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {testimonials.map(t => (
                <div key={t.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid #f1ece1' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                    {[...Array(t.rating)].map((_, i) => <Star key={i} size={14} fill="var(--accent-gold)" color="var(--accent-gold)" />)}
                  </div>
                  <p style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--text-dark)', marginBottom: '16px', lineHeight: '1.6' }}>
                    "{t.review_text}"
                  </p>
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px', color: 'var(--primary-maroon-dark)' }}>{t.client_name}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Event: {t.event_type} ({t.event_date})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
