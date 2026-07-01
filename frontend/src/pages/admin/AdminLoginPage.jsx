import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, LogIn } from 'lucide-react';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);
    
    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div style={{
      fontFamily: 'var(--font-body)',
      padding: '80px 0',
      minHeight: 'calc(100vh - 150px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-cream)'
    }}>
      <div className="glass-card" style={{ padding: '35px', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-gold-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <ShieldAlert size={28} color="var(--primary-maroon)" />
          </div>
          <h2 style={{ fontSize: '22px' }}>Admin Staff Entrance</h2>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>GS Associates Operations Center</p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: '#fff0f0',
            border: '1px solid #ffc9c9',
            borderRadius: '8px',
            color: '#d63031',
            fontSize: '12px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Corporate Email</label>
            <input
              type="email"
              required
              placeholder="e.g., admin@gsassociates.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Security Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none', fontSize: '13px' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              justifyContent: 'center',
              padding: '12px',
              borderRadius: '30px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '10px'
            }}
          >
            <LogIn size={16} /> {loading ? 'Authorizing...' : 'Enter Operations Portal'}
          </button>
        </form>


      </div>
    </div>
  );
}
