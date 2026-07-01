import React from 'react';
import { Heart, Globe, Users, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{ fontFamily: 'var(--font-body)', padding: '60px 0' }}>
      <div className="container">
        {/* Intro */}
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 50px' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '16px' }} className="traditional-border">About GS Associates</h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.7' }}>
            We create seamless, purposeful gatherings that achieve specific client goals—driving revenue, building brand awareness, educating audiences, or fostering community engagement—while delivering high-quality, engaging attendee experiences.
          </p>
        </div>

        {/* Core pillars grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '60px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Heart size={20} color="var(--primary-maroon)" />
              <h4 style={{ margin: 0, fontSize: '16px' }}>Vedic Rites Purity</h4>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              We consult experienced astrologers and senior purohits to determine precise Muhurthams using the Vedic Panchang, organizing authentic Sattvic catering and ritual item kits.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Globe size={20} color="var(--primary-maroon)" />
              <h4 style={{ margin: 0, fontSize: '16px' }}>Corporate Precision</h4>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              For conferences and corporate galas, we deliver risk mitigation, insured setups, and premium AV installations to match executive expectations.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <ShieldCheck size={20} color="var(--primary-maroon)" />
              <h4 style={{ margin: 0, fontSize: '16px' }}>Inclusive Commitment</h4>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              All our planning packages, caterers, decorators, and purohit coordinates are available to all individuals and communities without discrimination.
            </p>
          </div>
        </div>

        {/* Panel lists */}
        <div style={{ borderTop: '1px solid rgba(212,175,55,0.2)', paddingTop: '40px' }}>
          <h3 style={{ fontSize: '24px', marginBottom: '24px', textAlign: 'center' }}>Our Panel Directors</h3>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ backgroundColor: 'white', border: '1px solid #f1ece1', padding: '20px', borderRadius: '12px', textAlign: 'center', minWidth: '220px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>👨‍💼</div>
              <h4 style={{ margin: 0, fontSize: '15px' }}>Subramanian K R</h4>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>Managing Director &amp; Chief Planner</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
