import React, { useState, useEffect, useRef } from 'react';
import {
  FiUpload, FiPlay, FiDownload, FiTrash2,
  FiClock, FiCheckCircle, FiAlertCircle, FiVideo,
  FiFilm, FiActivity, FiEye, FiX, FiZap,
} from 'react-icons/fi';
import Modal from '../components/common/Modal';
import { videoService } from '../api/services/videoService';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const fmtPct  = (v) => `${Math.round((v ?? 0) * 100)}%`;
const fmtTime = (s) => {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toFixed(1).padStart(4, '0');
  return `${m}:${sec}`;
};
const fmtSize = (bytes) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const confColor = (c) => {
  if (c >= 0.85) return 'var(--success)';
  if (c >= 0.65) return 'var(--warning)';
  return 'var(--danger)';
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color = 'var(--primary)', icon }) => (
  <div style={{
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '18px 20px',
    display: 'flex', alignItems: 'center', gap: '14px',
    boxShadow: 'var(--shadow-sm)',
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 10, flexShrink: 0,
      background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ color, fontSize: 20 }}>{icon}</span>
    </div>
    <div>
      <p style={{ fontSize: 22, fontWeight: 800, color, margin: 0, lineHeight: 1.1 }}>{value}</p>
      <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{sub}</p>}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const VideoProcessing = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [dragOver, setDragOver]           = useState(false);
  const [phase, setPhase]                 = useState('idle'); // idle | uploading | processing | complete | error
  const [uploadPct, setUploadPct]         = useState(0);
  const [processPct, setProcessPct]       = useState(0);
  const [result, setResult]               = useState(null);
  const [history, setHistory]             = useState([]);
  const [lightbox, setLightbox]           = useState(null); // thumbnail URL string or null
  const [modalConfig, setModalConfig]     = useState({ isOpen: false });
  const processTimerRef                   = useRef(null);
  const currentJobRef                     = useRef(null);

  // cleanup on unmount
  useEffect(() => () => {
    clearInterval(processTimerRef.current);
    if (currentJobRef.current) videoService.cleanupJob(currentJobRef.current);
  }, []);

  // ─── File Handling ──────────────────────────────────────────────────────────
  const acceptFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setModalConfig({ isOpen: true, type: 'warning', title: 'Invalid File', content: 'Please select a video file (MP4, AVI, MOV, MKV).' });
      return;
    }
    setSelectedVideo(file);
    setPhase('idle');
    setResult(null);
    setUploadPct(0);
    setProcessPct(0);
  };

  const handleFileInput = (e) => acceptFile(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); acceptFile(e.dataTransfer.files[0]); };

  const removeVideo = () => {
    if (phase === 'uploading' || phase === 'processing') return;
    setSelectedVideo(null);
    setPhase('idle');
    setResult(null);
  };

  // ─── Processing ─────────────────────────────────────────────────────────────
  const startProcessing = async () => {
    if (!selectedVideo || phase === 'uploading' || phase === 'processing') return;

    // Cleanup previous job thumbnails if any
    if (currentJobRef.current) {
      await videoService.cleanupJob(currentJobRef.current);
      currentJobRef.current = null;
    }

    setResult(null);
    setUploadPct(0);
    setProcessPct(0);
    setPhase('uploading');

    try {
      // Phase 1: upload (real progress)
      const data = await videoService.processVideo(selectedVideo, (pct) => {
        setUploadPct(pct);
        if (pct >= 100) {
          // Upload done → switch to processing phase with animated bar
          setPhase('processing');
          setProcessPct(0);
          let p = 0;
          processTimerRef.current = setInterval(() => {
            p = Math.min(p + 0.8, 92); // animate to 92% while backend works
            setProcessPct(p);
          }, 200);
        }
      });

      // Phase 2: backend finished
      clearInterval(processTimerRef.current);
      setProcessPct(100);
      setPhase('complete');
      setResult(data);
      currentJobRef.current = data.job_id;

      // Add to history
      setHistory((prev) => [{
        id: data.job_id,
        name: selectedVideo.name,
        date: new Date().toISOString().split('T')[0],
        detections: data.detections_count,
        avgConf: data.avg_confidence,
        status: 'completed',
      }, ...prev]);

    } catch (err) {
      clearInterval(processTimerRef.current);
      setPhase('error');
      console.error('❌ Processing failed:', err);
      setModalConfig({
        isOpen: true, type: 'error',
        title: 'Processing Failed',
        content: err?.response?.data?.detail || 'An error occurred while processing the video. Please try again.',
      });
    }
  };

  // ─── Cleanup ────────────────────────────────────────────────────────────────
  const clearResults = async () => {
    if (currentJobRef.current) {
      await videoService.cleanupJob(currentJobRef.current);
      currentJobRef.current = null;
    }
    setResult(null);
    setSelectedVideo(null);
    setPhase('idle');
    setUploadPct(0);
    setProcessPct(0);
  };

  const handleRemoveHistory = (id) => {
    setModalConfig({
      isOpen: true, type: 'confirm',
      title: 'Remove Record?',
      content: 'This will remove this entry from the list. Detection logs in the database are kept.',
      onConfirm: () => setHistory((h) => h.filter((x) => x.id !== id)),
    });
  };

  // ─── Derived ────────────────────────────────────────────────────────────────
  const isRunning = phase === 'uploading' || phase === 'processing';
  const overallPct = phase === 'uploading'
    ? Math.round(uploadPct * 0.3)                      // upload = first 30%
    : phase === 'processing'
      ? Math.round(30 + processPct * 0.7)              // processing = remaining 70%
      : phase === 'complete' ? 100 : 0;

  const statusLabel = { idle: '', uploading: 'Uploading video…', processing: 'Running face detection…', complete: 'Complete', error: 'Error' };

  // ─── Auth header for thumbnails ──────────────────────────────────────────
  const authThumbSrc = (url) => {
    // The thumbnail endpoint requires auth, so we use the /thumbnails static mount instead
    // URL shape: /api/v1/video/thumbnail/{job_id}/{filename}
    // Static mount: /thumbnails/{job_id}/{filename}
    return `${API_BASE.replace('/api/v1', '')}${url.replace('/api/v1/video/thumbnail', '/thumbnails')}`;
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Video Processing</h1>
        <p className="page-subtitle">Upload a video and run face detection using your custom-trained model</p>
      </div>

      <div className="grid-2-1" style={{ alignItems: 'start' }}>
        {/* ── Left: Upload + Action ───────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => !isRunning && document.getElementById('video-upload').click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--primary)' : selectedVideo ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '40px 24px',
              textAlign: 'center',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              background: dragOver ? 'rgba(37,99,235,0.06)' : selectedVideo ? 'rgba(37,99,235,0.03)' : 'var(--background)',
              transition: 'all var(--transition-fast)',
              position: 'relative',
            }}
          >
            <input id="video-upload" type="file" accept="video/*" onChange={handleFileInput} style={{ display: 'none' }} />

            {selectedVideo ? (
              <>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(37,99,235,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <FiFilm size={24} color="var(--primary)" />
                </div>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{selectedVideo.name}</p>
                <p className="text-sm text-muted">{fmtSize(selectedVideo.size)} · Click to change</p>
                {!isRunning && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeVideo(); }}
                    style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                  >
                    <FiX size={16} />
                  </button>
                )}
              </>
            ) : (
              <>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <FiUpload size={24} color="var(--text-muted)" />
                </div>
                <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Drop your video here</p>
                <p className="text-sm text-muted">or click to browse · MP4, AVI, MOV, MKV supported</p>
              </>
            )}
          </div>

          {/* Model Info */}
          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 18 }}>👤</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Face Detection</p>
                <p className="text-xs text-muted" style={{ margin: '2px 0 0' }}>Custom-trained YOLOv8 · best.pt</p>
              </div>
              <span style={{
                background: 'rgba(16,185,129,0.1)', color: 'var(--success)',
                borderRadius: 'var(--radius-full)', padding: '3px 10px', fontSize: 11, fontWeight: 600,
              }}>Active</span>
            </div>
          </div>

          {/* Start Button */}
          <button
            className="btn btn-primary"
            onClick={startProcessing}
            disabled={!selectedVideo || isRunning}
            style={{ width: '100%', padding: 14, fontSize: 15, gap: 8 }}
          >
            {isRunning
              ? <><FiActivity size={16} style={{ animation: 'spin 1s linear infinite' }} /> {statusLabel[phase]}</>
              : <><FiPlay size={16} /> Start Face Detection</>
            }
          </button>
        </div>

        {/* ── Right: Status Card ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 className="card-title mb-16">Processing Status</h3>

            {phase === 'idle' && (
              <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)' }}>
                <FiClock size={32} style={{ marginBottom: 12, opacity: 0.45 }} />
                <p className="text-sm">Upload a video to begin face detection</p>
              </div>
            )}

            {(phase === 'uploading' || phase === 'processing') && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{statusLabel[phase]}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>{overallPct}%</span>
                </div>
                <div style={{ height: 10, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}>
                  <div style={{
                    height: '100%', width: `${overallPct}%`,
                    background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                    borderRadius: 99, transition: 'width 0.3s ease',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-xs text-muted">
                    {phase === 'uploading' ? `Upload: ${uploadPct}%` : `Frame analysis in progress…`}
                  </span>
                  {selectedVideo && <span className="text-xs text-muted">{selectedVideo.name}</span>}
                </div>
              </div>
            )}

            {phase === 'complete' && (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <FiCheckCircle size={24} color="var(--success)" />
                </div>
                <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--success)', marginBottom: 4 }}>Detection Complete!</p>
                <p className="text-sm text-muted">Results saved to Detection Logs</p>
              </div>
            )}

            {phase === 'error' && (
              <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--danger)' }}>
                <FiAlertCircle size={28} style={{ marginBottom: 10 }} />
                <p style={{ fontWeight: 600, fontSize: 14 }}>Processing failed</p>
                <p className="text-sm text-muted" style={{ marginTop: 4 }}>Check the console for details</p>
              </div>
            )}
          </div>

          {/* Queue Overview */}
          <div className="card">
            <h3 className="card-title mb-16">Session Overview</h3>
            {[
              { label: 'Videos Processed', value: history.filter((v) => v.status === 'completed').length, color: 'var(--success)' },
              { label: 'Total Detections',  value: history.reduce((a, v) => a + v.detections, 0),          color: 'var(--primary)' },
            ].map((s, i) => (
              <div key={i} className="flex-between" style={{ padding: '10px 0', borderBottom: i < 1 ? '1px solid var(--border)' : 'none' }}>
                <span className="text-sm text-muted">{s.label}</span>
                <span style={{ fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Results Panel ──────────────────────────────────────────────────── */}
      {phase === 'complete' && result && (
        <div style={{ marginTop: 28 }}>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14, marginBottom: 24 }}>
            <StatCard label="Faces Detected"    value={result.detections_count}                       icon="👤" color="var(--primary)" />
            <StatCard label="Avg Confidence"    value={fmtPct(result.avg_confidence)}                 icon={<FiZap size={18} />} color="var(--accent)" />
            <StatCard label="High Confidence"   value={result.high_confidence_count} sub="≥ 85%"      icon={<FiCheckCircle size={18} />} color="var(--success)" />
            <StatCard label="Frames Scanned"    value={result.processed_frames?.toLocaleString()}      icon={<FiFilm size={18} />} color="var(--warning)" />
          </div>

          {/* Annotated Thumbnails */}
          {result.thumbnail_urls?.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header" style={{ marginBottom: 16 }}>
                <h3 className="card-title"><FiEye size={15} style={{ marginRight: 6 }} />Detected Frames</h3>
                <span className="badge badge-primary">{result.thumbnail_urls.length} frames</span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 10,
              }}>
                {result.thumbnail_urls.map((url, i) => {
                  const det = result.results?.[i];
                  return (
                    <div
                      key={i}
                      onClick={() => setLightbox(authThumbSrc(url))}
                      style={{
                        borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                        border: '1px solid var(--border)', cursor: 'zoom-in',
                        position: 'relative', background: '#000',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                    >
                      <img
                        src={authThumbSrc(url)}
                        alt={`Detection frame ${i + 1}`}
                        style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      {det && (
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
                          padding: '16px 8px 6px',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                        }}>
                          <span style={{ fontSize: 10, color: '#fff', fontWeight: 500 }}>⏱ {fmtTime(det.timestamp)}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: confColor(det.confidence) }}>
                            {fmtPct(det.confidence)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detection Table */}
          {result.results?.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header" style={{ marginBottom: 12 }}>
                <h3 className="card-title"><FiActivity size={15} style={{ marginRight: 6 }} />Detection Log</h3>
                <span className="text-sm text-muted">{result.results.length} entries</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Frame</th>
                      <th>Timestamp</th>
                      <th>Bounding Box</th>
                      <th style={{ textAlign: 'center' }}>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.results.map((d, i) => (
                      <tr key={i}>
                        <td className="text-sm text-muted">{i + 1}</td>
                        <td style={{ fontWeight: 600, fontSize: 13 }}>{d.frame}</td>
                        <td className="text-sm text-muted">{fmtTime(d.timestamp)}</td>
                        <td className="text-xs text-muted">[{d.bbox.join(', ')}]</td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block', minWidth: 52,
                            background: `${confColor(d.confidence)}18`,
                            color: confColor(d.confidence),
                            borderRadius: 'var(--radius-full)',
                            padding: '2px 10px', fontSize: 12, fontWeight: 700,
                          }}>
                            {fmtPct(d.confidence)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={clearResults} style={{ gap: 6 }}>
              <FiTrash2 size={14} /> Clear Results &amp; Thumbnails
            </button>
          </div>
        </div>
      )}

      {/* ── History Table ──────────────────────────────────────────────────── */}
      {history.length > 0 && (
        <div className="card" style={{ marginTop: 28 }}>
          <div className="card-header">
            <h3 className="card-title"><FiVideo size={15} style={{ marginRight: 6 }} />Session History</h3>
            <span className="text-sm text-muted">{history.length} processed</span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Video File</th>
                <th>Date</th>
                <th style={{ textAlign: 'center' }}>Detections</th>
                <th style={{ textAlign: 'center' }}>Avg Confidence</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FiFilm size={15} color="var(--primary)" />
                      </div>
                      <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{v.name}</p>
                    </div>
                  </td>
                  <td className="text-sm text-muted">{v.date}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{v.detections.toLocaleString()}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ color: confColor(v.avgConf), fontWeight: 700 }}>{fmtPct(v.avgConf)}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-success"><FiCheckCircle size={11} style={{ marginRight: 4 }} />Completed</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-sm"
                      style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }}
                      onClick={() => handleRemoveHistory(v.id)}
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Lightbox ───────────────────────────────────────────────────────── */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.88)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out',
          }}
        >
          <button
            onClick={() => setLightbox(null)}
            style={{ position: 'absolute', top: 20, right: 24, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
          >
            <FiX size={18} />
          </button>
          <img
            src={lightbox}
            alt="Annotated detection"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 'var(--radius-md)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        title={modalConfig.title}
        onConfirm={modalConfig.onConfirm}
      >
        {modalConfig.content}
      </Modal>

      {/* spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default VideoProcessing;