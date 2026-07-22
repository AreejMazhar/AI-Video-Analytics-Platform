import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiSearch, FiChevronDown, FiLogOut, FiUser, FiSettings } from 'react-icons/fi';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="navbar">
      {/* Search */}
      <div className="navbar-search">
        <FiSearch size={15} color="var(--text-muted)" />
        <input type="text" placeholder="Search cameras, models, logs..." />
      </div>

      {/* Actions */}
      <div className="navbar-actions">
        {/* Notifications */}
        <button className="navbar-icon-btn">
          <FiBell size={17} />
          <span className="navbar-badge">3</span>
        </button>

        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <div
            className="navbar-profile"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="navbar-profile-avatar">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div style={{ lineHeight: 1.3 }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {user?.name || 'Admin User'}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {user?.role || 'Administrator'}
              </p>
            </div>
            <FiChevronDown size={14} color="var(--text-muted)" />
          </div>

          {showProfileMenu && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              background: 'white',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
              padding: '8px',
              minWidth: '180px',
              zIndex: 1100,
              animation: 'fadeIn 0.15s ease both'
            }}>
              <button
                onClick={() => { navigate('/settings'); setShowProfileMenu(false); }}
                style={menuItemStyle}
              >
                <FiUser size={15} /> Profile Settings
              </button>
              <div style={{ height: '1px', background: 'var(--border)', margin: '6px 0' }} />
              <button onClick={handleLogout} style={{ ...menuItemStyle, color: 'var(--danger)' }}>
                <FiLogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const menuItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  width: '100%',
  padding: '9px 12px',
  borderRadius: '8px',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontSize: '13.5px',
  color: 'var(--text-primary)',
  fontWeight: 500,
  textAlign: 'left',
  transition: 'background 0.15s',
};

export default Navbar;