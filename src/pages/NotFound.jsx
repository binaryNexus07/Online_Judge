import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', textAlign: 'center', gap: '20px' }}>
      <HelpCircle size={64} style={{ color: 'var(--text-muted)' }} />
      <h1 style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-0.04em', margin: 0 }}>404</h1>
      <h2 style={{ color: 'var(--text-primary)' }}>Page Not Found</h2>
      <p style={{ maxWidth: '400px' }}>
        The endpoint you are trying to reach does not exist or has been relocated.
      </p>
      <Link to="/" className="btn btn-primary">Go to Home</Link>
    </div>
  );
};

export default NotFound;
