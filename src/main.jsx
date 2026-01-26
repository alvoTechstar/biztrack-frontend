import React from 'react'; // Add this line
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import "./fonts/Averta/Averta-Light.otf";
import "./fonts/Averta/Averta-Regular.otf";
import "./fonts/Averta/Averta-Bold.otf";
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);