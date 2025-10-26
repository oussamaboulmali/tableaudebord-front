import { useContext, useEffect, useState } from "react";
import { MuiOtpInput } from "mui-one-time-password-input";
import { Button, CircularProgress } from "@mui/material";
import MyTimer from "./timer";
import { useAxios } from "../../services/useAxios";
import { AuthContexte } from "../../Context/AuthContext";
import log from "../../log/costumLog";
import * as Gfunc from "../../helpers/Gfunc";

const Otp = () => {
  const [otp, setOtp] = useState("");
  const [resend, setResend] = useState(false);
  const [otpError, setOtpError] = useState("");
  const time = new Date();
  time.setSeconds(time.getSeconds() + 60);

  const { handleValidateLogin, baseUrl, currentLang } =
    useContext(AuthContexte);

  const { response, loading, error, fetchData, clearData } = useAxios({
    method: "post",
    url: baseUrl + "auth/verifiy",
    body: {
      userId: JSON.parse(localStorage.getItem("userId" + currentLang)),
      otpKey: parseInt(otp),
    },
  });

  useEffect(() => {
    if (response && response?.data?.success) {
      localStorage.setItem("isLogged" + currentLang, true);
      localStorage.setItem(
        "userId" + currentLang,
        response?.data?.data?.userId
      );
      localStorage.setItem(
        "username" + currentLang,
        response?.data?.data?.username
      );
      localStorage.setItem(
        "userLastName" + currentLang,
        response?.data?.data?.userLastName
      );
      localStorage.setItem(
        "userFirstName" + currentLang,
        response?.data?.data?.userFirstName
      );
      handleValidateLogin();
    }
  }, [response, handleValidateLogin]);

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    clearData();
    // Validation des 6 chiffres
    const otpRegex = /^\d{6}$/;

    if (!otpRegex.test(otp)) {
      setOtpError("Le code doit contenir exactement 6 chiffres.");
      return;
    }

    setOtpError("");

    if (!Gfunc.checkXssSQL(otp).isInjection) {
      fetchData();
    } else {
      log.error(
        "L'utilisateur a saisi des balises HTML dans un formulaire d'ajout d'un nouveau tag.",
        "blocage",
        "Html Tags",
        220,
        "blockip"
      );
    }
  };

  return (
    <>
      <div id="otp-label">Entrez le code envoyé à votre email</div>
      <form onSubmit={handleVerifyOTP} id="login-form">
        <MuiOtpInput
          TextFieldsProps={{
            type: "number",
            inputProps: {
              inputMode: "numeric",
              pattern: "[0-9]*",
            },
            size: "large",
            sx: {
              "& .MuiOutlinedInput-root": {
                height: {
                  xs: "50px",
                  sm: "55px",
                  md: "60px",
                },

                padding: {
                  xs: "0",
                  sm: "0 ",
                  md: "0",
                },
              },
              "& .MuiOutlinedInput-input": {
                fontSize: {
                  xs: "16px",
                  sm: "20px",
                  md: "22px",
                },
                fontWeight: "bold",

                padding: "0 !important",
                textAlign: "center",
                lineHeight: {
                  xs: "20px",
                  sm: "55px",
                  md: "60px",
                },
              },
            },
          }}
          autoFocus
          length={6}
          value={otp}
          onChange={(value) => {
            setOtp(value);
            clearData();
            setOtpError("");
          }}
          sx={{
            gap: {
              xs: 0.5,
              sm: 0.5,
              md: 1.2,
            },
          }}
        />

        <p className="login-error">{otpError}</p>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          id="submit-button"
        >
          Vérifier OTP
        </Button>
      </form>
      <MyTimer
        expiryTimestamp={time}
        userId={response?.data?.data?.userId}
        resend={resend}
        setResend={setResend}
        setOtp={setOtp}
        setOtpError={setOtpError}
      />
      <div className="login-error">{error && <p>{error}</p>}</div>
      <div className="login-error">{loading && <CircularProgress />}</div>
    </>
  );
};

export default Otp;
