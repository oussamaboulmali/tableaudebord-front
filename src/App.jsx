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

const getCurrentLanguage = () => {
  const path = window.location.pathname;
  for (const lang of supportedLangs) {
    if (path.startsWith(`/${lang?.code}`)) {
      return lang?.code;
    }
  }
  return "fr";
};

function App() {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const imageUrl = import.meta.env.VITE_IMAGE_URL;
  const emptyData = import.meta.env.VITE_EMPTY_DATA;
  const frontalUrl = import.meta.env.VITE_URL_FRONTAL;
  const MaxImageSize = import.meta.env.VITE_MAX_IMAGE_SIZE;
  const lang = import.meta.env.VITE_LAN;
  const currentLang = getCurrentLanguage();
  const [routes, setRoutes] = useState([]);
  const [detailedMenu, setDetailedMenu] = useState([]);

  // Utiliser currentLang au lieu de lang pour la cohérence
  const [isLogged, setIsLogged] = useState(() => {
    return localStorage.getItem("isLogged" + currentLang) === "true";
  });

  const [isExisted, setIsExisted] = useState(() => {
    return sessionStorage.getItem("isExisted") === "true";
  });

  const [userPrivileges, setUserPrivileges] = useState([]);
  const authChannel = new BroadcastChannel("auth");

  // useAxios to get user menu
  const { response, loading, error, fetchData } = useAxios({
    method: "post",
    url: baseUrl + "auth/menu",
    body: {},
  });

  const handleValidateLogin = () => {
    setIsLogged(true);
  };

  const handleByPassOtp = () => {
    setIsExisted(true);
  };

  const handleDisconnect = () => {
    setIsLogged(false);
    setIsExisted(false);
  };

  // Fetch menu when user is logged in
  useEffect(() => {
    if (isLogged) {
      fetchData();
    }
  }, [isLogged]);

  // Utiliser currentLang pour la cohérence avec le logout
  useEffect(() => {
    authChannel.onmessage = (event) => {
      if (event.data?.type === "logout" + currentLang) {
        setIsLogged(false);
        setIsExisted(false);
        sessionStorage.clear();
      }
    };

    return () => authChannel.close();
  }, [authChannel, currentLang]);

  // Improved dynamic component loading function
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

  // Load topic components directly (pool.jsx, follow.jsx)
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

  // Process menu data from response
  useEffect(() => {
    const fetchRoutes = async () => {
      if (response && response?.data?.success) {
        const data = response.data.data;

        if (data) {
          setUserPrivileges(data?.privileges);
        }
        const arrayOther = data.other.map((el) => {
          return { ...el, name: el.id };
        });

        const processedMenu = [];

        // Traiter les éléments sans id_topic (routes directes)
        for (const item of arrayOther) {
          const component = await DynamicComponent(item.name);
          processedMenu.push({
            ...item,
            path: `${item.name}`,
            compo: component,
            isTopic: false,
          });
        }

        // Traiter les topics (avec sous-routes)
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
  }, [response]);

  // Récupération de la direction de la langue (ajouté comme dans le premier App.jsx)
  const currentDirection = getLanguageDirection(currentLang);

  // Basename basé sur la langue actuelle
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
