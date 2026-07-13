import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Total Cameras', value: '12', icon: '📷' },
    { title: 'Active Models', value: '8', icon: '🧠' },
    { title: 'Today\'s Detections', value: '2,847', icon: '📊' },
    { title: 'Active Alerts', value: '3', icon: '🔔' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Dashboard</h1>
        <p style={{ color: '#6b7280' }}>Welcome back, {user?.name || 'Admin'}!</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '20px',
        marginBottom: '32px'
      }}>
        {stats.map((stat, index) => (
          <div key={index} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{stat.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: '#1a3a5c' }}>
              {stat.value}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>{stat.title}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div className="card" style={{ minHeight: '300px' }}>
          <h3 style={{ marginBottom: '16px' }}>Activity Overview</h3>
          <p style={{ color: '#6b7280' }}>📈 Chart will appear here</p>
        </div>
        <div className="card" style={{ minHeight: '300px' }}>
          <h3 style={{ marginBottom: '16px' }}>Recent Events</h3>
          <ul style={{ listStyle: 'none' }}>
            <li style={{ padding: '8px 0', borderBottom: '1px solid #f0f2f5' }}>
              🔴 Person detected - Camera 1
              <span style={{ float: 'right', fontSize: '12px', color: '#6b7280' }}>2 min ago</span>
            </li>
            <li style={{ padding: '8px 0', borderBottom: '1px solid #f0f2f5' }}>
              🚗 Vehicle detected - Camera 3
              <span style={{ float: 'right', fontSize: '12px', color: '#6b7280' }}>15 min ago</span>
            </li>
            <li style={{ padding: '8px 0' }}>
              🔥 Fire detected - Camera 7
              <span style={{ float: 'right', fontSize: '12px', color: '#6b7280' }}>1 hour ago</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;