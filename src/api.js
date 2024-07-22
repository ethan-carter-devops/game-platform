import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to get the stored token
export const getStoredToken = () => {
  const token = localStorage.getItem("accessToken");
  return token ? JSON.parse(token) : null;
};

// Function to store the token
export const storeToken = (token) => {
  localStorage.setItem("accessToken", JSON.stringify(token));
};

// Function to remove the token
export const removeToken = () => {
  localStorage.removeItem("accessToken");
};

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const token = getStoredToken();
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/auth/refresh`,
          {
            refresh_token: token.refresh_token,
          }
        );

        const { access_token, refresh_token } = response.data;
        storeToken({ access_token, refresh_token });

        // Retry the original request with the new token
        originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (error) {
        // If refresh token fails, log out the user
        removeToken();
        // Redirect to login page or show login modal
        // You might want to use your app's routing mechanism here
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
