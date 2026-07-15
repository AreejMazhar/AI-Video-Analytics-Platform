import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiCamera, FiCpu, FiAlertCircle, FiActivity } from 'react-icons/fi';
import { analyticsService } from '../api/services/analyticsService';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_cameras: 0,
    active_cameras: 0,
    active_models: 0,
    total_detections: 0,
    todays_alerts: 0,
    total_alerts: 0,
    total_users: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [cameraHealth, setCameraHealth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, eventsData, alertsData, healthData] = await Promise.all([
        analyticsService.getDashboardStats(),
        analyticsService.getRecentEvents(6),
        analyticsService.getRecentAlerts(3),
        analyticsService.getCameraHealth()
      ]);

      setStats(statsData);
      setRecentEvents(eventsData);
      setRecentAlerts(alertsData);
      setCameraHealth(healthData);
      console.log('✅ Dashboard data loaded successfully');
    } catch (err) {
      console.error('❌ Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e0e4e8',
            borderTop: '4px solid #1a3a5c',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{
          background: '#fee2e2',
          color: '#dc2626',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p>{error}</p>
          <button
            onClick={fetchDashboardData}
            style={{
              marginTop: '12px',
              padding: '8px 20px',
              background: '#1a3a5c',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statsCards = [
    { 
      title: 'Total Cameras', 
      value: stats.total_cameras, 
      change: `${stats.active_cameras} online`,
      icon: FiCamera,
      color: '#4a90d9',
      bg: 'rgba(74, 144, 217, 0.1)'
    },
    { 
      title: 'Active Models', 
      value: stats.active_models, 
      change: 'Running',
      icon: FiCpu,
      color: '#00b4d8',
      bg: 'rgba(0, 180, 216, 0.1)'
    },
    { 
      title: 'Total Detections', 
      value: stats.total_detections.toLocaleString(), 
      change: `${stats.total_alerts} alerts total`,
      icon: FiActivity,
      color: '#22c55e',
      bg: 'rgba(34, 197, 94, 0.1)'
    },
    { 
      title: "Today's Alerts", 
      value: stats.todays_alerts, 
      change: `${stats.total_users} users`,
      icon: FiAlertCircle,
      color: stats.todays_alerts > 0 ? '#ef4444' : '#22c55e',
      bg: stats.todays_alerts > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
      warning: stats.todays_alerts > 0
    },
  ];

  const getSeverityColor = (severity) => {
    const colors = {
      critical: '#dc2626',
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#4a90d9'
    };
    return colors[severity] || '#6b7280';
  };

  const getEventIcon = (detectionType) => {
    const icons = {
      face: '👤',
      person: '🚶',
      vehicle: '🚗',
      ppe: '⛑️',
      fire: '🔥',
      license: '📋',
      fall: '⚠️'
    };
    return icons[detectionType?.toLowerCase()] || '🔍';
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a3a5c', marginBottom: '4px' }}>
          Dashboard
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Welcome back, {user?.name || 'Admin'}! Here's what's happening with your video analytics.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        {statsCards.map((stat, index) => (
          <div key={index} style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px 24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid #e8edf2'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>
                  {stat.title}
                </p>
                <p style={{ fontSize: '28px', fontWeight: '700', color: '#1a3a5c', margin: 0 }}>
                  {stat.value}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: stat.warning ? '#ef4444' : '#6b7280',
                  marginTop: '4px',
                  fontWeight: '500'
                }}>
                  {stat.change}
                </p>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: stat.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <stat.icon size={24} color={stat.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px',
        marginBottom: '28px'
      }}>
        {/* Recent Events */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid #e8edf2'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a3a5c', margin: 0 }}>
              Recent Events
            </h3>
            <span style={{ fontSize: '13px', color: '#4a90d9', cursor: 'pointer' }}>
              View All →
            </span>
          </div>
          
          {recentEvents.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px 0' }}>
              No recent events
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentEvents.map((event, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: event.is_alert ? '#fef2f2' : '#f8fafc',
                  borderRadius: '8px',
                  border: `1px solid ${event.is_alert ? '#ef444433' : '#f0f2f5'}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>{getEventIcon(event.detection_type)}</span>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a2e', margin: 0 }}>
                        {event.model_name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                        {event.camera_name} • {event.detection_type}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: event.confidence > 0.9 ? '#22c55e' : '#f59e0b', margin: 0 }}>
                      {Math.round(event.confidence * 100)}%
                    </p>
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Alerts */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid #e8edf2'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a3a5c', margin: 0 }}>
              Recent Alerts
            </h3>
            <span style={{ fontSize: '13px', color: '#4a90d9', cursor: 'pointer' }}>
              View All →
            </span>
          </div>
          
          {recentAlerts.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px 0' }}>
              No alerts detected ✅
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentAlerts.map((alert, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: alert.is_resolved ? '#f8fafc' : '#fef2f2',
                  borderRadius: '8px',
                  border: `1px solid ${alert.is_resolved ? '#e8edf2' : getSeverityColor(alert.severity) + '33'}`
                }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a2e', margin: 0 }}>
                      {alert.message}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                      {alert.camera_name}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      background: getSeverityColor(alert.severity) + '15',
                      color: getSeverityColor(alert.severity),
                      fontWeight: '500'
                    }}>
                      {alert.severity}
                    </span>
                    <p style={{ fontSize: '10px', color: '#6b7280', margin: '4px 0 0' }}>
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
      }}>
        {/* Camera Health */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid #e8edf2'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a3a5c', marginBottom: '16px' }}>
            Camera Health
          </h3>
          
          {cameraHealth.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px 0' }}>
              No cameras added yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cameraHealth.map((camera, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderBottom: index < cameraHealth.length - 1 ? '1px solid #f0f2f5' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: camera.status === 'online' ? '#22c55e' : '#ef4444'
                    }} />
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                      {camera.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontSize: '12px',
                      color: camera.status === 'online' ? '#22c55e' : '#ef4444',
                      fontWeight: '500'
                    }}>
                      {camera.status}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {camera.uptime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{
          background: 'linear-gradient(135deg, #1a3a5c 0%, #2a5a8c 100%)',
          borderRadius: '12px',
          padding: '24px',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Quick Actions
          </h3>
          <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '20px' }}>
            Manage your video analytics platform
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <a href="/cameras" style={{
              padding: '10px',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
            >
              Add Camera
            </a>
            <a href="/models" style={{
              padding: '10px',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
            >
              Enable AI Model
            </a>
            <a href="/reports" style={{
              padding: '10px',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
            >
              Generate Report
            </a>
            <a href="/analytics" style={{
              padding: '10px',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
            >
              View Analytics
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;