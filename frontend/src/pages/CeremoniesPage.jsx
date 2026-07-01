import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { Award, Compass, BookOpen } from 'lucide-react';

const initialCeremonies = [
  {
    id: 1,
    name: "Upanayanam",
    slug: "upanayanam",
    category: "Life-cycle",
    description: "Traditional sacred thread ceremony marking a young boy's entry into formal education and spiritual life.",
    significance: "Symbolizes the second birth (spiritual birth) and eligibility to study the Vedas and perform Gayatri Japa.",
    ritual_items: "Sacred thread, darbha grass, homam wood, ghee, new clothes, brass vessels"
  },
  {
    id: 2,
    name: "Seemantham",
    slug: "seemantham",
    category: "Life-cycle",
    description: "Traditional South Indian baby shower conducted during the odd months of pregnancy (usually 7th or 9th) to bless the mother and unborn child.",
    significance: "Provides mental strength to the mother and invokes positive vibrations for the child's health and intelligence.",
    ritual_items: "Glass bangles, turmeric, kumkum, specialized sweets, coconut, fruits"
  },
  {
    id: 3,
    name: "Griha Pravesh",
    slug: "griha-pravesh",
    category: "Poojas",
    description: "Auspicious housewarming ceremony performed before moving into a new home to purify it from negative energies.",
    significance: "Ensures prosperity, peace, and good health for the residents by seeking blessings of Vastu Purusha.",
    ritual_items: "Milk, cow and calf, Ganga water, Navadhanya, copper kalasam"
  },
  {
    id: 4,
    name: "Ganapati Homam",
    slug: "ganapati-homam",
    category: "Homams",
    description: "Powerful fire ritual dedicated to Lord Ganesha, the remover of obstacles, performed before starting any new venture.",
    significance: "Brings success, prosperity, and peace of mind by clearing hurdles and negative energies.",
    ritual_items: "Modak, sugarcane, puffed rice, ghee, coconut, visual puja samagri"
  },
  {
    id: 5,
    name: "Namakaranam",
    slug: "namakaranam",
    category: "Life-cycle",
    description: "Traditional baby-naming ceremony conducted on the 11th or 12th day after the child's birth.",
    significance: "Formally welcomes the newborn into the family and community and introduces their astrological name.",
    ritual_items: "Panchagavya, honey, gold ring, rice grains, new cradles"
  },
  {
    id: 6,
    name: "Sashtiabdapoorthi (60th Birthday)",
    slug: "sashtiabdapoorthi",
    category: "Milestone & Longevity",
    description: "Celebration of the 60th birthday, marking the completion of the 60-year lunar cycle. Includes symbolic re-wedding (Kalyana Veduka).",
    significance: "Requires horoscope-based Muhurtham calculations using both spouses birth stars, mutt, and Veda affiliation to fix auspicious dates.",
    ritual_items: "Yamuna Puja, Ganga Puja, Kalasha Sthapana, Navagraha and Ganapati Homa"
  },
  {
    id: 7,
    name: "Bhima Ratha Shanti (70th Birthday)",
    slug: "bhima-ratha-shanti",
    category: "Milestone & Longevity",
    description: "70th birthday celebration and peace rituals presided over by the Mrutyunjaya Bhima form of Lord Shiva.",
    significance: "Invokes physical health, longevity, and spiritual strength for the elder couple.",
    ritual_items: "Mrutyunjaya Homa, Kalasa Sthapana, Vedic recitations"
  },
  {
    id: 8,
    name: "Sathabhishekam (80th Birthday)",
    slug: "sathabhishekam",
    category: "Milestone & Longevity",
    description: "80th birthday milestone celebration marking the transition to the final stage of life and spiritual seeking (Mumukshu phase).",
    significance: "Blessing of having witnessed 1000 full moons (Chandra Darshana). Requires birth star alignments for both spouses.",
    ritual_items: "Kalashas, Sahasra Chandra Darshana Puja, gold coin offerings"
  },
  {
    id: 9,
    name: "Shatabdi (100th Birthday)",
    slug: "shatabdi",
    category: "Milestone & Longevity",
    description: "100th birthday celebration commemorating a century of life, wisdom, and cosmic blessings.",
    significance: "Highest longevity milestone invocation for family and future generations.",
    ritual_items: "Ayushya Homa, Maha Puja, Sattvic feast"
  },
  {
    id: 10,
    name: "Veda Parayanam Chanting",
    slug: "veda-parayanam",
    category: "Vedic Recitations",
    description: "Continuous Vedic recitation (continuous or group in unison) performed for health, prosperity, or remembrance. Available as Akhanda (uninterrupted multi-day) recitations.",
    significance: "Occasion-based recommendations (health recovery, housewarming, memorial shanti) with audio/video recording and remote relative livestream option.",
    ritual_items: "Veda scholars team, audio/video recording setups, digital livestream options"
  },
  {
    id: 11,
    name: "Sri Rudram & Chamakam Chanting",
    slug: "rudram-parayanam",
    category: "Vedic Recitations",
    description: "Powerful recitation of Sri Rudram and Chamakam from Yajurveda, dedicated to Lord Shiva.",
    significance: "Performed for general health recovery, obstacle removal, and planetary peace.",
    ritual_items: "Shiva Puja samagri, kalasa, bilva leaves"
  },
  {
    id: 12,
    name: "Shashthi Vrata",
    slug: "shashthi-vrata",
    category: "Vrata & Fasting",
    description: "Six-day fasting observance dedicated to Kartikeya, primarily observed by South Indian Hindus during Ashvin month.",
    significance: "Ends with puja involving a kalasha, Agni, and modak offerings to invoke family prosperity.",
    ritual_items: "Kalasha setup, Agni Homa, modak offerings, Kartikeya photos"
  },
  {
    id: 13,
    name: "Brahmotsavam Services",
    slug: "brahmotsavam-services",
    category: "Temple-Style Festivals",
    description: "Multi-day festival coordination including flag-hoisting ceremonies and processions following temple consecration traditions.",
    significance: "Useful for large community functions or temple-sponsored corporate CSR events.",
    ritual_items: "Festival flags, chariot/procession setups, temple purohit panel"
  },
  {
    id: 14,
    name: "Apara Kriya & Funeral Support",
    slug: "apara-kriya",
    category: "Final Rites",
    description: "Comprehensive coordination of traditional Vedic funeral rites (Antyeshti) guided by experienced purohits with utmost respect and sanctity.",
    significance: "Ensures dignified and scripturally accurate final rites according to traditional family customs (Sampradaya).",
    ritual_items: "Darbha grass, sesame seeds (til), holy water, earthen pots, sacred samagri"
  },
  {
    id: 15,
    name: "Asthi Visarjan Services",
    slug: "asthi-visarjan",
    category: "Final Rites",
    description: "Sacred ritual of immersing ashes in holy rivers (Kaveri, Ganga) or Rameshwaram seaside, complete with purohit assistance and boats.",
    significance: "Provides peace to the departed soul through holy immersion accompanied by Vedic chanting.",
    ritual_items: "Immersion urn, floral offerings, thirtham, purohit guidance"
  },
  {
    id: 16,
    name: "Karumandhiram & Shraddha Services",
    slug: "karumandhiram-shraddha",
    category: "Final Rites",
    description: "Remembrance rituals conducted on the 10th to 13th days and annual Shraddha observances presided over by senior priests.",
    significance: "Honors ancestors (Pitrus) and seeks their eternal blessings for family well-being and lineage peace.",
    ritual_items: "Pinda samagri, sesame seeds, darbha grass, Sattvic meal offerings, dharmo-kumbha"
  },
  {
    id: 17,
    name: "Annaprasanam",
    slug: "annaprasanam",
    category: "Life-cycle",
    description: "Traditional South Indian ceremony marking the baby's first intake of solid food (usually sweet payasam/rice pudding) to bless their physical growth and digestive health.",
    significance: "Invokes good digestion, physical strength, and sweet speech for the baby.",
    ritual_items: "Rice payasam, silver spoon, gold ring, books, pen, gold jewelry, clay, food grains"
  },
  {
    id: 18,
    name: "Akhanda Parayanam",
    slug: "akhanda-parayanam",
    category: "Vedic Recitations",
    description: "Continuous 24-hour uninterrupted recitation of sacred scriptures (such as Srimad Sundarakanda, Bhagavad Gita, or Upanishads) performed by a dedicated panel of Vedic scholars.",
    significance: "Locks positive cosmic energy in the home and purifies the surroundings from deep negative vibes.",
    ritual_items: "Altar, deity portraits, prasad offerings, continuous ghee lamp, scriptural books, seating mats"
  },
  {
    id: 19,
    name: "Group Parayanam",
    slug: "group-parayanam",
    category: "Vedic Recitations",
    description: "Collective, mass chanting of powerful Vedic mantras and hymns performed by a large group of scholars and devotees to invoke collective blessings.",
    significance: "Amplifies the spiritual resonance and power of the chants through unified voice and energy.",
    ritual_items: "Microphone setup, seating mats, chanting books, sound amplification, group prasad distribution"
  }
];

