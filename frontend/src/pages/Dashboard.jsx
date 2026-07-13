import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiCamera, FiCpu, FiAlertCircle, FiActivity } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { 
      title: 'Total Cameras', 
      value: '24', 
      change: '+12%', 
      icon: FiCamera,
      color: '#4a90d9',
      bg: 'rgba(74, 144, 217, 0.1)'
    },
    { 
      title: 'Active Models', 
      value: '8', 
      change: '+3', 
      icon: FiCpu,
      color: '#00b4d8',
      bg: 'rgba(0, 180, 216, 0.1)'
    },
    { 
      title: 'Total Detections', 
      value: '2,847', 
      change: '+23%', 
      icon: FiActivity,
      color: '#22c55e',
      bg: 'rgba(34, 197, 94, 0.1)'
    },
    { 
      title: 'Active Alerts', 
      value: '3', 
      change: '-2', 
      icon: FiAlertCircle,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)',
      warning: true
    },
  ];

  const recentEvents = [
    { time: '2 min ago', message: 'Person detected in Zone A', camera: 'Camera 01', type: 'person' },
    { time: '15 min ago', message: 'Vehicle detected in Parking Lot', camera: 'Camera 03', type: 'vehicle' },
    { time: '1 hour ago', message: 'PPE violation detected', camera: 'Camera 05', type: 'ppe' },
    { time: '2 hours ago', message: 'Fire detected in Warehouse', camera: 'Camera 07', type: 'fire' },
  ];

  const recentAlerts = [
    { time: '2 min ago', message: 'Unknown face detected', severity: 'High', color: '#ef4444' },
    { time: '45 min ago', message: 'Intrusion detected in restricted area', severity: 'Critical', color: '#dc2626' },
    { time: '3 hours ago', message: 'Crowd density exceeded threshold', severity: 'Medium', color: '#f59e0b' },
  ];

  const cameraHealth = [
    { name: 'Camera 01', status: 'Online', uptime: '99.8%' },
    { name: 'Camera 02', status: 'Online', uptime: '99.5%' },
    { name: 'Camera 03', status: 'Online', uptime: '98.2%' },
    { name: 'Camera 04', status: 'Offline', uptime: '87.3%' },
  ];

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
        {stats.map((stat, index) => (
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
                  color: stat.warning ? '#ef4444' : '#22c55e',
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
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentEvents.map((event, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #f0f2f5'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: event.type === 'fire' ? '#ef4444' : 
                               event.type === 'ppe' ? '#f59e0b' : 
                               event.type === 'vehicle' ? '#4a90d9' : '#22c55e'
                  }} />
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a2e', margin: 0 }}>
                      {event.message}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                      {event.camera}
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{event.time}</span>
              </div>
            ))}
          </div>
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
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentAlerts.map((alert, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: '#fef2f2',
                borderRadius: '8px',
                border: `1px solid ${alert.color}33`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: alert.color
                  }} />
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a2e', margin: 0 }}>
                      {alert.message}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                      Severity: <span style={{ color: alert.color, fontWeight: '600' }}>{alert.severity}</span>
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{alert.time}</span>
              </div>
            ))}
          </div>
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
                    background: camera.status === 'Online' ? '#22c55e' : '#ef4444'
                  }} />
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                    {camera.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    fontSize: '12px',
                    color: camera.status === 'Online' ? '#22c55e' : '#ef4444',
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
            <button style={{
              padding: '10px',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
            >
              Add Camera
            </button>
            <button style={{
              padding: '10px',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
            >
              Enable AI Model
            </button>
            <button style={{
              padding: '10px',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
            >
              Generate Report
            </button>
            <button style={{
              padding: '10px',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
            >
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;