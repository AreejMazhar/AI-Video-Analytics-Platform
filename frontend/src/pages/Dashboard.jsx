import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiCamera, FiCpu, FiAlertCircle, FiActivity, FiRefreshCw,
  FiChevronRight, FiArrowUpRight, FiVideo, FiBarChart2, FiFileText
} from 'react-icons/fi';
import { analyticsService } from '../api/services/analyticsService';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_cameras: 0, active_cameras: 0, active_models: 0,
    total_detections: 0, todays_alerts: 0, total_alerts: 0, total_users: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [cameraHealth, setCameraHealth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, eventsData, alertsData, healthData] = await Promise.all([
        analyticsService.getDashboardStats(),
        analyticsService.getRecentEvents(6),
        analyticsService.getRecentAlerts(5),
        analyticsService.getCameraHealth()
      ]);
      setStats(statsData);
      setRecentEvents(eventsData);
      setRecentAlerts(alertsData);
      setCameraHealth(healthData);
    } catch (err) {
      setError('Failed to load dashboard data. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-banner" style={{ maxWidth: 500, margin: '40px auto' }}>
        <FiAlertCircle size={20} />
        <div>
          <p>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={fetchDashboardData} style={{ marginTop: 10 }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Cameras',
      value: stats.total_cameras,
      sub: `${stats.active_cameras} online`,
      icon: FiCamera,
      iconBg: 'rgba(37,99,235,0.1)',
      iconColor: '#2563eb',
      accent: 'stat-card-blue'
    },
    {
      label: 'Active AI Models',
      value: stats.active_models,
      sub: 'Running inference',
      icon: FiCpu,
      iconBg: 'rgba(6,182,212,0.1)',
      iconColor: '#06b6d4',
      accent: 'stat-card-cyan'
    },
    {
      label: 'Total Detections',
      value: stats.total_detections?.toLocaleString(),
      sub: `${stats.total_alerts} total alerts`,
      icon: FiActivity,
      iconBg: 'rgba(16,185,129,0.1)',
      iconColor: '#10b981',
      accent: 'stat-card-green'
    },
    {
      label: "Today's Alerts",
      value: stats.todays_alerts,
      sub: stats.todays_alerts > 0 ? 'Requires attention' : 'All clear',
      icon: FiAlertCircle,
      iconBg: stats.todays_alerts > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
      iconColor: stats.todays_alerts > 0 ? '#ef4444' : '#10b981',
      accent: stats.todays_alerts > 0 ? 'stat-card-red' : 'stat-card-green'
    }
  ];

  const getEventIcon = (type) => {
    const map = { face: '👤', person: '🚶', vehicle: '🚗', ppe: '⛑️', fire: '🔥', license: '📋', fall: '⚠️' };
    return map[type?.toLowerCase()] || '🔍';
  };

  const severityClass = (s) => {
    const m = { critical: 'badge-danger', high: 'badge-danger', medium: 'badge-warning', low: 'badge-primary' };
    return m[s] || 'badge-muted';
  };

  const severityAlertClass = (s) => {
    const m = { critical: 'alert-critical', high: 'alert-high', medium: 'alert-medium', low: 'alert-low' };
    return m[s] || 'alert-low';
  };

  const quickActions = [
    { label: 'Live View', icon: FiVideo, to: '/live-view' },
    { label: 'Add Camera', icon: FiCamera, to: '/cameras' },
    { label: 'Analytics', icon: FiBarChart2, to: '/analytics' },
    { label: 'Reports', icon: FiFileText, to: '/reports' },
  ];

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">{greeting}, {user?.name?.split(' ')[0] || 'Admin'} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your video analytics platform today.</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchDashboardData}>
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid-4 mb-28">
        {statCards.map((s, i) => (
          <div key={i} className={`stat-card ${s.accent} animate-fade-in`} style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex-between mb-16">
              <div className="stat-icon" style={{ background: s.iconBg }}>
                <s.icon size={22} color={s.iconColor} />
              </div>
              <FiArrowUpRight size={16} color="var(--text-muted)" />
            </div>
            <p className="stat-label">{s.label}</p>
            <p className="stat-value">{s.value}</p>
            <p className="stat-change">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Grid: Events + Alerts */}
      <div className="grid-2-1 mb-28">
        {/* Recent Events */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Detection Events</h3>
            <Link to="/logs" className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }}>
              View all <FiChevronRight size={13} />
            </Link>
          </div>
          {recentEvents.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', padding: '24px 0' }}>No recent events</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentEvents.map((event, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 14px', borderRadius: '10px',
                  background: event.is_alert ? 'rgba(239,68,68,0.04)' : 'var(--background)',
                  border: `1px solid ${event.is_alert ? 'rgba(239,68,68,0.15)' : 'var(--border)'}`,
                  transition: 'all 0.15s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '10px',
                      background: 'var(--surface-hover)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px', flexShrink: 0
                    }}>
                      {getEventIcon(event.detection_type)}
                    </div>
                    <div>
                      <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        {event.model_name}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                        {event.camera_name} · {event.detection_type}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '12px', fontWeight: 700,
                      color: event.confidence > 0.85 ? 'var(--success)' : 'var(--warning)'
                    }}>
                      {Math.round(event.confidence * 100)}%
                    </span>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Active Alerts</h3>
            <span className="badge badge-danger">{recentAlerts.filter(a => !a.is_resolved).length} active</span>
          </div>
          {recentAlerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
              <p className="text-muted text-sm">No active alerts</p>
            </div>
          ) : (
            <div>
              {recentAlerts.map((alert, i) => (
                <div key={i} className={`alert-item ${severityAlertClass(alert.severity)}`}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '3px' }}>{alert.message}</p>
                    <p style={{ fontSize: '11.5px', opacity: 0.7 }}>{alert.camera_name}</p>
                    <p style={{ fontSize: '10.5px', opacity: 0.55, marginTop: '2px' }}>
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className={`badge ${severityClass(alert.severity)}`} style={{ flexShrink: 0 }}>
                    {alert.severity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Camera Health + Quick Actions */}
      <div className="grid-2">
        {/* Camera Health */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Camera Health</h3>
            <Link to="/cameras" className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }}>
              Manage <FiChevronRight size={13} />
            </Link>
          </div>
          {cameraHealth.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', padding: '24px 0' }}>No cameras added yet</p>
          ) : (
            <div>
              {cameraHealth.map((cam, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: i < cameraHealth.length - 1 ? '1px solid var(--border)' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '8px',
                      background: cam.status === 'online' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <FiCamera size={16} color={cam.status === 'online' ? '#10b981' : '#ef4444'} />
                    </div>
                    <div>
                      <p style={{ fontSize: '13.5px', fontWeight: 600, margin: 0 }}>{cam.name}</p>
                      <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '1px 0 0' }}>{cam.location || 'Unknown location'}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`status-dot ${cam.status === 'online' ? 'status-online' : 'status-offline'}`} style={{ fontSize: '12px' }}>
                      {cam.status}
                    </span>
                    {cam.uptime && <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{cam.uptime}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="gradient-card" style={{ padding: '28px' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '6px' }}>Quick Actions</h3>
            <p style={{ fontSize: '13.5px', opacity: 0.75, marginBottom: '24px' }}>
              Jump straight into key workflows
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {quickActions.map((a) => (
                <Link key={a.label} to={a.to} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  color: 'white', textDecoration: 'none',
                  fontSize: '13.5px', fontWeight: 600,
                  transition: 'all 0.2s'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                >
                  <a.icon size={16} />
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;