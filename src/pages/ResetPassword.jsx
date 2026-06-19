import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle, KeyRound } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || !confirmPassword) {
      setError('Please fill in both fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    const result = await resetPassword(token, password, confirmPassword);
    setIsSubmitting(false);

    if (result.success) {
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)', padding: '24px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', marginBottom: '12px' }}>
            <KeyRound size={24} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '4px' }}>Set New Password</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Enter your new password below.</p>
        </div>

        {error && (
          <div style={{ display: 'flex', gap: '8px', padding: '12px', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--color-wa-bg)', color: 'var(--color-wa)', fontSize: '0.875rem', marginBottom: '16px', alignItems: 'center' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div style={{ display: 'flex', gap: '8px', padding: '12px', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--color-ac-bg)', color: 'var(--color-ac)', fontSize: '0.875rem', marginBottom: '16px', alignItems: 'center' }}>
            <CheckCircle size={16} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="label">New Password</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 chars, uppercase, lowercase, digit, special" required disabled={isSubmitting || !!success} />
          </div>
          <div className="form-group">
            <label className="label">Confirm New Password</label>
            <input type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required disabled={isSubmitting || !!success} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={isSubmitting || !!success}>
            {isSubmitting ? <div className="spinner" /> : 'Reset Password'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
