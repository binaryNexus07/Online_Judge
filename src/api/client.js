import axios from 'axios';
import { setupMockAPI } from './mock';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Only enable mock API if explicitly opted in
if (import.meta.env.VITE_USE_MOCK_API === 'true') {
  setupMockAPI(axiosInstance);
}

export default axiosInstance;
