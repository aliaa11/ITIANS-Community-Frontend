import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store.js';
import App from './App.jsx';
import './index.css';
import { TranslationProvider } from './contexts/TranslationContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <TranslationProvider>
        <App />
      </TranslationProvider>
    </Provider>
  </React.StrictMode>
);