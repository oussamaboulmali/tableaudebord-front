import React, { useEffect, useState, useContext } from "react";
import {
  Autocomplete,
  Button,
  Chip,
  Popper,
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
import * as Gfunc from "../../helpers/Gfunc";
import * as icons from "@mdi/js";
import { AuthContexte } from "../../Context/AuthContext";
import { useAxios } from "../../services/useAxios";
import { mdiCheck } from "@mdi/js";
import { mdiShieldStar } from "@mdi/js";
import DataTable from "react-data-table-component";
import { customStyles } from "../../assets/styles/datatable_costum";
import { mdiDelete } from "@mdi/js";
import { useRef } from "react";
import DialogConfirm from "../../components/ui/ConfirmDialog";
import { toast } from "react-toastify";
import { CostumTooltip } from "../../components/styled/CostumTooltip";
import { mdiAlertCircleOutline } from "@mdi/js";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

export default function Role_add_previlege({ row }) {
  const { baseUrl, emptyData } = useContext(AuthContexte);
  const [open, setOpen] = useState(false);
  const [prevId, setPrevId] = useState(0);
  const [previleges, setPrevileges] = useState([]);
  const [previlegesIds, setPrevilegesIds] = useState([]);
  const [data, setData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [icon, setIcon] = useState("");
  const [message, setMessage] = useState("");

  // Utilisation de useAxios pour recuperer la liste des previleges non inclus dans la liste des previleges actuel
  const {
    response: PrevilegeResponse,
    loading,
    error,
    fetchData: fetchPrevilegesRole,
  } = useAxios({
    method: "post",
    url: baseUrl + "roles/detail",
    body: { roleId: parseInt(row.id_role) },
  });

  // Utilisation de useAxios pour recuperer la liste des previleges du role actuel
  const {
    response: PrevilegeOtherResponse,
    loading: PrevilegeAllLaoding,
    error: PrevilegeAllError,
    fetchData: fetchOtherPrevileges,
  } = useAxios({
    method: "post",
    url: baseUrl + "roles/otherprivileges",
    body: { roleId: parseInt(row.id_role) },
  });

  // Utilisation de useAxios pour assigner des nouveaux previleges
  const {
    response: AddResponse,
    loading: AddLaoding,
    error: AddError,
    fetchData: AddPrevileges,
  } = useAxios({
    method: "post",
    url: baseUrl + "roles/privileges/add",
    body: { roleId: parseInt(row.id_role), privileges: previlegesIds },
  });

  // Utilisation de useAxios pour assigner des nouveaux previleges
  const {
    response: DeleteResponse,
    loading: DeleteLaoding,
    error: DeleteError,
    fetchData: DeletePrevileges,
  } = useAxios({
    method: "put",
    url: baseUrl + "roles/privileges/remove",
    body: { roleId: row.id_role, privilegeId: prevId },
  });

  //ouvrir  le dialogue
  const handleClickOpen = () => {
    setOpen(true);
    setPrevileges([]);
    setPrevilegesIds([]);
    fetchPrevilegesRole();
    fetchOtherPrevileges();
  };

  //fermer le dialogue
  const handleClose = () => {
    setOpen(false);
  };

  const confirmUpdateData = () => {
    DeletePrevileges();
    setOpenDialog(false);
  };

  const consoleUpdateData = () => {
    setPrevId(0);
    setOpenDialog(false);
  };

  //verifier s'i y'a une reponse l'ajouter directement sans fetch au tableau privileges
  useEffect(() => {
    if (AddResponse && AddResponse?.data?.success) {
      let newRows = [];
      previleges.forEach((previlege) => {
        let newRow = {
          id_privileges: previlege.id_privileges,
          name: previlege.name,
          description: previlege.description,
        };
        newRows.push(newRow);
      });
      setPrevileges([]);
      setPrevilegesIds([]);
      setData((prevData) => [...prevData, ...newRows]);
      fetchOtherPrevileges();
    }
  }, [AddResponse]);

  //verifier s'il y'a une reponse de la part de getAllprevileges pour les mettres dans une state
  useEffect(() => {
    if (PrevilegeResponse && PrevilegeResponse?.data?.data?.privileges) {
      setData(PrevilegeResponse?.data?.data?.privileges);
    }
  }, [PrevilegeResponse]);

  //supprimer un previlege
  useEffect(() => {
    if (DeleteResponse && DeleteResponse?.data?.success) {
      const newArray = Gfunc.DeleteElementfromArray(
        data,
        prevId,
        "id_privileges"
      );
      setData(newArray);
      fetchOtherPrevileges();
      setPrevId(0);
    }
  }, [DeleteResponse]);

  //verifier si un previlege sera supprimer
  useEffect(() => {
    if (prevId) {
      setOpenDialog(true);
      setMessage("Êtes-vous sûr de vouloir supprimer ?");
      setIcon("mdiCloseCircleOutline");
    }
  }, [prevId]);

  useEffect(() => {
    if (DeleteError) {
      setPrevId(false);
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

  //supprimer un previlege d'un role
  const handleDeletePrevilege = (row) => {
    setPrevId(row.id_privileges);
  };

  //valider le fomulaire d'ajout
  const handleSubmit = (event) => {
    event.preventDefault();
    AddPrevileges();
  };

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      width: "250px",
    },
    {
      name: "Description",
      selector: (row) => row.description,
      sortable: true,
      width: "300px",
      wrap: true,
    },
    {
      right: "true",
      minWidth: "50px",
      cell: (row, columns) => {
        return (
          <div onClick={() => handleDeletePrevilege(row)}>
            <Icon
              path={mdiDelete}
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
      <CostumTooltip title={"Ajouter des nouveaux privilèges à " + row.name}>
        <Icon
          path={mdiShieldStar}
          //size={1}
          onClick={handleClickOpen}
          style={{
            color: "blue",
            cursor: "pointer",
            height: "24px",
            width: "24px",
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
            minWidth: "700px",
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
              Ajouter / Supprimer des nouveaux privilèges à / de {row.name}
            </p>
          </div>
        </DialogTitle>
        <DialogContent>
          <fieldset className="fieldset">
            <legend className="legend">Choisir des nouveaux privilèges</legend>
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
                    PrevilegeOtherResponse?.data?.data
                    /* ?.map(
                    (option) => ({
                      id: option.id_privileges,
                      name: option.name,
                      description: option.description,
                    })
                  ) */
                  }
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
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  size="small"
                  form="formValidatee"
                  startIcon={<Icon path={mdiCheck} size={0.8} />}
                >
                  Valider
                </Button>
              </div>
            </form>
          </fieldset>
          <div key={Math.floor(Math.random() * (1000 - 9 + 1))}>
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
              paginationRowsPerPageOptions={[5, 10, 20]}
              paginationComponentOptions={{
                rowsPerPageText: "Elements par page:",
                rangeSeparatorText: "de",
                selectAllRowsItem: true,
                selectAllRowsItemText: "Tous",
              }}
            />
          </div>
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
