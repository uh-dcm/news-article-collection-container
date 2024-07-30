import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.tsx';
import './css/index.css';
import { Toaster } from '@/components/ui/sonner';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          classNames: {
            title: 'text-sm',
          },
        }}
      />
      <App />
    </Router>
  </React.StrictMode>
);
