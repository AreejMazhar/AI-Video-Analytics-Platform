import React, { useState } from 'react';
import { 
  FiSearch, FiFilter, FiDownload, FiEye, 
  FiClock, FiUser, FiCamera, FiCpu,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';

const RecognitionLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock logs data - will come from backend
  const logs = [
    { id: 1, timestamp: '2024-07-13 14:32:15', camera: 'Main Entrance', model: 'Face Recognition', detection: 'John Doe', confidence: 95.2, status: 'matched' },
    { id: 2, timestamp: '2024-07-13 14:28:42', camera: 'Main Entrance', model: 'Face Recognition', detection: 'Unknown Person', confidence: 78.5, status: 'unknown' },
    { id: 3, timestamp: '2024-07-13 14:15:08', camera: 'Uploaded Video - Office.mp4', model: 'Person Detection', detection: '2 People', confidence: 92.1, status: 'detected' },
    { id: 4, timestamp: '2024-07-13 13:55:33', camera: 'Uploaded Video - Parking.mp4', model: 'Vehicle Detection', detection: 'Toyota Corolla', confidence: 88.7, status: 'detected' },
    { id: 5, timestamp: '2024-07-13 13:30:11', camera: 'Main Entrance', model: 'Face Recognition', detection: 'Jane Smith', confidence: 91.8, status: 'matched' },
    { id: 6, timestamp: '2024-07-13 13:12:45', camera: 'Uploaded Video - Warehouse.mp4', model: 'PPE Detection', detection: 'Missing Helmet', confidence: 85.3, status: 'alert' },
    { id: 7, timestamp: '2024-07-13 12:48:22', camera: 'Uploaded Video - Factory.mp4', model: 'Fire & Smoke', detection: 'Smoke Detected', confidence: 94.6, status: 'alert' },
    { id: 8, timestamp: '2024-07-13 12:20:05', camera: 'Main Entrance', model: 'Face Recognition', detection: 'Mike Johnson', confidence: 93.4, status: 'matched' },
    { id: 9, timestamp: '2024-07-13 11:55:18', camera: 'Uploaded Video - Street.mp4', model: 'License Plate', detection: 'ABC-123', confidence: 89.2, status: 'detected' },
    { id: 10, timestamp: '2024-07-13 11:30:44', camera: 'Uploaded Video - Mall.mp4', model: 'Crowd Detection', detection: '42 People', confidence: 87.9, status: 'detected' },
    { id: 11, timestamp: '2024-07-13 11:05:12', camera: 'Main Entrance', model: 'Face Recognition', detection: 'Sarah Wilson', confidence: 90.5, status: 'matched' },
    { id: 12, timestamp: '2024-07-13 10:42:36', camera: 'Uploaded Video - Construction.mp4', model: 'Fall Detection', detection: 'Fall Detected', confidence: 92.8, status: 'alert' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      matched: '#22c55e',
      unknown: '#f59e0b',
      detected: '#4a90d9',
      alert: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      matched: '✅ Matched',
      unknown: '❓ Unknown',
      detected: '🔍 Detected',
      alert: '⚠️ Alert'
    };
    return labels[status] || status;
  };

  const getModelIcon = (model) => {
    if (model.includes('Face')) return '👤';
    if (model.includes('Person')) return '🚶';
    if (model.includes('Vehicle')) return '🚗';
    if (model.includes('PPE')) return '⛑️';
    if (model.includes('Fire')) return '🔥';
    if (model.includes('License')) return '📋';
    if (model.includes('Crowd')) return '👥';
    if (model.includes('Fall')) return '⚠️';
    return '🧠';
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.detection.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.camera.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || log.status === filterType;
    
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

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
              onChange={(e) => setSearchTerm(e.target.value)}
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
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
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
        <button style={{
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
        }}>
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
                Camera/Source
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
            {currentLogs.length > 0 ? (
              currentLogs.map((log, index) => (
                <tr key={log.id} style={{
                  borderTop: index === 0 ? 'none' : '1px solid #f0f2f5',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a4a6a' }}>
                    {log.timestamp}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#1a1a2e' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {log.camera.includes('Uploaded') ? '📁' : '📹'}
                      {log.camera}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a4a6a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{getModelIcon(log.model)}</span>
                      {log.model}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '500', color: '#1a1a2e' }}>
                    {log.detection}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: log.confidence > 90 ? '#22c55e' : log.confidence > 80 ? '#f59e0b' : '#ef4444'
                    }}>
                      {log.confidence}%
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{
                      fontSize: '12px',
                      color: getStatusColor(log.status),
                      fontWeight: '500'
                    }}>
                      {getStatusLabel(log.status)}
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
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                  No logs found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0'
        }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                style={{
                  padding: '8px 14px',
                  border: '1px solid',
                  borderRadius: '6px',
                  background: currentPage === i + 1 ? '#1a3a5c' : 'white',
                  borderColor: currentPage === i + 1 ? '#1a3a5c' : '#e8edf2',
                  color: currentPage === i + 1 ? 'white' : '#4a4a6a',
                  cursor: 'pointer',
                  fontWeight: currentPage === i + 1 ? '600' : '400'
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
    </div>
  );
};

export default RecognitionLogs;