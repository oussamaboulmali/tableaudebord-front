import React, { useState, useContext, useEffect } from "react";
import { Popover } from "@mui/material";
import Icon from "@mdi/react";
import { mdiLogout, mdiAlertCircleOutline, mdiAccount } from "@mdi/js";
import { AuthContexte } from "../../Context/AuthContext";
import { useAxios } from "../../services/useAxios";
import * as Gfunc from "../../helpers/Gfunc";
import { toast } from "react-toastify";
import "../../assets/styles/users.css";
import "../../assets/styles/header.css";

export default function User_profil() {
  const { handleDisconnect, baseUrl, currentLang } = useContext(AuthContexte);
  const [anchorEl, setAnchorEl] = useState(null);

  // Utilisation de useAxios pour déconnecter un utilisateur
  const {
    response,
    loading,
    error,
    fetchData: fetchSignOut,
    clearData,
  } = useAxios({
    method: "post",
    url: baseUrl + "auth/logout",
    body: {
      userId: JSON.parse(localStorage.getItem("userId" + currentLang)),
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(`Erreur lors de la déconnexion: ${error}`, {
        icon: mdiAlertCircleOutline,
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
    setTimeout(clearData, 5000);
  }, [error, clearData]);

  const handleDisconnectUser = () => {
    fetchSignOut();
    handleClose();
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <>
      {/* Bouton simplifié - Juste une icône grise */}
      <div
        id="userProfil"
        onClick={handleClick}
        style={{
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
      >
        <Icon path={mdiAccount} size={1.2} color="white" />
        <span
          style={{
            fontSize: "15px",
            color: "white",
          }}
        >
          {localStorage.getItem("username" + currentLang)}
        </span>
      </div>

      {/* Popover simplifié - Uniquement la déconnexion */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        elevation={3}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{ marginTop: "8px" }}
        PaperProps={{
          style: {
            padding: "8px",
            minWidth: 180,
            borderRadius: "8px",
          },
        }}
      >
        <div
          onClick={handleDisconnectUser}
          className="disconnection"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            padding: "10px 12px",
            borderRadius: "6px",
            transition: "background-color 0.2s",
            color: "#d32f2f",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#ffebee";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <Icon path={mdiLogout} size={0.9} color="#d32f2f" />
          <p style={{ margin: 0, fontWeight: "500", fontSize: "14px" }}>
            Se déconnecter
          </p>
        </div>
      </Popover>
    </>
  );
}
