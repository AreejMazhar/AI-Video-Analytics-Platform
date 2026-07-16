import React, { useState, useEffect } from 'react';
import { 
  FiFileText, FiDownload, FiCalendar, FiFilter,
  FiPieChart, FiBarChart2, FiTrendingUp,
  FiChevronRight, FiClock, FiCheckCircle, FiXCircle,
  FiPlus, FiTrash2
} from 'react-icons/fi';
import { reportService } from '../api/services/reportService';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    generated: 0,
    pending: 0,
    failed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(null);
  
  // Form state for generating report
  const [formData, setFormData] = useState({
    name: '',
    report_type: 'daily',
    date_range: { start: '', end: '' },
    format: 'csv'
  });
  const [showGenerateForm, setShowGenerateForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reportsData, statsData] = await Promise.all([
        reportService.getAllReports(),
        reportService.getStats()
      ]);
      setReports(reportsData);
      setStats(statsData);
      console.log('✅ Reports data loaded:', reportsData.length);
    } catch (err) {
      console.error('❌ Error fetching reports:', err);
      setError('Failed to load reports. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      date_range: { ...formData.date_range, [name]: value }
    });
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      // Ensure date_range has proper values or use null
      const reportData = {
        name: formData.name,
        report_type: formData.report_type,
        format: formData.format,
        date_range: formData.date_range.start && formData.date_range.end ? formData.date_range : null
      };
      
      const newReport = await reportService.generateReport(reportData);
      setReports([newReport, ...reports]);
      setShowGenerateForm(false);
      setFormData({
        name: '',
        report_type: 'daily',
        date_range: { start: '', end: '' },
        format: 'csv'
      });
      const statsData = await reportService.getStats();
      setStats(statsData);
      alert('✅ Report generated successfully!');
    } catch (err) {
      alert('❌ Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (reportId) => {
    setDownloading(reportId);
    try {
      await reportService.downloadReport(reportId);
    } catch (err) {
      alert('❌ Failed to download report. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await reportService.deleteReport(reportId);
      setReports(reports.filter(r => r.id !== reportId));
      const statsData = await reportService.getStats();
      setStats(statsData);
      alert('✅ Report deleted successfully!');
    } catch (err) {
      alert('❌ Failed to delete report. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    return status === 'generated' ? '#22c55e' : status === 'pending' ? '#f59e0b' : '#ef4444';
  };

  const getStatusIcon = (status) => {
    return status === 'generated' ? <FiCheckCircle /> : status === 'pending' ? <FiClock /> : <FiXCircle />;
  };

  const getStatusLabel = (status) => {
    return status === 'generated' ? 'Ready' : status === 'pending' ? 'Generating...' : 'Failed';
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
          <p style={{ color: '#6b7280' }}>Loading reports...</p>
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
            onClick={fetchData}
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
        <button
          onClick={() => setShowGenerateForm(true)}
          style={{
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
          }}
        >
          <FiPlus size={18} />
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
            {stats.total}
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
            {stats.generated}
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
            {stats.pending}
          </p>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #e8edf2',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Failed</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444', margin: 0 }}>
            {stats.failed}
          </p>
        </div>
      </div>

      {/* Generate Report Form Modal */}
      {showGenerateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1a3a5c', marginBottom: '20px' }}>
              Generate Report
            </h2>
            <form onSubmit={handleGenerateReport}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Report Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="e.g., Weekly Detection Report"
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Report Type *
                </label>
                <select
                  name="report_type"
                  value={formData.report_type}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Date Range
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input
                    type="date"
                    name="start"
                    value={formData.date_range.start}
                    onChange={handleDateChange}
                    style={{
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <input
                    type="date"
                    name="end"
                    value={formData.date_range.end}
                    onChange={handleDateChange}
                    style={{
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Format *
                </label>
                <select
                  name="format"
                  value={formData.format}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF (HTML)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowGenerateForm(false);
                    setFormData({
                      name: '',
                      report_type: 'daily',
                      date_range: { start: '', end: '' },
                      format: 'csv'
                    });
                  }}
                  style={{
                    padding: '10px 24px',
                    background: '#f5f7fa',
                    border: '1px solid #e8edf2',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#4a4a6a'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  style={{
                    padding: '10px 24px',
                    background: '#1a3a5c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    opacity: generating ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {generating ? 'Generating...' : <><FiFileText /> Generate</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e8edf2',
        overflow: 'hidden'
      }}>
        {reports.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6b7280'
          }}>
            <FiFileText size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p style={{ fontSize: '16px' }}>No reports generated yet</p>
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>Click "Generate New Report" to get started</p>
          </div>
        ) : (
          reports.map((report, index) => (
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
                  {getReportIcon(report.report_type)}
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e', margin: 0 }}>
                    {report.name}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    <span>{report.report_type?.charAt(0).toUpperCase() + report.report_type?.slice(1) || 'Custom'}</span>
                    <span>{report.format?.toUpperCase() || 'CSV'}</span>
                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
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
                  {getStatusLabel(report.status)}
                </span>
                {report.status === 'generated' && (
                  <button                    onClick={() => handleDownload(report.id)}
                    disabled={downloading === report.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      background: '#1a3a5c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: downloading === report.id ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      opacity: downloading === report.id ? 0.6 : 1
                    }}
                  >
                    <FiDownload size={14} />
                    {downloading === report.id ? 'Downloading...' : 'Download'}
                  </button>
                )}
                {report.status === 'pending' && (
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>
                    <FiClock /> Processing...
                  </span>
                )}
                <button
                  onClick={() => handleDelete(report.id)}
                  style={{
                    padding: '6px',
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer'
                  }}
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
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

export default Reports;