import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, AlertCircle, Lock } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Credentials required.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    // Strict admin role check
    if (result.user?.role !== 'admin') {
      await logout();
      setError('Access denied. This portal is restricted to authorized administrators only.');
      return;
    }

    navigate('/admin', { replace: true });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)', padding: '24px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-wa-bg)', marginBottom: '12px' }}>
            <Lock size={24} style={{ color: 'var(--color-wa)' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '4px' }}>Restricted Access</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Administrator authentication required</p>
        </div>

        {error && (
          <div style={{ display: 'flex', gap: '8px', padding: '12px', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--color-wa-bg)', color: 'var(--color-wa)', fontSize: '0.8rem', marginBottom: '16px', alignItems: 'center' }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="label" style={{ fontSize: '0.75rem' }}>Admin Email</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@domain.com" required disabled={isSubmitting} />
          </div>
          <div className="form-group">
            <label className="label" style={{ fontSize: '0.75rem' }}>Admin Password</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required disabled={isSubmitting} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '4px' }} disabled={isSubmitting}>
            {isSubmitting ? <div className="spinner" /> : 'Authenticate'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
