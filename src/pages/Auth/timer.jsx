import { useContext, useEffect } from "react";
import { useTimer } from "react-timer-hook";
import { useAxios } from "../../services/useAxios";
import { AuthContexte } from "../../Context/AuthContext";
import { CircularProgress } from "@mui/material";

export default function Timer({
  expiryTimestamp,
  setResend,
  setOtp,
  setOtpError,
}) {
  const { baseUrl, currentLang } = useContext(AuthContexte);
  const { seconds, minutes, isRunning, restart } = useTimer({
    expiryTimestamp,
  });

  // Utilisation de useAxios pour tester l'existance de  l'utilisateur
  const {
    response,
    loading,
    error,
    fetchData: fetchResendOtp,
    clearData,
  } = useAxios({
    method: "post",
    url: baseUrl + "auth/resend",
    body: {
      userId: JSON.parse(localStorage.getItem("userId" + currentLang)),
    },
  });

  useEffect(() => {
    if (response && response.data.success) {
      setResend(true);
    }
  }, [response]);

  const handleResendOtp = () => {
    setOtpError("");
    setOtp("");
    const time = new Date();
    time.setSeconds(time.getSeconds() + 60);
    restart(time);
    fetchResendOtp();
  };

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ margin: "10px 0" }}>
        <span id="constum-time">{minutes}</span>:
        <span id="constum-time">{seconds}</span>
      </div>
      <div id="resend-otp">
        <p>Vous n&apos;avez pas reçu le code? </p>
        <p
          id={!isRunning ? "resend-text" : "resend-text-disbled"}
          onClick={!isRunning ? handleResendOtp : null}
        >
          Renvoyer
        </p>
      </div>
      <div className="login-error">{error && <p>{error}</p>}</div>
      <div className="resned-otp-message">
        {response?.data?.success && <p>{response?.data?.message}</p>}
      </div>
      <div className="login-error">{loading && <CircularProgress />}</div>
    </div>
  );
}
