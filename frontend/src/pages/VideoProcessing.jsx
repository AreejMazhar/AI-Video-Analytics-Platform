import React, { useState } from 'react';
import {
  FiUpload, FiPlay, FiStopCircle, FiDownload, FiTrash2,
  FiClock, FiCheckCircle, FiAlertCircle, FiCpu, FiVideo,
  FiFilm, FiActivity
} from 'react-icons/fi';
import Modal from '../components/common/Modal';

const modelOptions = [
  { id: 'faceDetection',   label: 'Face Detection',     icon: '👤' },
  { id: 'faceRecognition', label: 'Face Recognition',   icon: '🪪' },
  { id: 'person',          label: 'Person Detection',   icon: '🚶' },
  { id: 'vehicle',         label: 'Vehicle Detection',  icon: '🚗' },
  { id: 'ppe',             label: 'PPE Detection',      icon: '⛑️' },
  { id: 'fire',            label: 'Fire & Smoke',       icon: '🔥' },
  { id: 'intrusion',       label: 'Intrusion Detection',icon: '🚫' },
  { id: 'crowd',           label: 'Crowd Detection',    icon: '👥' },
  { id: 'fall',            label: 'Fall Detection',     icon: '⚠️' },
  { id: 'abandonedObject', label: 'Abandoned Object',   icon: '🧳' },
  { id: 'license',         label: 'License Plate',      icon: '📋' },
];