export default function CeremoniesPage() {
  const [ceremonies, setCeremonies] = useState(initialCeremonies);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchCeremonies();
  }, []);

  const fetchCeremonies = async () => {
    try {
      const res = await axios.get('/api/catalog/ceremonies');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setCeremonies(res.data);
      }
    } catch (err) {
      console.warn('Failed to load ceremonies list from API, using defaults');
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

        {/* Core Pillars / Standards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '50px' }}>
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--accent-gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <BookOpen size={20} color="var(--primary-maroon)" />
            </div>
            <h4 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--primary-maroon-dark)', fontFamily: 'var(--font-title)' }}>Scriptural Fidelity</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>Performed strictly as per Vedic scriptures and family traditions (Sampradaya).</p>
          </div>

          <div className="glass-card" style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--accent-gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Compass size={20} color="var(--primary-maroon)" />
            </div>
            <h4 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--primary-maroon-dark)', fontFamily: 'var(--font-title)' }}>Sattvic Cleanliness</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>Utmost physical and spiritual purity maintained at every stage of the ritual.</p>
          </div>

          <div className="glass-card" style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--accent-gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Award size={20} color="var(--primary-maroon)" />
            </div>
            <h4 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--primary-maroon-dark)', fontFamily: 'var(--font-title)' }}>Verified Acharyas</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>Vetted, experienced Vedic scholars and priests with proven credentials.</p>
          </div>
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
