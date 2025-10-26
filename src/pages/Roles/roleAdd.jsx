import React, { useEffect, useState, useContext } from "react";
import { Autocomplete, Button, Chip, Slide, TextField } from "@mui/material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { mdiPlus } from "@mdi/js";
import { Icon } from "@mdi/react";
import * as Gfunc from "../../helpers/Gfunc";
import * as icons from "@mdi/js";
import { AuthContexte } from "../../Context/AuthContext";
import { useAxios } from "../../services/useAxios";
import { mdiCheck } from "@mdi/js";
import { toast } from "react-toastify";
import { mdiAlertCircleOutline } from "@mdi/js";
import log from "../../log/costumLog";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

export default function Role_add({ data, setData }) {
  const { baseUrl, currentLang } = useContext(AuthContexte);
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [previleges, setPrevileges] = useState([]);
  const [previlegesIds, setPrevilegesIds] = useState([]);

  // Utilisation de useAxios pour recuperer la liste des previleges
  const {
    response: PrevilegeResponse,
    loading,
    error,
    fetchData: fetchPrevileges,
  } = useAxios({
    method: "post",
    url: baseUrl + "roles/privileges",
    body: {},
  });

  const {
    response: Addresponse,
    loading: Addloading,
    error: AddError,
    fetchData: AddRole,
  } = useAxios({
    method: "post",
    url: baseUrl + "roles/create",
    body: {
      name: nom,
      description: description,
      privileges: previlegesIds,
    },
  });

  const handleClickOpen = () => {
    setOpen(true);
    setNom("");
    setPrevileges([]);
    setPrevilegesIds([]);
    setDescription("");
    fetchPrevileges();
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (Addresponse && Addresponse?.data?.success) {
      toast.success(Addresponse?.data?.message, {
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
      const dateNow = Gfunc.addTimestamp(new Date());
      const newRow = {
        id_role: Addresponse?.data?.data,
        name: nom,
        description: description,
        created_date: dateNow,
        created_by: localStorage.getItem("username" + currentLang),
      };
      setData([...data, newRow]);
      setOpen(false);
    }
  }, [Addresponse]);

  useEffect(() => {
    if (AddError) {
      toast.error(AddError, {
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
  }, [AddError]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !Gfunc.checkXssSQL(nom).isInjection &&
      !Gfunc.checkXssSQL(description).isInjection
    ) {
      AddRole();
    } else {
      log.error(
        "L'utilisateur a saisi des balises HTML dans un formulaire d'ajout d'une nouveau role.",
        "blocage",
        "Html Tags",
        220
      );
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleClickOpen}
        size="small"
        startIcon={<Icon path={mdiPlus} size={0.8} />}
      >
        Ajouter
      </Button>
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
              path={icons[Gfunc?.getIcon("roles")]}
              size={0.9}
              style={{ color: "white" }}
            />
            <p> Ajouter un nouveau rôle</p>
          </div>
        </DialogTitle>
        <DialogContent>
          <form id="formValidate" onSubmit={handleSubmit}>
            <TextField
              placeholder="Nom du rôle"
              label="Nom"
              variant="outlined"
              margin="none"
              size="small"
              fullWidth
              required
              autoComplete="off"
              value={nom}
              onChange={(e) => {
                setNom(e.target.value);
              }}
            />
            <Autocomplete
              freeSolo
              multiple
              fullWidth
              filterSelectedOptions
              //disablePortal
              required
              size="small"
              margin="none"
              options={PrevilegeResponse?.data?.data}
              value={previleges}
              onChange={(event, newValues) => {
                const selectedIds = newValues.map(
                  (newValue) => newValue.id_privileges
                );
                setPrevileges(newValues);
                setPrevilegesIds(selectedIds);
              }}
              getOptionLabel={(option) => option.name}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={index}
                    variant="filled"
                    label={option.name}
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label="Privilèges" />
              )}
            />
            <TextField
              placeholder="Description du rôle"
              label="Description"
              variant="outlined"
              margin="none"
              size="small"
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
            />
          </form>
        </DialogContent>
        <DialogActions className="DialogActions">
          <Button
            variant="contained"
            color="primary"
            type="submit"
            size="small"
            form="formValidate"
            startIcon={<Icon path={mdiCheck} size={0.8} />}
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
