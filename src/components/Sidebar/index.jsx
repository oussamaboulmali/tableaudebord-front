import React, { useEffect, useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import Icon from "@mdi/react";
import * as icons from "@mdi/js";
import { mdiChevronDown, mdiChevronUp } from "@mdi/js";
import { useMediaQuery } from "react-responsive";
import { AuthContexte } from "../../Context/AuthContext";
import ApsLogo from "../../assets/images/logos/logo-aps-resp.png";
import User_profil from "../Header/userprofil";
import { getIcon } from "../../helpers/Gfunc";

export default function Sidebar({ toggleMenu, setToggleMenu }) {
  const { detailedMenu } = useContext(AuthContexte);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const isDesktopOrLaptop = useMediaQuery({ query: "(max-width: 1290px)" });

  useEffect(() => {
    if (isDesktopOrLaptop) {
      setToggleMenu(true);
    }
  }, [isDesktopOrLaptop]);

  const firstToLower = (str) =>
    str ? str.charAt(0).toLowerCase() + str.slice(1) : "";

  const handleMenuItemClick = () => {
    if (!toggleMenu) setToggleMenu(true);
  };

  const toggleDropdown = (index) => {
    setOpenDropdowns((prev) => {
      // Fermer tout sauf celui cliqué
      if (prev[index]) {
        return {};
      }
      return { [index]: true };
    });
  };

  return (
    <div className="modern-sidebar collapsed">
      <div className="sidebar-header">
        <div className="logo-container">
          <img src={ApsLogo} alt="APS Logo" className="logo" />
        </div>
      </div>

      {/* Menu items */}
      <nav className="sidebar-nav">
        <ul className="menu-list">
          {detailedMenu.map((menuItem, index) => (
            <li key={index} className="menu-item">
              {menuItem.isTopic ? (
                <div className="menu-dropdown">
                  <span
                    className="menu-link dropdown-trigger"
                    onClick={() => toggleDropdown(index)}
                  >
                    <span className="menu-text">{menuItem.name}</span>
                    <Icon
                      path={
                        openDropdowns[index] ? mdiChevronUp : mdiChevronDown
                      }
                      size={0.8}
                      className="dropdown-icon"
                    />
                  </span>

                  {openDropdowns[index] && (
                    <ul className="submenu-list">
                      {menuItem?.routes?.map((child, childIndex) => (
                        <li key={childIndex} className="submenu-item">
                          <NavLink
                            to={`/${menuItem.name}/${child.path}`}
                            className={({ isActive }) =>
                              `submenu-link ${isActive ? "active" : ""}`
                            }
                            onClick={handleMenuItemClick}
                          >
                            <span className="menu-text">{child.name}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <NavLink
                  to={`/${menuItem.name}`}
                  className={({ isActive }) =>
                    `menu-link ${isActive ? "active" : ""}`
                  }
                  onClick={handleMenuItemClick}
                >
                  <span className="menu-text">{menuItem.name}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-section">
          <User_profil />
        </div>
      </div>
    </div>
  );
}
