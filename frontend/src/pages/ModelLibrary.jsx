import React, { useState } from 'react';
import { FiToggleLeft, FiToggleRight, FiSliders, FiInfo, FiVideo, FiUpload } from 'react-icons/fi';

const ModelLibrary = () => {
  const [models, setModels] = useState([
    { 
      id: 1, 
      name: 'Face Detection', 
      enabled: true, 
      mode: 'Live', 
      icon: '👤',
      confidence: 0.75,
      description: 'Detect and track faces in real-time from live camera'
    },
    { 
      id: 2, 
      name: 'Face Recognition', 
      enabled: true, 
      mode: 'Live',
      icon: '🪪',
      confidence: 0.80,
      description: 'Identify known faces from database (live camera only)'
    },
    { 
      id: 3, 
      name: 'Person Detection', 
      enabled: true, 
      mode: 'Video',
      icon: '🚶',
      confidence: 0.60,
      description: 'Detect people in uploaded videos'
    },
    { 
      id: 4, 
      name: 'Vehicle Detection', 
      enabled: false, 
      mode: 'Video',
      icon: '🚗',
      confidence: 0.65,
      description: 'Detect cars, bikes, trucks, and buses in videos'
    },
    { 
      id: 5, 
      name: 'PPE Detection', 
      enabled: false, 
      mode: 'Video',
      icon: '⛑️',
      confidence: 0.70,
      description: 'Detect helmets, vests, gloves, and masks'
    },
    { 
      id: 6, 
      name: 'Fire & Smoke Detection', 
      enabled: false, 
      mode: 'Video',
      icon: '🔥',
      confidence: 0.80,
      description: 'Detect fire and smoke in video footage'
    },
    { 
      id: 7, 
      name: 'Intrusion Detection', 
      enabled: false, 
      mode: 'Video',
      icon: '🚫',
      confidence: 0.75,
      description: 'Detect entry into restricted zones'
    },
    { 
      id: 8, 
      name: 'Crowd Detection', 
      enabled: false, 
      mode: 'Video',
      icon: '👥',
      confidence: 0.70,
      description: 'Count people and detect crowd density'
    },
    { 
      id: 9, 
      name: 'Fall Detection', 
      enabled: false, 
      mode: 'Video',
      icon: '⚠️',
      confidence: 0.85,
      description: 'Detect falls and trigger emergency alerts'
    },
    { 
      id: 10, 
      name: 'License Plate Recognition', 
      enabled: false, 
      mode: 'Video',
      icon: '📋',
      confidence: 0.75,
      description: 'Detect and read license plates from videos'
    },
  ]);

  const toggleModel = (id) => {
    setModels(models.map(model => 
      model.id === id ? { ...model, enabled: !model.enabled } : model
    ));
  };

  const updateConfidence = (id, value) => {
    setModels(models.map(model => 
      model.id === id ? { ...model, confidence: parseFloat(value) } : model
    ));
  };

  const liveModels = models.filter(m => m.mode === 'Live');
  const videoModels = models.filter(m => m.mode === 'Video');

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a3a5c', marginBottom: '4px' }}>
          AI Model Library
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Enable or disable AI models and configure their settings
        </p>
      </div>

      {/* Mode Info Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #e8edf2',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#dbeafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            <FiVideo size={24} color="#1a3a5c" />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a3a5c', margin: 0 }}>
              Live Camera Models ({liveModels.length})
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
              Face Detection & Recognition - Real-time processing
            </p>
          </div>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #e8edf2',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            <FiUpload size={24} color="#f59e0b" />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a3a5c', margin: 0 }}>
              Video Processing Models ({videoModels.length})
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
              Upload videos to process with these models
            </p>
          </div>
        </div>
      </div>

      {/* Model Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '16px'
      }}>
        {models.map(model => (
          <div key={model.id} style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${model.enabled ? '#22c55e' : '#e8edf2'}`,
            transition: 'all 0.2s',
            opacity: model.enabled ? 1 : 0.7
          }}
          onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
          onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: model.enabled ? '#dbeafe' : '#f5f7fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px'
                }}>
                  {model.icon}
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a2e', margin: 0 }}>
                    {model.name}
                  </h4>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    background: model.mode === 'Live' ? '#dbeafe' : '#fef3c7',
                    color: model.mode === 'Live' ? '#1a3a5c' : '#92400e',
                    fontWeight: '500'
                  }}>
                    {model.mode === 'Live' ? <FiVideo size={12} style={{ marginRight: '4px' }} /> : <FiUpload size={12} style={{ marginRight: '4px' }} />}
                    {model.mode}
                  </span>
                </div>
              </div>
              <button
                onClick={() => toggleModel(model.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '28px',
                  color: model.enabled ? '#22c55e' : '#d1d5db',
                  padding: '4px'
                }}
              >
                {model.enabled ? <FiToggleRight /> : <FiToggleLeft />}
              </button>
            </div>

            <p style={{
              fontSize: '13px',
              color: '#6b7280',
              marginTop: '12px',
              marginBottom: '16px'
            }}>
              {model.description}
            </p>

            <div style={{
              paddingTop: '12px',
              borderTop: '1px solid #f0f2f5'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, marginRight: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4a4a6a' }}>
                    <span>Confidence Threshold</span>
                    <span style={{ fontWeight: '600', color: '#1a3a5c' }}>
                      {(model.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.95"
                    step="0.05"
                    value={model.confidence}
                    onChange={(e) => updateConfidence(model.id, e.target.value)}
                    disabled={!model.enabled}
                    style={{
                      width: '100%',
                      marginTop: '4px',
                      accentColor: '#1a3a5c',
                      opacity: model.enabled ? 1 : 0.5
                    }}
                  />
                </div>
                <button style={{
                  padding: '6px 14px',
                  background: model.enabled ? '#f5f7fa' : '#f5f7fa',
                  border: '1px solid #e8edf2',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#4a4a6a',
                  whiteSpace: 'nowrap'
                }}>
                  <FiInfo size={14} style={{ marginRight: '4px' }} />
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelLibrary;