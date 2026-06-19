import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut, Code, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="nav-container">
      <div className="container nav-content">
        <NavLink to="/" className="nav-logo">
          <Code size={20} />
          <span>OJ{'{ 0 }'}</span>
        </NavLink>

        {/* Desktop Navigation Links */}
        <div className="nav-links-desktop">
          <NavLink to="/problems" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Problems
          </NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Leaderboard
          </NavLink>
        </div>

        {/* Right side controls */}
        <div className="nav-controls-desktop">
          <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user ? (
            <div className="user-profile-section">
              <span className="user-name">{user.userName || user.name}</span>
              <button onClick={handleLogout} className="btn-logout" title="Log Out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <NavLink to="/login" className="btn btn-secondary">Login</NavLink>
              <NavLink to="/register" className="btn btn-primary">Register</NavLink>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <div className="mobile-drawer-links">
            <NavLink to="/problems" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
              Problems
            </NavLink>
            <NavLink to="/leaderboard" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
              Leaderboard
            </NavLink>

            <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '16px 0' }} />

            <div className="mobile-drawer-controls">
              <button onClick={() => { toggleTheme(); setMobileMenuOpen(false); }} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </button>

              {user ? (
                <div style={{ width: '100%', marginTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontWeight: '500' }}>{user.userName || user.name}</span>
                  </div>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="btn btn-danger" style={{ width: '100%' }}>
                    <LogOut size={16} style={{ marginRight: '8px' }} />
                    Log Out
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '16px' }}>
                  <NavLink to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>Login</NavLink>
                  <NavLink to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>Register</NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
