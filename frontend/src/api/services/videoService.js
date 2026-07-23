import apiClient from '../client';

export const videoService = {
  /**
   * Upload and process a video file with the face detection model.
   * @param {File} videoFile - the video File object
   * @param {Function} onUploadProgress - callback(percent: number) called during upload
   * @returns {Promise<Object>} - processing result including thumbnail_urls, stats, etc.
   */
  async processVideo(videoFile, onUploadProgress) {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('models', JSON.stringify(['Face Detection']));

    const response = await apiClient.post('/video/process', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 600_000, // 10 minutes — large videos can take a while
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(pct);
        }
      },
    });

    return response.data;
  },

  /**
   * Serve a thumbnail image URL (authenticated route).
   */
  thumbnailUrl(jobId, filename) {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    return `${base}/video/thumbnail/${jobId}/${filename}`;
  },

  /**
   * Delete all saved thumbnails for a processing job.
   * @param {string} jobId
   */
  async cleanupJob(jobId) {
    try {
      await apiClient.delete(`/video/cleanup/${jobId}`);
    } catch (err) {
      // Non-critical — log but don't throw
      console.warn('⚠️  Thumbnail cleanup failed (non-fatal):', err?.message);
    }
  },

  /**
   * Get all detection log entries for a job.
   */
  async getResults(jobId) {
    const response = await apiClient.get(`/video/results/${jobId}`);
    return response.data;
  },
};