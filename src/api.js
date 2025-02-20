import axios from 'axios';
import { store } from './store/store'; // Import your Redux store
import { setUser, logoutUser } from './store/userSlice'; // Import your Redux actions
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode to decode JWT

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASEADDRESS, // Update to match your backend's base URL
  withCredentials: true, // Ensure cookies are sent with requests
});

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.map((callback) => callback(token));
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

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
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_BASEADDRESS}/refresh-token`, {}, { withCredentials: true });
        store.dispatch(setUser({ token: data.accessToken, user: jwtDecode(data.accessToken) })); // Update the token and user in Redux store
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        isRefreshing = false;
        onRefreshed(data.accessToken);
        refreshSubscribers = [];
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed', refreshError);
        store.dispatch(logoutUser()); // Dispatch logout action if refresh token fails
        window.location.href = '/login'; // Redirect to login page
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;