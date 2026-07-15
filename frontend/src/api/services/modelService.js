import apiClient from '../client';

export const modelService = {
  // Get all models
  async getAllModels() {
    const response = await apiClient.get('/models/');
    return response.data;
  },

  // Get only enabled models
  async getEnabledModels() {
    const response = await apiClient.get('/models/enabled');
    return response.data;
  },

  // Update model (enable/disable, threshold, camera assignment)
  async updateModel(modelId, updates) {
    const response = await apiClient.put(`/models/${modelId}`, updates);
    return response.data;
  },

  // Get models assigned to a camera
  async getModelsForCamera(cameraId) {
    const response = await apiClient.get(`/models/cameras/${cameraId}`);
    return response.data;
  }
};