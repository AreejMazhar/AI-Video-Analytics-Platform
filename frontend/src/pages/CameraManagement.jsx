import React, { useState, useEffect } from 'react';
import { 
  FiPlus, FiEdit, FiTrash2, FiVideo, FiCamera, 
  FiUpload, FiCheckCircle, FiClock, FiRefreshCw,
  FiXCircle, FiSave
} from 'react-icons/fi';
import { cameraService } from '../api/services/cameraService';
import { modelService } from '../api/services/modelService';

const CameraManagement = () => {
  const [activeTab, setActiveTab] = useState('cameras');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real data from API
  const [cameras, setCameras] = useState([]);
  const [allModels, setAllModels] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([
    { id: 1, name: 'Office_Full_Footage.mp4', size: '256 MB', date: '2024-07-12', status: 'processed' },
    { id: 2, name: 'Warehouse_Evening.mp4', size: '412 MB', date: '2024-07-11', status: 'pending' },
    { id: 3, name: 'Parking_Lot_Recording.mp4', size: '189 MB', date: '2024-07-10', status: 'processing' },
  ]);

  // Form state for adding/editing
  const [formData, setFormData] = useState({
    name: '',
    rtsp_url: '',
    location: '',
    status: 'offline',
    is_recording: false,
    confidence_threshold: 0.5,
    assigned_models: []
  });
  const [editingCameraId, setEditingCameraId] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

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
      console.log('✅ Data loaded:', { cameras: camerasData.length, models: modelsData.length });
    } catch (err) {
      setError('Failed to load data. Please refresh the page.');
      console.error('❌ Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      online: '#22c55e',
      offline: '#ef4444',
      error: '#ef4444',
      pending: '#f59e0b',
      processing: '#4a90d9',
      processed: '#22c55e',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      online: 'Online',
      offline: 'Offline',
      error: 'Error',
      pending: 'Pending',
      processing: 'Processing...',
      processed: 'Processed',
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      processed: <FiCheckCircle color="#22c55e" size={16} />,
      pending: <FiClock color="#f59e0b" size={16} />,
      processing: <FiRefreshCw color="#4a90d9" size={16} style={{ animation: 'spin 1s linear infinite' }} />,
    };
    return icons[status] || null;
  };

  // Camera CRUD functions
  const handleAddCamera = async (e) => {
    e.preventDefault();
    try {
      const newCamera = await cameraService.createCamera(formData);
      setCameras([...cameras, newCamera]);
      setShowAddModal(false);
      resetForm();
      console.log('✅ Camera added:', newCamera);
    } catch (err) {
      console.error('❌ Error adding camera:', err);
      alert('Failed to add camera. Please try again.');
    }
  };

  const handleEditCamera = (camera) => {
    setEditingCameraId(camera.id);
    setFormData({
      name: camera.name,
      rtsp_url: camera.rtsp_url,
      location: camera.location || '',
      status: camera.status || 'offline',
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
      console.log('✅ Camera updated:', updated);
    } catch (err) {
      console.error('❌ Error updating camera:', err);
      alert('Failed to update camera. Please try again.');
    }
  };

  const handleDeleteCamera = async (cameraId) => {
    if (!window.confirm('Are you sure you want to delete this camera?')) return;
    
    try {
      await cameraService.deleteCamera(cameraId);
      setCameras(cameras.filter(c => c.id !== cameraId));
      console.log('✅ Camera deleted');
    } catch (err) {
      console.error('❌ Error deleting camera:', err);
      alert('Failed to delete camera. Please try again.');
    }
  };

  const handleTestConnection = async (cameraId) => {
    try {
      const result = await cameraService.testConnection(cameraId);
      alert(result.success ? '✅ Connection successful!' : '❌ Connection failed. Please check the RTSP URL.');
    } catch (err) {
      alert('❌ Connection test failed.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      rtsp_url: '',
      location: '',
      status: 'offline',
      is_recording: false,
      confidence_threshold: 0.5,
      assigned_models: []
    });
    setEditingCameraId(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleModelToggle = (modelId) => {
    const current = formData.assigned_models || [];
    if (current.includes(modelId)) {
      setFormData({
        ...formData,
        assigned_models: current.filter(id => id !== modelId)
      });
    } else {
      setFormData({
        ...formData,
        assigned_models: [...current, modelId]
      });
    }
  };

  // Video upload function
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploading(true);
      // Simulate upload
      setTimeout(() => {
        setUploading(false);
        setSelectedFile(null);
        setUploadedVideos([
          ...uploadedVideos,
          {
            id: Date.now(),
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(0) + ' MB',
            date: new Date().toISOString().split('T')[0],
            status: 'pending'
          }
        ]);
      }, 2000);
    }
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
          <p style={{ color: '#6b7280' }}>Loading cameras...</p>
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
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a3a5c', marginBottom: '4px' }}>
            Camera Management
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Manage live cameras and uploaded videos for processing
          </p>
        </div>
        {activeTab === 'cameras' && (
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
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
            Add Camera
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0',
        marginBottom: '24px',
        borderBottom: '2px solid #e8edf2',
        background: 'white',
        borderRadius: '12px 12px 0 0',
        padding: '0 4px',
        border: '1px solid #e8edf2',
        borderBottom: 'none'
      }}>
        <button
          onClick={() => setActiveTab('cameras')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'cameras' ? '3px solid #1a3a5c' : '3px solid transparent',
            color: activeTab === 'cameras' ? '#1a3a5c' : '#6b7280',
            fontWeight: activeTab === 'cameras' ? '600' : '400',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <FiVideo size={18} />
          📹 Live Cameras
          <span style={{
            background: '#e8edf2',
            padding: '2px 10px',
            borderRadius: '12px',
            fontSize: '12px',
            color: '#4a4a6a'
          }}>
            {cameras.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'videos' ? '3px solid #1a3a5c' : '3px solid transparent',
            color: activeTab === 'videos' ? '#1a3a5c' : '#6b7280',
            fontWeight: activeTab === 'videos' ? '600' : '400',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <FiUpload size={18} />
          📁 Uploaded Videos
          <span style={{
            background: '#e8edf2',
            padding: '2px 10px',
            borderRadius: '12px',
            fontSize: '12px',
            color: '#4a4a6a'
          }}>
            {uploadedVideos.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'cameras' ? (
        // CAMERAS TAB
        <div>
          {cameras.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e8edf2'
            }}>
              <FiCamera size={48} color="#d1d5db" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '16px', color: '#6b7280' }}>No cameras added yet</p>
              <p style={{ fontSize: '13px', color: '#9ca3af' }}>Click "Add Camera" to get started</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px'
            }}>
              {cameras.map(camera => (
                <div key={camera.id} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e8edf2',
                  transition: 'box-shadow 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: camera.rtsp_url?.startsWith('rtsp') ? '#e8edf2' : '#dbeafe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                      }}>
                        {camera.rtsp_url?.startsWith('rtsp') ? '📷' : '💻'}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a2e', margin: 0 }}>
                          {camera.name}
                        </h4>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                          {camera.location || 'No location set'}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => handleEditCamera(camera)}
                        style={{
                          padding: '4px',
                          background: 'transparent',
                          border: 'none',
                          color: '#4a90d9',
                          cursor: 'pointer'
                        }}
                      >
                        <FiEdit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCamera(camera.id)}
                        style={{
                          padding: '4px',
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

                  <div style={{ marginTop: '12px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      color: '#4a4a6a'
                    }}>
                      <span>Status:</span>
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: getStatusColor(camera.status),
                        fontWeight: '500'
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: getStatusColor(camera.status),
                          display: 'inline-block'
                        }} />
                        {getStatusLabel(camera.status)}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      <span style={{ fontWeight: '500' }}>Models:</span> 
                      {camera.assigned_models && camera.assigned_models.length > 0 ? (
                        camera.assigned_models.map(id => {
                          const model = allModels.find(m => m.id === id);
                          return model ? model.name : id;
                        }).join(', ')
                      ) : (
                        ' None assigned'
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      <span style={{ fontWeight: '500' }}>URL:</span> {camera.rtsp_url}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      <span style={{ fontWeight: '500' }}>Confidence:</span> {Math.round((camera.confidence_threshold || 0.5) * 100)}%
                    </div>
                  </div>

                  <button 
                    onClick={() => handleTestConnection(camera.id)}
                    style={{
                      width: '100%',
                      marginTop: '12px',
                      padding: '8px',
                      background: '#f5f7fa',
                      border: '1px solid #e8edf2',
                      borderRadius: '6px',
                      color: '#4a4a6a',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}
                  >
                    <FiRefreshCw size={14} style={{ marginRight: '6px' }} />
                    Test Connection
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // VIDEOS TAB
        <div>
          {/* Upload Area */}
          <div style={{
            border: '2px dashed #d1d5db',
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center',
            background: '#fafbfc',
            marginBottom: '20px',
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
              const input = document.getElementById('video-upload');
              const dt = new DataTransfer();
              dt.items.add(file);
              input.files = dt.files;
              input.dispatchEvent(new Event('change'));
            }
          }}
          >
            <FiUpload size={40} color="#6b7280" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '16px', fontWeight: '500', color: '#1a1a2e', margin: 0 }}>
              Upload Video for Processing
            </p>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
              Drag & drop or click to browse (MP4, AVI, MOV supported)
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
                background: uploading ? '#f5f7fa' : '#1a3a5c',
                color: uploading ? '#6b7280' : 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontWeight: '500'
              }}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Select Video'}
            </button>
            {uploading && (
              <div style={{ marginTop: '12px' }}>
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: '#e8edf2',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '60%',
                    height: '100%',
                    background: '#1a3a5c',
                    borderRadius: '2px',
                    animation: 'progress 1.5s ease-in-out infinite'
                  }} />
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Processing upload...</p>
              </div>
            )}
          </div>

          {/* Uploaded Videos List */}
          {uploadedVideos.length > 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e8edf2',
              overflow: 'hidden'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                      File Name
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                      Size
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                      Upload Date
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                      Status
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedVideos.map((video, index) => (
                    <tr key={video.id} style={{
                      borderTop: index === 0 ? 'none' : '1px solid #f0f2f5'
                    }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#1a1a2e' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>🎬</span>
                          {video.name}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#4a4a6a' }}>
                        {video.size}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#4a4a6a' }}>
                        {video.date}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: getStatusColor(video.status),
                          fontWeight: '500',
                          fontSize: '13px'
                        }}>
                          {getStatusIcon(video.status)}
                          {getStatusLabel(video.status)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {video.status === 'pending' && (
                          <button style={{
                            padding: '6px 16px',
                            background: '#1a3a5c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}>
                            Process
                          </button>
                        )}
                        {video.status === 'processed' && (
                          <button style={{
                            padding: '6px 16px',
                            background: '#f5f7fa',
                            color: '#4a4a6a',
                            border: '1px solid #e8edf2',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}>
                            View Results
                          </button>
                        )}
                        {video.status === 'processing' && (
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>Processing...</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e8edf2'
            }}>
              <FiUpload size={48} color="#d1d5db" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '16px', color: '#6b7280' }}>No videos uploaded yet</p>
              <p style={{ fontSize: '13px', color: '#9ca3af' }}>Upload a video above to get started</p>
            </div>
          )}
        </div>
      )}

      {/* Add Camera Modal */}
      {showAddModal && (
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
              Add New Camera
            </h2>
            <form onSubmit={handleAddCamera}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Camera Name *
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
                  placeholder="e.g., Front Gate Camera"
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  RTSP URL *
                </label>
                <input
                  type="text"
                  name="rtsp_url"
                  value={formData.rtsp_url}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="rtsp://username:password@ip:554/stream"
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="e.g., Main Entrance"
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Assigned AI Models
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '6px',
                  background: '#f8fafc',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #e8edf2'
                }}>
                  {allModels.map(model => (
                    <label key={model.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.assigned_models.includes(model.id)}
                        onChange={() => handleModelToggle(model.id)}
                      />
                      {model.icon} {model.name}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Confidence Threshold: {Math.round((formData.confidence_threshold || 0.5) * 100)}%
                </label>
                <input
                  type="range"
                  name="confidence_threshold"
                  min="0.1"
                  max="0.95"
                  step="0.05"
                  value={formData.confidence_threshold || 0.5}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    accentColor: '#1a3a5c'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
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
                  style={{
                    padding: '10px 24px',
                    background: '#1a3a5c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FiPlus size={16} />
                  Add Camera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Camera Modal */}
      {showEditModal && (
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
              Edit Camera
            </h2>
            <form onSubmit={handleUpdateCamera}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Camera Name *
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
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  RTSP URL *
                </label>
                <input
                  type="text"
                  name="rtsp_url"
                  value={formData.rtsp_url}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Assigned AI Models
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '6px',
                  background: '#f8fafc',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #e8edf2'
                }}>
                  {allModels.map(model => (
                    <label key={model.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.assigned_models.includes(model.id)}
                        onChange={() => handleModelToggle(model.id)}
                      />
                      {model.icon} {model.name}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Confidence Threshold: {Math.round((formData.confidence_threshold || 0.5) * 100)}%
                </label>
                <input
                  type="range"
                  name="confidence_threshold"
                  min="0.1"
                  max="0.95"
                  step="0.05"
                  value={formData.confidence_threshold || 0.5}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    accentColor: '#1a3a5c'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
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
                  style={{
                    padding: '10px 24px',
                    background: '#1a3a5c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FiSave size={16} />
                  Update Camera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CameraManagement;