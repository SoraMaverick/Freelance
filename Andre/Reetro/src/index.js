import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Importiere die App-Komponente
import './index.css'; // Für Tailwind CSS Imports

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
