import React, { useState, useEffect } from "react";
import {
  Avatar,
  Card,
  Checkbox,
  Dialog,
  Divider,
  FormControlLabel,
  IconButton,
  Slide,
  TextField,
} from "@mui/material";
import { CostumTooltip } from "../../components/styled/CostumTooltip";
import Icon from "@mdi/react";
import * as icons from "@mdi/js";
import * as Gfunc from "../../helpers/Gfunc";
import User from "../../assets/images/user.png";
import { useAxios } from "../../services/useAxios";
import { useContext } from "react";
import { AuthContexte } from "../../Context/AuthContext";
import log from "../../log/costumLog";
import { toast } from "react-toastify";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

export default function UserDetails({ children, row, dataa, setDataa, from }) {
  const { baseUrl, currentLang } = useContext(AuthContexte);
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [data, setData] = useState({});
  const [att, setAtt] = useState("");
  const [val, setVal] = useState("");
  const [editableField, setEditableField] = useState(null);
  const [errorUpdate, setErrorUpdate] = useState({
    email: [false, ""],
    phone_number: [false, ""],
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [errors, setErrors] = useState({
    password: [false, ""],
    confirmPassword: [false, ""],
  });
  const nonEditableFields = [
    "birth_day",
    "lastvisit_date",
    "post",
    "register_by",
    "register_date",
    "lastvisit_date",
    "post",
    "username",
    "activate_by",
    "activate_date",
    "blocked_date",
    "deactivated_by",
    "desactivate_date",
    "modified_by",
    "modified_date",
    "unblocked_by",
    "unblocked_date",
  ];
  const fieldLabels = {
    first_name: "Prénom",
    last_name: "Nom",
    username: "Nom d'utilisateur",
    birth_day: "Date de naissance",
    phone_number: "Numéro de téléphone",
    email: "Email",
    post: "Poste",
    role: "Rôle",
    register_by: "Enregistré par",
    register_date: "Date d'enregistrement",
    lastvisit_date: "Dernière visite",
    activate_by: "Activé par",
    activate_date: "Date d'activation",
    blocked_date: "Date de blocage",
    deactivated_by: "Désactivé par",
    desactivate_date: "Date de désactivation",
    unblocked_by: "Débloqué par",
    unblocked_date: "Date de déblocage",
  };

  //recuperer les informations de l'utilisateur
  const { response, loading, error, fetchData } = useAxios({
    method: "post",
    url: baseUrl + "users/detail",
    body: { userId: parseInt(row.id_user) },
  });

  //modifier les informations de l'utilisateur
  const {
    response: UpdateResponse,
    loading: UpdateLoading,
    error: UpdateError,
    fetchData: UpdateData,
    clearData: UpdateClear,
  } = useAxios({
    method: "put",
    url: baseUrl + (from ? "users/updateme" : "users/update"),
    body: from
      ? {
          [att]: val,
        }
      : {
          userId: parseInt(row.id_user),
          [att]: val,
        },
  });

  //modifier le mot de passe du proprietaire du compte
  const {
    response: PasswordResponse,
    loading: PasswordLoading,
    error: PasswordError,
    fetchData: PasswordData,
    clearData: PasswordClear,
  } = useAxios({
    method: "put",
    url: baseUrl + "users/changepassword",
    body: {
      userId: parseInt(localStorage.getItem("userId" + currentLang)),
      oldPassword: oldPassword,
      newPassword: newPassword,
    },
  });

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

  const handleEdit = (fieldName) => {
    setErrorUpdate({
      email: [false, ""],
      phone_number: [false, ""],
    });
    setEditableField(fieldName);
  };

  const handleInputChange = (e, fieldName) => {
    const injectionTypes = Gfunc.checkXssSQL(e.target.value);
    setAtt(fieldName);
    setVal(e.target.value);
    if (!injectionTypes.isInjection) {
      setData({ ...data, [fieldName]: e.target.value });
    }
  };

  //tester si l'attribut modifier soit email ou phone number pour tester son validite
  const testAtt = (att, val) => {
    switch (att) {
      case "email":
        if (Gfunc.isValidEmail(val)) {
          UpdateData();
          setEditableField(null);
        } else {
          setErrorUpdate((prevState) => ({
            ...prevState,
            email: [true, "Modification de l'adresse e-mail erronée"],
          }));
          log.error(
            "Modification de l'adresse e-mail erronée",
            "erreurs_saisie",
            "",
            210
          );
        }
        break;
      case "phone_number":
        if (Gfunc.validatePhoneNumber(val)) {
          UpdateData();
          setEditableField(null);
        } else {
          setErrorUpdate((prevState) => ({
            ...prevState,
            phone_number: [true, "Modification de numéro de téléphone erroné"],
          }));
          log.error(
            "Modification de numéro de téléphone erroné",
            "erreurs_saisie",
            "",
            210
          );
        }
        break;
      default:
        UpdateData();
        setEditableField(null);
        break;
    }
  };

  //valider la modification
  const handleSave = () => {
    const injectionTypes = Gfunc.checkXssSQL(val);
    if (!injectionTypes.isInjection) {
      testAtt(att, val);
    } else {
      log.error(
        `L'utilisateur a saisi une ou plusieurs tentatives d'injection dans ${fieldLabels[att]} : ${val} `,
        "blocage",
        "Injection détectée",
        220
      );
    }
  };

  //annuler la modification
  const handleCancle = () => {
    setData({ ...data, [att]: response?.data?.data[att] });
    setEditableField(null);
  };

  //verifier en pernamance la modification de updateResponse
  useEffect(() => {
    if (UpdateResponse) {
      row[att] = val;
      if (
        att === "first_name" &&
        row.id_user === parseInt(localStorage.getItem("userId" + currentLang))
      ) {
        localStorage.setItem("userFirstName" + currentLang, val);
      }
      if (
        att === "last_name" &&
        row.id_user === parseInt(localStorage.getItem("userId" + currentLang))
      ) {
        localStorage.setItem("userLastName" + currentLang, val);
      }
      UpdateClear();
    }
  }, [UpdateResponse]);

  useEffect(() => {
    if (rolesResponse) {
      fetchRoles();
    }
  }, [rolesResponse]);

  useEffect(() => {
    if (UpdateError) {
      setData({ ...data, [att]: response?.data?.data[att] });
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
      UpdateClear();
    }
  }, [UpdateError, att, response]);

  const handleIcon = (value) => {
    const iconMappings = {
      birth_day: "mdiCakeVariant",
      email: "mdiEmail",
      first_name: "mdiAlphaNBox",
      last_name: "mdiAlphaLBox",
      phone_number: "mdiPhone",
      post: "mdiBagChecked",
      username: "mdiAlphaUBox",
    };

    const Dates = [
      "lastvisit_date",
      "activate_date",
      "register_date",
      "blocked_date",
      "desactivate_date",
      "modified_date",
      "unblocked_date",
    ];

    const Agents = [
      "activate_by",
      "deactivated_by",
      "modified_by",
      "register_by",
      "unblocked_by",
    ];

    if (iconMappings[value]) {
      return iconMappings[value];
    } else if (Dates.includes(value)) {
      return "mdiCalendarRange";
    } else if (Agents.includes(value)) {
      return "mdiAccount";
    }
  };

  //tester si il y'a une reponse positive pour remplir le tableau.
  useEffect(() => {
    if (response) {
      const baseData = {
        first_name: response?.data?.data?.first_name,
        last_name: response?.data?.data?.last_name,
        username: response?.data?.data?.username,
        birth_day: Gfunc.formaterDate(response?.data?.data?.birth_day),
        phone_number: response?.data?.data?.phone_number,
        email: response?.data?.data?.email,
        post: response?.data?.data?.post,
      };

      const adminData = {
        ...baseData,
        register_by: response?.data?.data?.register_by,
        register_date: Gfunc.formaterDate(response?.data?.data?.register_date),
        lastvisit_date: Gfunc.formaterDate(
          response?.data?.data?.lastvisit_date
        ),
        activate_by: response?.data?.data?.activate_by,
        activate_date: Gfunc.formaterDate(response?.data?.data?.activate_date),
        blocked_date: Gfunc.formaterDate(response?.data?.data?.blocked_date),
        deactivated_by: response?.data?.data?.deactivated_by,
        desactivate_date: Gfunc.formaterDate(
          response?.data?.data?.desactivate_date
        ),
        unblocked_by: response?.data?.data?.unblocked_by,
        unblocked_date: Gfunc.formaterDate(
          response?.data?.data?.unblocked_date
        ),
      };

      setData(from ? baseData : adminData);
    }
  }, [response, from]);

  const handleClose = () => {
    if (!from) {
      const newDataa = dataa?.map((item) => {
        if (item?.id_user === row?.id_user) {
          return row;
        }
        return item;
      });
      setDataa(newDataa);
    }
    setOpen(false);
  };

  const handleOpen = () => {
    setErrorUpdate({
      email: [false, ""],
      phone_number: [false, ""],
    });
    setEditableField(null);
    setOpen(true);
    fetchData();
  };

  //changer l'etat de checkbox
  const handleChangePassword = (e) => {
    setChecked(!checked);
  };

  //annuler la modificatiopn du mot de passe du compte actuel
  const handleCancleChangePassword = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setErrors({ password: [false, ""], confirmPassword: [false, ""] });
  };

  const handleValidateChangePassword = (event) => {
    event.preventDefault();

    const errorObj = {
      password: [false, ""],
      confirmPassword: [false, ""],
    };

    const validations = {
      password: {
        isValid: Gfunc.isValidPassword(newPassword, row.username),
        errorMessage: "Le mot de passe saisi ne correspond pas aux règles.",
      },
      confirmPassword: {
        isValid: Gfunc.TwoEqualeString(newPassword, confirmNewPassword),
        errorMessage: "Les mots de passe ne sont pas identiques.",
      },
    };

    const injectionResults = Gfunc.checkXssSQL(newPassword);
    const hasInjection = injectionResults.type;

    if (!hasInjection && Object.values(validations).every((v) => v.isValid)) {
      PasswordData();
    } else {
      let errorMessages = [];
      let injectionTypes = [];
      if (hasInjection) {
        injectionTypes.push(injectionResults.type);

        const message = `L'utilisateur a saisi une ou plusieurs tentatives d'injection ${injectionTypes} : ${newPassword}`;
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

  useEffect(() => {
    if (PasswordResponse && PasswordResponse?.data?.success) {
      toast.success(PasswordResponse?.data?.message, {
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
  }, [PasswordResponse]);

  useEffect(() => {
    if (PasswordError) {
      toast.error(PasswordError, {
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
  }, [PasswordError]);

  return (
    <div>
      <CostumTooltip
        title={row.username ? "Voir plus de details de " + row.username : ""}
      >
        <div onClick={handleOpen}>{children}</div>
      </CostumTooltip>

      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        transitionDuration={500}
        PaperProps={{
          style: {
            right: "0",
            position: "fixed",
            width: "350px",
          },
        }}
      >
        <div onClick={handleClose} className="header-close">
          <p>Les détails d'utilisateurs</p>
          <Icon
            path={icons["mdiClose"]}
            size={1}
            style={{ cursor: "pointer", color: "white" }}
          />
        </div>
        <div className="details-user">
          <div className="infos">
            <Avatar src={User} sx={{ height: "70px", width: "70px" }} />
            <div>
              <b>{data.last_name}</b>
              <b> </b>
              <b>{data.first_name}</b>
              <p style={{ fontSize: "13px" }}>{row.post}</p>
            </div>
          </div>
          <Card style={{ backgroundColor: "#F2F9FA" }} elevation={3}>
            {Object.keys(data).map((fieldName, index) => (
              <div key={index} title={fieldLabels[fieldName]}>
                {!nonEditableFields.includes(fieldName) ? (
                  <div className="user-item">
                    <Icon path={icons[handleIcon(fieldName)]} size={1} />
                    <div>
                      <b>{fieldLabels[fieldName]}</b>
                      {editableField === fieldName ? (
                        <TextField
                          variant="outlined"
                          margin="none"
                          size="small"
                          fullWidth
                          autoComplete="off"
                          error={errorUpdate?.[fieldName]?.[0]}
                          helperText={errorUpdate?.[fieldName]?.[1]}
                          value={data[fieldName]}
                          onChange={(e) => handleInputChange(e, fieldName)}
                        />
                      ) : (
                        <p>{data[fieldName] ? data[fieldName] : "---"}</p>
                      )}
                    </div>
                    {editableField !== fieldName ? (
                      <div className="user-icon-edit">
                        <Icon
                          path={icons["mdiPencil"]}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleEdit(fieldName)}
                          size={1}
                        />
                      </div>
                    ) : (
                      <div className="user-btn">
                        <IconButton
                          color="primary"
                          variant="contained"
                          size="small"
                          onClick={handleSave}
                        >
                          <Icon
                            path={icons["mdiCheck"]}
                            size={0.8}
                            style={{ color: "blue" }}
                          />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          variant="outlined"
                          size="small"
                          onClick={handleCancle}
                        >
                          <Icon
                            path={icons["mdiCloseThick"]}
                            size={0.8}
                            style={{ color: "gray" }}
                          />
                        </IconButton>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="user-item">
                    <Icon path={icons[handleIcon(fieldName)]} />
                    <div>
                      <b>{[fieldLabels[fieldName]]}</b>
                      <p>{data[fieldName] ? data[fieldName] : "---"}</p>
                    </div>
                  </div>
                )}
                <Divider />
              </div>
            ))}
          </Card>
          {from && (
            <div className="user-change-pwd">
              <FormControlLabel
                label={<b>Modifier le mot de passe</b>}
                control={
                  <Checkbox
                    checked={checked}
                    onChange={handleChangePassword}
                    size="small"
                  />
                }
              />
              {checked && (
                <form
                  id="formValidate"
                  onSubmit={handleValidateChangePassword}
                  className="form-change-pwd"
                >
                  <div>
                    <TextField
                      placeholder="Ancien adresse mail"
                      label="Ancien mot de passe"
                      type="password"
                      variant="outlined"
                      margin="dense"
                      size="small"
                      fullWidth
                      required
                      autoComplete="off"
                      value={oldPassword}
                      onChange={(e) => {
                        setOldPassword(e.target.value);
                      }}
                    />
                    <TextField
                      placeholder="Nouveau mot de passe"
                      label="Nouveau mot de passe"
                      type="password"
                      variant="outlined"
                      margin="dense"
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
                          password: [false, ""],
                        }));
                      }}
                    />
                    <TextField
                      placeholder="Nouveau mot de passe"
                      label="Confirmer mot de passe"
                      type="password"
                      variant="outlined"
                      margin="dense"
                      size="small"
                      fullWidth
                      required
                      autoComplete="off"
                      error={errors?.confirmPassword?.[0]}
                      helperText={errors?.confirmPassword?.[1]}
                      value={confirmNewPassword}
                      onChange={(e) => {
                        setConfirmNewPassword(e.target.value);
                        setErrors((prevErrors) => ({
                          ...prevErrors,
                          confirmNewPassword: [false, ""],
                        }));
                      }}
                    />
                  </div>

                  <div className="user-profil-change-password">
                    <IconButton
                      type="submit"
                      color="primary"
                      variant="contained"
                      size="small"
                    >
                      <Icon
                        path={icons["mdiCheck"]}
                        size={0.8}
                        style={{ color: "blue" }}
                      />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      variant="outlined"
                      size="small"
                      onClick={handleCancleChangePassword}
                    >
                      <Icon
                        path={icons["mdiCloseThick"]}
                        size={0.8}
                        style={{ color: "gray" }}
                      />
                    </IconButton>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
