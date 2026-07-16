import apiClient from '../client';

export const userService = {
  // Get all users
  async getAllUsers() {
    try {
      console.log('👥 Fetching users...');
      const response = await apiClient.get('/users/');
      console.log('✅ Users fetched:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      throw error;
    }
  },

  // Get single user
  async getUser(userId) {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch user:', error);
      throw error;
    }
  },

  // Create user
  async createUser(userData) {
    try {
      console.log('📝 Creating user:', userData);
      const response = await apiClient.post('/users/', userData);
      console.log('✅ User created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create user:', error);
      throw error;
    }
  },

  // Update user
  async updateUser(userId, updateData) {
    try {
      console.log(`📝 Updating user ${userId}:`, updateData);
      const response = await apiClient.put(`/users/${userId}`, updateData);
      console.log('✅ User updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update user:', error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(userId) {
    try {
      console.log(`🗑️ Deleting user ${userId}`);
      await apiClient.delete(`/users/${userId}`);
      console.log('✅ User deleted');
      return true;
    } catch (error) {
      console.error('❌ Failed to delete user:', error);
      throw error;
    }
  }
};