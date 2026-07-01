import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, Check } from 'lucide-react';

export default function ServicesPage() {
  const { t } = useLanguage();
  const [packages, setPackages] = useState([]);
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCatalogData();
  }, []);

  const fetchCatalogData = async () => {
    try {
      const [pkgRes, addonRes] = await Promise.all([
        axios.get('/api/catalog/packages'),
        axios.get('/api/catalog/addons')
      ]);
      setPackages(pkgRes.data);
      setAddons(addonRes.data);
    } catch (err) {
      console.warn('Error fetching catalog data:', err);
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

        {/* Customizable Add-ons */}
        {!loading && addons.length > 0 && (
          <div style={{ marginTop: '50px' }}>
            <h3 style={{ fontSize: '24px', marginBottom: '20px', color: 'var(--primary-maroon-dark)', borderLeft: '4px solid var(--accent-gold)', paddingLeft: '12px' }}>
              Customizable Event Add-ons
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Tailor any package tier with these traditional and logistical enhancements:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              {addons.map(addon => (
                <div className="glass-card" key={addon.id} style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '3px solid var(--accent-gold)' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--primary-maroon)' }}>{addon.name}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', margin: '4px 0 8px' }}>
                      Category: {addon.category}
                    </span>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>{addon.description}</p>
                  </div>
                  <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dotted rgba(0,0,0,0.1)', fontSize: '13px', fontWeight: '600', color: 'var(--text-dark)' }}>
                    Base Cost: {addon.category === 'catering' ? `₹${addon.base_price}/plate` : `₹${parseFloat(addon.base_price).toLocaleString('en-IN')}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trust & Guarantee Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '50px' }}>
          <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.15)', padding: '10px', borderRadius: '50%', color: 'var(--primary-maroon)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '16px', margin: '0 0 6px', color: 'var(--primary-maroon-dark)', fontFamily: 'var(--font-title)' }}>Transparent Pricing Guarantee</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>
                All package tiers have clear price ranges with no hidden administrative fees or vendor markups. Custom alterations are calculated explicitly.
              </p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: 'rgba(163, 29, 60, 0.15)', padding: '10px', borderRadius: '50%', color: 'var(--primary-maroon-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '16px', margin: '0 0 6px', color: 'var(--primary-maroon-dark)', fontFamily: 'var(--font-title)' }}>Risk Mitigation & Contingencies</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>
                Every corporate event and wedding is covered by vetted local vendors with backup resource management (power, AV, decor) for peace of mind.
              </p>
            </div>
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
