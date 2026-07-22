import React, { useState, useRef } from 'react';
import {
  FiVideo, FiCamera, FiRefreshCw, FiPlay, FiPause,
  FiCameraOff, FiUser, FiClock, FiMaximize2, FiChevronDown
} from 'react-icons/fi';

const LiveView = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState('laptop_rtsp');
  const [detections, setDetections] = useState([]);
  const [tick, setTick] = useState(0);
  const intervalRef = useRef(null);

  const cameras = [
    { id: 'laptop_rtsp', name: 'Laptop RTSP Stream', icon: FiVideo, subtext: 'rtsp://localhost:8554/live' },
    { id: 'laptop_webcam', name: 'Laptop Webcam Direct', icon: FiCamera, subtext: 'Direct USB / Integrated' },
    { id: 'secondary_rtsp', name: 'Secondary RTSP Camera', icon: FiVideo, subtext: 'rtsp://192.168.1.101:554/stream1' },
  ];

  const currentCam = cameras.find(c => c.id === selectedCamera) || cameras[0];

  const mockFaces = [
    { id: 1, name: 'John Doe', confidence: 95, type: 'Known', time: '2s ago' },
    { id: 2, name: 'Jane Smith', confidence: 87, type: 'Known', time: '5s ago' },
    { id: 3, name: 'Unknown Person', confidence: 62, type: 'Unknown', time: '9s ago' },
  ];

  const toggleStream = () => {
    if (!isStreaming) {
      setDetections(mockFaces);
      intervalRef.current = setInterval(() => setTick(t => t + 1), 3000);
    } else {
      setDetections([]);
      clearInterval(intervalRef.current);
    }
    setIsStreaming(!isStreaming);
  };

  const stats = [
    { label: 'Faces Detected', value: isStreaming ? detections.length : 0 },
    { label: 'Known Persons', value: isStreaming ? detections.filter(d => d.type === 'Known').length : 0 },
    { label: 'Alerts', value: isStreaming ? detections.filter(d => d.type === 'Unknown').length : 0 },
    { label: 'Avg Confidence', value: isStreaming ? `${Math.round(detections.reduce((a, d) => a + d.confidence, 0) / (detections.length || 1))}%` : '—' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Page Header with Pretty Camera Dropdown */}
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Live View</h1>
          <p className="page-subtitle">Real-time AI face detection & recognition from active camera stream</p>
        </div>

        {/* Custom Pretty Dropdown */}
        <div style={{ position: 'relative' }}>
          <select
            className="form-input form-select"
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            style={{
              padding: '10px 36px 10px 16px',
              fontWeight: 600,
              fontSize: '13.5px',
              color: 'var(--primary)',
              background: 'white',
              border: '1.5px solid rgba(37,99,235,0.25)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              minWidth: '220px'
            }}
          >
            {cameras.map(cam => (
              <option key={cam.id} value={cam.id}>
                📷 {cam.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-4 mb-24">
        {stats.map((s, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', padding: '16px' }}>
            <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{s.value}</p>
            <p className="text-sm text-muted" style={{ marginTop: '4px' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid-2-1">
        {/* Video Feed */}
        <div style={{
          background: '#0f172a',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
          position: 'relative',
          aspectRatio: '16/9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {/* Live indicator */}
          {isStreaming && (
            <div style={{
              position: 'absolute', top: 16, left: 16,
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
              padding: '6px 12px', borderRadius: '99px', zIndex: 10
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s ease-in-out infinite', display: 'inline-block' }} />
              <span style={{ color: 'white', fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>LIVE</span>
            </div>
          )}

          {/* Maximize */}
          <button style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '8px',
            padding: '7px', color: 'white', cursor: 'pointer', zIndex: 10
          }}>
            <FiMaximize2 size={16} />
          </button>

          {isStreaming ? (
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }} />
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', zIndex: 1 }}>
                <FiVideo size={56} style={{ marginBottom: 16, color: 'rgba(37,99,235,0.6)' }} />
                <p style={{ fontWeight: 600, fontSize: '15px', color: 'rgba(255,255,255,0.7)' }}>{currentCam.name}</p>
                <p style={{ fontSize: '12.5px', marginTop: 4, color: 'var(--text-muted)' }}>
                  {currentCam.subtext}
                </p>
              </div>
              {/* Mock detection boxes */}
              {detections.slice(0, 2).map((face, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  left: `${25 + i * 35}%`, top: `${30 + i * 10}%`,
                  border: `2px solid ${face.type === 'Known' ? '#10b981' : '#ef4444'}`,
                  padding: '4px 8px',
                  background: `${face.type === 'Known' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
                  borderRadius: '4px', color: 'white', fontSize: '11px', fontWeight: 600
                }}>
                  {face.name} · {face.confidence}%
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)' }}>
              <FiCameraOff size={52} style={{ marginBottom: 14 }} />
              <p style={{ fontWeight: 600, fontSize: '15px', color: 'rgba(255,255,255,0.5)' }}>Camera Stream Offline</p>
              <p style={{ fontSize: '12px', marginTop: 4 }}>{currentCam.name} · Click Start Stream to begin</p>
            </div>
          )}

          {/* Controls overlay */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '16px 20px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            display: 'flex', justifyContent: 'center', gap: '10px'
          }}>
            <button
              onClick={toggleStream}
              className={`btn ${isStreaming ? 'btn-danger' : 'btn-primary'}`}
              style={{ minWidth: 140 }}
            >
              {isStreaming ? <><FiPause size={15} /> Stop Stream</> : <><FiPlay size={15} /> Start Stream</>}
            </button>
            <button className="btn btn-secondary" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
              <FiRefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Detection Panel */}
        <div className="card" style={{ padding: '20px', maxHeight: '420px', overflowY: 'auto' }}>
          <div className="card-header">
            <h3 className="card-title">Live Detections</h3>
            {isStreaming && <span className="badge badge-success">Active</span>}
          </div>

          {!isStreaming ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <FiClock size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p className="text-sm">Start stream to view real-time detections</p>
            </div>
          ) : detections.length === 0 ? (
            <p className="text-sm text-muted" style={{ textAlign: 'center', padding: '24px 0' }}>No faces detected yet...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {detections.map((d) => (
                <div key={d.id} style={{
                  padding: '12px 14px', borderRadius: '10px',
                  background: d.type === 'Known' ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
                  border: `1px solid ${d.type === 'Known' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}>
                  <div className="flex-between">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: d.type === 'Known' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <FiUser size={16} color={d.type === 'Known' ? '#10b981' : '#ef4444'} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '13.5px', margin: 0 }}>{d.name}</p>
                        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{d.time}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: d.type === 'Known' ? '#10b981' : '#ef4444' }}>{d.confidence}%</span>
                      <br />
                      <span className={`badge ${d.type === 'Known' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '10px', marginTop: '4px' }}>{d.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
};

export default LiveView;