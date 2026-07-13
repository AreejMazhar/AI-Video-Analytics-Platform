import React, { useState } from 'react';
import { 
  FiUpload, FiPlay, FiPause, FiStopCircle, 
  FiDownload, FiTrash2, FiClock, FiCheckCircle,
  FiAlertCircle, FiBarChart2, FiCpu, FiVideo
} from 'react-icons/fi';

const VideoProcessing = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('idle'); // idle, processing, complete, error
  const [progress, setProgress] = useState(0);
  const [selectedModels, setSelectedModels] = useState({
    person: true,
    vehicle: true,
    ppe: false,
    fire: false,
    intrusion: false,
    crowd: false,
    fall: false,
    license: false,
  });

  // Mock processed videos
  const [processedVideos, setProcessedVideos] = useState([
    {
      id: 1,
      name: 'Office_Full_Footage.mp4',
      date: '2024-07-13',
      models: ['Person Detection', 'Vehicle Detection'],
      status: 'completed',
      detections: 342,
      alerts: 5,
      duration: '12:34'
    },
    {
      id: 2,
      name: 'Warehouse_Evening.mp4',
      date: '2024-07-12',
      models: ['PPE Detection', 'Fire & Smoke'],
      status: 'processing',
      detections: 0,
      alerts: 0,
      duration: '08:21'
    },
    {
      id: 3,
      name: 'Parking_Lot_Recording.mp4',
      date: '2024-07-11',
      models: ['Vehicle Detection', 'License Plate'],
      status: 'completed',
      detections: 156,
      alerts: 2,
      duration: '15:45'
    },
  ]);

  const modelOptions = [
    { id: 'person', label: 'Person Detection', icon: '🚶' },
    { id: 'vehicle', label: 'Vehicle Detection', icon: '🚗' },
    { id: 'ppe', label: 'PPE Detection', icon: '⛑️' },
    { id: 'fire', label: 'Fire & Smoke', icon: '🔥' },
    { id: 'intrusion', label: 'Intrusion Detection', icon: '🚫' },
    { id: 'crowd', label: 'Crowd Detection', icon: '👥' },
    { id: 'fall', label: 'Fall Detection', icon: '⚠️' },
    { id: 'license', label: 'License Plate', icon: '📋' },
  ];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedVideo(file);
      setProcessingStatus('idle');
      setProgress(0);
    }
  };

  const startProcessing = () => {
    if (!selectedVideo) return;
    
    setProcessing(true);
    setProcessingStatus('processing');
    setProgress(0);

    // Simulate processing
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setProcessing(false);
          setProcessingStatus('complete');
          // Add to processed list
          const newVideo = {
            id: Date.now(),
            name: selectedVideo.name,
            date: new Date().toISOString().split('T')[0],
            models: Object.keys(selectedModels).filter(key => selectedModels[key]).map(key => 
              modelOptions.find(m => m.id === key)?.label
            ),
            status: 'completed',
            detections: Math.floor(Math.random() * 500) + 50,
            alerts: Math.floor(Math.random() * 10),
            duration: '00:00'
          };
          setProcessedVideos([newVideo, ...processedVideos]);
          return 100;
        }
        return prev + 2;
      });
    }, 200);
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: <FiCheckCircle color="#22c55e" />,
      processing: <FiClock color="#f59e0b" />,
      error: <FiAlertCircle color="#ef4444" />,
    };
    return icons[status] || <FiClock />;
  };

  const getStatusLabel = (status) => {
    const labels = {
      completed: 'Completed',
      processing: 'Processing...',
      error: 'Error',
    };
    return labels[status] || status;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a3a5c', marginBottom: '4px' }}>
          Video Processing
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Upload videos and process them with AI models
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px'
      }}>
        {/* Left - Upload & Process */}
        <div>
          {/* Upload Area */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e8edf2',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a3a5c', marginBottom: '16px' }}>
              Upload Video
            </h3>
            
            <div
              style={{
                border: '2px dashed #d1d5db',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                background: '#fafbfc',
                transition: 'border-color 0.2s'
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.target.style.borderColor = '#1a3a5c';
              }}
              onDragLeave={(e) => {
                e.target.style.borderColor = '#d1d5db';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('video/')) {
                  setSelectedVideo(file);
                  setProcessingStatus('idle');
                  setProgress(0);
                }
              }}
            >
              <FiVideo size={48} color="#6b7280" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '16px', fontWeight: '500', color: '#1a1a2e', margin: 0 }}>
                {selectedVideo ? selectedVideo.name : 'Drag & drop or click to browse'}
              </p>
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                {selectedVideo 
                  ? `Size: ${(selectedVideo.size / (1024 * 1024)).toFixed(1)} MB`
                  : 'MP4, AVI, MOV supported (max 500MB)'
                }
              </p>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="video-upload"
              />
              <button
                onClick={() => document.getElementById('video-upload').click()}
                style={{
                  marginTop: '16px',
                  padding: '10px 24px',
                  background: selectedVideo ? '#f5f7fa' : '#1a3a5c',
                  color: selectedVideo ? '#4a4a6a' : 'white',
                  border: selectedVideo ? '1px solid #e8edf2' : 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {selectedVideo ? 'Change Video' : 'Select Video'}
              </button>
            </div>

            {/* Selected Models */}
            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>
                Select AI Models to Process
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px'
              }}>
                {modelOptions.map(model => (
                  <label key={model.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: '#f8fafc',
                    borderRadius: '6px',
                    border: '1px solid #f0f2f5',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedModels[model.id]}
                      onChange={() => setSelectedModels({
                        ...selectedModels,
                        [model.id]: !selectedModels[model.id]
                      })}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>{model.icon}</span>
                    {model.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Process Button */}
            {selectedVideo && (
              <button
                onClick={startProcessing}
                disabled={processing || processingStatus === 'complete'}
                style={{
                  width: '100%',
                  marginTop: '20px',
                  padding: '12px',
                  background: processing ? '#f5f7fa' : processingStatus === 'complete' ? '#22c55e' : '#1a3a5c',
                  color: processing ? '#6b7280' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {processingStatus === 'idle' && (
                  <>
                    <FiPlay size={18} />
                    Start Processing
                  </>
                )}
                {processingStatus === 'processing' && (
                  <>
                    <span style={{ animation: 'spin 1s linear infinite' }}>⚙️</span>
                    Processing... {progress}%
                  </>
                )}
                {processingStatus === 'complete' && (
                  <>
                    <FiCheckCircle size={18} />
                    Process Complete!
                  </>
                )}
              </button>
            )}

            {/* Progress Bar */}
            {processingStatus === 'processing' && (
              <div style={{ marginTop: '12px' }}>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: '#e8edf2',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #4a90d9, #1a3a5c)',
                    borderRadius: '3px',
                    transition: 'width 0.3s'
                  }} />
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', textAlign: 'center' }}>
                  {Math.min(progress, 100)}% complete
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right - Processed Videos */}
        <div>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e8edf2'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a3a5c', marginBottom: '16px' }}>
              Processed Videos
            </h3>

            {processedVideos.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {processedVideos.map(video => (
                  <div key={video.id} style={{
                    padding: '14px 16px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #f0f2f5'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <p style={{ fontWeight: '500', color: '#1a1a2e', margin: 0 }}>
                          🎬 {video.name}
                        </p>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                          {video.date} • {video.duration}
                        </div>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                          {video.models.map((model, i) => (
                            <span key={i} style={{
                              fontSize: '10px',
                              padding: '2px 10px',
                              background: '#dbeafe',
                              borderRadius: '12px',
                              color: '#1a3a5c'
                            }}>
                              {model}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '13px',
                          color: video.status === 'completed' ? '#22c55e' : '#f59e0b',
                          fontWeight: '500'
                        }}>
                          {getStatusIcon(video.status)}
                          {getStatusLabel(video.status)}
                        </div>
                        {video.status === 'completed' && (
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                            {video.detections} detections • {video.alerts} alerts
                          </div>
                        )}
                      </div>
                    </div>

                    {video.status === 'completed' && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px', borderTop: '1px solid #f0f2f5', paddingTop: '10px' }}>
                        <button style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 12px',
                          background: '#1a3a5c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}>
                          <FiBarChart2 size={14} />
                          View Results
                        </button>
                        <button style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 12px',
                          background: '#f5f7fa',
                          border: '1px solid #e8edf2',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          color: '#4a4a6a'
                        }}>
                          <FiDownload size={14} />
                          Download
                        </button>
                        <button style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 12px',
                          background: '#f5f7fa',
                          border: '1px solid #e8edf2',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          color: '#ef4444'
                        }}>
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
                <FiVideo size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                <p>No videos processed yet</p>
                <p style={{ fontSize: '13px' }}>Upload and process your first video</p>
              </div>
            )}
          </div>
        </div>
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

export default VideoProcessing;