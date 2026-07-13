import React, { useState } from 'react';
import { 
  FiTrendingUp, FiTrendingDown, FiActivity, FiBarChart2, 
  FiPieChart, FiDownload, FiCalendar, FiFilter 
} from 'react-icons/fi';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week');

  // Mock analytics data - will come from backend
  const stats = {
    totalDetections: 2847,
    uniqueFaces: 156,
    alertsTriggered: 43,
    avgAccuracy: 94.2,
    dailyTrend: '+12.5%',
    weeklyTrend: '+8.3%'
  };

  // Mock daily detection data
  const dailyData = [
    { day: 'Mon', detections: 320, alerts: 5 },
    { day: 'Tue', detections: 280, alerts: 8 },
    { day: 'Wed', detections: 410, alerts: 12 },
    { day: 'Thu', detections: 350, alerts: 6 },
    { day: 'Fri', detections: 450, alerts: 9 },
    { day: 'Sat', detections: 270, alerts: 3 },
    { day: 'Sun', detections: 180, alerts: 0 },
  ];

  // Mock model performance
  const modelPerformance = [
    { name: 'Face Recognition', accuracy: 95.2, detections: 843 },
    { name: 'Person Detection', accuracy: 92.8, detections: 624 },
    { name: 'Vehicle Detection', accuracy: 89.5, detections: 456 },
    { name: 'PPE Detection', accuracy: 87.3, detections: 321 },
    { name: 'License Plate', accuracy: 91.1, detections: 234 },
  ];

  // Mock detection types breakdown
  const detectionBreakdown = [
    { type: 'Face', count: 843, color: '#4a90d9' },
    { type: 'Person', count: 624, color: '#22c55e' },
    { type: 'Vehicle', count: 456, color: '#f59e0b' },
    { type: 'PPE Violation', count: 321, color: '#ef4444' },
    { type: 'License Plate', count: 234, color: '#8b5cf6' },
    { type: 'Other', count: 369, color: '#6b7280' },
  ];

  const maxDetection = Math.max(...dailyData.map(d => d.detections));

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a3a5c', marginBottom: '4px' }}>
            Analytics
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Insights and performance metrics from all AI models
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: 'white',
            border: '1px solid #e8edf2',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#4a4a6a'
          }}>
            <FiCalendar size={16} />
            {timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : 'This Year'}
          </button>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: 'white',
            border: '1px solid #e8edf2',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#4a4a6a'
          }}>
            <FiDownload size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #e8edf2'
        }}>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Detections</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#1a3a5c', margin: 0 }}>
            {stats.totalDetections.toLocaleString()}
          </p>
          <p style={{ fontSize: '12px', color: '#22c55e', marginTop: '4px' }}>
            <FiTrendingUp size={12} /> {stats.dailyTrend} from yesterday
          </p>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #e8edf2'
        }}>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Unique Faces</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#1a3a5c', margin: 0 }}>
            {stats.uniqueFaces}
          </p>
          <p style={{ fontSize: '12px', color: '#22c55e', marginTop: '4px' }}>
            <FiTrendingUp size={12} /> +12 new this week
          </p>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #e8edf2'
        }}>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Alerts Triggered</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444', margin: 0 }}>
            {stats.alertsTriggered}
          </p>
          <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
            <FiTrendingDown size={12} /> -4 from last week
          </p>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #e8edf2'
        }}>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Avg. Accuracy</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#22c55e', margin: 0 }}>
            {stats.avgAccuracy}%
          </p>
          <p style={{ fontSize: '12px', color: '#22c55e', marginTop: '4px' }}>
            <FiTrendingUp size={12} /> {stats.weeklyTrend} this week
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Daily Detection Chart */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px 24px',
          border: '1px solid #e8edf2'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a3a5c', margin: 0 }}>
              Daily Detections
            </h3>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Last 7 days</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '160px' }}>
            {dailyData.map((day, index) => (
              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '100%',
                  height: `${(day.detections / maxDetection) * 140}px`,
                  background: '#4a90d9',
                  borderRadius: '6px 6px 0 0',
                  position: 'relative',
                  minHeight: '4px',
                  transition: 'height 0.3s'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-18px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '10px',
                    color: '#6b7280'
                  }}>
                    {day.detections}
                  </div>
                </div>
                <div style={{
                  width: '100%',
                  height: '2px',
                  background: '#ef4444',
                  position: 'relative',
                  marginTop: '2px'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-14px',
                    right: '0',
                    fontSize: '9px',
                    color: '#ef4444'
                  }}>
                    {day.alerts > 0 && `⚠️${day.alerts}`}
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
                  {day.day}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '8px' }}>
            <span style={{ fontSize: '11px', color: '#6b7280' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#4a90d9', borderRadius: '2px', marginRight: '4px' }} />
              Detections
            </span>
            <span style={{ fontSize: '11px', color: '#6b7280' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px', marginRight: '4px' }} />
              Alerts
            </span>
          </div>
        </div>

        {/* Detection Breakdown */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px 24px',
          border: '1px solid #e8edf2'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a3a5c', marginBottom: '16px' }}>
            Detection Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {detectionBreakdown.map((item, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '2px' }}>
                  <span style={{ color: '#4a4a6a' }}>{item.type}</span>
                  <span style={{ fontWeight: '600', color: '#1a3a5c' }}>{item.count}</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: '#f0f2f5',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(item.count / stats.totalDetections) * 100}%`,
                    height: '100%',
                    background: item.color,
                    borderRadius: '3px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Model Performance */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px 24px',
        border: '1px solid #e8edf2'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a3a5c', marginBottom: '16px' }}>
          Model Performance
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {modelPerformance.map((model, index) => (
            <div key={index} style={{
              padding: '12px 16px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #f0f2f5'
            }}>
              <p style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a2e', margin: 0 }}>
                {model.name}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {model.detections} detections
                </span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: model.accuracy > 90 ? '#22c55e' : model.accuracy > 85 ? '#f59e0b' : '#ef4444'
                }}>
                  {model.accuracy}%
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '4px',
                background: '#e8edf2',
                borderRadius: '2px',
                marginTop: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${model.accuracy}%`,
                  height: '100%',
                  background: model.accuracy > 90 ? '#22c55e' : model.accuracy > 85 ? '#f59e0b' : '#ef4444',
                  borderRadius: '2px'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;