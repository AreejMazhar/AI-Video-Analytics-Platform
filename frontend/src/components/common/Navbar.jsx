import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiBell, FiSearch, FiUser, FiChevronDown } from 'react-icons/fi';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <header style={{
      background: 'white',
      padding: '16px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #e8edf2',
      position: 'sticky',
      top: 0,
      zIndex: 999,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
    }}>
      {/* Left side - Page title placeholder */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a3a5c', margin: 0 }}>
          Welcome back, {user?.name || 'Admin'} 👋
        </h3>
      </div>

      {/* Right side - Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#f5f7fa',
          borderRadius: '8px',
          padding: '8px 14px',
          gap: '8px'
        }}>
          <FiSearch size={18} color="#6b7280" />
          <input
            type="text"
            placeholder="Search..."
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '13px',
              color: '#1a1a2e',
              width: '180px'
            }}
          />
        </div>

        {/* Notifications */}
        <button style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          padding: '4px'
        }}>
          <FiBell size={22} color="#4a4a6a" />
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '18px',
            height: '18px',
            background: '#dc2626',
            borderRadius: '50%',
            fontSize: '10px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600'
          }}>
            3
          </span>
        </button>

        {/* User Profile */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '8px',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.background = '#f5f7fa'}
        onMouseLeave={(e) => e.target.style.background = 'transparent'}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4a90d9, #1a3a5c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: '14px'
          }}>
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div style={{ display: 'none', '@media(minWidth:768px)': { display: 'block' } }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a2e' }}>
              {user?.name || 'Admin'}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>
              {user?.role || 'Administrator'}
            </div>
          </div>
          <FiChevronDown size={16} color="#6b7280" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;