import Auth from "../pages/Auth/index";
import AuthForm from "../pages/Auth/AuthForm";
import Otp from "../pages/Auth/otpForm";
import Pages from "../pages/index";
import ListArticles from "../pages/Articles/listItem";
import AddArticle from "../pages/Articles/itemAdd";
import EditArticle from "../pages/Articles/itemEdit";
import Articles from "../pages/Articles/index";
import Tag from "../pages/Tags/index";
import Acceuil from "../pages/Acceuil";
import Banniere from "../pages/Banniere";
import Dossier from "../pages/Dossier";
import Role from "../pages/Roles/index";
import Utilisateur from "../pages/Utilisateurs/index";
import Categorie from "../pages/Categories/index";
import Log from "../pages/Logs/index";
import Log_List from "../pages/Logs/logs_list";
import Log_Ltem from "../pages/Logs/log_item";
import Sessions from "../pages/Logs/sessions";
import { Navigate } from "react-router-dom";

export function Menu() {
  const array = [
    {
      path: "login",
      element: <Auth />,
      children: [
        { path: "", element: <AuthForm />, index: true },
        { path: "otp", element: <Otp />, index: false },
      ],
    },
    {
      path: "/",
      element: <Pages />,
      children: [
        { path: "acceuil", element: <Acceuil />, index: true },
        {
          path: "articles",
          element: <Articles />,
          index: false,
          children: [
            { path: "", element: <ListArticles />, index: true },
            { path: "add", element: <AddArticle />, index: false },
            { path: "edit/:id", element: <EditArticle />, index: false },
          ],
        },
        { path: "roles", element: <Role />, index: false },
        { path: "utilisateurs", element: <Utilisateur />, index: false },
        { path: "tags", element: <Tag />, index: false },
        { path: "bannieres", element: <Banniere />, index: false },
        { path: "dossiers", element: <Dossier />, index: false },
        { path: "categories", element: <Categorie />, index: false },
        {
          path: "logs",
          element: <Log />,
          index: false,
          children: [
            { path: "", element: <Log_List />, index: true },
            { path: "sessions", element: <Sessions />, index: false },
            { path: "users", element: <Log_Ltem />, index: false },
            { path: "roles", element: <Log_Ltem />, index: false },
            { path: "login_erreurs", element: <Log_Ltem />, index: false },
            { path: "front", element: <Log_Ltem />, index: false },
            { path: "categories", element: <Log_Ltem />, index: false },
            { path: "tags", element: <Log_Ltem />, index: false },
            { path: "articles", element: <Log_Ltem />, index: false },
            { path: "images", element: <Log_Ltem />, index: false },
          ],
        },
      ],
    },
    {
      path: "*",
      element: <Navigate to="login" />,
    },
  ];
  const menu = array;
  return menu;
}
