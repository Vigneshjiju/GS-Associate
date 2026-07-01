import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function PanchangWidget() {
  const [dates, setDates] = useState([]);
  const [filterType, setFilterType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showGlossary, setShowGlossary] = useState(false);

  useEffect(() => {
    fetchDates();
  }, []);

  const fetchDates = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/panchang/dates');
      setDates(res.data);
    } catch (err) {
      console.error('Error fetching panchang dates:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDates = filterType === 'All'
    ? dates
    : dates.filter(d => d.event_type.toLowerCase() === filterType.toLowerCase() || d.event_type.includes(filterType));

  const uniqueEventTypes = ['All', 'Marriage', 'Upanayanam', 'Griha Pravesh', 'Seemantham'];

  return (
    <div className="glass-card" style={{ padding: '24px', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={28} color="var(--primary-maroon)" />
          <div>
            <h3 style={{ margin: 0, fontSize: '20px' }}>Auspicious Muhurthams</h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Verified panchang timings for family rituals</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowGlossary(!showGlossary)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid var(--accent-gold)',
              backgroundColor: showGlossary ? 'var(--accent-gold-light)' : 'transparent',
              color: 'var(--primary-maroon-dark)',
              fontSize: '12px',
              fontWeight: '550',
              cursor: 'pointer'
            }}
          >
            <HelpCircle size={14} />
            Ritual Glossary
          </button>
        </div>
      </div>

      {/* Glossary Panel */}
      {showGlossary && (
        <div style={{
          padding: '16px',
          backgroundColor: '#FFFDF9',
          border: '1px dashed var(--accent-gold)',
          borderRadius: '12px',
          marginBottom: '20px',
          fontSize: '13px'
        }}>
          <h4 style={{ color: 'var(--primary-maroon)', marginBottom: '8px', fontSize: '15px' }}>Panchang Terms Demystified</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <strong>Tithi:</strong> The lunar day. It represents the phase of the moon and sets the spiritual energy of the day.
            </div>
            <div>
              <strong>Nakshatram:</strong> The star constellation. It guides the auspicious nature and alignment of personal energies.
            </div>
            <div>
              <strong>Lagnam:</strong> The rising sign. A specific hour window ideal for locking vows or performing main homams.
            </div>
            <div>
              <strong>Muhurtham:</strong> An auspicious 1.5-hour duration calculated to align actions with cosmic timing.
            </div>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        {uniqueEventTypes.map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: '1px solid var(--primary-maroon)',
              backgroundColor: filterType === t ? 'var(--primary-maroon)' : 'white',
              color: filterType === t ? 'white' : 'var(--primary-maroon)',
              fontSize: '12px',
              fontWeight: '550',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Dates Listing */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          <RefreshCw className="spin" style={{ animation: 'spin 2s linear infinite', marginBottom: '8px' }} />
          <div>Calculating auspicious dates...</div>
        </div>
      ) : filteredDates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', border: '1px solid var(--bg-cream-dark)', borderRadius: '12px', color: 'var(--text-muted)' }}>
          <AlertCircle size={32} style={{ marginBottom: '8px', color: 'var(--accent-gold)' }} />
          <div>No predefined Muhurthams found for this category. Contact our priest coordination team for a custom Panchang chart analysis.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filteredDates.map(d => (
            <div
              key={d.id}
              style={{
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: '12px',
                padding: '16px',
                backgroundColor: 'white',
                position: 'relative',
                boxShadow: '0 4px 12px rgba(122,0,30,0.02)'
              }}
            >
              {/* Badge */}
              <span style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                fontSize: '11px',
                backgroundColor: 'var(--primary-maroon-dark)',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '10px',
                fontWeight: '550'
              }}>
                {d.event_type}
              </span>

              {/* Date */}
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary-maroon)', marginBottom: '8px' }}>
                {new Date(d.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  weekday: 'short'
                })}
              </div>

              {/* Grid attributes */}
              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Tithi:</strong> {d.tithi}</div>
                <div><strong>Nakshatram:</strong> {d.nakshatram}</div>
                <div><strong>Lagnam:</strong> {d.lagnam}</div>
                <div style={{
                  marginTop: '6px',
                  padding: '6px',
                  backgroundColor: 'var(--bg-cream)',
                  borderRadius: '6px',
                  borderLeft: '3px solid var(--accent-gold)',
                  fontWeight: '550',
                  color: 'var(--primary-maroon-dark)'
                }}>
                  🕒 {d.auspicious_time}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ marginTop: '20px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '6px', alignItems: 'center' }}>
        <AlertCircle size={14} style={{ flexShrink: 0 }} />
        <span>Muhurtham calculations are general guidelines. Precise timings depend on individual birth horoscopes (Horary Astrology). Connect with our purohits for customized consultations.</span>
      </div>
    </div>
  );
}
