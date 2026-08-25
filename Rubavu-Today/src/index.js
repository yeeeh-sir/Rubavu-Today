import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import rubavuIcon from './Rubavu.jpeg';

document.querySelector('link[rel="icon"]')?.setAttribute('href', rubavuIcon);
document.querySelector('link[rel="apple-touch-icon"]')?.setAttribute('href', rubavuIcon);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);




reportWebVitals();
