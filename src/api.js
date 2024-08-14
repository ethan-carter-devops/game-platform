import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Ensure cookies are sent with requests
});

// No need for token storage functions as we use cookies now

// Simplified request interceptor (if needed for other headers)
// Function to get the token from the cookie
// Request interceptor to add the token to the Authorization header
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the session by calling the refresh endpoint
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/auth/refresh`,
          null,
          { withCredentials: true }
        );

        // Retry the original request after successful refresh
        return api(originalRequest);
      } catch (refreshError) {
        // If the refresh fails, redirect to login or handle the error accordingly
        // Clear any session state (if needed) and redirect to login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
