// src/services/logisticsAuthService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const loginLogisticsUser = async (credentials) => {
  try {
    // 1. Build a unified payload compatible with handleLogin
    const payload = {
      identifier: credentials.identifier || credentials.email || credentials.userId,
      password: credentials.password,
      deskRole: credentials.deskRole || credentials.role,
      portalType: 'LOGISTICS' // Ensures backend triggers Logistics authorization checks
    };

    // 2. Execute login POST request
    const response = await axios.post(`${API_BASE_URL}/v1/auth/handleLogin`, payload);
    
    // 3. Store authentication session data on success
    if (response.data.success) {
      const { token, user } = response.data;
      localStorage.setItem('logistics_token', token);
      localStorage.setItem('logistics_user', JSON.stringify(user));
    }
    
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Login failed';
    throw new Error(message);
  }
};