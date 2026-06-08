import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Forbidden = () => {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', textAlign: 'center', gap: '20px' }}>
      <ShieldAlert size={64} style={{ color: 'var(--color-wa)' }} />
      <h1 style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-0.04em', margin: 0 }}>403</h1>
      <h2 style={{ color: 'var(--text-primary)' }}>Access Denied</h2>
      <p style={{ maxWidth: '400px' }}>
        You do not have the required administrative permissions to access this control surface.
      </p>
      <Link to="/problems" className="btn btn-primary">Return to Problems</Link>
    </div>
  );
};

export default Forbidden;
