import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { Award, Compass, BookOpen } from 'lucide-react';

export default function CeremoniesPage() {
  const [ceremonies, setCeremonies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchCeremonies();
  }, []);

  const fetchCeremonies = async () => {
    try {
      const res = await axios.get('/api/catalog/ceremonies');
      setCeremonies(res.data);
    } catch (err) {
      console.warn('Failed to load ceremonies list');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(ceremonies.map(c => c.category))];

  const filteredCeremonies = selectedCategory === 'All'
    ? ceremonies
    : ceremonies.filter(c => c.category === selectedCategory);

  return (
    <div style={{ fontFamily: 'var(--font-body)', padding: '60px 0' }}>
      <div className="container">
        
        {/* Intro */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '36px' }} className="traditional-border">Traditional Ceremonies & Rites</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '10px' }}>
            Vedic rituals managed with utmost scriptural fidelity, Sattvic cleanliness, and verified purohit bookings.
          </p>
        </div>



        {/* Ceremonies List */}
        <h3 style={{ fontSize: '24px', marginBottom: '16px', borderBottom: '1px solid var(--accent-gold-light)', paddingBottom: '10px' }}>
          Our Ritual Catalog
        </h3>

        {/* Category Filters */}
        {!loading && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid var(--primary-maroon)',
                  backgroundColor: selectedCategory === cat ? 'var(--primary-maroon)' : 'white',
                  color: selectedCategory === cat ? 'white' : 'var(--primary-maroon)',
                  fontSize: '12px',
                  fontWeight: '550',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Loading ritual details...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {filteredCeremonies.map(c => (
              <div className="glass-card" key={c.id} style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '18px', color: 'var(--primary-maroon-dark)' }}>{c.name}</h4>
                    <span style={{ fontSize: '11px', backgroundColor: 'var(--bg-cream-dark)', padding: '2px 8px', borderRadius: '10px', color: 'var(--text-muted)' }}>
                      {c.category}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.6' }}>{c.description}</p>
                </div>

                <div style={{ borderTop: '1px solid #f1ece1', paddingTop: '12px', fontSize: '12px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Significance:</strong>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', fontStyle: 'italic', color: 'var(--text-dark)' }}>{c.significance}</p>
                  </div>
                  {c.ritual_items && (
                    <div>
                      <strong>Core Items Arranged:</strong>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--primary-maroon)' }}>{c.ritual_items}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
