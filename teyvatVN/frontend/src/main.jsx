/**
 * Application Entry Point
 * 
 * This is the very first file that runs when the website loads.
 * It takes our entire React application (the <App /> component) and "injects" it 
 * into the HTML file (specifically, into the div with id="root").
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // Import global styles
import App from "./App.jsx"; // Import the main app component

// Find the HTML element with id="root"
const rootElement = document.getElementById("root");

// Create a React root on that element and render our app inside it
createRoot(rootElement).render(
  // <StrictMode> is a development tool that checks for potential problems in the app.
  // It effectively runs some code twice to catch bugs early. It only runs in development, not production.
  <StrictMode>
    <App />
  </StrictMode>
);
