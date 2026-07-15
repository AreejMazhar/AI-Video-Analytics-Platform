import apiClient from '../client';

export const analyticsService = {
  // Get dashboard stats
  async getDashboardStats() {
    try {
      console.log('📊 Fetching dashboard stats...');
      const response = await apiClient.get('/analytics/dashboard/stats');
      console.log('✅ Dashboard stats fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch dashboard stats:', error);
      throw error;
    }
  },

  // Get recent events
  async getRecentEvents(limit = 10) {
    try {
      console.log('📋 Fetching recent events...');
      const response = await apiClient.get(`/analytics/dashboard/events?limit=${limit}`);
      console.log('✅ Recent events fetched:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch recent events:', error);
      throw error;
    }
  },

  // Get recent alerts
  async getRecentAlerts(limit = 5) {
    try {
      console.log('🔔 Fetching recent alerts...');
      const response = await apiClient.get(`/analytics/dashboard/alerts?limit=${limit}`);
      console.log('✅ Recent alerts fetched:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch recent alerts:', error);
      throw error;
    }
  },

  // Get camera health
  async getCameraHealth() {
    try {
      console.log('🏥 Fetching camera health...');
      const response = await apiClient.get('/analytics/dashboard/camera-health');
      console.log('✅ Camera health fetched:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch camera health:', error);
      throw error;
    }
  },

  // Get model performance
  async getModelPerformance() {
    try {
      console.log('📈 Fetching model performance...');
      const response = await apiClient.get('/analytics/dashboard/model-performance');
      console.log('✅ Model performance fetched:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch model performance:', error);
      throw error;
    }
  },

  // Get detection breakdown (for analytics page)
  async getDetectionBreakdown(days = 7) {
    try {
      console.log('📊 Fetching detection breakdown...');
      const response = await apiClient.get(`/analytics/detection-breakdown?days=${days}`);
      console.log('✅ Detection breakdown fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch detection breakdown:', error);
      throw error;
    }
  },

  // Get daily detection trends (for analytics page)
  async getDailyTrends(days = 7) {
    try {
      console.log('📈 Fetching daily trends...');
      const response = await apiClient.get(`/analytics/daily-trends?days=${days}`);
      console.log('✅ Daily trends fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch daily trends:', error);
      throw error;
    }
  },

  // Export CSV
    async exportCSV(days = 7) {
        try {
            console.log('📥 Exporting CSV...');
            const response = await apiClient.get(`/analytics/export/csv?days=${days}`, {
            responseType: 'blob'
            });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'analytics_export.csv';
            if (contentDisposition) {
            const match = contentDisposition.match(/filename=(.+)/);
            if (match) filename = match[1];
            }
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            console.log('✅ CSV exported successfully');
        } catch (error) {
            console.error('❌ Failed to export CSV:', error);
            throw error;
        }
    },

    // Export PDF/HTML
    async exportPDF(days = 7) {
        try {
            console.log('📥 Exporting PDF...');
            const response = await apiClient.get(`/analytics/export/pdf?days=${days}`, {
            responseType: 'blob'
            });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'analytics_report.html';
            if (contentDisposition) {
            const match = contentDisposition.match(/filename=(.+)/);
            if (match) filename = match[1];
            }
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            console.log('✅ PDF exported successfully');
        } catch (error) {
            console.error('❌ Failed to export PDF:', error);
            throw error;
        }
    }

};

