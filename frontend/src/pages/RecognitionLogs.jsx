import React, { useState, useEffect } from 'react';
import { 
  FiSearch, FiFilter, FiDownload, FiEye, 
  FiClock, FiUser, FiCamera, FiCpu,
  FiChevronLeft, FiChevronRight, FiAlertCircle
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
  const [perPage] = useState(10);
  const [stats, setStats] = useState({ total: 0, alerts: 0, today: 0 });

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [currentPage, filterStatus, searchTerm]);

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
      console.log('✅ Logs loaded:', data.items.length, 'total:', data.total);
    } catch (err) {
      console.error('❌ Error fetching logs:', err);
      setError('Failed to load logs. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await detectionLogService.getStats();
      setStats(data);
    } catch (err) {
      console.error('❌ Error fetching stats:', err);
    }
  };

  const handleExport = async () => {
    try {
      await detectionLogService.exportDetections({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchTerm || undefined
      });
      alert('✅ Logs exported successfully!');
    } catch (err) {
      alert('❌ Failed to export logs. Please try again.');
    }
  };

  const getStatusInfo = (log) => {
    if (log.is_alert) {
      return { label: '⚠️ Alert', color: '#ef4444' };
    }
    if (log.detection_type === 'face') {
      return { label: '✅ Matched', color: '#22c55e' };
    }
    if (log.detection_type === 'unknown') {
      return { label: '❓ Unknown', color: '#f59e0b' };
    }
    return { label: '🔍 Detected', color: '#4a90d9' };
  };

  const getModelIcon = (model) => {
    if (model?.includes('Face')) return '👤';
    if (model?.includes('Person')) return '🚶';
    if (model?.includes('Vehicle')) return '🚗';
    if (model?.includes('PPE')) return '⛑️';
    if (model?.includes('Fire')) return '🔥';
    if (model?.includes('License')) return '📋';
    if (model?.includes('Crowd')) return '👥';
    if (model?.includes('Fall')) return '⚠️';
    if (model?.includes('Intrusion')) return '🚫';
    if (model?.includes('Abandoned')) return '🧳';
    return '🧠';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence > 0.9) return '#22c55e';
    if (confidence > 0.7) return '#f59e0b';
    return '#ef4444';
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading && logs.length === 0) {
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
          <p style={{ color: '#6b7280' }}>Loading logs...</p>
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
            onClick={fetchLogs}
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

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a3a5c', marginBottom: '4px' }}>
          Recognition Logs
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          View all detection logs from live camera and uploaded videos
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #e8edf2',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '20px', fontWeight: '700', color: '#1a3a5c', margin: 0 }}>
            {stats.total.toLocaleString()}
          </p>
          <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Total Detections</p>
        </div>
        <div style={{
          background: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #e8edf2',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '20px', fontWeight: '700', color: '#ef4444', margin: 0 }}>
            {stats.alerts}
          </p>
          <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Total Alerts</p>
        </div>
        <div style={{
          background: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #e8edf2',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '20px', fontWeight: '700', color: '#22c55e', margin: 0 }}>
            {stats.today}
          </p>
          <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Today's Detections</p>
        </div>
        <div style={{
          background: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #e8edf2',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '20px', fontWeight: '700', color: '#4a90d9', margin: 0 }}>
            {stats.alert_percentage || 0}%
          </p>
          <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Alert Rate</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'white',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid #e8edf2',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f5f7fa',
            borderRadius: '8px',
            padding: '0 12px',
            flex: 1,
            minWidth: '200px'
          }}>
            <FiSearch color="#6b7280" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                border: 'none',
                background: 'transparent',
                padding: '10px 8px',
                outline: 'none',
                flex: 1,
                fontSize: '14px'
              }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '10px 16px',
              border: '1px solid #e8edf2',
              borderRadius: '8px',
              background: 'white',
              fontSize: '14px',
              color: '#4a4a6a',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Status</option>
            <option value="matched">✅ Matched</option>
            <option value="unknown">❓ Unknown</option>
            <option value="detected">🔍 Detected</option>
            <option value="alert">⚠️ Alert</option>
          </select>
        </div>
        <button
          onClick={handleExport}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 20px',
            background: '#f5f7fa',
            border: '1px solid #e8edf2',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#4a4a6a'
          }}
        >
          <FiDownload size={16} />
          Export Logs
        </button>
      </div>

      {/* Logs Table */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e8edf2',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
            <FiSearch size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p>No logs found matching your criteria</p>
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                  <FiClock size={14} style={{ marginRight: '4px' }} />
                  Timestamp
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                  <FiCamera size={14} style={{ marginRight: '4px' }} />
                  Camera
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                  <FiCpu size={14} style={{ marginRight: '4px' }} />
                  Model
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                  <FiUser size={14} style={{ marginRight: '4px' }} />
                  Detection
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                  Confidence
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                  Status
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => {
                const statusInfo = getStatusInfo(log);
                return (
                  <tr key={log.id} style={{
                    borderTop: index === 0 ? 'none' : '1px solid #f0f2f5',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a4a6a' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#1a1a2e' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {log.camera_name || 'Unknown'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a4a6a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{getModelIcon(log.model_name)}</span>
                        {log.model_name || 'Unknown'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '500', color: '#1a1a2e' }}>
                      {log.detection_type || 'Unknown'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: getConfidenceColor(log.confidence)
                      }}>
                        {Math.round(log.confidence * 100)}%
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        fontSize: '12px',
                        color: statusInfo.color,
                        fontWeight: '500'
                      }}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button style={{
                        padding: '4px 12px',
                        background: '#f5f7fa',
                        border: '1px solid #e8edf2',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#4a4a6a'
                      }}>
                        <FiEye size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            Showing {logs.length > 0 ? ((currentPage - 1) * perPage + 1) : 0} to {Math.min(currentPage * perPage, totalItems)} of {totalItems} entries
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '8px 12px',
                border: '1px solid #e8edf2',
                borderRadius: '6px',
                background: 'white',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1,
                color: '#4a4a6a'
              }}
            >
              <FiChevronLeft />
            </button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={i}
                  onClick={() => goToPage(pageNum)}
                  style={{
                    padding: '8px 14px',
                    border: '1px solid',
                    borderRadius: '6px',
                    background: currentPage === pageNum ? '#1a3a5c' : 'white',
                    borderColor: currentPage === pageNum ? '#1a3a5c' : '#e8edf2',
                    color: currentPage === pageNum ? 'white' : '#4a4a6a',
                    cursor: 'pointer',
                    fontWeight: currentPage === pageNum ? '600' : '400'
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 12px',
                border: '1px solid #e8edf2',
                borderRadius: '6px',
                background: 'white',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1,
                color: '#4a4a6a'
              }}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RecognitionLogs;