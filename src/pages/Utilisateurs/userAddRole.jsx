import React, { useEffect, useState, useContext, useRef } from "react";
import {
  Autocomplete,
  Button,
  Chip,
  Slide,
  TextField,
  Tooltip,
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
import { mdiAlertCircleOutline } from "@mdi/js";
import DialogConfirm from "../../components/ui/ConfirmDialog";
import { CostumTooltip } from "../../components/styled/CostumTooltip";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

export default function User_add_role({ rowUser }) {
  const { baseUrl, emptyData, currentLang } = useContext(AuthContexte);
  const [open, setOpen] = useState(false);
  const [roleId, setRoleId] = useState(0);
  const [roles, setRoles] = useState([]);
  const [rolesIds, setRolesIds] = useState([]);
  const [data, setData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [icon, setIcon] = useState("");
  const roleIdRef = useRef(roleId);

  // Utilisation de useAxios pour recuperer la liste des utilisateurs non inclus dans la liste des utilisateurs actuel
  const {
    response: AllRolesResponse,
    loading: AllRolesLoading,
    error: allRolesError,
    fetchData: fetchRoleUtilisateur,
  } = useAxios({
    method: "post",
    url: baseUrl + "users/detail",
    body: { userId: rowUser.id_user },
  });

  // Utilisation de useAxios pour recuperer la liste des roles qui n'appartient pas a l'utilisateur
  const {
    response: OtherRolesResponse,
    loading: OtherRoleLaoding,
    error: OtherRoleError,
    fetchData: fetchOtherRole,
  } = useAxios({
    method: "post",
    url: baseUrl + "users/other",
    body: { userId: rowUser.id_user },
  });

  // Utilisation de useAxios pour assigner des nouveaux previleges
  const {
    response: AddResponse,
    loading: AddLaoding,
    error: AddError,
    fetchData: AddRoles,
  } = useAxios({
    method: "post",
    url: baseUrl + "users/roles",
    body: { userId: rowUser.id_user, roles: rolesIds },
  });

  // Utilisation de useAxios pour assigner des nouveaux previleges
  const {
    response: DeleteResponse,
    loading: DeleteLaoding,
    error: DeleteError,
    fetchData: DeleteRoles,
  } = useAxios({
    method: "put",
    url: baseUrl + "users/roles",
    body: { userId: rowUser.id_user, roleId: roleId },
  });

  //ouvrir  le dialogue
  const handleClickOpen = () => {
    setOpen(true);
    setRoles([]);
    setRolesIds([]);
    fetchRoleUtilisateur();
    fetchOtherRole();
  };

  //fermer le dialogue
  const handleClose = () => {
    setOpen(false);
  };

  const confirmUpdateData = () => {
    DeleteRoles();
    setOpenDialog(false);
  };

  const consoleUpdateData = () => {
    setRoleId(0);
    setOpenDialog(false);
  };

  //verifier s'i y'a une reponse l'ajouter directement sans fetch au tableau privileges
  useEffect(() => {
    if (AddResponse && AddResponse?.data?.success) {
      let newRows = [];
      roles.map((role) => {
        const newRow = {
          id_role: role.id_role,
          name: role.name,
          assigned_date: Gfunc.addTimestamp(new Date()),
          assigned_by: localStorage.getItem("username" + currentLang),
        };
        newRows.push(newRow);
      });
      setRoles([]);
      setRolesIds([]);
      setData((prevData) => [...prevData, ...newRows]);
      fetchOtherRole();
    }
  }, [AddResponse]);

  //verifier s'il y'a une reponse de la part de getAllutilisateur pour les mettres dans une state
  useEffect(() => {
    if (AllRolesResponse && AllRolesResponse?.data?.data) {
      setData(AllRolesResponse?.data?.data?.roles);
    }
  }, [AllRolesResponse]);

  //verifier si un utilisateur sera supprimer
  useEffect(() => {
    if (DeleteResponse && DeleteResponse?.data?.success) {
      const newArray = Gfunc.DeleteElementfromArray(data, roleId, "id_role");
      setData(newArray);
      setRoleId(0);
      fetchOtherRole();
    }
  }, [DeleteResponse]);

  //verifier si un utilisateur pourra etre supprimer
  useEffect(() => {
    if (roleIdRef && roleIdRef?.current !== roleId) {
      setOpenDialog(true);
      setMessage("Êtes-vous sûr de vouloir supprimer ?");
      setIcon("mdiCloseCircleOutline");
    }
  }, [roleIdRef, roleId]);

  useEffect(() => {
    if (DeleteError) {
      setRoleId(0);
      toast.error(DeleteError, {
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
  }, [DeleteError]);

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

  //supprimer un role d'un utilisateur
  const handleDeleteRole = (row) => {
    setRoleId(row.id_role);
  };

  //valider le fomulaire d'ajout
  const handleSubmit = (event) => {
    event.preventDefault();
    AddRoles();
  };

  const columns = [
    {
      name: "Roles",
      selector: (row) => row.name,
      sortable: true,
      width: "220px",
      wrap: true,
    },
    {
      name: "Créer le",
      selector: (row) => row?.assigned_date?.substr(0, 10),
      sortable: true,
    },
    {
      name: "Par",
      selector: (row) => row.assigned_by,
      sortable: true,
    },
    {
      right: "true",
      cell: (row, columns) => {
        return (
          <div
            onClick={rowUser.state !== 0 ? () => handleDeleteRole(row) : null}
          >
            <Icon
              path={icons["mdiDelete"]}
              size={0.9}
              style={{
                color: rowUser.state !== 0 ? "red" : "gray",
                cursor: rowUser.state !== 0 ? "pointer" : null,
              }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <CostumTooltip title={"Ajouter des nouveaux rôles à " + rowUser.username}>
        <Icon
          path={icons[Gfunc?.getIcon("roles")]}
          onClick={handleClickOpen}
          //size={1}
          style={{
            cursor: "pointer",
            height: "24px",
            width: "24px",
            color: "black",
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
            minWidth: "800px",
            height: "fit-content",
          },
        }}
      >
        <DialogTitle>
          <div className="dialogTitle">
            <Icon
              path={icons[Gfunc?.getIcon("role")]}
              size={0.9}
              style={{ color: "white" }}
            />
            <p>
              {" "}
              Ajouter / Retirer des nouveaux rôles à / de {rowUser.username}
            </p>
          </div>
        </DialogTitle>
        <DialogContent>
          <fieldset className="fieldset">
            <legend className="legend">Choisir des nouveaux rôles</legend>
            <form
              id="formValidatee"
              onSubmit={handleSubmit}
              disabled={rowUser.state === 0}
            >
              <div className="row-1">
                <Autocomplete
                  multiple
                  freeSolo
                  required
                  size="small"
                  margin="none"
                  options={OtherRolesResponse?.data?.data}
                  value={roles}
                  onChange={(event, newValues) => {
                    const selectedIds = newValues.map(
                      (newValue) => newValue.id_role
                    );
                    setRoles(newValues);
                    setRolesIds(selectedIds);
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
                  filterSelectedOptions
                  renderInput={(params) => (
                    <TextField {...params} label="Rôles" />
                  )}
                />
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  size="small"
                  form="formValidatee"
                  startIcon={<Icon path={icons["mdiCheck"]} size={0.8} />}
                  disabled={rowUser.state === 0}
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
            paginationComponentOptions={{
              rowsPerPageText: "Elements par page:",
              rangeSeparatorText: "de",
              selectAllRowsItem: true,
              selectAllRowsItemText: "Tous",
            }}
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
