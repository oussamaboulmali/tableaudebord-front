/**
 * @fileoverview Authentication Context
 * @description React Context for managing global authentication state and configuration.
 * Provides authentication handlers, API URLs, user privileges, and menu routing throughout the app.
 */

import { createContext } from "react";

/**
 * Authentication Context
 * 
 * Provides the following values to all child components:
 * @property {Function} handleValidateLogin - Validates and sets login state
 * @property {Function} handleByPassOtp - Bypasses OTP verification
 * @property {Function} handleDisconnect - Handles user logout
 * @property {string} baseUrl - Backend API base URL
 * @property {string} imageUrl - Image storage URL
 * @property {string} frontalUrl - Frontend URL
 * @property {string} emptyData - Message for empty data states
 * @property {Array} routes - Application routes
 * @property {string} lang - Current language code
 * @property {Array} detailedMenu - Detailed menu structure with topics
 * @property {Array} userPrivileges - Current user's privileges/permissions
 * @property {number} MaxImageSize - Maximum allowed image size
 * @property {BroadcastChannel} authChannel - Channel for cross-tab authentication
 * @property {string} currentDirection - Text direction (ltr/rtl) for current language
 * @property {Array} supportedLangs - List of supported languages
 * @property {string} currentLang - Current active language code
 * 
 * @example
 * const { baseUrl, userPrivileges } = useContext(AuthContexte);
 */
const AuthContexte = createContext();

export { AuthContexte };
