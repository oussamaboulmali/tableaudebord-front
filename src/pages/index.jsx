import { Outlet, useLocation } from "react-router-dom";
import SideBar from "../components/Sidebar/index";
import "../assets/styles/sidebar.css";
import Header from "../components/Header/index";
import { Helmet } from "react-helmet";
import * as Gfunc from "../helpers/Gfunc";
import Footer from "../components/Footer/index";
import { useState } from "react";
import Icon from "@mdi/react";
import { mdiBookOpenPageVariant } from "@mdi/js";

export default function Index() {
  const location = useLocation();
  const [toggleMenu, setToggleMenu] = useState(true);

  const handleHelpClick = () => {
    window.open(
      "https://dashboard.aps.dz/help/aps-helper/videos.html",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="home-content">
      <Helmet>
        <title>
          {Gfunc.capitalizeFirstLetter(location?.pathname.slice(1))?.length !==
          0
            ? Gfunc.capitalizeFirstLetter(location?.pathname?.slice(1))
            : "Aps"}
        </title>
      </Helmet>

      <SideBar toggleMenu={toggleMenu} setToggleMenu={setToggleMenu} />

      <div
        className={`div-rigth ${toggleMenu ? "overlay-mode" : "normal-mode"}`}
      >
        <Outlet />
        <Footer />
      </div>
    </div>
  );
}
