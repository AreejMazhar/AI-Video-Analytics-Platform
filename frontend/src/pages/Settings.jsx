import React, { useState } from 'react';
import {
  FiSave, FiBell, FiMonitor, FiDatabase, FiShield,
  FiUser, FiGlobe, FiCpu, FiCheck, FiLock, FiMail
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    appName: 'Invexal AI Video Analytics',
    timezone: 'UTC+5:30',
    language: 'en',
    sessionTimeout: '60',
    retentionDays: '90'
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true, smsAlerts: false, criticalOnly: false,
    dailyReport: true, weeklyReport: true
  });

  const [display, setDisplay] = useState({
    videoQuality: 'hd', refreshRate: '1', showConfidence: true,
    showBoundingBox: true, theme: 'light'
  });

  const [security, setSecurity] = useState({
    twoFactor: false, sessionLog: true, apiAccess: false
  });

  const tabs = [
    { id: 'general',       label: 'General',       icon: FiGlobe    },
    { id: 'notifications', label: 'Notifications', icon: FiBell     },
    { id: 'display',       label: 'Display',       icon: FiMonitor  },
    { id: 'security',      label: 'Security',      icon: FiShield   },
    { id: 'profile',       label: 'My Profile',    icon: FiUser     },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const ToggleRow = ({ label, desc, checked, onChange }) => (
    <div className="flex-between" style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <p style={{ fontWeight: 600, fontSize: '14px', margin: 0 }}>{label}</p>
        {desc && <p className="text-sm text-muted" style={{ marginTop: '2px' }}>{desc}</p>}
      </div>
      <label className="toggle">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <div className="toggle-track" />
      </label>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure platform preferences and security options</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? <><FiCheck size={15} /> Saved!</> : <><FiSave size={15} /> Save Changes</>}
        </button>
      </div>

      <div className="grid-1-2" style={{ alignItems: 'flex-start' }}>
        {/* Sidebar Tabs */}
        <div className="card" style={{ padding: '8px' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                width: '100%', padding: '12px 14px', border: 'none', borderRadius: '10px',
                background: activeTab === t.id ? 'rgba(37,99,235,0.08)' : 'transparent',
                color: activeTab === t.id ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === t.id ? 700 : 500,
                fontSize: '14px', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s', marginBottom: '2px',
                borderLeft: activeTab === t.id ? '3px solid var(--primary)' : '3px solid transparent'
              }}
            >
              <t.icon size={17} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card">
          {/* General */}
          {activeTab === 'general' && (
            <div>
              <h3 className="card-title mb-24">General Settings</h3>
              <div className="form-group">
                <label className="form-label">Application Name</label>
                <input className="form-input" style={{ maxWidth: '400px' }} value={generalSettings.appName}
                  onChange={e => setGeneralSettings({ ...generalSettings, appName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Time Zone</label>
                <select className="form-input form-select" style={{ maxWidth: '400px' }} value={generalSettings.timezone}
                  onChange={e => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}>
                  <option value="UTC-5">UTC-5 (Eastern Time)</option>
                  <option value="UTC-8">UTC-8 (Pacific Time)</option>
                  <option value="UTC+1">UTC+1 (Central European)</option>
                  <option value="UTC+5:30">UTC+5:30 (India / Pakistan)</option>
                  <option value="UTC+0">UTC+0 (GMT)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Language</label>
                <select className="form-input form-select" style={{ maxWidth: '400px' }} value={generalSettings.language}
                  onChange={e => setGeneralSettings({ ...generalSettings, language: e.target.value })}>
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div className="grid-2" style={{ maxWidth: '400px' }}>
                <div className="form-group">
                  <label className="form-label">Session Timeout (min)</label>
                  <input className="form-input" type="number" value={generalSettings.sessionTimeout}
                    onChange={e => setGeneralSettings({ ...generalSettings, sessionTimeout: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Log Retention (days)</label>
                  <input className="form-input" type="number" value={generalSettings.retentionDays}
                    onChange={e => setGeneralSettings({ ...generalSettings, retentionDays: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div>
              <h3 className="card-title mb-8">Notification Preferences</h3>
              <p className="text-sm text-muted mb-24">Configure how and when you receive alerts</p>
              <ToggleRow label="Email Alerts" desc="Receive alert notifications via email" checked={notifications.emailAlerts} onChange={() => setNotifications({ ...notifications, emailAlerts: !notifications.emailAlerts })} />
              <ToggleRow label="SMS Alerts" desc="Receive urgent alerts via SMS" checked={notifications.smsAlerts} onChange={() => setNotifications({ ...notifications, smsAlerts: !notifications.smsAlerts })} />
              <ToggleRow label="Critical Alerts Only" desc="Only notify for critical severity events" checked={notifications.criticalOnly} onChange={() => setNotifications({ ...notifications, criticalOnly: !notifications.criticalOnly })} />
              <ToggleRow label="Daily Summary Report" desc="Get a daily overview emailed to you" checked={notifications.dailyReport} onChange={() => setNotifications({ ...notifications, dailyReport: !notifications.dailyReport })} />
              <div style={{ paddingTop: 16 }}>
                <ToggleRow label="Weekly Report" desc="Receive a weekly analytics digest" checked={notifications.weeklyReport} onChange={() => setNotifications({ ...notifications, weeklyReport: !notifications.weeklyReport })} />
              </div>
            </div>
          )}

          {/* Display */}
          {activeTab === 'display' && (
            <div>
              <h3 className="card-title mb-24">Display Settings</h3>
              <div className="form-group">
                <label className="form-label">Video Quality</label>
                <select className="form-input form-select" style={{ maxWidth: '300px' }} value={display.videoQuality}
                  onChange={e => setDisplay({ ...display, videoQuality: e.target.value })}>
                  <option value="sd">SD (480p)</option>
                  <option value="hd">HD (720p)</option>
                  <option value="fhd">Full HD (1080p)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Dashboard Refresh Rate (seconds)</label>
                <select className="form-input form-select" style={{ maxWidth: '300px' }} value={display.refreshRate}
                  onChange={e => setDisplay({ ...display, refreshRate: e.target.value })}>
                  <option value="1">Every second</option>
                  <option value="5">Every 5 seconds</option>
                  <option value="30">Every 30 seconds</option>
                  <option value="0">Manual only</option>
                </select>
              </div>
              <ToggleRow label="Show Confidence Scores" desc="Display AI confidence percentage on detections" checked={display.showConfidence} onChange={() => setDisplay({ ...display, showConfidence: !display.showConfidence })} />
              <div style={{ paddingTop: 16 }}>
                <ToggleRow label="Show Bounding Boxes" desc="Overlay detection boxes on live video" checked={display.showBoundingBox} onChange={() => setDisplay({ ...display, showBoundingBox: !display.showBoundingBox })} />
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div>
              <h3 className="card-title mb-8">Security Settings</h3>
              <p className="text-sm text-muted mb-24">Manage access control and security features</p>
              <ToggleRow label="Two-Factor Authentication" desc="Require 2FA for all admin accounts" checked={security.twoFactor} onChange={() => setSecurity({ ...security, twoFactor: !security.twoFactor })} />
              <ToggleRow label="Session Activity Log" desc="Track all login sessions and activity" checked={security.sessionLog} onChange={() => setSecurity({ ...security, sessionLog: !security.sessionLog })} />
              <div style={{ paddingTop: 16 }}>
                <ToggleRow label="API Access" desc="Allow external API integrations" checked={security.apiAccess} onChange={() => setSecurity({ ...security, apiAccess: !security.apiAccess })} />
              </div>
              <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--danger)', marginBottom: '6px' }}>Danger Zone</p>
                <p className="text-sm text-muted mb-16">These actions are irreversible. Proceed with caution.</p>
                <button className="btn btn-danger btn-sm">Clear All Detection Logs</button>
              </div>
            </div>
          )}

          {/* Profile */}
          {activeTab === 'profile' && (
            <div>
              <h3 className="card-title mb-24">My Profile</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', padding: '20px', background: 'var(--background)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '16px' }}>{user?.name || 'Admin User'}</p>
                  <p className="text-sm text-muted">{user?.email}</p>
                  <span className="badge badge-primary" style={{ marginTop: '6px', textTransform: 'capitalize' }}>{user?.role || 'admin'}</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" style={{ maxWidth: '400px' }} defaultValue={user?.name} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" style={{ maxWidth: '400px' }} defaultValue={user?.email} />
              </div>
              <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                <h4 style={{ fontWeight: 600, fontSize: '14px', marginBottom: '16px' }}>Change Password</h4>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input className="form-input" type="password" style={{ maxWidth: '400px' }} placeholder="••••••••" />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input className="form-input" type="password" style={{ maxWidth: '400px' }} placeholder="••••••••" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;