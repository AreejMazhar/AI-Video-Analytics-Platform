import React, { useState, useEffect } from 'react';
import {
  FiSearch, FiDownload, FiEye, FiClock, FiCamera, FiCpu,
  FiChevronLeft, FiChevronRight, FiAlertCircle, FiActivity, FiFilter
} from 'react-icons/fi';
import { detectionLogService } from '../api/services/detectionLogService';

const RecognitionLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(12);
  const [stats, setStats] = useState({ total: 0, alerts: 0, today: 0, alert_percentage: 0 });

  useEffect(() => { fetchLogs(); fetchStats(); }, [currentPage, filterStatus, searchTerm]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        per_page: perPage,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchTerm || undefined
      };
      const data = await detectionLogService.getDetections(params);
      setLogs(data.items);
      setTotalPages(data.pages);
      setTotalItems(data.total);
    } catch (err) {
      setError('Failed to load detection logs.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await detectionLogService.getStats();
      setStats(data);
    } catch {}
  };

  const handleExport = async () => {
    try {
      await detectionLogService.exportDetections({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchTerm || undefined
      });
    } catch {}
  };

  const getModelIcon = (model) => {
    const m = model || '';
    if (m.includes('Face')) return '👤';
    if (m.includes('Person')) return '🚶';
    if (m.includes('Vehicle') || m.includes('License')) return '🚗';
    if (m.includes('PPE') || m.includes('Safety')) return '⛑️';
    if (m.includes('Fire') || m.includes('Smoke')) return '🔥';
    if (m.includes('Crowd')) return '👥';
    if (m.includes('Fall')) return '⚠️';
    if (m.includes('Intrusion')) return '🚫';
    if (m.includes('Abandoned')) return '🧳';
    return '🧠';
  };

  const getStatusBadge = (log) => {
    if (log.is_alert) return <span className="badge badge-danger">⚠ Alert</span>;
    if (log.detection_type === 'face') return <span className="badge badge-success">✓ Matched</span>;
    if (log.detection_type === 'unknown') return <span className="badge badge-warning">? Unknown</span>;
    return <span className="badge badge-primary">✦ Detected</span>;
  };

  const getConfidenceColor = (c) => c > 0.9 ? 'var(--success)' : c > 0.7 ? 'var(--warning)' : 'var(--danger)';

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const statCards = [
    { label: 'Total Detections', value: stats.total?.toLocaleString(), color: 'var(--primary)', bg: 'rgba(37,99,235,0.1)' },
    { label: 'Total Alerts', value: stats.alerts, color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)' },
    { label: "Today's Detections", value: stats.today, color: 'var(--success)', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Alert Rate', value: `${stats.alert_percentage || 0}%`, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Detection Logs</h1>
          <p className="page-subtitle">Real-time detection events from cameras and video uploads</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExport}>
          <FiDownload size={14} /> Export CSV
        </button>
      </div>

      {error && (
        <div className="error-banner mb-16">
          <FiAlertCircle size={18} /> {error}
          <button className="btn btn-sm" style={{ marginLeft: 'auto', background: 'white' }} onClick={fetchLogs}>Retry</button>
        </div>
      )}

      {/* Stat Row */}
      <div className="grid-4 mb-24">
        {statCards.map((s, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', padding: '16px 20px' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '10px',
              background: s.bg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 10px'
            }}>
              <FiActivity size={18} color={s.color} />
            </div>
            <p style={{ fontSize: '22px', fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card flex-between mb-20" style={{ padding: '14px 20px', flexWrap: 'wrap', gap: '12px' }}>
        <div className="flex" style={{ gap: '12px', flex: 1, flexWrap: 'wrap' }}>
          <div className="navbar-search" style={{ minWidth: '220px', flex: 1 }}>
            <FiSearch size={14} color="var(--text-muted)" />
            <input
              type="text" placeholder="Search camera, model, type..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <select
            className="form-input form-select"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            style={{ width: 'auto', minWidth: '160px' }}
          >
            <option value="all">All Status</option>
            <option value="matched">Matched</option>
            <option value="unknown">Unknown</option>
            <option value="detected">Detected</option>
            <option value="alert">Alert</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiFilter size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {totalItems.toLocaleString()} results
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="table-container mb-20">
        {loading ? (
          <div className="loading-screen">
            <div className="spinner" />
            <p>Loading logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
            <p style={{ fontWeight: 600 }}>No logs found</p>
            <p className="text-sm">Try adjusting your search filters</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th><FiClock size={13} style={{ marginRight: 5 }} />Timestamp</th>
                <th><FiCamera size={13} style={{ marginRight: 5 }} />Camera</th>
                <th><FiCpu size={13} style={{ marginRight: 5 }} />AI Model</th>
                <th>Detection Type</th>
                <th style={{ textAlign: 'center' }}>Confidence</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>View</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={log.id || i}>
                  <td className="text-sm text-muted">
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '7px', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiCamera size={13} color="var(--primary)" />
                      </div>
                      <span style={{ fontWeight: 500, fontSize: '13.5px' }}>{log.camera_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{getModelIcon(log.model_name)}</span>
                      <span className="text-sm">{log.model_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '13.5px', fontWeight: 600, textTransform: 'capitalize' }}>
                      {log.detection_type || '—'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: getConfidenceColor(log.confidence) }}>
                        {Math.round(log.confidence * 100)}%
                      </span>
                      <div style={{ width: '60px', height: '4px', background: 'var(--border)', borderRadius: '99px', margin: '4px auto 0' }}>
                        <div style={{ width: `${log.confidence * 100}%`, height: '100%', background: getConfidenceColor(log.confidence), borderRadius: '99px' }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {getStatusBadge(log)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn btn-ghost btn-sm">
                      <FiEye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex-between" style={{ padding: '4px 0' }}>
          <span className="text-sm text-muted">
            Showing {logs.length > 0 ? ((currentPage - 1) * perPage + 1) : 0}–{Math.min(currentPage * perPage, totalItems)} of {totalItems.toLocaleString()} entries
          </span>
          <div className="flex" style={{ gap: '4px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
              <FiChevronLeft size={14} />
            </button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              let p = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
              return (
                <button
                  key={i}
                  onClick={() => goToPage(p)}
                  className={p === currentPage ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                >
                  {p}
                </button>
              );
            })}
            <button className="btn btn-secondary btn-sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecognitionLogs;