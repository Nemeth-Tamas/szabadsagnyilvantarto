import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { ThemeProvider } from './ThemeContext';
import { Provider } from 'react-redux';
import { store, presistor } from './store/store';
import { PersistGate } from 'redux-persist/integration/react';
import { WebSocketProvider } from './WebSocketContext';
import { KeyboardProvider } from './KeyboardContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={presistor}>
      <ThemeProvider>
        <WebSocketProvider>
          <KeyboardProvider>
            <React.StrictMode>
              <App />
            </React.StrictMode>
          </KeyboardProvider>
        </WebSocketProvider>
      </ThemeProvider>
    </PersistGate>
  </Provider>
)
