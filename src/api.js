import axios from 'axios';
import { store } from './store/store'; // Import your Redux store
import { setUser, logoutUser } from './store/userSlice'; // Import your Redux actions
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode to decode JWT

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASEADDRESS, // Update to match your backend's base URL
  withCredentials: true, // Ensure cookies are sent with requests
});

// Request interceptor to add the access token to headers
api.interceptors.request.use(
  (config) => {
    const token = store.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refreshing
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_BASEADDRESS}/refresh-token`, {}, { withCredentials: true });
        store.dispatch(setUser({ token: data.accessToken, user: jwtDecode(data.accessToken) })); // Update the token and user in Redux store
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed', refreshError);
        store.dispatch(logoutUser()); // Dispatch logout action if refresh token fails
        window.location.href = '/login'; // Redirect to login page
      }
    }
    return Promise.reject(error);
  }
);

export default api;