import axios from 'axios';

const getApiUrl = (route) => {
  if (globalThis.location.protocol !== 'file:') {
    return `/api/${route}`;
  }
  const base = import.meta.env.VITE_API_URL || '/api';
  return `${base}/${route}`;
};

export const communityService = {
  async getNewsByGame(gameId) {
    try {
      const response = await axios.get(getApiUrl(`community/${gameId}/news`));
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      }
      return { success: false, data: [] };
    } catch (error) {
      console.error('Error in communityService.getNewsByGame:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  async getPosts(gameId) {
    try {
      // Use standard fetch mechanism just to wrap it cleanly, or axios
      const token = localStorage.getItem('jwt_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(getApiUrl(`community/${gameId}/posts`), { headers });
      return response.data;
    } catch (error) {
      console.error('Error in communityService.getPosts:', error);
      return { success: false, error: error.message };
    }
  }
};
