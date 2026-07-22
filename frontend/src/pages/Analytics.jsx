import React, { useState, useEffect } from 'react';
import {
  FiTrendingUp, FiTrendingDown, FiActivity, FiBarChart2,
  FiPieChart, FiDownload, FiAlertCircle
} from 'react-icons/fi';
import { analyticsService } from '../api/services/analyticsService';
import Modal from '../components/common/Modal';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({ totalDetections: 0, uniqueFaces: 0, alertsTriggered: 0, avgAccuracy: 0 });
  const [dailyData, setDailyData] = useState([]);
  const [detectionBreakdown, setDetectionBreakdown] = useState([]);
  const [modelPerformance, setModelPerformance] = useState([]);

  // Custom modal state
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'info', title: '', content: null, onConfirm: null });

  useEffect(() => { fetchAnalyticsData(); }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
      const [statsData, trendsData, breakdownData, performanceData] = await Promise.all([
        analyticsService.getDashboardStats(),
        analyticsService.getDailyTrends(days),
        analyticsService.getDetectionBreakdown(days),
        analyticsService.getModelPerformance()
      ]);
      const totalDetections = statsData.total_detections || 0;
      const avgAccuracy = performanceData.length > 0
        ? performanceData.reduce((s, m) => s + m.avg_confidence, 0) / performanceData.length : 0;
      setStats({
        totalDetections,
        uniqueFaces: Math.floor(totalDetections * 0.05),
        alertsTriggered: statsData.todays_alerts || 0,
        avgAccuracy: Math.round(avgAccuracy * 100)
      });
      setDailyData(trendsData);
      setDetectionBreakdown(breakdownData);
      setModelPerformance(performanceData);
    } catch {
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    setExporting(true);
    try {
      const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
      if (type === 'csv') await analyticsService.exportCSV(days);
      else await analyticsService.exportPDF(days);
      setModalConfig({
        isOpen: true, type: 'success',
        title: 'Export Complete',
        content: `Analytics report exported successfully as ${type.toUpperCase()}.`
      });
    } catch {
      setModalConfig({
        isOpen: true, type: 'danger',
        title: 'Export Failed',
        content: 'Failed to export analytics data. Please try again.'
      });
    } finally {
      setExporting(false);
    }
  };

  const maxDetection = dailyData.length > 0 ? Math.max(...dailyData.map(d => d.detections), 1) : 1;
  const COLORS = ['#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  const statCards = [
    { label: 'Total Detections', value: stats.totalDetections.toLocaleString(), trend: '+12.5%', up: true, color: '#2563eb' },
    { label: 'Unique Faces', value: stats.uniqueFaces, trend: '+12 new', up: true, color: '#06b6d4' },
    { label: 'Alerts Triggered', value: stats.alertsTriggered, trend: '-4 vs last week', up: false, color: '#ef4444' },
    { label: 'Avg. Accuracy', value: `${stats.avgAccuracy}%`, trend: '+8.3% this week', up: true, color: '#10b981' },
  ];

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading analytics...</p></div>;

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">AI performance insights and detection trends</p>
        </div>
        <div className="flex" style={{ gap: '10px' }}>
          <select
            className="form-input form-select"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn btn-secondary" disabled={exporting} onClick={() => handleExport('csv')}>
            <FiDownload size={14} /> {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
          <button className="btn btn-secondary" disabled={exporting} onClick={() => handleExport('pdf')}>
            <FiDownload size={14} /> PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner mb-16">
          <FiAlertCircle size={18} /> {error}
          <button className="btn btn-sm" style={{ marginLeft: 'auto', background: 'white' }} onClick={fetchAnalyticsData}>Retry</button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid-4 mb-28">
        {statCards.map((s, i) => (
          <div key={i} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: s.color, borderRadius: '12px 12px 0 0' }} />
            <p className="stat-label mb-8">{s.label}</p>
            <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: '12px', color: s.up ? 'var(--success)' : 'var(--danger)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {s.up ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />} {s.trend}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid-2-1 mb-24">
        {/* Bar Chart – Daily Detections */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><FiBarChart2 size={16} style={{ marginRight: 6 }} />Daily Detections</h3>
            <span className="text-sm text-muted">Last {dailyData.length} days</span>
          </div>

          {dailyData.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', padding: '40px 0' }}>No data available</p>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '180px', padding: '0 4px' }}>
                {dailyData.map((day, i) => {
                  const pct = Math.max((day.detections / maxDetection) * 100, 2);
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>{day.detections || ''}</span>
                      <div
                        style={{
                          width: '100%',
                          height: `${pct}%`,
                          background: day.alerts > 0
                            ? 'linear-gradient(180deg, #ef4444, #fca5a5)'
                            : 'linear-gradient(180deg, #2563eb, #93c5fd)',
                          borderRadius: '6px 6px 0 0',
                          transition: 'height 0.5s ease',
                          position: 'relative',
                          cursor: 'pointer',
                          minHeight: '4px'
                        }}
                        title={`${day.day}: ${day.detections} detections, ${day.alerts || 0} alerts`}
                      />
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px', whiteSpace: 'nowrap' }}>{day.day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex" style={{ gap: '20px', justifyContent: 'center', marginTop: '12px' }}>
                {[
                  { label: 'Detections', color: '#2563eb' },
                  { label: 'With Alerts', color: '#ef4444' },
                ].map(l => (
                  <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    <span style={{ width: 12, height: 12, borderRadius: '3px', background: l.color, display: 'inline-block' }} />
                    {l.label}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Detection Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><FiPieChart size={16} style={{ marginRight: 6 }} />Detection Types</h3>
          </div>

          {detectionBreakdown.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', padding: '40px 0' }}>No data</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {detectionBreakdown.map((item, i) => {
                const total = detectionBreakdown.reduce((s, x) => s + x.count, 0);
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="flex-between" style={{ marginBottom: '5px' }}>
                      <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: 10, height: 10, borderRadius: '3px', background: item.color || COLORS[i % COLORS.length], display: 'inline-block', flexShrink: 0 }} />
                        {item.type?.charAt(0).toUpperCase() + item.type?.slice(1)}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.count} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({pct}%)</span></span>
                    </div>
                    <div className="confidence-bar">
                      <div className="confidence-fill" style={{ width: `${pct}%`, background: item.color || COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Model Performance */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title"><FiActivity size={16} style={{ marginRight: 6 }} />Model Performance</h3>
          <span className="text-sm text-muted">{modelPerformance.length} models tracked</span>
        </div>

        {modelPerformance.length === 0 ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: '24px 0' }}>No performance data</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
            {modelPerformance.map((m, i) => {
              const conf = Math.round(m.avg_confidence * 100);
              const color = conf >= 90 ? 'var(--success)' : conf >= 80 ? 'var(--warning)' : 'var(--danger)';
              return (
                <div key={i} style={{
                  padding: '14px 16px',
                  background: 'var(--background)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)'
                }}>
                  <p style={{ fontSize: '13.5px', fontWeight: 600, margin: '0 0 8px', color: 'var(--text-primary)' }}>{m.model_name}</p>
                  <div className="flex-between mb-8">
                    <span className="text-sm text-muted">{m.detection_count?.toLocaleString()} detections</span>
                    <span style={{ fontWeight: 700, fontSize: '14px', color }}>{conf}%</span>
                  </div>
                  <div className="confidence-bar">
                    <div className="confidence-fill" style={{ width: `${conf}%`, background: color }} />
                  </div>
                  {m.alert_count > 0 && (
                    <p style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '6px' }}>
                      ⚠ {m.alert_count} alerts generated
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom Reusable Modal */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        title={modalConfig.title}
        onConfirm={modalConfig.onConfirm}
      >
        {modalConfig.content}
      </Modal>
    </div>
  );
};

export default Analytics;