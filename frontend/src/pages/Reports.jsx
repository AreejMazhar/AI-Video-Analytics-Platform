import React, { useState } from 'react';
import { 
  FiFileText, FiDownload, FiCalendar, FiFilter,
  FiPieChart, FiBarChart2, FiTrendingUp,
  FiChevronRight, FiClock, FiCheckCircle, FiXCircle
} from 'react-icons/fi';

const Reports = () => {
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState('today');

  // Mock reports data
  const reports = [
    { 
      id: 1, 
      name: 'Daily Detection Report', 
      type: 'daily', 
      date: '2024-07-13',
      status: 'generated',
      size: '2.4 MB',
      format: 'PDF'
    },
    { 
      id: 2, 
      name: 'Weekly Analytics Summary', 
      type: 'weekly', 
      date: '2024-07-07 - 2024-07-13',
      status: 'generated',
      size: '4.8 MB',
      format: 'PDF'
    },
    { 
      id: 3, 
      name: 'Monthly Performance Report', 
      type: 'monthly', 
      date: 'July 2024',
      status: 'pending',
      size: '-',
      format: '-'
    },
    { 
      id: 4, 
      name: 'Face Recognition Log', 
      type: 'custom', 
      date: '2024-07-10 - 2024-07-12',
      status: 'generated',
      size: '1.2 MB',
      format: 'CSV'
    },
    { 
      id: 5, 
      name: 'Alerts Summary Report', 
      type: 'weekly', 
      date: '2024-07-01 - 2024-07-07',
      status: 'generated',
      size: '3.1 MB',
      format: 'PDF'
    },
  ];

  const summaryStats = {
    totalReports: 24,
    generated: 18,
    pending: 4,
    failed: 2,
    totalSize: '156.8 MB'
  };

  const getStatusColor = (status) => {
    return status === 'generated' ? '#22c55e' : '#f59e0b';
  };

  const getStatusIcon = (status) => {
    return status === 'generated' ? <FiCheckCircle /> : <FiClock />;
  };

  const getReportIcon = (type) => {
    const icons = {
      daily: '📊',
      weekly: '📈',
      monthly: '📋',
      custom: '📑'
    };
    return icons[type] || '📄';
  };

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
            Reports
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Generate and download analytics reports
          </p>
        </div>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          background: '#1a3a5c',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '500'
        }}>
          <FiFileText size={18} />
          Generate New Report
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #e8edf2',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Total Reports</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#1a3a5c', margin: 0 }}>
            {summaryStats.totalReports}
          </p>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #e8edf2',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Generated</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#22c55e', margin: 0 }}>
            {summaryStats.generated}
          </p>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #e8edf2',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Pending</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b', margin: 0 }}>
            {summaryStats.pending}
          </p>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #e8edf2',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Total Size</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#4a90d9', margin: 0 }}>
            {summaryStats.totalSize}
          </p>
        </div>
      </div>

      {/* Report Generation Form */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #e8edf2',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a3a5c', marginBottom: '16px' }}>
          Generate Report
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e8edf2',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="daily">Daily Report</option>
              <option value="weekly">Weekly Report</option>
              <option value="monthly">Monthly Report</option>
              <option value="custom">Custom Report</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e8edf2',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
              Format
            </label>
            <select
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e8edf2',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel (.xlsx)</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button style={{
              width: '100%',
              padding: '10px',
              background: '#1a3a5c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}>
              <FiFileText style={{ marginRight: '6px' }} />
              Generate
            </button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e8edf2',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f0f2f5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a3a5c', margin: 0 }}>
            Recent Reports
          </h3>
          <span style={{ fontSize: '13px', color: '#4a90d9', cursor: 'pointer' }}>
            View All →
          </span>
        </div>

        {reports.map((report, index) => (
          <div key={report.id} style={{
            padding: '16px 20px',
            borderBottom: index < reports.length - 1 ? '1px solid #f0f2f5' : 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
          onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px'
              }}>
                {getReportIcon(report.type)}
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e', margin: 0 }}>
                  {report.name}
                </p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  <span>{report.date}</span>
                  <span>{report.format}</span>
                  <span>{report.size}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                color: getStatusColor(report.status),
                fontWeight: '500'
              }}>
                {getStatusIcon(report.status)}
                {report.status === 'generated' ? 'Ready' : 'Generating...'}
              </span>
              {report.status === 'generated' ? (
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  background: '#1a3a5c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}>
                  <FiDownload size={14} />
                  Download
                </button>
              ) : (
                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                  <FiClock /> Processing...
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;