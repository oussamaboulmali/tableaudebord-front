/**
 * @fileoverview Main Application Component
 * @description Root component that handles routing, authentication, and menu management.
 * Manages multi-language support, dynamic route loading, and cross-tab authentication.
 * Provides global context for authentication state and user privileges.
 * 
 * @author APS Development Team
 */

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import "./assets/styles/global.css";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./assets/styles/theme";
import { AuthContexte } from "./Context/AuthContext";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAxios } from "./services/useAxios";
import Login from "./pages/Auth/index";
import LoginForm from "./pages/Auth/AuthForm";
import Otp from "./pages/Auth/otpForm";
import Pages from "./pages/index";
import * as Gfunc from "./helpers/Gfunc";
import NotFound from "./404";
import { getLanguageDirection, supportedLangs } from "./lang";

/**
 * Determines the current language from the URL path
 * Defaults to French ("fr") if no language detected in path
 * 
 * @returns {string} Current language code (fr, ar, en, etc.)
 * 
 * @example
 * // URL: /ar/login -> returns "ar"
 * // URL: /fr/articles -> returns "fr"
 * // URL: /unknown -> returns "fr"
 */
const getCurrentLanguage = () => {
  const path = window.location.pathname;
  for (const lang of supportedLangs) {
    if (path.startsWith(`/${lang?.code}`)) {
      return lang?.code;
    }
  }
  return "fr"; // Default language
};

/**
 * Main App Component
 * 
 * Responsibilities:
 * - Manages authentication state (login, OTP verification)
 * - Loads and processes dynamic menu structure from API
 * - Handles multi-language routing with URL-based language detection
 * - Provides global context for authentication and configuration
 * - Implements cross-tab authentication synchronization
 * - Dynamically loads page components based on user permissions
 * 
 * @component
 * @returns {JSX.Element} Main application with routing and context providers
 */
