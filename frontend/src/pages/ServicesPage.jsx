import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, Check } from 'lucide-react';

const initialPackages = [
  {
    id: 1,
    event_type_id: 1,
    name: "Basic Wedding",
    description: "Simple traditional wedding execution covering core rituals and setups.",
    price_range: "₹1,00,000 - ₹5,00,000",
    features: "Essential Mandap decor, Muhurtham planning assistance, Standard sound setup, Core ritual coordination"
  },
  {
    id: 2,
    event_type_id: 1,
    name: "Premium Wedding",
    description: "Elegant wedding celebrations with rich decorations and end-to-end support.",
    price_range: "₹5,00,000 - ₹10,00,000",
    features: "Elegant thematic floral mandap, Bridal makeup, Professional sound & light, Full catering management, Muhurtham consultation"
  },
  {
    id: 3,
    event_type_id: 1,
    name: "Luxury Wedding",
    description: "Grand majestic wedding experiences with top-tier details and custom hospitality.",
    price_range: "₹10,00,000+",
    features: "Bespoke grand entrance & designer mandap, Pre-wedding photoshoot, Live traditional & fusion music, Premium catering, Full hospitality & guest logistics"
  },
  {
    id: 4,
    event_type_id: 2,
    name: "Basic Corporate",
    description: "Clean, professional setup for seminars and mid-sized conferences.",
    price_range: "₹1,50,000 - ₹3,00,000",
    features: "Standard audio-visual gear, Stage & podium branding, Attendee registration support, Standard hi-tea"
  },
  {
    id: 5,
    event_type_id: 2,
    name: "Premium Corporate",
    description: "Polished brand activations, exhibitions, and executive gatherings.",
    price_range: "₹3,00,000 - ₹6,00,000",
    features: "Advanced LED backdrop, Multi-camera live stream, Customized registration portal, Multi-cuisine buffet"
  },
  {
    id: 6,
    event_type_id: 2,
    name: "Luxury Corporate",
    description: "Grand-scale product launches and VIP corporate galas.",
    price_range: "₹6,00,000+",
    features: "Bespoke stage designs, 4K projection mapping, Celebrity emcee, Premium corporate gifting, 5-star catering"
  },
  {
    id: 7,
    event_type_id: 4,
    name: "Basic Ceremony",
    description: "Essential setups for domestic poojas and lifecycle rituals.",
    price_range: "₹30,000 - ₹60,000",
    features: "Verified Purohit booking, Standard Puja kit & samagri, Basic home/venue decoration, Sattvic menu coordination"
  },
  {
    id: 8,
    event_type_id: 4,
    name: "Premium Ceremony",
    description: "Traditional ceremonies with complete ritual kits and guest setups.",
    price_range: "₹60,000 - ₹1,50,000",
    features: "Experienced Vedic Purohit team, Complete premium Puja kit, Vastu-compliant mandap, Traditional South Indian seating, Standard Sattvic buffet"
  },
  {
    id: 9,
    event_type_id: 4,
    name: "Luxury Ceremony",
    description: "Grand traditional ceremonies with elaborate Vedic rituals and grand catering.",
    price_range: "₹1,50,000+",
    features: "Senior Acharya & Vedic group, Grand floral & traditional themes, Custom ritual item arrangements, Premium traditional welcome, Grand organic Sattvic feast"
  },
  {
    id: 10,
    event_type_id: 5,
    name: "Basic Final Rites",
    description: "Essential coordination for Apara Kriya and funeral rites.",
    price_range: "₹25,000 - ₹50,000",
    features: "Verified Acharya booking, Core ritual samagri kit, Earthen pots & dharmo-kumbha, Assistance at cremation ground"
  },
  {
    id: 11,
    event_type_id: 5,
    name: "Premium Final Rites",
    description: "Comprehensive 10th-13th day Karumandhiram and remembrance services.",
    price_range: "₹50,000 - ₹1,20,000",
    features: "Senior Vedic Purohit panel, Complete Karumandhiram setup, Pinda danam & thirtham arrangements, Sattvic memorial meal coordination"
  },
  {
    id: 12,
    event_type_id: 5,
    name: "Luxury Final Rites",
    description: "Complete end-to-end Apara Kriya, holy Asthi Visarjan, and annual Shraddha coordination.",
    price_range: "₹1,20,000+",
    features: "Lead Acharya with assistant priests, Holy river Asthi Visarjan boat & rituals, Full memorial guest logistics, Annual Shraddha remembrance reminder setup"
  },
  {
    id: 13,
    event_type_id: 3,
    name: "Basic Social",
    description: "Simple traditional or modern execution covering core decorations and setups.",
    price_range: "₹75,000 - ₹1,50,000",
    features: "Standard theme decor, basic sound setup, stage coordination, guest management assistance"
  },
  {
    id: 14,
    event_type_id: 3,
    name: "Premium Social",
    description: "Beautiful celebrations with customized decorations and catering management.",
    price_range: "₹1,80,000 - ₹3,50,000",
    features: "Exquisite floral decoration, premium sound & stage lights, full catering management, professional photography & videography"
  },
  {
    id: 15,
    event_type_id: 3,
    name: "Luxury Social",
    description: "Grand celebrations with bespoke layouts, entertainment, and top-tier guest logistics.",
    price_range: "₹3,50,000+",
    features: "Bespoke designer themes, celebrity host/entertainment, multi-cuisine catering, cinematography & drone footage, full hospitality & guest logistics"
  }
];

