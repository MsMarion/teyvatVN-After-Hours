/**
 * Application Entry Point
 * 
 * This file mounts the React application to the DOM.
 * It wraps the App component with StrictMode for development checks.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