const VideoProcessing = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('idle');
  const [selectedModels, setSelectedModels] = useState({
    faceDetection: true, faceRecognition: true, person: true,
    vehicle: true, ppe: false, fire: false, intrusion: false,
    crowd: false, fall: false, abandonedObject: false, license: false
  });
  const [processedVideos, setProcessedVideos] = useState([
    { id: 1, name: 'Office_Full_Footage.mp4', date: '2024-07-13', models: ['Face Detection', 'Person Detection'], status: 'completed', detections: 342, alerts: 5, duration: '12:34' },
    { id: 2, name: 'Warehouse_Evening.mp4',   date: '2024-07-12', models: ['PPE Detection', 'Fire & Smoke'],     status: 'processing', detections: 0, alerts: 0, duration: '08:21' },
    { id: 3, name: 'Parking_Lot.mp4',         date: '2024-07-11', models: ['Vehicle Detection', 'License Plate'], status: 'completed', detections: 156, alerts: 2, duration: '15:45' },
  ]);

  // Custom modal state
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'info', title: '', content: null, onConfirm: null });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) { setSelectedVideo(file); setProcessingStatus('idle'); setProgress(0); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedVideo(file); setProcessingStatus('idle'); setProgress(0);
    }
  };

  const handleProcess = () => {
    const activeModels = Object.entries(selectedModels).filter(([, v]) => v);
    if (!selectedVideo) {
      return setModalConfig({
        isOpen: true, type: 'warning',
        title: 'No Video Selected',
        content: 'Please upload or drop a video file before starting analysis.'
      });
    }
    if (activeModels.length === 0) {
      return setModalConfig({
        isOpen: true, type: 'warning',
        title: 'No Models Selected',
        content: 'Please check at least one AI detection model to run.'
      });
    }
    setProcessing(true);
    setProcessingStatus('processing');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setProcessing(false);
          setProcessingStatus('complete');
          return 100;
        }
        return p + 2;
      });
    }, 150);
  };

  const handleRemoveVideo = (v) => {
    setModalConfig({
      isOpen: true, type: 'confirm',
      title: 'Remove Video Record?',
      content: `Are you sure you want to remove "${v.name}" from the processing queue?`,
      onConfirm: () => setProcessedVideos(list => list.filter(x => x.id !== v.id))
    });
  };

  const selectedCount = Object.values(selectedModels).filter(Boolean).length;

  const statusBadge = (s) => {
    if (s === 'completed') return <span className="badge badge-success"><FiCheckCircle size={11} style={{ marginRight: 4 }} />Completed</span>;
    if (s === 'processing') return <span className="badge badge-primary"><FiActivity size={11} style={{ marginRight: 4 }} />Processing</span>;
    return <span className="badge badge-danger"><FiAlertCircle size={11} style={{ marginRight: 4 }} />Error</span>;
  };

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Video Processing</h1>
        <p className="page-subtitle">Upload video files and run AI detection models on them</p>
      </div>

      <div className="grid-2-1">
        {/* Upload & Config Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('video-upload').click()}
            style={{
              border: `2px dashed ${selectedVideo ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '36px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: selectedVideo ? 'rgba(37,99,235,0.04)' : 'var(--background)',
              transition: 'all 0.2s'
            }}
          >
            <input id="video-upload" type="file" accept="video/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            {selectedVideo ? (
              <>
                <div style={{ width: 52, height: 52, borderRadius: '12px', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <FiFilm size={24} color="var(--primary)" />
                </div>
                <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{selectedVideo.name}</p>
                <p className="text-sm text-muted">{(selectedVideo.size / (1024 * 1024)).toFixed(1)} MB · Click to change</p>
              </>
            ) : (
              <>
                <div style={{ width: 52, height: 52, borderRadius: '12px', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <FiUpload size={24} color="var(--text-muted)" />
                </div>
                <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '6px' }}>Drop your video here</p>
                <p className="text-sm text-muted">or click to browse · MP4, AVI, MOV, MKV supported</p>
              </>
            )}
          </div>

          {/* Model Selection */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><FiCpu size={15} style={{ marginRight: 6 }} />Select AI Models</h3>
              <span className="badge badge-primary">{selectedCount} selected</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '8px' }}>
              {modelOptions.map(m => (
                <label key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                  background: selectedModels[m.id] ? 'rgba(37,99,235,0.07)' : 'var(--background)',
                  border: `1px solid ${selectedModels[m.id] ? 'rgba(37,99,235,0.3)' : 'var(--border)'}`,
                  transition: 'all 0.15s'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedModels[m.id]}
                    onChange={() => setSelectedModels(p => ({ ...p, [m.id]: !p[m.id] }))}
                    style={{ accentColor: 'var(--primary)', width: 15, height: 15 }}
                  />
                  <span style={{ fontSize: '16px' }}>{m.icon}</span>
                  <span style={{ fontSize: '12.5px', fontWeight: 500 }}>{m.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Process Button */}
          <button
            className="btn btn-primary"
            onClick={handleProcess}
            disabled={processing || !selectedVideo}
            style={{ width: '100%', padding: '14px', fontSize: '15px' }}
          >
            {processing
              ? <><FiActivity size={16} /> Processing…</>
              : <><FiPlay size={16} /> Start Processing</>
            }
          </button>
        </div>

        {/* Progress / Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Status Card */}
          <div className="card">
            <h3 className="card-title mb-16">Processing Status</h3>
            {processingStatus === 'idle' && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                <FiClock size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
                <p className="text-sm">Upload a video and select models to begin</p>
              </div>
            )}
            {processingStatus === 'processing' && (
              <div>
                <div className="flex-between mb-8">
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Analyzing video…</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>{progress}%</span>
                </div>
                <div style={{ height: '10px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${progress}%`,
                    background: 'linear-gradient(90deg, #2563eb, #06b6d4)',
                    borderRadius: '99px', transition: 'width 0.15s ease'
                  }} />
                </div>
                <p className="text-sm text-muted" style={{ marginTop: '10px' }}>Running {selectedCount} model{selectedCount !== 1 ? 's' : ''} on {selectedVideo?.name}</p>
              </div>
            )}
            {processingStatus === 'complete' && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <FiCheckCircle size={24} color="var(--success)" />
                </div>
                <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--success)' }}>Processing Complete!</p>
                <p className="text-sm text-muted" style={{ marginTop: '4px' }}>Results saved to Detection Logs</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h3 className="card-title mb-16">Queue Overview</h3>
            {[
              { label: 'Total Processed', value: processedVideos.filter(v => v.status === 'completed').length, color: '#10b981' },
              { label: 'In Progress',     value: processedVideos.filter(v => v.status === 'processing').length, color: '#2563eb' },
              { label: 'Total Detections',value: processedVideos.reduce((a, v) => a + v.detections, 0), color: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} className="flex-between" style={{ padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <span className="text-sm text-muted">{s.label}</span>
                <span style={{ fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Processed Videos Table */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title"><FiVideo size={15} style={{ marginRight: 6 }} />Processed Videos</h3>
          <span className="text-sm text-muted">{processedVideos.length} total</span>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Video File</th>
              <th>Models Used</th>
              <th>Date</th>
              <th style={{ textAlign: 'center' }}>Detections</th>
              <th style={{ textAlign: 'center' }}>Alerts</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {processedVideos.map((v) => (
              <tr key={v.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiFilm size={15} color="var(--primary)" />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '13px', margin: 0 }}>{v.name}</p>
                      <p className="text-xs text-muted">{v.duration}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {v.models.slice(0, 2).map((m, i) => (
                      <span key={i} className="badge badge-muted" style={{ fontSize: '11px' }}>{m}</span>
                    ))}
                    {v.models.length > 2 && <span className="badge badge-muted" style={{ fontSize: '11px' }}>+{v.models.length - 2}</span>}
                  </div>
                </td>
                <td className="text-sm text-muted">{v.date}</td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{v.detections.toLocaleString()}</td>
                <td style={{ textAlign: 'center' }}>
                  {v.alerts > 0 ? <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{v.alerts}</span> : '—'}
                </td>
                <td style={{ textAlign: 'center' }}>{statusBadge(v.status)}</td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                    {v.status === 'completed' && (
                      <button className="btn btn-secondary btn-sm">
                        <FiDownload size={13} />
                      </button>
                    )}
                    <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }} onClick={() => handleRemoveVideo(v)}>
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default VideoProcessing;