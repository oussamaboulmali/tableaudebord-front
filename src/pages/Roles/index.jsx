import { useEffect, useState, useRef, useContext } from "react";
import DataTable from "react-data-table-component";
import { customStyles } from "../../assets/styles/datatable_costum";
import {
  Card,
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import ContentEditable from "react-contenteditable";
import Icon from "@mdi/react";
import { useAxios } from "../../services/useAxios";
import { AuthContexte } from "../../Context/AuthContext";
import RoleAdd from "./roleAdd";
import RoleAddPrevilege from "./roleaddPrevileges";
import RoleAddUser from "./roleAddUser";
import "../../assets/styles/roles.css";
import * as Gfunc from "../../helpers/Gfunc";
import * as icons from "@mdi/js";
import DialogConfirm from "../../components/ui/ConfirmDialog/index";
import { toast } from "react-toastify";
import { CostumTooltip } from "../../components/styled/CostumTooltip";
import log from "../../log/costumLog";

export default function Index() {
  const { baseUrl, emptyData, currentLang } = useContext(AuthContexte);
  const [UpdateValue, setUpdateValue] = useState({});
  const [deletedRole, setDeletedRole] = useState(0);
  const [data, setData] = useState([]);
  const [FiltredData, setFiltredData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [icon, setIcon] = useState("");
  const prevDataRef = useRef(UpdateValue);
  const deletedRoleRef = useRef(deletedRole);

  const { response, loading, error, fetchData } = useAxios({
    method: "post",
    url: baseUrl + "roles",
    body: {},
  });

  //utiliser axios personnaliser pour la modification d'un role
  const {
    response: UpdateResponse,
    loading: UpdateLoading,
    error: UpdateError,
    fetchData: UpdateData,
    clearData: UpdateClearData,
  } = useAxios({
    method: UpdateValue.method,
    url: UpdateValue.url,
    body: UpdateValue.body,
  });

  //utiliser axios personnaliser pour le suppression du role
  const {
    response: DeleteResponse,
    loading: DeleteLoading,
    error: DeleteError,
    fetchData: DeleteRole,
    clearData: DeleteClearData,
  } = useAxios({
    method: "put",
    url: baseUrl + "roles/delete",
    body: { roleId: parseInt(deletedRole) },
  });

  const confirmUpdateData = () => {
    setOpenDialog(false);
    if (
      deletedRole &&
      localStorage.getItem("action" + currentLang) === "delete"
    ) {
      DeleteRole();
      DeleteClearData();
    }
    if (
      UpdateValue &&
      Object.keys(UpdateValue).length !== 0 &&
      localStorage.getItem("action" + currentLang) === "update"
    ) {
      UpdateData();
      UpdateClearData();
    }
  };

  const consoleUpdateData = () => {
    setOpenDialog(false);
    if (
      UpdateValue &&
      localStorage.getItem("action" + currentLang) === "update"
    ) {
      const rowIndex = data.findIndex(
        (item) => item.id_role === UpdateValue.row.id_role
      );
      if (rowIndex !== -1) {
        const newData = [...data];
        newData[rowIndex] = {
          ...newData[rowIndex],
          [UpdateValue.att]: UpdateValue.oldValue,
        };
        setData(newData);
        UpdateClearData();
      }
    }
    if (
      deletedRole &&
      localStorage.getItem("action" + currentLang) === "delete"
    ) {
      DeleteClearData();
      setDeletedRole(0);
    }
  };

  useEffect(() => {
    if (response) {
      setData(response?.data?.data);
      setFiltredData(response?.data?.data);
    }
  }, [response]);

  useEffect(() => {
    if (!response) {
      fetchData();
    }
  }, [response]);

  useEffect(() => {
    if (prevDataRef.current && prevDataRef.current !== UpdateValue) {
      setOpenDialog(true);
      setMessage("Êtes-vous sûr de vouloir modifier ?");
      setIcon("mdiUpdate");
    }
  }, [UpdateValue]);

  useEffect(() => {
    if (UpdateResponse && UpdateResponse?.data?.success) {
      //UpdateValue.row[UpdateValue.att] = UpdateValue.body[UpdateValue.att];
      const rowIndex = data.findIndex(
        (item) => item.id_role === UpdateValue.row.id_role
      );
      if (rowIndex !== -1) {
        const newData = [...data];
        newData[rowIndex] = {
          ...newData[rowIndex],
          [UpdateValue.att]: UpdateValue.body[UpdateValue.att],
        };
        setData(newData);
      }
    }
  }, [UpdateResponse, UpdateValue]);

  useEffect(() => {
    if (UpdateError) {
      const toastid = toast.error(UpdateError, {
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

      //updateValue.row[updateValue.att] = updateValue.oldValue;
      const rowIndex = data.findIndex(
        (item) => item.id_role === UpdateValue.row.id_role
      );
      if (rowIndex !== -1) {
        const newData = [...data];
        newData[rowIndex] = {
          ...newData[rowIndex],
          [UpdateValue.att]: UpdateValue.oldValue,
        };
        setData(newData);
      }
    }
  }, [UpdateError, UpdateValue]);

  const handleOnEdit = (e, row, value, att) => {
    localStorage.setItem("action" + currentLang, "update");
    const oldVal = row[att];
    if (!Gfunc.checkXssSQL(value).isInjection) {
      if (row[att] !== value && value !== "") {
        setUpdateValue({
          row: row,
          method: "put",
          url: baseUrl + "roles/update",
          body: {
            [att]: value,
            roleId: parseInt(row.id_role),
          },
          oldValue: row[att],
          att: att,
        });
      } else {
        e.target.innerHTML = oldVal;
      }
    } else {
      log.error(
        "L'utilisateur a saisi des balises HTML lors de modification de  " +
          att +
          "  dans role.",
        "blocage",
        "Html Tags",
        220
      );
      e.target.innerHTML = oldVal;
    }
  };

  //supprimer un role
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
      const newArray = Gfunc.DeleteElementfromArray(
        data,
        deletedRole,
        "id_role"
      );
      setData(newArray);
      setDeletedRole(0);
    }
  }, [DeleteResponse]);

  useEffect(() => {
    if (DeleteError) {
      setDeletedRole(0);
      toast.error(DeleteError, {
        icon: icon["mdiAlertCircleOutline"],
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

  //verifier si un previlege pourra supprimer
  useEffect(() => {
    if (deletedRoleRef && deletedRoleRef?.current !== deletedRole) {
      setOpenDialog(true);
      setMessage("Êtes-vous sûr de vouloir supprimer ?");
      setIcon("mdiCloseCircleOutline");
    }
  }, [deletedRoleRef, deletedRole]);

  const handleDeleteRole = (row) => {
    localStorage.setItem("action" + currentLang, "delete");
    setDeletedRole(row.id_role);
  };

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      //minWidth: "350px",
      cell: (row, columns) => {
        return (
          <ContentEditable
            className="content-editable"
            html={row.name}
            onBlur={(e) => {
              const { isValid, cleanedString } = Gfunc.validateAndCleanString(
                e.target.innerHTML
              );

              if (isValid) {
                handleOnEdit(e, row, cleanedString, "name");
              } else {
                toast.error(
                  "Le nom du role ne doit pas contenir les caractères comme . / _ -",
                  {
                    icon: icons["mdiAlertCircleOutline"],
                    position: "bottom-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                  }
                );
                e.target.innerHTML = row.name;
              }
            }}
          />
        );
      },
    },
    {
      name: "Description",
      selector: (row) => row.description,
      sortable: true,
      // minWidth: "350px",
      cell: (row, columns) => {
        return (
          <ContentEditable
            className="content-editable"
            html={row.description}
            /*  onBlur={(e) =>
              handleOnEdit(e, row, e.target.innerHTML, "description")
            } */
            onBlur={(e) => {
              const { isValid, cleanedString } = Gfunc.validateAndCleanString(
                e.target.innerHTML
              );

              if (isValid) {
                handleOnEdit(e, row, cleanedString, "description");
              } else {
                toast.error(
                  "La description du role ne doit pas contenir les caractères comme . / _ -",
                  {
                    icon: icons["mdiAlertCircleOutline"],
                    position: "bottom-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                  }
                );
                e.target.innerHTML = row.description;
              }
            }}
          />
        );
      },
    },
    {
      name: "Créer le",
      sortable: true,
      cell: (row, columns) => {
        return <div>{Gfunc.formaterDate(row.created_date)}</div>;
      },
    },
    {
      name: "Par",
      selector: (row) => row.created_by,
      sortable: true,
    },
    {
      right: "true",
      minWidth: "50px",
      cell: (row, columns) => {
        return (
          <div id="three-grid-icons">
            <RoleAddPrevilege row={row} />
            <RoleAddUser row={row} />
            <CostumTooltip title="Supprimer un rôle">
              <div onClick={() => handleDeleteRole(row)}>
                <Icon
                  path={icons["mdiDelete"]}
                  size={1}
                  style={{ color: "red", cursor: "pointer" }}
                />
              </div>
            </CostumTooltip>
          </div>
        );
      },
    },
  ];

  const handleSearch = (term) => {
    const termLowerCase = term.toLowerCase();
    let array = FiltredData?.filter(
      (role) =>
        role?.name?.toLowerCase().includes(termLowerCase) ||
        role?.description?.toLowerCase().includes(termLowerCase) ||
        role?.created_by_username?.toLowerCase().includes(termLowerCase)
    );
    setData(array);
  };

  return (
    <div className="main-content">
      <Grid container sx={{ marginBottom: "8px" }}>
        <Grid item xs={6}>
          <TextField
            id="input-with-icon-textfield"
            name="input-with-icon-textfield"
            label="Rechercher"
            placeholder="Rechercher..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon path={icons["mdiTextSearch"]} size={0.8} />
                </InputAdornment>
              ),
            }}
            size="small"
            variant="outlined"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Grid>
        <Grid item xs={6}>
          <div className="div-add">
            <RoleAdd setData={setData} data={data} />
          </div>
        </Grid>
      </Grid>
      <Card
        sx={{
          width: "100%",
          margin: "0 auto",
          borderRadius: "10px",
          textAlign: "center",
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : (
          <div key={Math.floor(Math.random() * 2)}>
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
              paginationPerPage={10}
              paginationComponentOptions={{
                rowsPerPageText: "Elements par page:",
                rangeSeparatorText: "de",
                selectAllRowsItem: true,
                selectAllRowsItemText: "Tous",
              }}
            />
          </div>
        )}
      </Card>
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
    </div>
  );
}
