import { useEffect, useState } from "react";
import api from "../../api";
import { show_alert } from "../../components/functions/Showpro_functions";

export function useMiModulo() {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    api
      .get("/estudiante/mi-modulo")
      .then(({ data: respuesta }) => {
        if (active) setData(respuesta);
      })
      .catch((requestError) => {
        if (!active) return;
        const detail = requestError.response?.data?.detail;
        const mensaje =
          typeof detail === "string"
            ? detail
            : "No se pudo cargar tu información académica.";
        setError(mensaje);
        show_alert(mensaje, "error");
      })
      .finally(() => {
        if (active) setCargando(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { data, cargando, error };
}
