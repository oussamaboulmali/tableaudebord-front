import { useState } from "react";
import axios from "axios";
import { TreatError, removeLangKeysFromLocalStorage } from "../helpers/Gfunc";

const useAxios = (initialConfig = {}) => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async (config = initialConfig) => {
    setLoading(true);
    try {
      const { url, method, body } = config;
      const res = await axios[method](url, body, {
        withCredentials: true,
      });
      setResponse(res);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);
        if (error?.response?.data?.logout) {
          //localStorage.clear();
          sessionStorage.clear();
          removeLangKeysFromLocalStorage(import.meta.env.VITE_LAN);
          window.location.replace("/login");
        }
        //si la session cookies indisponible.
        if (error?.response?.data?.hasSession === false) {
          TreatError(error.response.data.message);
        }
      } else if (error.request) {
        //localStorage.clear();
        removeLangKeysFromLocalStorage(import.meta.env.VITE_LAN);
        sessionStorage.clear();
        window.location.replace("/login");
        setError("Aucune réponse du serveur");
      }
    }
    setLoading(false);
  };

  const clearData = () => {
    setResponse(null);
    setLoading(false);
    setError("");
  };
  return { response, loading, error, fetchData, clearData };
};

export { useAxios };
