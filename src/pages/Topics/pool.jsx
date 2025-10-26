// Pool.jsx - Version corrigée
import { useContext, useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { customStyles } from "../../assets/styles/datatable_costum";
import {
  Button,
  Card,
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import Icon from "@mdi/react";
import {
  mdiPlus,
  mdiTextSearch,
  mdiTrashCan,
  mdiEye,
  mdiDotsHorizontal,
  mdiInvoiceTextSendOutline,
} from "@mdi/js";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAxios } from "../../services/useAxios";
import { AuthContexte } from "../../Context/AuthContext";
import { CostumTooltip } from "../../components/styled/CostumTooltip";
import * as Gfunc from "../../helpers/Gfunc";
import DialogConfirm from "../../components/ui/ConfirmDialog";
import { toast } from "react-toastify";
import PoolDetails from "./poolDetails";

const Pool = () => {
  console.log("Rendering Pool component");
  const navigate = useNavigate();
  const location = useLocation();
  const { baseUrl, emptyData, detailedMenu } = useContext(AuthContexte);

  const categorie = decodeURIComponent(location.pathname.split("/")[1]);
  const id_topic =
    detailedMenu.find((item) => item.name === categorie)?.id_topic || null;

  // State management
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [sortField, setSortField] = useState("created_date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [sortInfo, setSortInfo] = useState({ order: { created_date: "desc" } });
  const [search, setSearch] = useState("");
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [articleId, setArticleId] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Main data fetching hook
  const { response, loading, error, fetchData, clearData } = useAxios({
    method: "post",
    url: baseUrl + "articles",
    body: { id_topic: id_topic },
  });

  // useAxios for deleting article
  const {
    response: ResponseDelete,
    loading: LoadingDelete,
    error: ErrorDelete,
    fetchData: FetchDelete,
    clearData: ClearDelete,
  } = useAxios({
    method: "delete",
    url: baseUrl + "articles/delete",
    body: {},
  });

  // CORRECTION : Recharger les données quand la catégorie change
  useEffect(() => {
    console.log("Category changed:", categorie, "ID Topic:", id_topic);

    // Reset de l'état
    clearData();
    setData([]);
    setCurrentPage(1);
    setSearch("");
    setSortField("created_date");
    setSortDirection("desc");

    // Charger les nouvelles données
    if (id_topic) {
      fetchData();
    }
  }, [categorie, id_topic]); // Dépendances critiques

  // Helper function pour créer les paramètres de recherche
  const createFetchParams = () => {
    return {
      id_topic: id_topic,
      page: currentPage,
      per_page: perPage,
      search: search,
      ...sortInfo,
    };
  };

  // Recharger quand pagination/tri/recherche change
  useEffect(() => {
    if (id_topic) {
      fetchData();
    }
  }, [currentPage, perPage, sortInfo]);

  // Handle articles response
  useEffect(() => {
    if (response && response.data.data) {
      console.log(response.data.data);
      setData(response?.data?.data || []);
      setTotalRows(response.data.pagination.totalPages || 0);
    }
  }, [response]);

  // Handle delete response
  useEffect(() => {
    if (ResponseDelete && ResponseDelete.data) {
      toast.success("Article supprimé avec succès");
      ClearDelete();
      fetchData(createFetchParams());
    }
  }, [ResponseDelete]);

  // Handle delete error
  useEffect(() => {
    if (ErrorDelete) {
      toast.error(ErrorDelete.message || "Erreur lors de la suppression");
      ClearDelete();
    }
  }, [ErrorDelete]);

  // Column definitions
  const columns = [
    {
      name: "Titre / Super titre",
      selector: (row) => row.title,
      sortable: true,
      wrap: true,
      width: "400px",
      sortField: "title",
      cell: (row) => (
        <div title={row?.title}>
          {row?.title?.length > 50 ? `${row.title.slice(0, 50)}...` : row.title}
        </div>
      ),
    },
    {
      name: "Slug",
      selector: (row) => row.slug,
      sortable: true,
      wrap: true,
      sortField: "title",
      cell: (row) => (
        <div title="row?.slug">
          {row?.slug?.length > 50 ? `${row.slug.slice(0, 50)}...` : row.slug}
        </div>
      ),
    },
    {
      name: "Catégorie ",
      selector: (row) => row.subCategorie,
      sortable: true,
      wrap: true,
      width: "280px",
      sortField: "categorie",
      cell: (row) => (
        <div>{row?.categories?.map((cat) => cat.name).join(", ")}</div>
      ),
    },
    {
      name: "État",
      selector: (row) => row.state,
      sortable: true,
      wrap: true,
      width: "250px",
      sortField: "state",
      cell: (row) => {
        const stateConfig = {
          DRAFT: { label: "Brouillon", color: "#95a5a6", icon: "📝" },
          DRAFT_RC: { label: "Brouillon RC", color: "#7f8c8d", icon: "✏️" },
          DRAFT_CVC: { label: "Brouillon CVC", color: "#8395a7", icon: "📋" },
          SUBMITTED_TO_RC: {
            label: "Soumis au RC",
            color: "#3498db",
            icon: "📤",
          },
          RC_REVIEW: { label: "Révision RC", color: "#f1c40f", icon: "🔍" },
          SENT_BACK_TO_REDACTEUR: {
            label: "Renvoyé au rédacteur",
            color: "#e67e22",
            icon: "↩️",
          },
          SUBMITTED_TO_CVC: {
            label: "Soumis au CVC",
            color: "#1abc9c",
            icon: "📮",
          },
          CVC_REVIEW: { label: "Révision CVC", color: "#16a085", icon: "👁️" },
          READY_TO_BROADCAST: {
            label: "Prêt à diffuser",
            color: "#27ae60",
            icon: "✅",
          },
          BROADCASTED: { label: "Diffusé", color: "#2c3e50", icon: "📡" },
          ARCHIVED: { label: "Archivé", color: "#7f8c8d", icon: "📦" },
          REJECTED_BY_CVC: {
            label: "Rejeté par CVC",
            color: "#c0392b",
            icon: "❌",
          },
          TRASH: { label: "Corbeille", color: "#8e44ad", icon: "🗑️" },
        };

        const config = stateConfig[row.state] || {
          label: row.state,
          color: "#95a5a6",
          icon: "•",
        };

        return (
          <div
            style={{
              backgroundColor: config.color,
              color: "#fff",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "600",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
              cursor: "default",
              textTransform: "none",
              letterSpacing: "0.3px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            <span style={{ fontSize: "14px" }}>{config.icon}</span>
            <span>{config.label}</span>
          </div>
        );
      },
    },
    {
      name: "Créé le / par",
      // selector: (row) => row.created_date,
      sortable: true,
      wrap: true,
      sortField: "created_date",
      cell: (row) => (
        <div>
          {Gfunc.formaterDate(row.created_at)}&ensp;/&ensp;
          {row?.created_by?.username}
        </div>
      ),
    },

    {
      width: "150px",
      cell: (row) => (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "33% 33% 33%",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <div>
            <PoolDetails row={row} />
          </div>
          <div>
            {row.state === "DRAFT" && (
              <CostumTooltip title="Supprimer" placement="top">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(row.id)}
                >
                  <Icon path={mdiTrashCan} size={1} />
                </IconButton>
              </CostumTooltip>
            )}
          </div>

          <div>
            <div>
              <IconButton size="small" onClick={handleClick}>
                <Icon path={mdiDotsHorizontal} size={1} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "center",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
                slotProps={{
                  list: {
                    "aria-labelledby": "basic-button",
                  },
                }}
              >
                <MenuItem onClick={handleClose}>
                  {" "}
                  <Icon path={mdiInvoiceTextSendOutline} size={1} />
                  Valider
                </MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
                <MenuItem onClick={handleClose}>Logout</MenuItem>
              </Menu>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Handler functions
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page);
  };

  const handleSort = (column, requestedSortDirection) => {
    let actualDirection = requestedSortDirection;
    if (column.sortField === sortField) {
      actualDirection = sortDirection === "asc" ? "desc" : "asc";
    }

    setSortField(column.sortField);
    setSortDirection(actualDirection);

    const newSortInfo = {
      order: { [column.sortField]: actualDirection },
    };
    setSortInfo(newSortInfo);
  };

  const handleSearch = (value) => {
    setSearch(value);
  };

  const onKeyPressSearch = (event) => {
    if (event.key === "Enter") {
      setCurrentPage(1);
      fetchData(createFetchParams());
    }
  };

  const handleChangeContent = () => {
    setOpenAddDialog(true);
  };

  const handleDelete = (id) => {
    setArticleId(id);
    setOpenConfirmDialog(true);
  };

  const confirmTrashedArticle = () => {
    if (articleId) {
      FetchDelete({ id: articleId });
    }
    setOpenConfirmDialog(false);
  };

  const consoleTrashedArticle = () => {
    setOpenConfirmDialog(false);
    setArticleId(null);
  };

  // Afficher un message si pas d'id_topic
  if (!id_topic) {
    return (
      <div className="main-content">
        <Card sx={{ padding: "40px", textAlign: "center" }}>
          <p>Catégorie non trouvée</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="main-content">
      <Grid
        container
        spacing={2}
        direction="row"
        sx={{ marginBottom: "8px" }}
        alignItems="center"
      >
        {/* Search and Filter section */}
        <Grid item xs={8} container spacing={2} alignItems="center">
          <Grid item xs={3}>
            <TextField
              id="input-with-icon-textfield"
              name="input-with-icon-textfield"
              label="Rechercher"
              placeholder="Rechercher..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon
                      path={mdiTextSearch}
                      size={0.8}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setCurrentPage(1);
                        fetchData(createFetchParams());
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              size="small"
              variant="outlined"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyPress={onKeyPressSearch}
              fullWidth
            />
          </Grid>
        </Grid>

        {/* Action buttons section */}
        <Grid item xs={4}>
          <Grid container spacing={1} justifyContent="flex-end">
            <Grid item>
              <Button
                startIcon={<Icon path={mdiPlus} size={0.8} />}
                variant="contained"
                color="primary"
                size="small"
                onClick={handleChangeContent}
              >
                Ajouter
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Data table */}
      <Card
        sx={{
          width: "100%",
          margin: "0 auto",
          borderRadius: "10px",
          textAlign: "center",
        }}
      >
        {loading ? (
          <div style={{ padding: "40px" }}>
            <CircularProgress />
          </div>
        ) : (
          <DataTable
            responsive
            noDataComponent={<b>{emptyData}</b>}
            columns={columns}
            data={data}
            customStyles={customStyles}
            fixedHeader
            persistTableHead
            highlightOnHover
            paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
            paginationComponentOptions={{
              rowsPerPageText: "Elements par page:",
              rangeSeparatorText: "de",
            }}
            pagination
            paginationServer
            sortServer
            paginationDefaultPage={currentPage}
            paginationPerPage={perPage}
            paginationTotalRows={totalRows}
            onChangeRowsPerPage={handlePerRowsChange}
            onChangePage={handlePageChange}
            onSort={handleSort}
            defaultSortField={sortField}
            defaultSortAsc={sortDirection === "asc"}
          />
        )}
      </Card>

      {/* Confirmation dialog */}
      <DialogConfirm
        open={openConfirmDialog}
        id={articleId}
        icon="mdiTrashCan"
        message="Vous allez supprimer un article, êtes-vous sûr de vouloir continuer ?"
        confirmCloseSession={confirmTrashedArticle}
        consoleCloseSession={consoleTrashedArticle}
        placement="auto"
      />
    </div>
  );
};

export default Pool;
