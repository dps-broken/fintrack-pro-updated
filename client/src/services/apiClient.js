import axios from 'axios';

// Get the API URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true, // Uncomment if you are using HttpOnly cookies for JWT
});

// --- Request Interceptor ---
// Adds the JWT token to the Authorization header for every request if available.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
// Handles global errors, like 401 Unauthorized (token expired or invalid).
apiClient.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    const originalRequest = error.config;

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        // Handle 401 Unauthorized (e.g., token expired)
        console.error("API Client: Unauthorized access - 401. Logging out.");
        // Option 1: Directly trigger logout (if AuthContext is accessible or via event bus)
        // This is tricky because apiClient shouldn't directly know about AuthContext.
        // One way is to dispatch a custom event that AuthContext listens to.
        // window.dispatchEvent(new CustomEvent('auth-error-401'));

        // Option 2: Redirect to login page (less ideal as it doesn't clear context state cleanly)
        // if (window.location.pathname !== '/login') {
        //   localStorage.removeItem('authToken'); // Clear token
        //   window.location.href = '/login'; // Force redirect
        // }

        // For simplicity in this example, we'll just let the AuthContext's checkAuthStatus handle it
        // or the calling component to handle the error and trigger logout.
        // Ensure localStorage token is cleared if it's proven invalid.
        if (originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/register') {
             // Don't clear token if the error was on login/register itself
            localStorage.removeItem('authToken');
            // TODO: Better way to trigger logout from AuthContext.
            // A simple way for now, though not ideal, is to reload if not on login page to trigger AuthContext re-check
            // if (window.location.pathname !== '/login') window.location.reload();
        }
      }
      // You can add more global error handling here for other status codes (e.g., 403, 500)
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Client: No response received from server:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Client: Error setting up request:', error.message);
    }
    return Promise.reject(error); // Important to reject the promise so the calling code can handle it
  }
);

export default apiClient;