import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiVideo, FiCamera, FiCpu, FiBarChart2,
  FiFileText, FiUsers, FiSettings, FiLogOut, FiActivity,
  FiUpload, FiShield
} from 'react-icons/fi';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const menuGroups = [
    {
      label: 'Monitoring',
      items: [
        { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/live-view', icon: FiVideo, label: 'Live View' },
        { path: '/cameras', icon: FiCamera, label: 'Camera Management' },
      ]
    },
    {
      label: 'Intelligence',
      items: [
        { path: '/models', icon: FiCpu, label: 'AI Models' },
        { path: '/video-processing', icon: FiUpload, label: 'Video Processing' },
        { path: '/logs', icon: FiActivity, label: 'Detection Logs' },
      ]
    },
    {
      label: 'Analytics',
      items: [
        { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
        { path: '/reports', icon: FiFileText, label: 'Reports' },
      ]
    },
    {
      label: 'Administration',
      items: [
        { path: '/users', icon: FiUsers, label: 'Users' },
        { path: '/settings', icon: FiSettings, label: 'Settings' },
      ]
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <FiShield size={20} />
        </div>
        <div className="sidebar-logo-text">
          <h2>Invexal</h2>
          <p>Video Analytics</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuGroups.map((group) => (
          <div key={group.label}>
            <p className="sidebar-section-label">{group.label}</p>
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-nav-link${isActive ? ' active' : ''}`
                }
              >
                <item.icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user.name?.charAt(0) || 'A'}
            </div>
            <div className="sidebar-user-info">
              <p>{user.name || 'Admin User'}</p>
              <p>{user.role || 'admin'}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="sidebar-nav-link"
          style={{ width: '100%', cursor: 'pointer', background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', fontSize: '13.5px', fontWeight: 500 }}
        >
          <FiLogOut size={17} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;