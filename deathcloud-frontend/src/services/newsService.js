import axios from 'axios';

const getApiUrl = (route) => {
  if (globalThis.location.protocol !== 'file:') {
    return `/api/${route}`;
  }
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  return `${base}/${route}`;
};

export const newsService = {
  async getNewsStats() {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await axios.get(getApiUrl('admin/news/stats'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return {
        success: true,
        data: response.data.users || response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error de conexión al obtener estadísticas'
      };
    }
  },
  async getUserStats() {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await axios.get(getApiUrl('admin/users/stats'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return {
        success: true,
        data: response.data.stats
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error de conexión al obtener estadísticas de usuarios'
      };
    }
  },
  async getUsers() {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await axios.get(getApiUrl('admin/users'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error al obtener usuarios'
      };
    }
  }
};
