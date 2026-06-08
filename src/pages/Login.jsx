import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Key, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Find redirect route
  const from = location.state?.from?.pathname || '/problems';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
  };

  const handleQuickLogin = async (type) => {
    setError('');
    setIsSubmitting(true);

    let result;
    if (type === 'admin') {
      result = await login('sumitbansal1290@gmail.com', 'admin123');
    } else {
      result = await login('alice@example.com', 'user123');
    }

    setIsSubmitting(false);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)', padding: '24px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '4px' }}>Welcome Back</h2>
          <p style={{ fontSize: '0.875rem' }}>Sign in to submit your solutions</p>
        </div>

        {error && (
          <div style={{ display: 'flex', gap: '8px', padding: '12px', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--color-wa-bg)', color: 'var(--color-wa)', fontSize: '0.875rem', marginBottom: '16px', alignItems: 'center' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="label">Email Address</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isSubmitting}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px' }} disabled={isSubmitting}>
            {isSubmitting ? <div className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
          <Link to="/register" style={{ color: 'var(--text-primary)', fontWeight: '600', textDecoration: 'none' }}>Register</Link>
        </div>

        <div style={{ margin: '24px 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>Quick Access</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => handleQuickLogin('admin')} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.75rem', padding: '10px' }} disabled={isSubmitting}>
            <Shield size={14} style={{ color: 'var(--color-wa)' }} />
            Admin (Bansal)
          </button>
          <button onClick={() => handleQuickLogin('user')} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.75rem', padding: '10px' }} disabled={isSubmitting}>
            <User size={14} style={{ color: 'var(--text-secondary)' }} />
            User (Alice)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
