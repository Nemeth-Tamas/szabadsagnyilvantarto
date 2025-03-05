import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectToken, setUser, logoutUser } from "./store/userSlice";
import api from "./api";
import { store } from "./store/store";
import { jwtDecode } from 'jwt-decode';

const WebSocketContext = createContext(null);

export const WebScoketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const token = useSelector(selectToken);
  const backend = import.meta.env.VITE_BACKEND_BASEADDRESS;
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 5000;
  const maxMessages = 100;

  const refreshToken = async () => {
    const isLoginPage = window.location.pathname === "/login";
    if (isLoginPage) return null;
    try {
      const { data } = await api.post(`${backend}/refresh-token`);
      store.dispatch(setUser({ token: data.accessToken, user: jwtDecode(data.accessToken)}));
      return data.accessToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      store.dispatch(logoutUser());
      window.location.href = '/login';
      return null;
    }
  }

  const connect = async () => {
    let currentToken = token;
    if (!currentToken) {
      currentToken = await refreshToken();
    }
    if (currentToken && reconnectAttempts.current < maxReconnectAttempts) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected');
        return;
      }

      let url = `${backend.replace(/^http/, 'ws')}?token=${token}`
      const socket = new WebSocket(url);

      socket.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts.current = 0; // Reset reconnect attempts on successful connection
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessages((prev) => {
          return [...prev, message].slice(-maxMessages);
        });
      };

      socket.onerror = (event) => {
        console.error('WebSocket error:', event);
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected');
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          setTimeout(connect, reconnectDelay);
        }
      };

      setWs(socket);
    }
  }

  useEffect(() => {
    connect();
    return () => {
      if (ws) {
        ws.close();
      }
    }
  }, [token]);

  return (
    <WebSocketContext.Provider value={{ ws, messages, setMessages }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => {
  return useContext(WebSocketContext);
}