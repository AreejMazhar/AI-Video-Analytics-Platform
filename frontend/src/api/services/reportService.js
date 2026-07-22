import apiClient from '../client';

export const reportService = {
  // Get all reports
  async getAllReports() {
    try {
      console.log('📄 Fetching reports...');
      const response = await apiClient.get('/reports/');
      console.log('✅ Reports fetched:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch reports:', error);
      throw error;
    }
  },

  // Get report stats
  async getStats() {
    try {
      const response = await apiClient.get('/reports/stats');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch report stats:', error);
      throw error;
    }
  },

  // Generate new report
  async generateReport(reportData) {
    try {
      console.log('📝 Generating report:', reportData);
      const response = await apiClient.post('/reports/generate', reportData);
      console.log('✅ Report generated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to generate report:', error);
      throw error;
    }
  },

  // Download report
  async downloadReport(reportId, reportFormat = 'pdf') {
    try {
      console.log(`📥 Downloading report ${reportId}`);
      const response = await apiClient.get(`/reports/${reportId}/download`, {
        responseType: 'blob',
        timeout: 60000
      });
      
      // Determine extension: csv stays .csv, everything else is .html (styled HTML report)
      const ext = reportFormat === 'csv' ? 'csv' : 'html';
      let filename = `report_${reportId}.${ext}`;

      // Try to read Content-Disposition header (requires CORS expose_headers)
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const match = contentDisposition.match(/filename=[\"']?([^\"';\s]+)[\"']?/);
        if (match && match[1]) filename = match[1];
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log(`✅ Report downloaded as: ${filename}`);
      return { filename };
    } catch (error) {
      console.error('❌ Failed to download report:', error);
      throw error;
    }
  },

  // Delete report
  async deleteReport(reportId) {
    try {
      console.log(`🗑️ Deleting report ${reportId}`);
      await apiClient.delete(`/reports/${reportId}`);
      console.log('✅ Report deleted');
      return true;
    } catch (error) {
      console.error('❌ Failed to delete report:', error);
      throw error;
    }
  }
};