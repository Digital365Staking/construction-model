import React from 'react';
import ReactDOM from 'react-dom/client'; // New import for React 18
import { BrowserRouter } from 'react-router-dom';
import App from './App'; // Import the main App component

// Create a root and render the app
const root = ReactDOM.createRoot(document.getElementById('root')); // Matches the div in index.html


root.render(
    <BrowserRouter basename="/">
      <App />
    </BrowserRouter>
);