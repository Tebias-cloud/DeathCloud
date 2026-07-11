import axios from 'axios';
import { UserDto } from '../dtos/userDto';

const getApiUrl = (route) => {
  if (globalThis.location.protocol !== 'file:') {
    return `/api/${route}`;
  }
  const base = import.meta.env.VITE_API_URL || '/api';
  return `${base}/${route}`;
};

export const authService = {
  async login(email, password) {
    try {
      const response = await axios.post(getApiUrl('login'), { email, password });
      return {
        success: true,
        user: new UserDto(response.data),
        token: response.data.token,
        rawData: response.data // To access raw data just in case during transition
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error de conexión'
      };
    }
  },

  async register(username, email, password) {
    try {
      const response = await axios.post(getApiUrl('register'), { username, email, password });
      return {
        success: true,
        user: new UserDto(response.data),
        token: response.data.token,
        rawData: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error de conexión'
      };
    }
  }
};
