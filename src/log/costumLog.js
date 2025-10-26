/**
 * @fileoverview Custom Logging Configuration
 * @description Configures loglevel library to send logs to backend API.
 * Automatically logs errors, warnings, and info messages to the server for monitoring.
 * Supports user blocking on security violations.
 */

import log from "loglevel";
import axios from "axios";

/**
 * Custom log method factory
 * Overrides default loglevel behavior to send logs to backend API
 * 
 * @param {string} methodName - Log level name (error, warn, info, etc.)
 * @returns {Function} Custom log function that sends data to API
 * 
 * @example
 * log.error("User input validation failed", "blocage", "Html Tags", 220)
 */
log.methodFactory = (methodName) => {
  /**
   * Custom log function
   * 
   * @param {string} message - Log message
   * @param {string} folder - Log category/folder (e.g., "blocage", "roles")
   * @param {string} action - Action being logged (e.g., "Html Tags", "Update")
   * @param {number} code - Response/error code
   * @param {string} api - Optional API endpoint for additional actions
   */
  return (message, folder, action, code, api) => {
    // Create log object with level, message, folder, and action
    const logObject = {
      level: methodName,
      message: message,
      folder: folder,
      action: action,
    };
    axios
      .post(import.meta.env.VITE_BASE_URL + "logs/front", logObject, {
        withCredentials: true,
      })
      .then((response) => {
        // Code 220 indicates security violation - can trigger user blocking
        if (code === 220) {
          // User blocking is handled in the calling code
          // Gfunc.BloquerUser(code, api);
        }
      })
      .catch((error) => {
        // Silent fail - logging errors should not break the application
        // Errors are not displayed to avoid exposing backend issues
      });
  };
};

// Enable all log levels (error, warning, info, debug, trace)
log.enableAll();

export default log;
