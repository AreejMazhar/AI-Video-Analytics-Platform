import React, { useState, useEffect } from 'react';
import {
  FiCpu, FiToggleLeft, FiToggleRight, FiInfo, FiVideo,
  FiUpload, FiRefreshCw, FiAlertCircle, FiCheck
} from 'react-icons/fi';
import { modelService } from '../api/services/modelService';

const ModelLibrary = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchModels(); }, []);

  const fetchModels = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await modelService.getAllModels();
      setModels(data);
    } catch (err) {
      setError('Failed to load models. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const toggleModel = async (id) => {
    const modelToUpdate = models.find(m => m.id === id);
    if (!modelToUpdate) return;
    setModels(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
    setUpdating(id);
    try {
      await modelService.updateModel(id, { enabled: !modelToUpdate.enabled });
    } catch {
      setModels(prev => prev.map(m => m.id === id ? { ...m, enabled: modelToUpdate.enabled } : m));
      setError('Failed to update model.');
    } finally {
      setUpdating(null);
    }
  };

  const updateConfidence = async (id, value) => {
    const threshold = parseFloat(value);
    const modelToUpdate = models.find(m => m.id === id);
    if (!modelToUpdate) return;
    setModels(prev => prev.map(m => m.id === id ? { ...m, confidence_threshold: threshold } : m));
    try {
      await modelService.updateModel(id, { confidence_threshold: threshold });
    } catch {
      setModels(prev => prev.map(m => m.id === id ? { ...m, confidence_threshold: modelToUpdate.confidence_threshold } : m));
    }
  };

  const getModelIcon = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('face')) return '👤';
    if (n.includes('vehicle') || n.includes('license')) return '🚗';
    if (n.includes('ppe') || n.includes('safety')) return '⛑️';
    if (n.includes('fire') || n.includes('smoke')) return '🔥';
    if (n.includes('fall')) return '⚠️';
    if (n.includes('crowd')) return '👥';
    return '🧠';
  };

  const filteredModels = models.filter(m => {
    if (filter === 'enabled') return m.enabled;
    if (filter === 'disabled') return !m.enabled;
    if (filter === 'live') return m.mode === 'both';
    if (filter === 'video') return m.mode === 'video';
    return true;
  });

  const enabledCount = models.filter(m => m.enabled).length;
  const liveCount = models.filter(m => m.mode === 'both').length;
  const videoCount = models.filter(m => m.mode === 'video').length;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading AI Models...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">AI Model Library</h1>
          <p className="page-subtitle">Enable, disable, and configure your AI detection models</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchModels}>
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="error-banner mb-16">
          <FiAlertCircle size={18} /> {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid-4 mb-28">
        {[
          { label: 'Total Models', value: models.length, icon: FiCpu, color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
          { label: 'Active Models', value: enabledCount, icon: FiCheck, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Live Stream', value: liveCount, icon: FiVideo, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
          { label: 'Video Only', value: videoCount, icon: FiUpload, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div>
              <p className="stat-label" style={{ marginBottom: 2 }}>{s.label}</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex mb-24" style={{ gap: '8px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: `All (${models.length})` },
          { key: 'enabled', label: `Active (${enabledCount})` },
          { key: 'disabled', label: `Disabled (${models.length - enabledCount})` },
          { key: 'live', label: `Live Stream (${liveCount})` },
          { key: 'video', label: `Video Only (${videoCount})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={filter === tab.key ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Model Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {filteredModels.map(model => (
          <div key={model.id} className="card" style={{
            borderColor: model.enabled ? 'rgba(16,185,129,0.3)' : 'var(--border)',
            transition: 'all 0.2s',
            opacity: model.enabled ? 1 : 0.8
          }}>
            {/* Model Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 46, height: 46, borderRadius: '12px',
                  background: model.enabled ? 'rgba(37,99,235,0.1)' : 'var(--surface-hover)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', flexShrink: 0
                }}>
                  {getModelIcon(model.name)}
                </div>
                <div>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    {model.name}
                  </h4>
                  <span className={`badge ${model.mode === 'both' ? 'badge-primary' : 'badge-warning'}`} style={{ marginTop: '4px' }}>
                    {model.mode === 'both' ? '📡 Live + Video' : '📹 Video Only'}
                  </span>
                </div>
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggleModel(model.id)}
                disabled={updating === model.id}
                style={{ background: 'none', border: 'none', cursor: updating === model.id ? 'not-allowed' : 'pointer', padding: '4px', opacity: updating === model.id ? 0.5 : 1 }}
              >
                {updating === model.id
                  ? <FiRefreshCw size={24} color="var(--text-muted)" style={{ animation: 'spin 1s linear infinite' }} />
                  : model.enabled
                    ? <FiToggleRight size={30} color="var(--success)" />
                    : <FiToggleLeft size={30} color="var(--text-muted)" />
                }
              </button>
            </div>

            {/* Description */}
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
              {model.description || 'AI-powered detection model for video analytics.'}
            </p>

            {/* Confidence Threshold */}
            <div style={{ padding: '14px 0 0', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Confidence Threshold
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>
                  {Math.round((model.confidence_threshold || 0.5) * 100)}%
                </span>
              </div>
              <input
                type="range" min="0.1" max="0.95" step="0.05"
                value={model.confidence_threshold || 0.5}
                onChange={(e) => updateConfidence(model.id, e.target.value)}
                disabled={!model.enabled || updating === model.id}
                style={{ width: '100%', marginTop: '4px', accentColor: 'var(--primary)', opacity: model.enabled ? 1 : 0.5 }}
              />
            </div>

            {/* Status */}
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={`status-dot ${model.enabled ? 'status-online' : 'status-offline'}`}>
                {model.enabled ? 'Active' : 'Disabled'}
              </span>
              <button className="btn btn-ghost btn-sm">
                <FiInfo size={13} /> Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredModels.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🤖</div>
          <p style={{ fontWeight: 600 }}>No models found</p>
          <p className="text-sm">Try changing the filter or refreshing</p>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ModelLibrary;