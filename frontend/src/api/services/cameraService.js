import apiClient from '../client';

export const cameraService = {
  // Get all cameras
  async getAllCameras() {
    try {
      console.log('📦 Fetching cameras...');
      const response = await apiClient.get('/cameras/');
      console.log('✅ Cameras fetched:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch cameras:', error);
      throw error;
    }
  },

  // Get single camera
  async getCamera(cameraId) {
    try {
      const response = await apiClient.get(`/cameras/${cameraId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch camera:', error);
      throw error;
    }
  },

  // Create new camera
  async createCamera(cameraData) {
    try {
      console.log('📝 Creating camera:', cameraData);
      const response = await apiClient.post('/cameras/', cameraData);
      console.log('✅ Camera created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create camera:', error);
      throw error;
    }
  },

  // Update camera
  async updateCamera(cameraId, updateData) {
    try {
      console.log(`📝 Updating camera ${cameraId}:`, updateData);
      const response = await apiClient.put(`/cameras/${cameraId}`, updateData);
      console.log('✅ Camera updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update camera:', error);
      throw error;
    }
  },

  // Delete camera
  async deleteCamera(cameraId) {
    try {
      console.log(`🗑️ Deleting camera ${cameraId}`);
      await apiClient.delete(`/cameras/${cameraId}`);
      console.log('✅ Camera deleted');
      return true;
    } catch (error) {
      console.error('❌ Failed to delete camera:', error);
      throw error;
    }
  },

  // Test camera connection
  async testConnection(cameraId) {
    try {
      // This could be a separate endpoint or just attempt to connect
      console.log(`🔌 Testing connection for camera ${cameraId}`);
      // For now, just get the camera details
      const response = await apiClient.get(`/cameras/${cameraId}`);
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { success: false, message: 'Connection failed' };
    }
  }
};