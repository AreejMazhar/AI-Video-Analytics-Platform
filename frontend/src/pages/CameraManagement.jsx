import React, { useState, useEffect } from 'react';
import {
  FiPlus, FiEdit, FiTrash2, FiCamera, FiRefreshCw,
  FiCheckCircle, FiXCircle, FiAlertCircle, FiSave, FiX,
  FiWifi, FiMapPin, FiCpu, FiActivity
} from 'react-icons/fi';
import { cameraService } from '../api/services/cameraService';
import { modelService } from '../api/services/modelService';
import Modal from '../components/common/Modal';

const CameraManagement = () => {
  const [cameras, setCameras] = useState([]);
  const [allModels, setAllModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCameraId, setEditingCameraId] = useState(null);
  const [testing, setTesting] = useState(null);

  // Custom modal state
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'info', title: '', content: null, onConfirm: null });

  const [formData, setFormData] = useState({
    name: '', rtsp_url: '', location: '', status: 'offline',
    is_recording: false, confidence_threshold: 0.5, assigned_models: []
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [camerasData, modelsData] = await Promise.all([
        cameraService.getAllCameras(),
        modelService.getAllModels()
      ]);
      setCameras(camerasData);
      setAllModels(modelsData);
    } catch {
      setError('Failed to load cameras. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', rtsp_url: '', location: '', status: 'offline', is_recording: false, confidence_threshold: 0.5, assigned_models: [] });
    setEditingCameraId(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleModelToggle = (modelId) => {
    const current = formData.assigned_models || [];
    setFormData({
      ...formData,
      assigned_models: current.includes(modelId)
        ? current.filter(id => id !== modelId)
        : [...current, modelId]
    });
  };

  const handleAddCamera = async (e) => {
    e.preventDefault();
    try {
      const newCamera = await cameraService.createCamera(formData);
      setCameras([...cameras, newCamera]);
      setShowAddModal(false);
      resetForm();
      setModalConfig({
        isOpen: true, type: 'success',
        title: 'Camera Added',
        content: `Camera "${newCamera.name}" has been configured successfully.`
      });
    } catch {
      setModalConfig({
        isOpen: true, type: 'danger',
        title: 'Failed to Add Camera',
        content: 'Could not create camera stream profile.'
      });
    }
  };

  const handleEditCamera = (camera) => {
    setEditingCameraId(camera.id);
    setFormData({
      name: camera.name, rtsp_url: camera.rtsp_url,
      location: camera.location || '', status: camera.status || 'offline',
      is_recording: camera.is_recording || false,
      confidence_threshold: camera.confidence_threshold || 0.5,
      assigned_models: camera.assigned_models || []
    });
    setShowEditModal(true);
  };

  const handleUpdateCamera = async (e) => {
    e.preventDefault();
    try {
      const updated = await cameraService.updateCamera(editingCameraId, formData);
      setCameras(cameras.map(c => c.id === editingCameraId ? updated : c));
      setShowEditModal(false);
      resetForm();
      setModalConfig({
        isOpen: true, type: 'success',
        title: 'Camera Updated',
        content: `Camera settings for "${updated.name}" updated successfully.`
      });
    } catch {
      setModalConfig({
        isOpen: true, type: 'danger',
        title: 'Update Failed',
        content: 'Could not update camera settings.'
      });
    }
  };

  const handleDeleteCamera = (camera) => {
    setModalConfig({
      isOpen: true, type: 'confirm',
      title: 'Delete Camera?',
      content: `Are you sure you want to remove "${camera.name}"? Active stream links will be disconnected.`,
      onConfirm: async () => {
        try {
          await cameraService.deleteCamera(camera.id);
          setCameras(cameras.filter(c => c.id !== camera.id));
        } catch {
          setModalConfig({
            isOpen: true, type: 'danger',
            title: 'Delete Failed',
            content: 'Could not delete camera.'
          });
        }
      }
    });
  };

  const handleTestConnection = async (cameraId) => {
    setTesting(cameraId);
    try {
      const result = await cameraService.testConnection(cameraId);
      if (result.success) {
        setModalConfig({
          isOpen: true, type: 'success',
          title: 'Connection Successful',
          content: 'Successfully connected to the RTSP camera stream feed.'
        });
      } else {
        setModalConfig({
          isOpen: true, type: 'warning',
          title: 'Connection Failed',
          content: 'Unable to connect. Please check the RTSP URL or network link.'
        });
      }
    } catch {
      setModalConfig({
        isOpen: true, type: 'danger',
        title: 'Test Failed',
        content: 'Camera stream test encounterd a network error.'
      });
    } finally {
      setTesting(null);
    }
  };

  const onlineCount = cameras.filter(c => c.status === 'online').length;
  const recordingCount = cameras.filter(c => c.is_recording).length;

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading cameras…</p></div>;

  const CameraFormModal = ({ title, onSubmit }) => (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: '24px', overflowY: 'auto'
    }}>
      <div style={{
        background: 'white', borderRadius: '20px',
        padding: '28px 32px', width: '100%', maxWidth: '520px',
        margin: 'auto',
        animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        position: 'relative'
      }}>
        <div className="flex-between mb-20">
          <h2 style={{ fontSize: '19px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{title}</h2>
          <button className="navbar-icon-btn" onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}>
            <FiX size={17} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="grid-2" style={{ gap: '10px' }}>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">Camera Name *</label>
              <input className="form-input" name="name" value={formData.name} onChange={handleFormChange} placeholder="Entrance Camera" required />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">Location</label>
              <input className="form-input" name="location" value={formData.location} onChange={handleFormChange} placeholder="Main Entrance" />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label">RTSP Stream URL *</label>
            <input className="form-input" name="rtsp_url" value={formData.rtsp_url} onChange={handleFormChange} placeholder="rtsp://192.168.1.100:554/stream" required />
          </div>
          <div className="grid-2" style={{ gap: '10px' }}>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">Status</label>
              <select className="form-input form-select" name="status" value={formData.status} onChange={handleFormChange}>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">Confidence Threshold</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="range" name="confidence_threshold" min="0.1" max="0.95" step="0.05"
                  value={formData.confidence_threshold}
                  onChange={handleFormChange}
                  style={{ flex: 1, accentColor: 'var(--primary)' }}
                />
                <span style={{ fontWeight: 700, color: 'var(--primary)', minWidth: '35px', fontSize: '13px' }}>
                  {Math.round(formData.confidence_threshold * 100)}%
                </span>
              </div>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" name="is_recording" checked={formData.is_recording} onChange={handleFormChange} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
              Enable Recording Mode
            </label>
          </div>
          {/* Model Assignment */}
          {allModels.length > 0 && (
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Assign AI Models</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '6px' }}>
                {allModels.filter(m => m.enabled).map(m => (
                  <label key={m.id} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '6px 10px', borderRadius: '8px', cursor: 'pointer',
                    background: formData.assigned_models?.includes(m.id) ? 'rgba(37,99,235,0.08)' : 'var(--background)',
                    border: `1px solid ${formData.assigned_models?.includes(m.id) ? 'rgba(37,99,235,0.3)' : 'var(--border)'}`,
                    transition: 'all 0.15s', fontSize: '12px', fontWeight: 500
                  }}>
                    <input type="checkbox" checked={formData.assigned_models?.includes(m.id)} onChange={() => handleModelToggle(m.id)} style={{ accentColor: 'var(--primary)' }} />
                    {m.name}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex" style={{ gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {showAddModal ? <><FiPlus size={15} /> Add Camera</> : <><FiSave size={15} /> Update Camera</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Camera Management</h1>
          <p className="page-subtitle">Configure and monitor all connected camera streams</p>
        </div>
        <div className="flex" style={{ gap: '10px' }}>
          <button className="btn btn-secondary" onClick={fetchData}><FiRefreshCw size={14} /> Refresh</button>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowAddModal(true); }}>
            <FiPlus size={15} /> Add Camera
          </button>
        </div>
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
          { label: 'Total Cameras',   value: cameras.length,  icon: FiCamera,   color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
          { label: 'Online',          value: onlineCount,      icon: FiWifi,     color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Offline',         value: cameras.length - onlineCount, icon: FiXCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
          { label: 'Recording',       value: recordingCount,  icon: FiActivity, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
            <div style={{ width: 42, height: 42, borderRadius: '11px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div>
              <p className="stat-label" style={{ marginBottom: 2 }}>{s.label}</p>
              <p style={{ fontSize: '22px', fontWeight: 700, color: s.color, letterSpacing: '-0.5px' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cameras Grid */}
      {cameras.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
          <p style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>No cameras configured</p>
          <p className="text-sm">Click "Add Camera" to get started</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '20px' }}>
          {cameras.map(camera => (
            <div key={camera.id} className="card" style={{ borderColor: camera.status === 'online' ? 'rgba(16,185,129,0.2)' : 'var(--border)' }}>
              {/* Camera Preview */}
              <div style={{
                height: '140px', borderRadius: '10px', marginBottom: '16px',
                background: '#0f172a', position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} />
                <FiCamera size={36} color={camera.status === 'online' ? '#10b981' : 'rgba(255,255,255,0.2)'} />
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '99px'
                }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: camera.status === 'online' ? '#10b981' : '#ef4444',
                    display: 'inline-block',
                    boxShadow: camera.status === 'online' ? '0 0 6px #10b981' : 'none'
                  }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'white', textTransform: 'uppercase' }}>
                    {camera.status}
                  </span>
                </div>
                {camera.is_recording && (
                  <div style={{
                    position: 'absolute', top: 10, left: 10,
                    background: 'rgba(239,68,68,0.9)', padding: '3px 9px',
                    borderRadius: '99px', fontSize: '10px', fontWeight: 700, color: 'white'
                  }}>
                    ● REC
                  </div>
                )}
              </div>

              {/* Camera Info */}
              <div className="flex-between mb-8">
                <h4 style={{ fontWeight: 700, fontSize: '15px', margin: 0 }}>{camera.name}</h4>
                <span className="badge badge-muted" style={{ fontSize: '11px' }}>
                  {Math.round((camera.confidence_threshold || 0.5) * 100)}% threshold
                </span>
              </div>

              {camera.location && (
                <p className="text-sm text-muted flex" style={{ gap: '5px', marginBottom: '8px' }}>
                  <FiMapPin size={13} /> {camera.location}
                </p>
              )}

              <p className="text-xs text-muted" style={{ marginBottom: '12px', wordBreak: 'break-all' }}>
                {camera.rtsp_url || 'No RTSP URL configured'}
              </p>

              {/* Assigned models */}
              {camera.assigned_models?.length > 0 && (
                <div className="flex mb-12" style={{ gap: '4px', flexWrap: 'wrap' }}>
                  <FiCpu size={13} color="var(--text-muted)" style={{ marginTop: '2px' }} />
                  <span className="text-xs text-muted">
                    {camera.assigned_models.length} model{camera.assigned_models.length !== 1 ? 's' : ''} assigned
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex" style={{ gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => handleEditCamera(camera)}>
                  <FiEdit size={13} /> Edit
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleTestConnection(camera.id)}
                  disabled={testing === camera.id}
                >
                  {testing === camera.id ? <FiRefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <FiCheckCircle size={13} />}
                </button>
                <button
                  className="btn btn-sm"
                  style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }}
                  onClick={() => handleDeleteCamera(camera)}
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && <CameraFormModal title="Add New Camera" onSubmit={handleAddCamera} />}
      {showEditModal && <CameraFormModal title="Edit Camera" onSubmit={handleUpdateCamera} />}

      {/* Reusable Custom Modal */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        title={modalConfig.title}
        onConfirm={modalConfig.onConfirm}
      >
        {modalConfig.content}
      </Modal>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default CameraManagement;