import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { ThemeProvider } from './ThemeContext';
import { Provider } from 'react-redux';
import { store, presistor } from './store/store';
import { PersistGate } from 'redux-persist/integration/react';
import { WebScoketProvider } from './WebSocketContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={presistor}>
      <ThemeProvider>
        <WebScoketProvider>
          <React.StrictMode>
            <App />
          </React.StrictMode>
        </WebScoketProvider>
      </ThemeProvider>
    </PersistGate>
  </Provider>
)
