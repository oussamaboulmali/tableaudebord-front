import { Button, Dialog } from "@mui/material";
import "../../../assets/styles/dialog.css";
import Icon from "@mdi/react";
import * as icons from "@mdi/js";

export default function DialogConfirm({
  open,
  icon,
  message,
  confirmCloseSession,
  consoleCloseSession,
}) {
  const handleOnConfirm = () => {
    confirmCloseSession();
  };

  const handleOnConcle = () => {
    consoleCloseSession();
  };

  return (
    <>
      <Dialog
        open={open}
        PaperProps={{
          style: {
            width: "500px",
            padding: "10px 10px 30px 10px",
            borderRadius: "8px",
          },
        }}
      >
        <div
          style={{
            width: "100%",
            textAlign: "center",
          }}
        >
          <Icon path={icons[icon]} size={6} style={{ color: "red" }} />
        </div>
        <div
          style={{
            width: "100%",
            textAlign: "center",
            fontWeight: "bold",
            marginBottom: "30px",
            color: "gray",
            fontSize: "18px",
          }}
        >
          {message}
        </div>
        <div
          style={{
            display: "flex",
            gridGap: "15px",
            width: "100%",
            justifyContent: "center",
          }}
        >
          <Button color="primary" variant="contained" onClick={handleOnConfirm}>
            Confirmer
          </Button>
          <Button color="secondary" variant="outlined" onClick={handleOnConcle}>
            Annuler
          </Button>
        </div>
      </Dialog>
    </>
  );
}
