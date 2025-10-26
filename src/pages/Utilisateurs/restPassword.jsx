import React, { useEffect, useState, useContext } from "react";
import { Button, Slide, TextField } from "@mui/material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Icon } from "@mdi/react";
import * as Gfunc from "../../helpers/Gfunc";
import * as icons from "@mdi/js";
import { AuthContexte } from "../../Context/AuthContext";
import { useAxios } from "../../services/useAxios";
import { toast } from "react-toastify";
import log from "../../log/costumLog";
import { CostumTooltip } from "../../components/styled/CostumTooltip";
import DialogConfirm from "../../components/ui/ConfirmDialog";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

export default function Rest_password({ row }) {
  const { baseUrl } = useContext(AuthContexte);
  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [icon, setIcon] = useState("");
  const [errors, setErrors] = useState({
    password: [false, ""],
    confirmPassword: [false, ""],
  });

  // Utilisation de useAxios pour changer le mot de passe
  const {
    response: UpdateResponse,
    loading: UpdateLoading,
    error: UpdateError,
    fetchData: UpdatePassword,
  } = useAxios({
    method: "put",
    url: baseUrl + "users/reset",
    body: {
      userId: row.id_user,
      password: newPassword,
    },
  });

  const handleClickOpen = () => {
    setOpen(true);
    setNewPassword("");
    setConfirmPassword("");
    setErrors({
      password: [false, ""],
      confirmPassword: [false, ""],
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (UpdateResponse && UpdateResponse?.data?.success) {
      toast.success(UpdateResponse?.data?.message, {
        icon: icons["mdiCheck"],
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setOpen(false);
    }
  }, [UpdateResponse]);

  useEffect(() => {
    if (UpdateError) {
      toast.error(UpdateError, {
        icon: icons["mdiAlertCircleOutline"],
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
  }, [UpdateError]);
  //valider le formulaire

  const handleSubmit = (event) => {
    event.preventDefault();

    const errorObj = {
      password: [false, ""],
      confirmPassword: [false, ""],
    };

    const validations = {
      password: {
        isValid: Gfunc.isValidPassword(newPassword, row.username),
        errorMessage: "Le mot de passe saisi ne correspond pas aux règles",
      },
      confirmPassword: {
        isValid: Gfunc.TwoEqualeString(newPassword, confirmPassword),
        errorMessage: "Les mots de passe ne sont pas identiques.",
      },
    };

    const fields = {
      newPassword: newPassword,
      confirmPassword: confirmPassword,
    };

    const injectionResults = Object.values(fields).map((field) =>
      Gfunc.checkXssSQL(field)
    );

    const hasInjection = injectionResults.some((result) => result.isInjection);

    if (!hasInjection && Object.values(validations).every((v) => v.isValid)) {
      setOpenDialog(true);
      setMessage("Êtes-vous sûr de vouloir modifier votre mot de passe?");
      setIcon("mdiUpdate");
    } else {
      let errorMessages = [];
      let injectionTypes = [];
      if (hasInjection) {
        injectionResults.map((result) => {
          if (!injectionTypes.includes(result?.type)) {
            injectionTypes.push(result?.type);
          }
        });
        const message = `L'utilisateur a saisi une ou plusieurs tentatives d'injection: ${injectionTypes}`;
        log.error(message, "blocage", "Injection détectée", 220);
        return;
      }

      Object.keys(validations).forEach((key) => {
        if (!validations[key].isValid) {
          errorObj[key][0] = true;
          errorObj[key][1] = validations[key].errorMessage;
          errorMessages.push(validations[key].errorMessage);
        }
      });

      if (errorMessages.length > 0) {
        log.error(errorMessages.join(" et "), "erreurs_saisie", "", 210);
      }

      setErrors(errorObj);
    }
  };

  //confirmation la modification
  const confirmUpdateData = () => {
    UpdatePassword();
    setOpenDialog(false);
  };

  //annuler la modification
  const consoleUpdateData = () => {
    setNewPassword("");
    setConfirmPassword("");
    setOpenDialog(false);
  };

  return (
    <>
      <CostumTooltip title={"Modifier le mot de passe de " + row.username}>
        <Icon
          path={icons["mdiAccountKey"]}
          onClick={handleClickOpen}
          //size={1}
          style={{
            cursor: "pointer",
            height: "24px",
            width: "24px",
            color: "#00A88E",
          }}
        />
      </CostumTooltip>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        onClose={handleClose}
        PaperProps={{
          style: {
            boxShadow: "none",
            minWidth: "600px",
            height: "fit-content",
          },
        }}
      >
        <DialogTitle>
          <div className="dialogTitle">
            <Icon
              path={icons["mdiAccountKey"]}
              size={0.9}
              style={{ color: "white" }}
            />
            <p> Modifier le mot de passe de {row.username}</p>
          </div>
        </DialogTitle>
        <DialogContent>
          <form id="formValidate" onSubmit={handleSubmit}>
            <TextField
              placeholder="Nouveau mot de passe"
              label="Nouveau mot de passe"
              type="password"
              variant="outlined"
              margin="none"
              size="small"
              fullWidth
              required
              autoComplete="off"
              error={errors?.password?.[0]}
              helperText={errors?.password?.[1]}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  password: [false, ""], // Met à jour seulement le usersanme
                }));
              }}
            />
            <TextField
              placeholder="Confirm mot de passe"
              label="Confirmer le mot de passe"
              type="password"
              variant="outlined"
              margin="none"
              size="small"
              fullWidth
              required
              autoComplete="off"
              error={errors?.confirmPassword?.[0]}
              helperText={errors?.confirmPassword?.[1]}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  confirmPassword: [false, ""], // Met à jour seulement le usersanme
                }));
              }}
            />
          </form>
          <DialogConfirm
            open={openDialog}
            //id={response?.data?.data?.userId}
            icon={icon}
            grid={4}
            message={message}
            confirmCloseSession={confirmUpdateData}
            consoleCloseSession={consoleUpdateData}
            placement="auto"
          />
        </DialogContent>
        <DialogActions className="DialogActions">
          <Button
            variant="contained"
            color="primary"
            type="submit"
            size="small"
            form="formValidate"
            startIcon={<Icon path={icons["mdiCheck"]} size={0.8} />}
          >
            Valider
          </Button>
          <Button
            color="secondary"
            variant="outlined"
            size="small"
            onClick={handleClose}
          >
            Annuler
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
