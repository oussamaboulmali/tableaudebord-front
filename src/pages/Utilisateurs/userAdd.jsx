import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  Autocomplete,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Slide,
  TextField,
  Grid,
} from "@mui/material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { mdiPlus, mdiEye, mdiEyeOff } from "@mdi/js";
import { Icon } from "@mdi/react";
import * as Gfunc from "../../helpers/Gfunc";
import * as icons from "@mdi/js";
import { AuthContexte } from "../../Context/AuthContext";
import { useAxios } from "../../services/useAxios";
import { toast } from "react-toastify";
import log from "../../log/costumLog";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

export default function User_add({ fetchData }) {
  const { baseUrl } = useContext(AuthContexte);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    email: [false, ""],
    username: [false, ""],
    password: [false, ""],
    confirmPassword: [false, ""],
  });
  const [roles, setRoles] = useState([]);
  const [rolesIds, setRolesIds] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

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

  // Create user API call
  const {
    response: addResponse,
    loading: addLoading,
    error: addError,
    fetchData: addUser,
    clearData: addClear,
  } = useAxios({
    method: "post",
    url: baseUrl + "users/create",
    body: {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      roleId: rolesIds[0],
      first_name: formData.nom,
      last_name: formData.prenom,
    },
  });

  const resetForm = useCallback(() => {
    setFormData({
      username: "",
      nom: "",
      prenom: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setRoles([]);
    setRolesIds([]);
    setErrors({
      email: [false, ""],
      username: [false, ""],
      password: [false, ""],
      confirmPassword: [false, ""],
    });
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
    resetForm();
    fetchRoles();
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Reset the specific error when user types
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: [false, ""],
        }));
      }
    },
    [errors]
  );

  // Handle successful user creation
  useEffect(() => {
    if (addResponse && addResponse?.data?.success) {
      setOpen(false);

      toast.success(addResponse?.data?.message, {
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

      addClear();
      fetchData();
    }
  }, [addResponse, addClear, fetchData]);

  // Handle user creation error
  useEffect(() => {
    if (addError) {
      toast.error(addError, {
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
      addClear();
    }
  }, [addError, addClear]);

  // Handle role fetch error
  useEffect(() => {
    if (rolesError) {
      toast.error("Erreur lors de la récupération des rôles", {
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
  }, [rolesError]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const errorObj = {
      email: [false, ""],
      username: [false, ""],
      password: [false, ""],
      confirmPassword: [false, ""],
    };

    const { username, email, password, confirmPassword, nom, prenom } =
      formData;

    // Check for password match
    const passwordsMatch = password === confirmPassword;

    // Validate the form fields
    const validations = {
      username: {
        isValid: Gfunc.isValidUsername(username),
        errorMessage: "Nom d'utilisateur doit contenir que des lettres , . - _",
      },
      email: {
        isValid: Gfunc.isValidEmail(email),
        errorMessage: "Adresse e-mail invalide",
      },
      password: {
        isValid: Gfunc.isValidPassword(password, username),
        errorMessage: "Mot de passe invalide",
      },
      confirmPassword: {
        isValid: passwordsMatch,
        errorMessage: "Les mots de passe ne correspondent pas",
      },
    };

    // Check for XSS or SQL injection
    const fields = { username, email, password, confirmPassword, nom, prenom };
    const injectionResults = Object.values(fields).map((field) =>
      Gfunc.checkXssSQL(field)
    );

    const hasInjection = injectionResults.some((result) => result.isInjection);

    // Validate role selection
    const rolesSelected = rolesIds.length > 0;

    if (!rolesSelected) {
      toast.error("Veuillez sélectionner au moins un rôle", {
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
      return;
    }

    if (!hasInjection && Object.values(validations).every((v) => v.isValid)) {
      addUser();
    } else {
      let errorMessages = [];

      if (hasInjection) {
        const injectionTypes = injectionResults
          .filter((result) => result?.isInjection)
          .map((result) => result?.type)
          .filter((type, index, self) => self.indexOf(type) === index); // Get unique types

        const message = `L'utilisateur a saisi une ou plusieurs tentatives d'injection: ${injectionTypes.join(
          ", "
        )}`;
        log.error(message, "blocage", "Injection détectée", 220);
        return;
      }

      Object.keys(validations).forEach((key) => {
        if (!validations[key].isValid) {
          errorObj[key] = [true, validations[key].errorMessage];
          errorMessages.push(validations[key].errorMessage);
        }
      });

      if (errorMessages.length > 0) {
        log.error(
          errorMessages.join(" et ") + " invalide(s).",
          "erreurs_saisie",
          "",
          210
        );
      }

      setErrors(errorObj);
    }
  };

  const renderPasswordField = (field, label, placeholder) => {
    const isPassword = field === "password";
    const showField = isPassword ? showPassword : showConfirmPassword;

    return (
      <TextField
        placeholder={placeholder}
        label={label}
        type={showField ? "text" : "password"}
        variant="outlined"
        margin="dense"
        size="small"
        fullWidth
        required
        error={errors?.[field]?.[0]}
        helperText={errors?.[field]?.[1]}
        autoComplete="off"
        value={formData[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => togglePasswordVisibility(field)}
                edge="end"
              >
                <Icon path={showField ? mdiEye : mdiEyeOff} size={1} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    );
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
              path={icons[Gfunc?.getIcon("utilisateurs")]}
              size={0.9}
              style={{ color: "white" }}
            />
            <p> Ajouter un nouveau utilisateur</p>
          </div>
        </DialogTitle>
        <DialogContent>
          <form id="formValidate" onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TextField
                  placeholder="Nom de l'utilisateur"
                  label="Nom"
                  variant="outlined"
                  margin="none"
                  size="small"
                  fullWidth
                  autoComplete="off"
                  value={formData.nom}
                  onChange={(e) => handleInputChange("nom", e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  placeholder="Prénom de l'utilisateur"
                  label="Prénom"
                  variant="outlined"
                  margin="none"
                  size="small"
                  fullWidth
                  autoComplete="off"
                  value={formData.prenom}
                  onChange={(e) => handleInputChange("prenom", e.target.value)}
                />
              </Grid>
            </Grid>

            <TextField
              placeholder="Username"
              label="Username"
              variant="outlined"
              margin="dense"
              size="small"
              fullWidth
              required
              autoComplete="off"
              error={errors?.username?.[0]}
              helperText={errors?.username?.[1]}
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
            />

            <Autocomplete
              freeSolo
              fullWidth
              filterSelectedOptions
              required
              size="small"
              options={rolesResponse?.data?.data || []}
              value={roles}
              loading={rolesLoading}
              loadingText="Chargement des rôles..."
              noOptionsText="Aucun rôle disponible"
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
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Rôles"
                  placeholder="Sélectionnez les rôles"
                  error={rolesIds.length === 0 && formData.username !== ""}
                  helperText={
                    rolesIds.length === 0 && formData.username !== ""
                      ? "Sélectionnez au moins un rôle"
                      : ""
                  }
                />
              )}
            />

            <TextField
              placeholder="Adresse mail"
              label="Email"
              variant="outlined"
              margin="dense"
              size="small"
              fullWidth
              required
              error={errors?.email?.[0]}
              helperText={errors?.email?.[1]}
              autoComplete="off"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />

            {renderPasswordField("password", "Mot de passe", "Mot de passe")}
            {renderPasswordField(
              "confirmPassword",
              "Confirmer mot de passe",
              "Confirmez votre mot de passe"
            )}
          </form>
        </DialogContent>
        <DialogActions className="DialogActions">
          <Button
            variant="contained"
            color="primary"
            type="submit"
            size="small"
            form="formValidate"
            disabled={addLoading}
            startIcon={<Icon path={icons["mdiCheck"]} size={0.8} />}
          >
            {addLoading ? "Traitement..." : "Valider"}
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