function App() {
  // Environment configuration
  const baseUrl = import.meta.env.VITE_BASE_URL; // Backend API URL
  const imageUrl = import.meta.env.VITE_IMAGE_URL; // Image CDN URL
  const emptyData = import.meta.env.VITE_EMPTY_DATA; // Empty state message
  const frontalUrl = import.meta.env.VITE_URL_FRONTAL; // Frontend public URL
  const MaxImageSize = import.meta.env.VITE_MAX_IMAGE_SIZE; // Max image size in bytes
  const lang = import.meta.env.VITE_LAN; // Default language
  const currentLang = getCurrentLanguage(); // Detected language from URL
  
  // State management
  const [routes, setRoutes] = useState([]);
  const [detailedMenu, setDetailedMenu] = useState([]); // Processed menu with components

  // Authentication state - persists across page reloads using localStorage
  const [isLogged, setIsLogged] = useState(() => {
    return localStorage.getItem("isLogged" + currentLang) === "true";
  });

  // OTP verification state - session-based
  const [isExisted, setIsExisted] = useState(() => {
    return sessionStorage.getItem("isExisted") === "true";
  });

  // User permissions loaded from backend
  const [userPrivileges, setUserPrivileges] = useState([]);
  
  // BroadcastChannel for cross-tab authentication synchronization
  const authChannel = new BroadcastChannel("auth");

  // Fetch user-specific menu structure from backend
  const { response, loading, error, fetchData } = useAxios({
    method: "post",
    url: baseUrl + "auth/menu",
    body: {},
  });

  /**
   * Validates and sets user as logged in
   * Called after successful authentication
   */
  const handleValidateLogin = () => {
    setIsLogged(true);
  };

  /**
   * Bypasses OTP verification
   * Called when OTP is verified successfully
   */
  const handleByPassOtp = () => {
    setIsExisted(true);
  };

  /**
   * Handles user disconnection
   * Clears all authentication states
   */
  const handleDisconnect = () => {
    setIsLogged(false);
    setIsExisted(false);
  };

  /**
   * Effect: Fetch user menu when logged in
   * Triggers menu API call after successful authentication
   */
  useEffect(() => {
    if (isLogged) {
      fetchData();
    }
  }, [isLogged]);

  /**
   * Effect: Cross-tab authentication synchronization
   * Listens for logout events from other tabs and synchronizes logout state
   * Ensures consistent authentication state across all browser tabs
   */
  useEffect(() => {
    authChannel.onmessage = (event) => {
      if (event.data?.type === "logout" + currentLang) {
        setIsLogged(false);
        setIsExisted(false);
        sessionStorage.clear();
      }
    };

    // Cleanup: Close broadcast channel on unmount
    return () => authChannel.close();
  }, [authChannel, currentLang]);

  /**
   * Dynamically imports and renders page components
   * Loads components from /pages directory based on file name
   * 
   * @async
   * @param {string} fileName - Component file name (e.g., "roles", "utilisateurs")
   * @returns {Promise<JSX.Element|null>} Component element or null if failed
   */
  const DynamicComponent = async (fileName) => {
    if (typeof fileName !== "string") {
      return null;
    }

    // Handle numeric keys or other special cases
    if (/^\d+$/.test(fileName)) {
      return null;
    }
    try {
      const validKey = fileName.charAt(0).toUpperCase() + fileName.slice(1);
      const module = await import(`./pages/${validKey}/index.jsx`);
      const AnotherComponent = module.default;
      return <AnotherComponent />;
    } catch (error) {
      console.error(`Failed to load component for ${fileName}:`, error);
      return null;
    }
  };

  /**
   * Dynamically loads topic-specific components from /pages/Topics
   * Used for pool.jsx and follow.jsx components
   * 
   * @async
   * @param {string} fileName - Component file name without extension
   * @returns {Promise<JSX.Element|null>} Component element or null if failed
   */
  const DynamicTopicComponent = async (fileName) => {
    try {
      const module = await import(`./pages/Topics/${fileName}.jsx`);
      const Component = module.default;
      return <Component />;
    } catch (error) {
      console.error(`Failed to load topic component ${fileName}:`, error);
      return null;
    }
  };

  /**
   * Extracts all unique privileges from articles array
   * Searches through articles, categories, topics, and created_by objects
   * 
   * @param {Array<Object>} articles - Array of article objects
   * @returns {Array<string>} Array of unique privilege strings
   */
  const extractPrivileges = (articles) => {
    const privileges = new Set();

    if (!articles || !Array.isArray(articles)) {
      return [];
    }

    articles.forEach((article) => {
      // Extraire le privilège direct s'il existe
      if (article.privilege || article.privilge) {
        privileges.add(article.privilege || article.privilge);
      }

      // Extraire les privilèges des catégories
      if (article.categories && Array.isArray(article.categories)) {
        article.categories.forEach((category) => {
          if (category.privilege || category.privilge) {
            privileges.add(category.privilege || category.privilge);
          }
        });
      }

      // Extraire les privilèges du topic
      if (
        article.topic &&
        (article.topic.privilege || article.topic.privilge)
      ) {
        privileges.add(article.topic.privilege || article.topic.privilge);
      }

      // Extraire les privilèges du créateur
      if (
        article.created_by &&
        (article.created_by.privilege || article.created_by.privilge)
      ) {
        privileges.add(
          article.created_by.privilege || article.created_by.privilge
        );
      }
    });

    return Array.from(privileges);
  };

  /**
   * Effect: Process menu data from API response
   * Transforms backend menu structure into frontend routes with loaded components
   * Handles both regular pages and topic-based pages with sub-routes
   */
  useEffect(() => {
    const fetchRoutes = async () => {
      if (response && response?.data?.success) {
        const data = response.data.data;

        // Extract and store user privileges from response
        if (data) {
          setUserPrivileges(data?.privileges);
        }
        
        // Transform 'other' menu items (non-topic pages)
        const arrayOther = data.other.map((el) => {
          return { ...el, name: el.id };
        });

        const processedMenu = [];

        // Process non-topic menu items (direct routes)
        for (const item of arrayOther) {
          const component = await DynamicComponent(item.name);
          processedMenu.push({
            ...item,
            path: `${item.name}`,
            compo: component,
            isTopic: false,
          });
        }

        // Process topic menu items (with sub-routes: pool and follow)
        for (const item of data.topics) {
          const poolComponent = await DynamicTopicComponent("pool");
          const followComponent = await DynamicTopicComponent("follow");

          processedMenu.push({
            ...item,
            isTopic: true,
            routes: [
              {
                id: "pool",
                name: "Actualité",
                path: `pool`,
                compo: poolComponent,
              },
              {
                id: "follow",
                name: "Follow my news",
                path: `follow`,
                compo: followComponent,
              },
            ],
          });
        }

        console.log("Processed menu:", processedMenu);
        setDetailedMenu(processedMenu);
      }
    };

    fetchRoutes();
  }, [response]); // Re-run when API response changes

  // Get text direction for current language (ltr or rtl)
  const currentDirection = getLanguageDirection(currentLang);

  // Set router basename based on current language
  const basename = `/${currentLang}`;

  return (
    <ThemeProvider theme={theme}>
      <AuthContexte.Provider
        value={{
          handleValidateLogin,
          handleByPassOtp,
          handleDisconnect,
          baseUrl,
          imageUrl,
          frontalUrl,
          emptyData,
          routes,
          lang,
          detailedMenu,
          userPrivileges,
          MaxImageSize,
          authChannel,
          currentDirection, // Ajouté pour la cohérence
          supportedLangs,
          currentLang,
        }}
      >
        <BrowserRouter basename={basename}>
          <Routes>
            <Route
              path="login"
              element={!isLogged ? <Login /> : <Navigate to="/" />}
            >
              <Route
                index
                element={!isExisted ? <LoginForm /> : <Navigate to="otp" />}
              />
              <Route
                path="otp"
                element={isExisted ? <Otp /> : <Navigate to="login" />}
              />
            </Route>
            <Route
              path="/"
              element={isLogged ? <Pages /> : <Navigate to="login" />}
            >
              {/* Redirection automatique vers le premier élément du menu */}
              <Route
                index
                element={
                  detailedMenu.length > 0 ? (
                    detailedMenu[0].isTopic ? (
                      <Navigate
                        to={`/${detailedMenu[0].name}/${detailedMenu[0].routes[0].path}`}
                        replace
                      />
                    ) : (
                      <Navigate to={`/${detailedMenu[0].name}`} replace />
                    )
                  ) : (
                    <div>Chargement...</div>
                  )
                }
              />

              {detailedMenu.map((route, index) => {
                // Si c'est un topic (avec id_topic)
                if (route.isTopic) {
                  return (
                    <Route key={index} path={`/${route.name}`}>
                      {/* Redirection automatique vers la première sous-route du topic */}
                      <Route
                        index
                        element={
                          route.routes && route.routes.length > 0 ? (
                            <Navigate to={route.routes[0].path} replace />
                          ) : (
                            <div>Aucune sous-route disponible</div>
                          )
                        }
                      />
                      {route.routes?.map((subroute, subindex) => (
                        <Route
                          key={subindex}
                          path={subroute.path}
                          element={subroute.compo}
                        />
                      ))}
                    </Route>
                  );
                } else {
                  // Route simple
                  return (
                    <Route
                      key={index}
                      path={`/${route.name}`}
                      element={route.compo}
                    />
                  );
                }
              })}
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthContexte.Provider>
      <ToastContainer />
    </ThemeProvider>
  );
}

export default App;
