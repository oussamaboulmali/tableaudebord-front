import { useContext, useEffect, useState } from "react";
import {
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  IconButton,
} from "@mui/material";
import Icon from "@mdi/react";
import { mdiLockOutline, mdiAccountCircle } from "@mdi/js";
import { useAxios } from "../../services/useAxios";
import { AuthContexte } from "../../Context/AuthContext";
import DialogConfirm from "../../components/ui/ConfirmDialog/index";
import { mdiEyeOff } from "@mdi/js";
import { mdiEye } from "@mdi/js";
import * as Gfunc from "../../helpers/Gfunc";
import log from "../../log/costumLog";

const AuthForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const { handleByPassOtp, baseUrl, currentLang } = useContext(AuthContexte);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Utilisation de useAxios pour tester l'existance de  l'utilisateur
  const {
    response,
    loading,
    error,
    fetchData: fetchSignIn,
  } = useAxios({
    method: "post",
    url: baseUrl + "auth/login",
    body: {
      username: username,
      password: password,
    },
  });

  // Utilisation de useAxios pour fermer la premiere session ouverte
  const {
    response: otherResponse,
    loading: otherLoading,
    error: otherError,
    fetchData: fetchCloseSession,
  } = useAxios({
    method: "post",
    url: baseUrl + "auth/close",
    body: {
      sessionId: response?.data?.data?.sessionId,
      userId: response?.data?.data?.userId,
      username: username,
      password: password,
    },
  });

  const confirmCloseSession = () => {
    fetchCloseSession();
    setOpenDialog(false);
  };

  useEffect(() => {
    if (
      response &&
      response.data.success === true &&
      response.data.hasSession === false
    ) {
      sessionStorage.setItem("isExisted", true);
      localStorage.setItem(
        "userId" + currentLang,
        response?.data?.data?.userId
      );
      localStorage.setItem("email" + currentLang, response?.data?.data?.email);
      handleByPassOtp();
    }
    if (
      response &&
      response.data.success === true &&
      response.data.hasSession === true
    ) {
      setOpenDialog(true);
    }
  }, [response, handleByPassOtp]);

  const consoleCloseSession = () => {
    sessionStorage.removeItem("isExisted");
    localStorage.removeItem("userId" + currentLang);
    localStorage.removeItem("email" + currentLang);
    setOpenDialog(false);
  };

  //track changes of response to dchange to otp form
  useEffect(() => {
    if (otherResponse && otherResponse.data.success) {
      sessionStorage.setItem("isExisted", true);
      localStorage.setItem(
        "userId" + currentLang,
        response?.data?.data?.userId
      );
      localStorage.setItem("email" + currentLang, response?.data?.data?.email);
      handleByPassOtp();
    }
  }, [otherResponse, handleByPassOtp]);

  //track changes of response to dchange to otp form
  useEffect(() => {
    if (error) {
      setPassword("");
    }
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !Gfunc.checkXssSQL(username).isInjection &&
      !Gfunc.checkXssSQL(password).isInjection
    ) {
      fetchSignIn();
    } else {
      log.error(
        "L'utilisateur a saisi des balises HTML dans un formulaire d'authentification.",
        "blocage",
        "Html Tags",
        220,
        "blockip"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} id="login-form">
      <TextField
        placeholder="Username"
        label="Username"
        variant="outlined"
        margin="normal"
        size="normal"
        required
        fullWidth
        id="username"
        name="username"
        autoComplete="off"
        value={username}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Icon path={mdiAccountCircle} size={1} />
            </InputAdornment>
          ),
        }}
        onChange={(e) => {
          setUsername(e.target.value);
        }}
      />
      <TextField
        label="Password"
        placeholder="Password"
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id="password"
        name="password"
        type={showPassword ? "text" : "password"}
        value={password}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Icon path={mdiLockOutline} size={1} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={togglePasswordVisibility} edge="end">
                <Icon path={showPassword ? mdiEye : mdiEyeOff} size={1} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        id="submit-button"
      >
        Valider
      </Button>
      <div className="login-error">
        {(error || otherError) && <p>{error}</p>}
      </div>
      <div className="login-error">
        {(loading || otherLoading) && <CircularProgress />}
      </div>

      <DialogConfirm
        open={openDialog}
        id={response?.data?.data?.userId}
        icon="mdiTwoFactorAuthentication"
        message={"Vous avez déjà une session, êtes-vous sûr de continuer ?"}
        confirmCloseSession={confirmCloseSession}
        consoleCloseSession={consoleCloseSession}
        placement="auto"
      />
    </form>
  );
};

export default AuthForm;
