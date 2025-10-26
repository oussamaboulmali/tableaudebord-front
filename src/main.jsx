/**
 * @fileoverview Application entry point
 * @description Main entry point for the React application. Initializes React root and renders the App component.
 * @author APS Development Team
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

/**
 * Initialize React application
 * Creates root element and renders the main App component
 */
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
