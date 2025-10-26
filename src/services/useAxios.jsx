/**
 * @fileoverview Custom Axios Hook
 * @description Custom React hook for making HTTP requests with Axios.
 * Handles loading states, errors, and authentication flows.
 * Automatically manages session expiration and redirects to login on authentication failures.
 */

import { useState } from "react";
import axios from "axios";
import { TreatError, removeLangKeysFromLocalStorage } from "../helpers/Gfunc";

/**
 * Custom hook for making HTTP requests using Axios
 * 
 * @param {Object} initialConfig - Initial configuration for the request
 * @param {string} initialConfig.url - API endpoint URL
 * @param {string} initialConfig.method - HTTP method (get, post, put, delete)
 * @param {Object} initialConfig.body - Request body data
 * 
 * @returns {Object} Hook state and methods
 * @returns {Object|null} response - Axios response object
 * @returns {string} error - Error message if request fails
 * @returns {boolean} loading - Loading state indicator
 * @returns {Function} fetchData - Function to trigger the API request
 * @returns {Function} clearData - Function to reset hook state
 * 
 * @example
 * const { response, loading, error, fetchData } = useAxios({
 *   method: "post",
 *   url: baseUrl + "auth/login",
 *   body: { username, password }
 * });
 */
const useAxios = (initialConfig = {}) => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Fetches data from the API endpoint
   * 
   * @param {Object} config - Request configuration (defaults to initialConfig)
   * @returns {Promise<void>}
   * 
   * @throws Will handle errors automatically:
   * - Server errors: Sets error state and handles logout if required
   * - Network errors: Clears session and redirects to login
   */
  const fetchData = async (config = initialConfig) => {
    setLoading(true);
    try {
      const { url, method, body } = config;
      
      // Make HTTP request with credentials for session management
      const res = await axios[method](url, body, {
        withCredentials: true,
      });
      
      setResponse(res);
    } catch (error) {
      // Handle server response errors (4xx, 5xx)
      if (error.response) {
        setError(error.response.data.message);
        
        // Logout required: Clear session and redirect
        if (error?.response?.data?.logout) {
          sessionStorage.clear();
          removeLangKeysFromLocalStorage(import.meta.env.VITE_LAN);
          window.location.replace("/login");
        }
        
        // Handle expired session: Show error and logout
        if (error?.response?.data?.hasSession === false) {
          TreatError(error.response.data.message);
        }
      } else if (error.request) {
        // Network error: No response from server
        removeLangKeysFromLocalStorage(import.meta.env.VITE_LAN);
        sessionStorage.clear();
        window.location.replace("/login");
        setError("Aucune réponse du serveur");
      }
    }
    setLoading(false);
  };

  /**
   * Clears all hook state (response, loading, error)
   * Useful for resetting the hook after a request or before a new one
   * 
   * @returns {void}
   */
  const clearData = () => {
    setResponse(null);
    setLoading(false);
    setError("");
  };
  return { response, loading, error, fetchData, clearData };
};

export { useAxios };