const initialAddons = [
  {
    id: 1,
    name: "Standard South Indian Catering",
    category: "catering",
    description: "Traditional banana leaf service with 18 items.",
    base_price: 450.00
  },
  {
    id: 2,
    name: "Premium Sattvic Feast",
    category: "catering",
    description: "Traditional pure vegetarian buffet with 26 items.",
    base_price: 750.00
  },
  {
    id: 3,
    name: "Classic Floral Decor",
    category: "decor",
    description: "Traditional marigold and jasmine arrangements.",
    base_price: 30000.00
  },
  {
    id: 4,
    name: "Grand Royal Mandap Decor",
    category: "decor",
    description: "Ornate temple-style backdrop decorations with fresh flowers.",
    base_price: 95000.00
  },
  {
    id: 5,
    name: "Standard Photography",
    category: "photography",
    description: "Traditional photo & video coverage of key rituals.",
    base_price: 25000.00
  },
  {
    id: 6,
    name: "Cinematic Candid Showcase",
    category: "photography",
    description: "Full DSLR coverage, cinematic video teaser, and high-res album.",
    base_price: 65000.00
  },
  {
    id: 7,
    name: "Vedic Purohit Services",
    category: "priest",
    description: "Verified purohit booking and Muhurtham timing consultation.",
    base_price: 10000.00
  },
  {
    id: 8,
    name: "Maha Homam Priest Group",
    category: "priest",
    description: "Lead Acharya with 4 assistant priests for elaborate homams.",
    base_price: 28000.00
  }
];

export default function ServicesPage() {
  const { t } = useLanguage();
  const [packages, setPackages] = useState(initialPackages);
  const [addons, setAddons] = useState(initialAddons);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCatalogData();
  }, []);

  const fetchCatalogData = async () => {
    try {
      const [pkgRes, addonRes] = await Promise.all([
        axios.get('/api/catalog/packages'),
        axios.get('/api/catalog/addons')
      ]);
      if (Array.isArray(pkgRes.data) && pkgRes.data.length > 0) {
        setPackages(pkgRes.data);
      }
      if (Array.isArray(addonRes.data) && addonRes.data.length > 0) {
        setAddons(addonRes.data);
      }
    } catch (err) {
      console.warn('Error fetching catalog data from API, using defaults');
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
            {[...new Set(packages.map(p => p.event_type_id))].sort((a, b) => a - b).map(catId => {
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
                            {(pkg.features || '').split(',').map((f, i) => <li key={i}>{f.trim()}</li>)}
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
