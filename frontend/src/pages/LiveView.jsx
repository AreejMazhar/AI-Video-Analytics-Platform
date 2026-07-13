import React, { useState, useRef, useEffect } from 'react';
import { FiVideo, FiCamera, FiRefreshCw, FiPlay, FiPause, FiCameraOff, FiUser, FiClock } from 'react-icons/fi';

const LiveView = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState('rtsp');
  const [detections, setDetections] = useState([]);
  const [faceDetections, setFaceDetections] = useState([]);
  const videoRef = useRef(null);

  // Mock face detection data (will come from backend later)
  const mockFaces = [
    { id: 1, name: 'John Doe', confidence: 95, time: '2s ago', box: '120, 200, 180, 260' },
    { id: 2, name: 'Jane Smith', confidence: 87, time: '5s ago', box: '320, 180, 380, 240' },
  ];

  const cameras = [
    { id: 'rtsp', name: 'IP Camera (RTSP)', icon: <FiVideo /> },
    { id: 'webcam', name: 'Webcam', icon: <FiCamera /> },
  ];

  const toggleStream = () => {
    setIsStreaming(!isStreaming);
    if (!isStreaming) {
      // Start stream - will connect to backend
      setDetections(mockFaces);
    } else {
      // Stop stream
      setDetections([]);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a3a5c', marginBottom: '4px' }}>
          Live View
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Real-time face detection and recognition from live camera feeds
        </p>
      </div>

      {/* Camera Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'white',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid #e8edf2',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {cameras.map(cam => (
              <button
                key={cam.id}
                onClick={() => setSelectedCamera(cam.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: selectedCamera === cam.id ? '#1a3a5c' : '#f5f7fa',
                  color: selectedCamera === cam.id ? 'white' : '#4a4a6a',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                {cam.icon}
                {cam.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={toggleStream}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: isStreaming ? '#ef4444' : '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {isStreaming ? <FiPause size={18} /> : <FiPlay size={18} />}
            {isStreaming ? 'Stop Stream' : 'Start Stream'}
          </button>
          <button
            style={{
              padding: '10px 16px',
              background: '#f5f7fa',
              border: '1px solid #e8edf2',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#4a4a6a'
            }}
          >
            <FiRefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Video Feed + Detections */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px'
      }}>
        {/* Video Feed */}
        <div style={{
          background: '#1a1a2e',
          borderRadius: '12px',
          overflow: 'hidden',
          aspectRatio: '16/9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #e8edf2',
          position: 'relative'
        }}>
          {isStreaming ? (
            <>
              {/* Video placeholder - will be replaced with actual stream */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                background: '#2a2a4e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                  <FiVideo size={48} style={{ marginBottom: '12px' }} />
                  <p>Live Stream Active</p>
                  <p style={{ fontSize: '12px' }}>Camera: {selectedCamera === 'rtsp' ? 'IP Camera' : 'Webcam'}</p>
                </div>

                {/* Face detection overlays - mock boxes */}
                {detections.map((face, index) => (
                  <div
                    key={index}
                    style={{
                      position: 'absolute',
                      left: 120 + index * 200,
                      top: 180 + index * 20,
                      border: '2px solid #22c55e',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      background: 'rgba(34, 197, 94, 0.2)',
                      color: 'white',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiUser size={14} />
                      <span>{face.name}</span>
                      <span style={{ fontSize: '10px', opacity: 0.7 }}>{face.confidence}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
              <FiCameraOff size={48} style={{ marginBottom: '12px' }} />
              <p>Camera Offline</p>
              <p style={{ fontSize: '12px' }}>Click "Start Stream" to begin</p>
            </div>
          )}
        </div>

        {/* Detection Log */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #e8edf2',
          maxHeight: '500px',
          overflowY: 'auto'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a3a5c', marginBottom: '16px' }}>
            Face Detections
          </h3>

          {isStreaming ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {faceDetections.length > 0 ? (
                faceDetections.map((detection, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #f0f2f5'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontWeight: '500', fontSize: '14px', margin: 0 }}>
                          {detection.name || 'Unknown Person'}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                          Confidence: {detection.confidence}%
                        </p>
                      </div>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        {detection.time}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
                  No faces detected yet
                </p>
              )}
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
              Start the stream to see detections
            </p>
          )}

          {/* Stats */}
          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #f0f2f5',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px'
          }}>
            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#1a3a5c', margin: 0 }}>
                {faceDetections.length}
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Total Faces</p>
            </div>
            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#22c55e', margin: 0 }}>
                98%
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Accuracy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveView;