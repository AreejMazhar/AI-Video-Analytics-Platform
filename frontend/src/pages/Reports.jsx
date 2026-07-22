import React, { useState, useEffect } from 'react';
import {
  FiFileText, FiDownload, FiPlus, FiTrash2,
  FiClock, FiCheckCircle, FiXCircle, FiX, FiAlertCircle
} from 'react-icons/fi';
import { reportService } from '../api/services/reportService';
import Modal from '../components/common/Modal';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, generated: 0, pending: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // Custom Modal notification / confirmation states
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'info', title: '', content: null, onConfirm: null });

  const [formData, setFormData] = useState({
    name: '', report_type: 'daily',
    date_range: { start: '', end: '' }, format: 'pdf'
  });

  useEffect(() => { fetchData(); }, []);

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
    } catch { setError('Failed to load reports.'); }
    finally { setLoading(false); }
  };

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleDateChange = (e) => setFormData({ ...formData, date_range: { ...formData.date_range, [e.target.name]: e.target.value } });

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const payload = {
        name: formData.name, report_type: formData.report_type, format: formData.format,
        date_range: formData.date_range.start && formData.date_range.end ? formData.date_range : null
      };
      const newReport = await reportService.generateReport(payload);
      setReports([newReport, ...reports]);
      setShowForm(false);
      setFormData({ name: '', report_type: 'daily', date_range: { start: '', end: '' }, format: 'pdf' });
      const s = await reportService.getStats();
      setStats(s);

      setModalConfig({
        isOpen: true, type: 'success',
        title: 'Report Generated',
        content: `Your report "${newReport.name}" has been generated successfully and is ready for download.`
      });
    } catch {
      setModalConfig({
        isOpen: true, type: 'danger',
        title: 'Generation Failed',
        content: 'Failed to generate report. Please verify parameters and try again.'
      });
    }
    finally { setGenerating(false); }
  };

  const handleDownload = async (r) => {
    setDownloading(r.id);
    try {
      const result = await reportService.downloadReport(r.id, r.format);
      const ext = r.format === 'csv' ? 'csv' : 'html';
      const displayName = result?.filename || `${r.name}.${ext}`;
      setModalConfig({
        isOpen: true, type: 'success',
        title: 'Download Started',
        content: `"${displayName}" is being downloaded. Open it in your browser for a full styled report.`
      });
    }
    catch {
      setModalConfig({
        isOpen: true, type: 'danger',
        title: 'Download Failed',
        content: 'Could not download the requested report file.'
      });
    }
    finally { setDownloading(null); }
  };

  const handleDelete = (r) => {
    setModalConfig({
      isOpen: true, type: 'confirm',
      title: 'Delete Report?',
      content: `Are you sure you want to delete "${r.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await reportService.deleteReport(r.id);
          setReports(prev => prev.filter(x => x.id !== r.id));
          const s = await reportService.getStats();
          setStats(s);
        } catch {
          setModalConfig({
            isOpen: true, type: 'danger',
            title: 'Delete Failed',
            content: 'Failed to delete report.'
          });
        }
      }
    });
  };

  const getReportIcon = (type) => ({ daily: '📊', weekly: '📈', monthly: '📋', custom: '📑' }[type] || '📄');

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading reports…</p></div>;

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Generate, download, and manage analytics reports</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <FiPlus size={15} /> Generate Report
        </button>
      </div>

      {error && (
        <div className="error-banner mb-16">
          <FiAlertCircle size={18} /> {error}
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setError(null)}><FiX size={14} /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid-4 mb-24">
        {[
          { label: 'Total Reports', value: stats.total,     color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
          { label: 'Ready',         value: stats.generated, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Pending',       value: stats.pending,   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Failed',        value: stats.failed,    color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', padding: '18px 20px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <FiFileText size={18} color={s.color} />
            </div>
            <p style={{ fontSize: '24px', fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
            <p className="text-sm text-muted" style={{ marginTop: '4px' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Reports List */}
      <div className="table-container">
        {reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📄</div>
            <p style={{ fontWeight: 600 }}>No reports yet</p>
            <p className="text-sm">Click "Generate Report" to create your first report</p>
          </div>
        ) : (
          reports.map((r, i) => (
            <div key={r.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px', flexWrap: 'wrap', gap: '12px',
              borderBottom: i < reports.length - 1 ? '1px solid var(--border)' : 'none',
              transition: 'background 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--background)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: 44, height: 44, borderRadius: '10px', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                  {getReportIcon(r.report_type)}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '14px', margin: 0 }}>{r.name}</p>
                  <div className="flex" style={{ gap: '14px', marginTop: '4px' }}>
                    <span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>{r.report_type}</span>
                    <span className="badge badge-muted">{r.format?.toUpperCase()}</span>
                    <span className="text-xs text-muted">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex" style={{ gap: '10px', alignItems: 'center' }}>
                {r.status === 'generated' && (
                  <span className="status-dot status-online text-sm">Ready</span>
                )}
                {r.status === 'pending' && (
                  <span className="badge badge-warning"><FiClock size={11} style={{ marginRight: 4 }} />Generating</span>
                )}
                {r.status === 'failed' && (
                  <span className="badge badge-danger"><FiXCircle size={11} style={{ marginRight: 4 }} />Failed</span>
                )}
                {r.status === 'generated' && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleDownload(r)} disabled={downloading === r.id}>
                    <FiDownload size={13} /> {downloading === r.id ? '…' : 'Download'}
                  </button>
                )}
                <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }} onClick={() => handleDelete(r)}>
                  <FiTrash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Generate Report Modal — flex-start so tall viewports never clip top */}
      {showForm && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            zIndex: 2000, padding: '40px 24px', overflowY: 'auto'
          }}
          onClick={() => setShowForm(false)}
        >
          <div
            style={{
              background: 'var(--surface)', borderRadius: '20px',
              padding: '28px 32px', width: '100%', maxWidth: '460px',
              animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex-between mb-20">
              <h2 style={{ fontSize: '19px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Generate New Report</h2>
              <button className="navbar-icon-btn" onClick={() => setShowForm(false)}><FiX size={17} /></button>
            </div>
            <form onSubmit={handleGenerate}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Report Name *</label>
                <input className="form-input" type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="Weekly Detection Report" required />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Report Type *</label>
                <select className="form-input form-select" name="report_type" value={formData.report_type} onChange={handleFormChange}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Date Range (optional)</label>
                <div className="grid-2" style={{ gap: '10px' }}>
                  <input className="form-input" type="date" name="start" value={formData.date_range.start} onChange={handleDateChange} />
                  <input className="form-input" type="date" name="end"   value={formData.date_range.end}   onChange={handleDateChange} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Format *</label>
                <select className="form-input form-select" name="format" value={formData.format} onChange={handleFormChange}>
                  <option value="pdf">PDF / HTML Report (.html)</option>
                  <option value="csv">CSV Spreadsheet (.csv)</option>
                </select>
              </div>
              <div className="flex" style={{ gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={generating}>
                  <FiFileText size={14} /> {generating ? 'Generating…' : 'Generate Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable Custom Modal for Alert / Confirmations */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        title={modalConfig.title}
        onConfirm={modalConfig.onConfirm}
      >
        {modalConfig.content}
      </Modal>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
};

export default Reports;