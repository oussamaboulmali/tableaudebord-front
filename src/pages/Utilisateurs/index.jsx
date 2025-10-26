import { useEffect, useState, useContext } from "react";
import DataTable from "react-data-table-component";
import { customStyles } from "../../assets/styles/datatable_costum";
import {
  Autocomplete,
  Card,
  CircularProgress,
  FormControl,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import Icon from "@mdi/react";
import { mdiTextSearch } from "@mdi/js";
import { useAxios } from "../../services/useAxios";
import { AuthContexte } from "../../Context/AuthContext";
import UserAdd from "./userAdd";
import UserAddRole from "./userAddRole";
import UserDetails from "./userDetails";
import "../../assets/styles/roles.css";
import * as Gfunc from "../../helpers/Gfunc";
import * as icons from "@mdi/js";
import { toast } from "react-toastify";
import { CostumTooltip } from "../../components/styled/CostumTooltip";
import "../../assets/styles/users.css";
import RestPassword from "./restPassword";
import DialogConfirm from "../../components/ui/ConfirmDialog";
import { use } from "react";

export default function Utilisateur() {
  const { baseUrl, emptyData } = useContext(AuthContexte);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    message: "",
    icon: "",
    userToChange: null,
    newState: null,
    url: "",
    body: {},
  });

  // State options for filter
  const states = [
    { id: null, name: "Tous" },
    { id: 0, name: "désactiver" },
    { id: 1, name: "activer" },
    { id: 2, name: "bloquer" },
  ];

  // Row styling for disabled users
  const conditionalRowStyles = [
    {
      when: (row) => row.state === 0,
      style: {
        background: "#F8F9FA",
        color: "gray",
        "&:hover": {
          background: "#F8F9FA",
          color: "gray",
        },
      },
    },
  ];

  // Fetch users data
  const { response, loading, error, fetchData } = useAxios({
    method: "post",
    url: baseUrl + "users",
    body: {},
  });

  // Axios hook for changing user state
  const {
    response: stateResponse,
    loading: stateLoading,
    error: stateError,
    fetchData: changeState,
    clearData: clearStateResponse,
  } = useAxios();

  // Fetch roles list
  const {
    response: rolesResponse,
    loading: rolesLoading,
    error: rolesError,
    fetchData: fetchRoles,
  } = useAxios({
    method: "post",
    url: baseUrl + "roles",
    body: {},
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Update data when response changes
  useEffect(() => {
    if (response?.data?.success) {
      const responseData = response?.data?.data || [];
      setData(responseData);
      applyFilters(responseData);
    }
  }, [response, searchTerm, selectedUser]);

  // Apply search and state filters
  const applyFilters = (sourceData) => {
    let result = [...sourceData];

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          (user?.first_name?.toLowerCase() || "").includes(term) ||
          (user?.username?.toLowerCase() || "").includes(term) ||
          (user?.last_name?.toLowerCase() || "").includes(term) ||
          (user?.register_date?.toLowerCase() || "").includes(term) ||
          (user?.post?.toLowerCase() || "").includes(term) ||
          (user?.email?.toLowerCase() || "").includes(term)
      );
    }

    // Apply state filter
    if (selectedUser?.id !== null && selectedUser?.id !== undefined) {
      result = result.filter((user) => user.state === selectedUser.id);
    }

    setFilteredData(result);
  };

  // Handle successful state change
  useEffect(() => {
    if (stateResponse?.data?.success) {
      toast.success(stateResponse?.data?.message, {
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

      // Update the state in the data array
      const updatedData = data.map((row) => {
        if (dialogConfig.userToChange.id_user === row.id_user) {
          return { ...row, state: dialogConfig.newState };
        }
        return row;
      });

      setData(updatedData);
      applyFilters(updatedData);
      clearStateResponse();
    }
  }, [stateResponse]);

  // Handle state change error
  useEffect(() => {
    if (stateError) {
      toast.error(stateError, {
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
      clearStateResponse();
    }
  }, [stateError]);

  // Prepare confirmation dialog for state change
  const handleChangeStateUser = (row) => {
    const newState = row.state === 1 ? 0 : 1;
    const actionText =
      row.state === 1
        ? "désactiver"
        : row.state === 0
        ? "activer"
        : "débloquer";

    // Determine which API to call based on current state
    const isBlock = row.state === 2;
    const url = baseUrl + (isBlock ? "users/unblock" : "users/activate");
    const body = isBlock
      ? { userId: row.id_user }
      : {
          userId: row.id_user,
          type: row.state === 0,
        };

    setDialogConfig({
      message: `Êtes-vous sûr de vouloir ${actionText} cet utilisateur ?`,
      icon: row.state === 1 ? "mdiLock" : "mdiLockOpen",
      userToChange: row,
      newState: newState,
      url,
      body,
    });

    setOpenDialog(true);
  };

  // Confirm state change
  const confirmStateChange = () => {
    // Use the existing changeState function with the URL and body from dialogConfig
    changeState({
      method: "put",
      url: dialogConfig.url,
      body: dialogConfig.body,
    });

    setOpenDialog(false);
  };

  // Cancel state change
  const cancelStateChange = () => {
    setOpenDialog(false);
  };

  // Filter by state
  const handleStateFilter = (stateValue) => {
    setSelectedUser(stateValue);
  };

  // Handle search input
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Helper to get icon and color based on user state
  const getUserStateDisplay = (state) => {
    switch (state) {
      case 1:
        return {
          icon: "mdiLockOpen",
          color: "green",
          tooltip: "Utilisateur activé",
        };
      case 0:
        return {
          icon: "mdiLock",
          color: "red",
          tooltip: "Utilisateur désactivé",
        };
      case 2:
        return {
          icon: "mdiBlockHelper",
          color: "orange",
          tooltip: "Utilisateur bloqué",
        };
      default:
        return {
          icon: "mdiHelpCircleOutline",
          color: "gray",
          tooltip: "État inconnu",
        };
    }
  };

  const {
    response: updateResp,
    loading: updateLoading,
    error: updateError,
    fetchData: updateRole,
    clearData: clearUpdateResp,
  } = useAxios();

  const handleRoleChange = (userId, newRoleId, roleName) => {
    // optionnel : désactiver le contrôle pendant updateLoading
    updateRole({
      method: "put",
      url: baseUrl + "users/change-role",
      body: {
        userId,
        roleId: newRoleId,
      },
    });
  };

  // Gérer la réponse de mise à jour du rôle
  useEffect(() => {
    if (updateResp?.data?.success) {
      toast.success(
        updateResp?.data?.message || "Rôle mis à jour avec succès",
        {
          icon: icons["mdiCheck"],
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

      // Mettre à jour les données localement
      fetchData();
      clearUpdateResp();
    }
  }, [updateResp]);

  // Gérer les erreurs de mise à jour du rôle
  useEffect(() => {
    if (updateError) {
      toast.error(updateError, {
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
      fetchData();
      clearUpdateResp();
    }
  }, [updateError]);

  // DataTable columns
  const columns = [
    {
      name: "Nom et prenom",
      selector: (row) => row.first_name + " " + row.last_name,
      sortable: true,
      minWidth: "250px",
      wrap: true,
    },
    {
      name: "Username",
      selector: (row) => row.username,
      sortable: true,
      wrap: true,
    },
    {
      name: "Post",
      selector: (row) => row.post,
      sortable: true,
      wrap: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      wrap: true,
    },
    {
      name: "Rôle",
      selector: (row) => row.role || "",
      sortable: true,
      wrap: true,
      minWidth: "180px",
      cell: (row) => {
        const [isEditing, setIsEditing] = useState(false);
        const [localRole, setLocalRole] = useState(row.role || "");

        // Mettre à jour localRole quand row.role change
        useEffect(() => {
          setLocalRole(row.role || "");
        }, [row.role]);

        const handleChange = (e) => {
          const newRoleId = e.target.value;
          const selectedRoleObj = rolesResponse?.data?.data?.find(
            (r) => r.id_role === newRoleId
          );

          if (selectedRoleObj) {
            // Mettre à jour immédiatement l'affichage local
            setLocalRole(selectedRoleObj.name);

            // Appeler l'API pour sauvegarder le changement
            handleRoleChange(row.id_user, newRoleId, selectedRoleObj.name);
          }

          setIsEditing(false);
        };

        const handleCancel = () => {
          setIsEditing(false);
        };

        return (
          <div style={{ minWidth: "150px", width: "100%" }}>
            {!isEditing ? (
              <div
                onClick={() => setIsEditing(true)}
                style={{
                  cursor: "pointer",
                  fontWeight: 500,
                  padding: "6px 12px",
                  borderRadius: "4px",
                  transition: "background-color 0.2s",
                  "&:hover": {
                    backgroundColor: "#f3f4f6",
                  },
                }}
                title="Cliquer pour modifier le rôle"
              >
                {localRole || "Aucun rôle"}
              </div>
            ) : (
              <FormControl size="small" fullWidth>
                <Select
                  autoFocus
                  value={row.id_role || ""}
                  onChange={handleChange}
                  onBlur={handleCancel}
                  MenuProps={{
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "left",
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "left",
                    },
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  }}
                  sx={{
                    fontSize: "0.875rem",
                    "& .MuiSelect-select": {
                      padding: "6px 12px",
                      fontWeight: 500,
                    },
                    "& .MuiInputBase-root": {
                      height: 36,
                      fontSize: "0.875rem",
                    },
                  }}
                >
                  {rolesResponse?.data?.data?.map((role) => (
                    <MenuItem
                      key={role.id_role}
                      value={role.id_role}
                      sx={{
                        fontSize: "0.875rem",
                        "&.Mui-selected": {
                          backgroundColor: "#e5e7eb",
                          fontWeight: 600,
                        },
                      }}
                    >
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>
        );
      },
    },
    {
      name: "Dernière visite",
      selector: (row) => row.lastvisit_date,
      sortable: true,
      wrap: true,
      cell: (row) => {
        return (
          <div
            style={{
              color: row.lastvisit_date ? "#374151" : "#9ca3af",
              fontStyle: row.lastvisit_date ? "normal" : "italic",
            }}
          >
            {row.lastvisit_date
              ? Gfunc.formaterDate(row.lastvisit_date)
              : "Jamais connecté"}
          </div>
        );
      },
    },
    {
      right: true,
      cell: (row) => {
        const stateDisplay = getUserStateDisplay(row.state);

        return (
          <div id="four-grid-icons">
            <UserDetails row={row} setDataa={setData} dataa={data}>
              <Icon
                path={icons["mdiEye"]}
                size={1}
                style={{ cursor: "pointer", color: "#265396" }}
              />
            </UserDetails>

            <CostumTooltip title={stateDisplay.tooltip}>
              <div onClick={() => handleChangeStateUser(row)}>
                <Icon
                  path={icons[stateDisplay.icon]}
                  size={0.9}
                  style={{
                    color: stateDisplay.color,
                    cursor: "pointer",
                  }}
                />
              </div>
            </CostumTooltip>
            <RestPassword row={row} />
          </div>
        );
      },
    },
  ];

  return (
    <div className="main-content">
      <Grid container spacing={2} sx={{ marginBottom: "8px" }}>
        <Grid item xs={12} sm={3} md={2}>
          <TextField
            id="input-with-icon-textfield"
            name="input-with-icon-textfield"
            label="Rechercher"
            placeholder="Rechercher..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon path={mdiTextSearch} size={0.8} />
                </InputAdornment>
              ),
            }}
            size="small"
            variant="outlined"
            fullWidth
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3} md={2}>
          <Autocomplete
            disablePortal
            size="small"
            margin="none"
            options={states}
            getOptionLabel={(option) => option?.name || ""}
            value={selectedUser}
            onChange={(event, newValue) => {
              handleStateFilter(newValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="État" fullWidth />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={8}>
          <div className="div-add">
            <UserAdd fetchData={fetchData} />
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
          <DataTable
            noDataComponent={<b>{emptyData}</b>}
            responsive
            columns={columns}
            data={filteredData.length > 0 ? filteredData : data}
            customStyles={customStyles}
            fixedHeader
            persistTableHead
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
            highlightOnHover
            paginationDefaultPage={currentPage}
            onChangePage={(page) => setCurrentPage(page)}
            conditionalRowStyles={conditionalRowStyles}
            paginationComponentOptions={{
              rowsPerPageText: "Elements par page:",
              rangeSeparatorText: "de",
              selectAllRowsItem: true,
              selectAllRowsItemText: "Tous",
            }}
          />
        )}
      </Card>

      {/* Confirmation Dialog */}
      <DialogConfirm
        open={openDialog}
        icon={dialogConfig.icon}
        grid={6}
        message={dialogConfig.message}
        confirmCloseSession={confirmStateChange}
        consoleCloseSession={cancelStateChange}
        placement="auto"
      />
    </div>
  );
}
