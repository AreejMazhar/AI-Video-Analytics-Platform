import React, { useState, useEffect } from 'react';
import { FiToggleLeft, FiToggleRight, FiInfo, FiVideo, FiUpload } from 'react-icons/fi';
import { modelService } from '../api/services/modelService';

const ModelLibrary = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  // Fetch models from backend on mount
  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await modelService.getAllModels();
      setModels(data);
    } catch (err) {
      setError('Failed to load models. Please refresh the page.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleModel = async (id) => {
    const modelToUpdate = models.find(m => m.id === id);
    if (!modelToUpdate) return;

    // Optimistically update UI
    setModels(models.map(model =>
      model.id === id ? { ...model, enabled: !model.enabled } : model
    ));
    setUpdating(id);

    try {
      await modelService.updateModel(id, {
        enabled: !modelToUpdate.enabled
      });
    } catch (err) {
      // Revert if failed
      setModels(models.map(model =>
        model.id === id ? { ...model, enabled: modelToUpdate.enabled } : model
      ));
      setError('Failed to update model. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const updateConfidence = async (id, value) => {
    const threshold = parseFloat(value);
    const modelToUpdate = models.find(m => m.id === id);
    if (!modelToUpdate) return;

    // Update local state
    setModels(models.map(model =>
      model.id === id ? { ...model, confidence_threshold: threshold } : model
    ));

    try {
      await modelService.updateModel(id, {
        confidence_threshold: threshold
      });
    } catch (err) {
      // Revert on failure
      setModels(models.map(model =>
        model.id === id ? { ...model, confidence_threshold: modelToUpdate.confidence_threshold } : model
      ));
      setError('Failed to update confidence threshold.');
    }
  };

  const liveVideoModels = models.filter(m => m.mode === 'both');
  const videoModels = models.filter(m => m.mode === 'video');

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
          <p style={{ color: '#6b7280' }}>Loading AI Models...</p>
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
            onClick={fetchModels}
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
              Live + Video Models ({liveVideoModels.length})
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
              Face Detection & Recognition - Real-time + Video
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
                  {model.icon || '🧠'}
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a2e', margin: 0 }}>
                    {model.name}
                  </h4>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    background: model.mode === 'both' ? '#dbeafe' : '#fef3c7',
                    color: model.mode === 'both' ? '#1a3a5c' : '#92400e',
                    fontWeight: '500'
                  }}>
                    {model.mode === 'both' ? 'Live + Video' : 'Video Only'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => toggleModel(model.id)}
                disabled={updating === model.id}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: updating === model.id ? 'not-allowed' : 'pointer',
                  fontSize: '28px',
                  color: model.enabled ? '#22c55e' : '#d1d5db',
                  padding: '4px',
                  opacity: updating === model.id ? 0.5 : 1
                }}
              >
                {updating === model.id ? '⏳' : (model.enabled ? <FiToggleRight /> : <FiToggleLeft />)}
              </button>
            </div>

            <p style={{
              fontSize: '13px',
              color: '#6b7280',
              marginTop: '12px',
              marginBottom: '16px'
            }}>
              {model.description || 'AI model for video analytics'}
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
                      {Math.round((model.confidence_threshold || 0.5) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.95"
                    step="0.05"
                    value={model.confidence_threshold || 0.5}
                    onChange={(e) => updateConfidence(model.id, e.target.value)}
                    disabled={!model.enabled || updating === model.id}
                    style={{
                      width: '100%',
                      marginTop: '4px',
                      accentColor: '#1a3a5c',
                      opacity: (model.enabled && updating !== model.id) ? 1 : 0.5
                    }}
                  />
                </div>
                <button style={{
                  padding: '6px 14px',
                  background: '#f5f7fa',
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