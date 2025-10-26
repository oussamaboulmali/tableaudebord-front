import { mdiKeyboardReturn } from "@mdi/js";
import Icon from "@mdi/react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  const handleChange = () => {
    navigate("/");
  };
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "grid",
      }}
    >
      <div
        style={{
          width: "50%",
          height: "350px",
          margin: "auto",
          /* background: "red", */
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "150px", color: "#1e40af" }}>404</p>
        <p style={{ color: "#5c5c5c", fontWeight: "bold" }}>
          Oops ! Cette page est introuvable.
        </p>
        <br />
        <Button
          startIcon={<Icon path={mdiKeyboardReturn} size={1} />}
          variant="contained"
          color="primary"
          size="small"
          onClick={() => handleChange()}
        >
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
}
