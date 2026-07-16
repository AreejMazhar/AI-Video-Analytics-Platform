import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiVideo, 
  FiCamera, 
  FiCpu, 
  FiBarChart2, 
  FiFileText, 
  FiUsers, 
  FiSettings, 
  FiLogOut,
  FiActivity
} from 'react-icons/fi';

const Sidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/live-view', icon: FiVideo, label: 'Live View' },
    { path: '/cameras', icon: FiCamera, label: 'Camera Management' },
    { path: '/models', icon: FiCpu, label: 'AI Models' },
    { path: '/video-processing', icon: FiVideo, label: 'Video Processing' },
    { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
    { path: '/logs', icon: FiActivity, label: 'Recognition Logs' },
    { path: '/reports', icon: FiFileText, label: 'Reports' },
    { path: '/users', icon: FiUsers, label: 'Users' },
    { path: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{
      width: '250px',
      height: '100vh',
      background: 'linear-gradient(180deg, #0d1f33 0%, #1a3a5c 100%)',
      color: 'white',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      zIndex: 1000,
      boxShadow: '2px 0 12px rgba(0,0,0,0.1)'
    }}>
      {/* Logo */}
      <div style={{
        padding: '0 24px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: '#4a90d9',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: 'bold'
        }}>
          AI
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Invexal</h2>
          <p style={{ fontSize: '11px', opacity: 0.7, margin: 0 }}>Video Analytics</p>
        </div>
      </div>

      {/* Menu Items */}
      <nav style={{ flex: 1, overflowY: 'auto' }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: isActive ? '600' : '400',
              borderLeft: isActive ? '3px solid #4a90d9' : '3px solid transparent',
              background: isActive ? 'rgba(74, 144, 217, 0.15)' : 'transparent',
              transition: 'all 0.2s ease'
            })}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        marginTop: 'auto'
      }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '8px 0',
            width: '100%',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = 'white'}
          onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}
        >
          <FiLogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;