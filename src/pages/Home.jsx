import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Code, Award, CheckCircle, Shield } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="container" style={{ padding: '60px 24px', minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'inline-flex', alignSelf: 'center', padding: '6px 16px', borderRadius: '9999px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', gap: '8px', alignItems: 'center' }}>
          <span className="user-role-badge" style={{ margin: 0, textTransform: 'none', letterSpacing: 0 }}>v1.0.0 Stable</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Minimalist Online Judge API Sandbox</span>
        </div>

        <h1 style={{ fontSize: '3.5rem', lineHeight: '1.1', fontWeight: '800', letterSpacing: '-0.04em', margin: 0 }}>
          Develop. Submit. <br />
          Verify correctness.
        </h1>

        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxW: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          A sleek, high-fidelity developer evaluation environment. Write solutions to algorithmic problems, run hidden test cases locally in your browser, and track your progress.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '12px' }}>
          <Link to="/problems" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '1rem' }}>
            Browse Problems
            <ArrowRight size={16} />
          </Link>
          {!user && (
            <Link to="/login" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '1rem' }}>
              Sign In
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-2" style={{ maxWidth: '900px', margin: '80px auto 0 auto', gap: '24px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
            <Code size={20} />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>JWT-Split Security</h3>
          <p style={{ fontSize: '0.875rem' }}>
            Demonstrates modern cookie-refresh split architecture. Session access tokens reside in memory, guarded from script injections.
          </p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
            <CheckCircle size={20} />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>In-Browser Compiler</h3>
          <p style={{ fontSize: '0.875rem' }}>
            Execute JavaScript submissions immediately using Web Workers and sandboxed eval cycles. Get direct verdicts against hidden specifications.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
