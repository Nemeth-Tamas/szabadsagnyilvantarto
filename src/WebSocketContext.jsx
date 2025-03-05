import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, selectToken, setUser } from "./store/userSlice";
import { store } from "./store/store";
import api from "./api";
import { jwtDecode } from "jwt-decode";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [shouldReconnect, setShouldReconnect] = useState(true);
  const token = useSelector(selectToken);
  const dispatch = useDispatch();
  const backend = import.meta.env.VITE_BACKEND_BASEADDRESS;
  const reconnectAttempts = useRef(0);
  const tokenRefetchAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 5000;
  const reconnectTimeoutRef = useRef(null);
  const maxMessages = 100;
  const wsRef = useRef(null);
  // Track connection in progress
  const connectionInProgress = useRef(false);
  // Track if a connection was established since the last attempt reset
  const hasEstablishedConnection = useRef(false);

  // Get token from Redux store directly
  const getReduxToken = () => {
    const state = store.getState();
    return state.token;
  };

  // Refresh auth token if expired
  const refreshToken = async (forceRefresh = false) => {
    const isLoginPage = window.location.pathname === "/login";
    if (isLoginPage) {
      setShouldReconnect(false);
      return null;
    }

    if (!forceRefresh && tokenRefetchAttempts.current === 0) {
      tokenRefetchAttempts.current += 1;
      const freshToken = getReduxToken();
      if (freshToken) {
        console.log('Using fresh token from Redux store');
        return freshToken;
      }
    }

    try {
      console.log('Attempting to refresh token via API');
      const { data } = await api.post(`${backend}/refresh-token`);
      const decodedToken = jwtDecode(data.accessToken);
      store.dispatch(setUser({ token: data.accessToken, user: decodedToken }));
      return data.accessToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      store.dispatch(logoutUser());

      if (!isLoginPage) {
        window.location.href = '/login';
      }
      return null;
    }
  };

  // Cleanup function to properly close WebSocket and clear timeouts
  const cleanup = () => {
    console.log("Running cleanup");
    
    if (reconnectTimeoutRef.current) {
      console.log("Clearing reconnect timeout");
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      if ([WebSocket.OPEN, WebSocket.CONNECTING].includes(wsRef.current.readyState)) {
        console.log("Closing existing WebSocket connection");
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    connectionInProgress.current = false;
    setIsConnected(false);
  };

  // Connect to WebSocket server
  const connect = async (forceTokenRefresh = false) => {
    // Don't attempt to connect if we shouldn't reconnect
    if (!shouldReconnect) {
      console.log("Reconnection is disabled, skipping connection attempt");
      return;
    }
    
    // Prevent multiple simultaneous connection attempts
    if (connectionInProgress.current) {
      console.log("Connection attempt already in progress, skipping");
      return;
    }
    
    connectionInProgress.current = true;
    console.log(`Starting connection attempt (${reconnectAttempts.current}/${maxReconnectAttempts})`);

    // Check reconnect attempts
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.log(`Maximum reconnection attempts (${maxReconnectAttempts}) reached.`);
      setShouldReconnect(false);
      connectionInProgress.current = false;
      return;
    }

    // Clean up any existing connections
    if (wsRef.current) {
      console.log("Cleaning up existing connection before connecting");
      cleanup();
    }

    // Get current token or refresh if needed
    let currentToken = token;
    if (!currentToken || forceTokenRefresh) {
      currentToken = await refreshToken(forceTokenRefresh);
      if (!currentToken) {
        console.log("No token available, aborting connection attempt");
        connectionInProgress.current = false;
        return; // Exit if we couldn't get a token
      }
    }

    try {
      const wsUrl = `${backend.replace(/^http/, 'ws')}/ws?token=${currentToken}`;
      console.log(`Connecting to WebSocket at ${wsUrl}`);
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      // Store connection id to prevent race conditions
      const connectionId = Date.now();
      socket._connectionId = connectionId;

      socket.onopen = () => {
        // Avoid setting state for stale connections
        if (wsRef.current !== socket) {
          console.log('Ignoring open event for stale connection');
          return;
        }
        
        console.log('WebSocket connection established');
        hasEstablishedConnection.current = true;
        setIsConnected(true);
        tokenRefetchAttempts.current = 0;
        setWs(socket);
        connectionInProgress.current = false;
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setMessages((prev) => [...prev, message].slice(-maxMessages));
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Don't reset connectionInProgress here, wait for onclose
      };

      socket.onclose = (event) => {
        // Avoid handling close events for stale connections
        if (wsRef.current !== socket) {
          console.log('Ignoring close event for stale connection');
          return;
        }
        
        console.log(`WebSocket closed: ${event.code} - ${event.reason}`);
        setIsConnected(false);
        setWs(null);
        
        // Reset wsRef if it's the current connection
        if (wsRef.current === socket) {
          wsRef.current = null;
        }

        // If the connection closed due to auth issues, try refreshing the token
        const authErrors = [1001, 1006, 1008];
        const shouldTryTokenRefresh = authErrors.includes(event.code);

        // Prevent racing conditions - check if we should reconnect and not already reconnecting
        if (shouldReconnect && reconnectAttempts.current < maxReconnectAttempts && !connectionInProgress.current) {
          // If we've previously established a connection, don't increment the counter
          // only increment if this close was from a failed connection attempt
          if (!hasEstablishedConnection.current) {
            reconnectAttempts.current += 1;
          }
          
          console.log(`Scheduling reconnect... (Attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);

          // Clear any existing timeout before setting a new one
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Executing scheduled reconnect (Attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);
            connect(shouldTryTokenRefresh);
          }, reconnectDelay);
        } else {
          console.log("Not reconnecting: Either max attempts reached or reconnection disabled");
          connectionInProgress.current = false;
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      connectionInProgress.current = false;

      // Attempt to reconnect if we should
      if (shouldReconnect && reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current += 1;
        console.log(`Scheduling reconnect after error (Attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);

        // Clear any existing timeout before setting a new one
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(() => connect(true), reconnectDelay);
      }
    }
  };

  // Reset connection flags when token changes
  useEffect(() => {
    console.log("Token changed, updating connection state");
    
    if (token) {
      setShouldReconnect(true);
      hasEstablishedConnection.current = false; // Reset connection flag on token change
      tokenRefetchAttempts.current = 0;
    } else {
      setShouldReconnect(false);
    }
  }, [token]);

  // Connect when token changes or when shouldReconnect changes
  useEffect(() => {
    console.log(`Connection effect triggered: token=${!!token}, shouldReconnect=${shouldReconnect}`);
    
    if (token && shouldReconnect && !connectionInProgress.current) {
      // Reset connection attempt counter on deliberate connection initiation
      reconnectAttempts.current = 0;
      hasEstablishedConnection.current = false;
      console.log("Resetting reconnect counter and initiating connection");
      connect(false);
    }

    return cleanup;
  }, [token, shouldReconnect]);

  // Listen for route changes
  useEffect(() => {
    const handleRouteChange = () => {
      const isLoginPage = window.location.pathname === "/login";
      console.log(`Route changed: ${window.location.pathname}, isLoginPage=${isLoginPage}`);
      
      if (isLoginPage) {
        setShouldReconnect(false);
      } else if (token) {
        setShouldReconnect(true);
      }
    };

    handleRouteChange();
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [token]);

  // Value to provide through context
  const contextValue = {
    ws,
    messages,
    setMessages,
    isConnected,
    reconnect: () => {
      console.log("Manual reconnection triggered");
      reconnectAttempts.current = 0;
      hasEstablishedConnection.current = false;
      tokenRefetchAttempts.current = 0;
      setShouldReconnect(true);
      connect(false);
    },
    clearMessages: () => setMessages([]),
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}