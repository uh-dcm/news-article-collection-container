import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './css/index.css';

export const backendUrl = 'http://localhost:5000';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
