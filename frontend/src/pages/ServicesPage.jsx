import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, Check } from 'lucide-react';

export default function ServicesPage() {
  const { t } = useLanguage();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await axios.get('/api/catalog/packages');
      setPackages(res.data);
    } catch (err) {
      console.warn('Error fetching packages');
    } finally {
      setLoading(false);
    }
  };

  const getEventName = (id) => {
    if (id === 1) return 'Wedding Packages';
    if (id === 2) return 'Corporate Events';
    if (id === 3) return 'Social Events';
    if (id === 4) return 'Traditional Ceremonies';
    if (id === 5) return 'Final Rites Services';
    return 'Other Services';
  };

  return (
    <div style={{ fontFamily: 'var(--font-body)', padding: '60px 0' }}>
      <div className="container">
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '36px' }} className="traditional-border">Our Package Tiers</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '10px' }}>
            We organize Basic, Premium, and Luxury packages, customizable with high-end traditional add-ons.
          </p>
        </div>

        {/* Packages display */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px' }}>Loading packages catalog...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
            
            {/* Split by event category */}
            {[...new Set(packages.map(p => p.event_type_id))].sort((a,b)=>a-b).map(catId => {
              const catPkgs = packages.filter(p => p.event_type_id === catId);
              if (catPkgs.length === 0) return null;

              return (
                <div key={catId} style={{ borderBottom: '1px solid rgba(212,175,55,0.15)', paddingBottom: '40px' }}>
                  <h3 style={{ fontSize: '24px', marginBottom: '20px', color: 'var(--primary-maroon-dark)', borderLeft: '4px solid var(--accent-gold)', paddingLeft: '12px' }}>
                    {getEventName(catId)}
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    {catPkgs.map(pkg => (
                      <div className="glass-card" key={pkg.id} style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '18px', color: 'var(--primary-maroon)' }}>{pkg.name}</h4>
                          <strong style={{ display: 'block', fontSize: '16px', margin: '8px 0', color: 'var(--text-dark)' }}>{pkg.price_range}</strong>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>{pkg.description}</p>
                        </div>

                        <div style={{ borderTop: '1px solid #eee', paddingTop: '12px', fontSize: '12px' }}>
                          <strong style={{ display: 'block', marginBottom: '6px' }}>Key features:</strong>
                          <ul style={{ paddingLeft: '14px', listStyleType: 'circle', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {pkg.features.split(',').map((f, i) => <li key={i}>{f.trim()}</li>)}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

          </div>
        )}

        {/* Pricing comparison table */}
        <div style={{ marginTop: '50px' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '22px' }}>Tier Comparison Matrix</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', fontSize: '13px', border: '1px solid #f1ece1', borderRadius: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--primary-maroon-dark)', color: 'white' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Feature Offered</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Basic Package</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Premium Package</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Luxury Package</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}><strong>Astrologer & Panchang Consulting</strong></td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>General Guide</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>Custom Chart Review</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>Senior Priest Board Analysis</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}><strong>Mandap & Stage Decor</strong></td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>Standard Setup</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>Thematic Flowers</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>Grand Temple Backdrops</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}><strong>Vedic Purohit Booking</strong></td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>1 Verified Priest</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>Lead Acharya + 2 Assistant Priests</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>Maha Purohit Panel (4+ Priests)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}><strong>Catering Service</strong></td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>14-Item Feast</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>22-Item Sattvic Buffet</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>28-Item Royal Feast (Leaf service)</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px' }}><strong>Photography & Videography</strong></td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>1 Lead Cameraman</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>DSLR Team + Teaser Video</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>Cinematographers + Aerial Drone</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link to="/calculator" className="btn-primary">Go to Custom Quote Calculator</Link>
        </div>

      </div>
    </div>
  );
}
