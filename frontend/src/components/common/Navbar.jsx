import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, LogOut, ShieldAlert, Globe, Search } from 'lucide-react';

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLangChange = (selected) => {
    setLang(selected);
    setLangDropdown(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: t('navHome'), path: '/' },
    { label: t('navAbout'), path: '/about' },
    { label: t('navServices'), path: '/services' },
    { label: t('navCeremonies'), path: '/ceremonies' },
    { label: 'Calculator', path: '/calculator' },
    { label: 'Submit Event', path: '/submit-event' },
    { label: t('navContact'), path: '/contact' }
  ];

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 900,
      backgroundColor: 'var(--primary-maroon-dark)',
      borderBottom: '2px solid var(--accent-gold)',
      color: 'white',
      fontFamily: 'var(--font-body)'
    }}>
      <div style={{
        height: '75px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '0 24px'
      }}>
        {/* Logo (Extreme Left) */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'white' }}>
          <span style={{ fontSize: '24px' }}>✨</span>
          <div>
            <h1 style={{ color: 'var(--accent-gold-light)', margin: 0, fontSize: '20px', fontFamily: 'var(--font-title)', letterSpacing: '1px' }}>
              GS ASSOCIATES
            </h1>
            <p style={{ margin: 0, fontSize: '9px', color: 'var(--accent-gold)', letterSpacing: '2px' }}>
              PURPOSEFUL EVENT DESIGN
            </p>
          </div>
        </Link>

        {/* Desktop Links (Center) */}
        <div style={{ alignItems: 'center', gap: '24px' }} className="desktop-nav">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--accent-gold)'}
              onMouseLeave={(e) => e.target.style.color = 'white'}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Action Panel (Extreme Right) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Search Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {searchOpen && (
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services..."
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  border: '1px solid var(--accent-gold)',
                  backgroundColor: 'white',
                  color: 'var(--text-dark)',
                  fontSize: '12px',
                  outline: 'none',
                  width: '140px'
                }}
              />
            )}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-gold-light)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
            >
              <Search size={18} />
            </button>
          </div>

          {/* Language selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setLangDropdown(!langDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(212,175,55,0.4)',
                color: 'var(--accent-gold-light)',
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <Globe size={14} />
              {lang.toUpperCase()}
            </button>
            
            {langDropdown && (
              <div style={{
                position: 'absolute',
                top: '40px',
                right: 0,
                backgroundColor: 'white',
                color: 'var(--text-dark)',
                borderRadius: '8px',
                border: '1px solid var(--accent-gold)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                width: '130px',
                overflow: 'hidden',
                zIndex: 999
              }}>
                {[
                  { code: 'en', name: 'English' },
                  { code: 'ta', name: 'தமிழ்' },
                  { code: 'te', name: 'తెలుగు' },
                  { code: 'kn', name: 'ಕನ್ನಡ' },
                  { code: 'ml', name: 'മലയാളം' },
                  { code: 'hi', name: 'हिंदी' }
                ].map(l => (
                  <button
                    key={l.code}
                    onClick={() => handleLangChange(l.code)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'block'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-cream)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Book button */}
          <Link to="/booking" className="btn-gold book-btn" style={{
            padding: '8px 18px',
            fontSize: '12px',
            textDecoration: 'none'
          }}>
            {t('navBooking')}
          </Link>

          {/* Admin shortcut */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/admin" style={{ color: 'var(--accent-gold-light)', textDecoration: 'none', fontSize: '12px' }}>
                Dashboard
              </Link>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/admin/login" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '11px' }}>
              Admin
            </Link>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="mobile-trigger"
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Links */}
      {mobileOpen && (
        <div style={{
          backgroundColor: 'var(--primary-maroon-dark)',
          borderTop: '1px solid rgba(212,175,55,0.2)',
          padding: '12px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          zIndex: 999
        }}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '14px',
                display: 'block'
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/booking"
            onClick={() => setMobileOpen(false)}
            style={{
              color: 'var(--accent-gold-light)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              display: 'block'
            }}
          >
            {t('navBooking')}
          </Link>
        </div>
      )}
    </nav>
  );
}
