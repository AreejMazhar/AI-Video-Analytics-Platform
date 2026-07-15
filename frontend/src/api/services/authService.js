import apiClient from '../client';

export const authService = {
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      console.log('Login Response:', response.data);
      
      if (response.data && response.data.access_token) {
        // Store token
        localStorage.setItem('access_token', response.data.access_token);
        
        // Get user data from response
        let userData = response.data.user;
        
        // If user data is not in the response, create it from email
        if (!userData) {
          userData = {
            id: 1,
            name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            email: email,
            role: 'admin'
          };
          console.log('Created user data from email:', userData);
        }
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('Token stored:', localStorage.getItem('access_token'));
        console.log('User stored:', localStorage.getItem('user'));
        
        return {
          access_token: response.data.access_token,
          token_type: response.data.token_type || 'bearer',
          user: userData
        };
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      throw new Error('Login failed. Please try again.');
    }
  },

  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  async getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }
};