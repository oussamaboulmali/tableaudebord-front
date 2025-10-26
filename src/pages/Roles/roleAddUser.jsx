import React, { useEffect, useState, useContext, useRef } from "react";
import {
  Autocomplete,
  Button,
  Chip,
  Slide,
  TextField,
  Tooltip,
  getStepIconUtilityClass,
} from "@mui/material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Icon } from "@mdi/react";
import * as icons from "@mdi/js";
import * as Gfunc from "../../helpers/Gfunc";
import { AuthContexte } from "../../Context/AuthContext";
import { useAxios } from "../../services/useAxios";
import DataTable from "react-data-table-component";
import { customStyles } from "../../assets/styles/datatable_costum";
import { toast } from "react-toastify";
import DialogConfirm from "../../components/ui/ConfirmDialog";
import { CostumTooltip } from "../../components/styled/CostumTooltip";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

export default function Role_add_User({ row }) {
  const { baseUrl, emptyData } = useContext(AuthContexte);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState(0);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [utilisateursIds, setUtilisateursIds] = useState([]);
  const [data, setData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [icon, setIcon] = useState("");
  const userIDRef = useRef(userId);

  // Utilisation de useAxios pour recuperer la liste des roles non inclus dans la liste des roles actuel
  const {
    response: UtilisateursResponse,
    loading,
    error,
    fetchData: fetchUtilisateursRole,
  } = useAxios({
    method: "post",
    url: baseUrl + "roles/users",
    body: { roleId: parseInt(row.id_role) },
  });

  // Utilisation de useAxios pour recuperer la liste des previleges du role actuel
  const {
    response: UtilisateursOtherResponse,
    loading: UtilisateursAllLaoding,
    error: UtilisateursAllError,
    fetchData: fetchAllUtilisateur,
  } = useAxios({
    method: "post",
    url: baseUrl + "roles/other",
    body: { roleId: parseInt(row.id_role) },
  });

  // Utilisation de useAxios pour assigner des nouveaux previleges
  const {
    response: AddResponse,
    loading: AddLaoding,
    error: AddError,
    fetchData: AddUtilisateurs,
  } = useAxios({
    method: "post",
    url: baseUrl + "roles/users/add",
    body: { roleId: parseInt(row.id_role), users: utilisateursIds },
  });

  // Utilisation de useAxios pour assigner des nouveaux previleges
  const {
    response: DeleteResponse,
    loading: DeleteLaoding,
    error: DeleteError,
    fetchData: DeleteUtilisateurs,
  } = useAxios({
    method: "put",
    url: baseUrl + "roles/users/remove",
    body: { roleId: parseInt(row.id_role), userId: userId },
  });

  //ouvrir  le dialogue
  const handleClickOpen = () => {
    setOpen(true);
    setUtilisateurs([]);
    setUtilisateursIds([]);
    fetchUtilisateursRole();
    fetchAllUtilisateur();
  };

  //fermer le dialogue
  const handleClose = () => {
    setOpen(false);
  };

  const confirmUpdateData = () => {
    DeleteUtilisateurs();
    setOpenDialog(false);
  };

  const consoleUpdateData = () => {
    setUserId(0);
    setOpenDialog(false);
  };

  //verifier s'i y'a une reponse l'ajouter directement sans fetch au tableau privileges
  useEffect(() => {
    if (AddResponse && AddResponse?.data?.success) {
      let newRows = [];
      utilisateurs.map((utilisateur) => {
        const newRow = {
          id_user: utilisateur.id_user,
          username: utilisateur.username,
          email: utilisateur.email,
        };
        newRows.push(newRow);
      });
      setUtilisateurs([]);
      setUtilisateursIds([]);
      setData((prevData) => [...prevData, ...newRows]);
    }
  }, [AddResponse]);

  //verifier s'il y'a une reponse de la part de getAllutilisateur pour les mettres dans une state
  useEffect(() => {
    if (UtilisateursResponse && UtilisateursResponse?.data?.data) {
      setData(UtilisateursResponse?.data?.data);
    }
  }, [UtilisateursResponse]);

  //verifier si un utilisateur sera supprimer
  useEffect(() => {
    if (DeleteResponse && DeleteResponse?.data?.success) {
      toast.success(DeleteResponse?.data?.message, {
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
      const newArray = Gfunc.DeleteElementfromArray(data, userId, "id_user");
      setData(newArray);
      setUserId(0);
      fetchAllUtilisateur();
    }
  }, [DeleteResponse]);

  //verifier si un utilisateur pourra etre supprimer
  useEffect(() => {
    if (userIDRef && userIDRef?.current !== userId) {
      setOpenDialog(true);
      setMessage("Êtes-vous sûr de vouloir supprimer ?");
      setIcon("mdiCloseCircleOutline");
    }
  }, [userIDRef, userId]);

  useEffect(() => {
    if (DeleteError) {
      setUserId(0);
      toast.error(DeleteError, {
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
  }, [DeleteError]);

  useEffect(() => {
    if (AddError) {
      toast.error(AddError, {
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
  }, [AddError]);

  //supprimer un previlege d'un role
  const handleDeleteUser = (row) => {
    setUserId(row.id_user);
  };

  //valider le fomulaire d'ajout
  const handleSubmit = (event) => {
    event.preventDefault();
    AddUtilisateurs();
  };

  const columns = [
    {
      name: "Utilisateur",
      selector: (row) => row.username,
      sortable: true,
      width: "250px",
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      width: "300px",
    },
    {
      right: "true",
      minWidth: "50px",
      cell: (row, columns) => {
        return (
          <div onClick={() => handleDeleteUser(row)}>
            <Icon
              path={icons["mdiDelete"]}
              size={0.9}
              style={{ color: "red", cursor: "pointer" }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <CostumTooltip title={"Ajouter des nouveaux utilisateurs à " + row.name}>
        <Icon
          path={icons["mdiAccountGroup"]}
          onClick={handleClickOpen}
          //size={1}
          style={{ height: "24px", width: "24px" }}
        />
      </CostumTooltip>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        onClose={handleClose}
        PaperProps={{
          style: {
            boxShadow: "none",
            minWidth: "800px",
            height: "fit-content",
          },
        }}
      >
        <DialogTitle>
          <div className="dialogTitle">
            <Icon
              path={icons[Gfunc?.getIcon("utilisateur")]}
              size={0.9}
              style={{ color: "white" }}
            />
            <p>
              {" "}
              Ajouter / Supprimer des nouveaux utilisateurs à / de {row.name}
            </p>
          </div>
        </DialogTitle>
        <DialogContent>
          <fieldset className="fieldset">
            <legend className="legend">
              Choisir des nouveaux utilisateurs
            </legend>
            <form id="formValidatee" onSubmit={handleSubmit}>
              <div className="row-1">
                <Autocomplete
                  freeSolo
                  multiple
                  fullWidth
                  filterSelectedOptions
                  //disablePortal
                  required
                  size="small"
                  margin="none"
                  options={
                    UtilisateursOtherResponse?.data?.data
                    /* ?.map(
                    (option) => ({
                      id: option.id_privileges,
                      name: option.name,
                      description: option.description,
                    })
                  ) */
                  }
                  value={utilisateurs}
                  onChange={(event, newValues) => {
                    const selectedIds = newValues.map(
                      (newValue) => newValue.id_user
                    );
                    setUtilisateurs(newValues);
                    setUtilisateursIds(selectedIds);
                  }}
                  getOptionLabel={(option) => option.username}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={index}
                        variant="filled"
                        label={option.username}
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Utilisateurs" />
                  )}
                />
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  size="small"
                  form="formValidatee"
                  startIcon={<Icon path={icons["mdiCheck"]} size={0.8} />}
                >
                  Valider
                </Button>
              </div>
            </form>
          </fieldset>
          <DataTable
            responsive
            noDataComponent={<b>{emptyData}</b>}
            columns={columns}
            data={data}
            customStyles={customStyles}
            fixedHeader
            persistTableHead
            pagination
            highlightOnHover
            paginationDefaultPage={1}
            paginationPerPage={5}
          />
          <DialogConfirm
            open={openDialog}
            //id={response?.data?.data?.userId}
            icon={icon}
            grid={6}
            message={message}
            confirmCloseSession={confirmUpdateData}
            consoleCloseSession={consoleUpdateData}
            placement="auto"
          />
        </DialogContent>
        <DialogActions className="DialogActions">
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
