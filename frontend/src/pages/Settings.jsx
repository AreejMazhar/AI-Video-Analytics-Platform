import React, { useState } from 'react';
import { 
  FiSave, FiBell, FiMonitor, FiDatabase, FiShield,
  FiUser, FiMail, FiLock, FiGlobe, FiCpu
} from 'react-icons/fi';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: <FiGlobe /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell /> },
    { id: 'display', label: 'Display', icon: <FiMonitor /> },
    { id: 'database', label: 'Database', icon: <FiDatabase /> },
    { id: 'security', label: 'Security', icon: <FiShield /> },
    { id: 'profile', label: 'Profile', icon: <FiUser /> },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a3a5c', marginBottom: '4px' }}>
          Settings
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Configure application settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        background: 'white',
        padding: '6px',
        borderRadius: '12px',
        border: '1px solid #e8edf2',
        marginBottom: '24px',
        overflowX: 'auto'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: activeTab === tab.id ? '#1a3a5c' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#4a4a6a',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? '600' : '400',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #e8edf2'
      }}>
        {activeTab === 'general' && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a3a5c', marginBottom: '16px' }}>
              General Settings
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Application Name
                </label>
                <input
                  type="text"
                  defaultValue="Invexal AI Video Analytics"
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Time Zone
                </label>
                <select
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option>UTC-5 (Eastern Time)</option>
                  <option selected>UTC-4 (Eastern Time)</option>
                  <option>UTC-8 (Pacific Time)</option>
                  <option>UTC+1 (Central European)</option>
                  <option>UTC+5:30 (India)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Language
                </label>
                <select
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option selected>English (US)</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>
              <button style={{
                alignSelf: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                background: '#1a3a5c',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}>
                <FiSave size={16} />
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a3a5c', marginBottom: '16px' }}>
              Notification Settings
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f2f5' }}>
                <div>
                  <p style={{ fontWeight: '500', margin: 0 }}>Email Notifications</p>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Receive alerts via email</p>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                  <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: '#22c55e',
                    borderRadius: '26px',
                    transition: '0.4s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: '4px',
                      bottom: '4px',
                      background: 'white',
                      borderRadius: '50%',
                      transition: '0.4s'
                    }} />
                  </span>
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f2f5' }}>
                <div>
                  <p style={{ fontWeight: '500', margin: 0 }}>Push Notifications</p>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Browser push notifications</p>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                  <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: '#d1d5db',
                    borderRadius: '26px',
                    transition: '0.4s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: '4px',
                      bottom: '4px',
                      background: 'white',
                      borderRadius: '50%',
                      transition: '0.4s'
                    }} />
                  </span>
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                <div>
                  <p style={{ fontWeight: '500', margin: 0 }}>Alert Sounds</p>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Play sound for critical alerts</p>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                  <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: '#22c55e',
                    borderRadius: '26px',
                    transition: '0.4s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: '4px',
                      bottom: '4px',
                      background: 'white',
                      borderRadius: '50%',
                      transition: '0.4s'
                    }} />
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'display' && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a3a5c', marginBottom: '16px' }}>
              Display Settings
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Dashboard Layout
                </label>
                <select
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option selected>3 Column (Default)</option>
                  <option>2 Column</option>
                  <option>4 Column</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Theme
                </label>
                <select
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option selected>Light</option>
                  <option>Dark</option>
                  <option>System Default</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
                <span style={{ fontSize: '14px' }}>Show recent activity on dashboard</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a3a5c', marginBottom: '16px' }}>
              Database Settings
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Database Connection
                </label>
                <input
                  type="text"
                  defaultValue="postgresql://localhost:5432/invexal_db"
                  style={{
                    width: '100%',
                    maxWidth: '500px',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{
                  padding: '8px 16px',
                  background: '#f5f7fa',
                  border: '1px solid #e8edf2',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}>
                  Test Connection
                </button>
                <button style={{
                  padding: '8px 16px',
                  background: '#f5f7fa',
                  border: '1px solid #e8edf2',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}>
                  Backup Database
                </button>
              </div>
              <div style={{
                padding: '12px',
                background: '#fef3c7',
                borderRadius: '8px',
                border: '1px solid #f59e0b33'
              }}>
                <p style={{ fontSize: '13px', color: '#92400e', margin: 0 }}>
                  ⚠️ Database operations may affect system performance.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a3a5c', marginBottom: '16px' }}>
              Security Settings
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  defaultValue="60"
                  style={{
                    width: '200px',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Password Requirements
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    <input type="checkbox" defaultChecked /> Minimum 8 characters
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    <input type="checkbox" defaultChecked /> Require uppercase and lowercase
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    <input type="checkbox" /> Require special characters
                  </label>
                </div>
              </div>
              <div style={{
                padding: '12px',
                background: '#dbeafe',
                borderRadius: '8px',
                border: '1px solid #4a90d933'
              }}>
                <p style={{ fontSize: '13px', color: '#1a3a5c', margin: 0 }}>
                  🔒 All passwords are encrypted using bcrypt.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a3a5c', marginBottom: '16px' }}>
              Profile Settings
            </h3>
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  color: '#1a3a5c',
                  margin: '0 auto'
                }}>
                  👤
                </div>
                <button style={{
                  marginTop: '8px',
                  padding: '6px 16px',
                  background: '#f5f7fa',
                  border: '1px solid #e8edf2',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}>
                  Change Photo
                </button>
              </div>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Admin User"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue="admin@invexal.com"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;