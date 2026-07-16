import apiClient from '../client';

export const detectionLogService = {
  // Get detections with pagination and filters
  async getDetections(params = {}) {
    try {
      console.log('📋 Fetching detections...', params);
      const response = await apiClient.get('/detections/', { params });
      console.log('✅ Detections fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch detections:', error);
      throw error;
    }
  },

  // Export detections as CSV
  async exportDetections(params = {}) {
    try {
      console.log('📥 Exporting detections...', params);
      const response = await apiClient.get('/detections/export', {
        params,
        responseType: 'blob',
        timeout: 60000
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'detection_logs.csv';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename=(.+)/);
        if (match) filename = match[1];
      }
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Detections exported successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to export detections:', error);
      throw error;
    }
  },

  // Get detection stats
  async getStats() {
    try {
      const response = await apiClient.get('/detections/stats');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch detection stats:', error);
      throw error;
    }
  }
};