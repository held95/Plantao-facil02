// API Client Configuration
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor for logging and auth (future)
apiClient.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }

    // Add auth token here in Phase 3
    // const token = getAuthToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      console.error('[API Error Response]', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });

      // Handle specific status codes
      if (error.response.status === 401) {
        // Unauthorized - redirect to login (Phase 3)
        console.error('Unauthorized access - authentication required');
      }

      if (error.response.status === 404) {
        console.error('Resource not found');
      }

      if (error.response.status === 500) {
        console.error('Server error');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('[API No Response]', error.request);
    } else {
      // Error setting up the request
      console.error('[API Setup Error]', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
