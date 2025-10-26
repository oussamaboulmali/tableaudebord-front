import { useLocation, useNavigate } from "react-router-dom";
import Icon from "@mdi/react";
import Userprofil from "./userprofil";
//import Notification from "./notification";
import "../../assets/styles/header.css";
import * as Gfunc from "../../helpers/Gfunc";
import * as icon from "@mdi/js";
import LogoAps from "../../assets/images/logos/logo-v1.png";
import { useContext } from "react";
import { AuthContexte } from "../../Context/AuthContext";

export default function Index() {
  const location = useLocation();
  const navigate = useNavigate();
  const { frontalUrl } = useContext(AuthContexte);

  const tablepath = location?.pathname?.slice(1)?.trim()?.split("/");

  const handleChangePage = () => {
    navigate(tablepath?.[0]);
  };

  const handleClickLogo = () => {
    window.open(frontalUrl);
  };

  return (
    <header className="app-header">
      {/* Breadcrumb Navigation */}
      <div className="header-breadcrumb">
        <div className="breadcrumb-icon">
          <Icon
            path={icon[Gfunc.getIcon(location?.pathname?.slice(1))]}
            size={1.2}
            color="#000"
          />
        </div>
        <nav className="breadcrumb-nav">
          <span
            onClick={tablepath.length > 1 ? handleChangePage : null}
            className={`breadcrumb-item ${
              tablepath.length > 1 ? "clickable" : ""
            }`}
            title={tablepath.length > 1 ? "Retour à la page parent" : ""}
          >
            {Gfunc.capitalizeFirstLetter(tablepath?.[0])}
          </span>
          {tablepath.length > 1 && (
            <>
              <Icon
                path={icon.mdiMenuRightOutline}
                size={0.8}
                color="#000"
                className="breadcrumb-separator"
              />
              <span className="breadcrumb-item current">
                {Gfunc.getEquivalentPath(tablepath?.[0], tablepath?.[1])}
              </span>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
