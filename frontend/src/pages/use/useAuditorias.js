import { useEffect, useState } from "react";
import api from "../../api";
import { MESES } from "../../components/helpers/auditoriaHelpers.jsx";

const construirParametrosFiltro = ({ mes, dia, hora }) => {
  const params = {};
  if (mes) params.mes = Number(mes);
  if (dia) params.dia = Number(dia);
  if (hora !== "") params.hora = Number(hora);
  return params;
};

const extraerDetalleErrorBlob = async (requestError, mensajePorDefecto) => {
  const respuesta = requestError.response?.data;
  if (respuesta instanceof Blob) {
    try {
      const texto = await respuesta.text();
      const json = JSON.parse(texto);
      if (typeof json?.detail === "string") return json.detail;
    } catch {
      // Use the generic export error when the response body is not JSON.
    }
  }
  if (typeof respuesta?.detail === "string") return respuesta.detail;
  return mensajePorDefecto;
};

export function useAuditorias() {
  const [mes, setMes] = useState("");
  const [dia, setDia] = useState("");
  const [hora, setHora] = useState("");
  const [auditoriaSeleccionada, setAuditoriaSeleccionada] = useState(null);
  const [graficaAbierta, setGraficaAbierta] = useState(false);
  const [descargandoPdf, setDescargandoPdf] = useState(false);
  const [descargandoExcel, setDescargandoExcel] = useState(false);
  const [errorExportacion, setErrorExportacion] = useState("");
  const [resultado, setResultado] = useState({ filtro: null, auditorias: [], error: "" });
  const filtro = `${mes}-${dia}-${hora}`;

  useEffect(() => {
    if (!auditoriaSeleccionada && !graficaAbierta) return undefined;
    const cerrarConEscape = (event) => {
      if (event.key === "Escape") {
        setAuditoriaSeleccionada(null);
        setGraficaAbierta(false);
      }
    };
    document.addEventListener("keydown", cerrarConEscape);
    return () => document.removeEventListener("keydown", cerrarConEscape);
  }, [auditoriaSeleccionada, graficaAbierta]);

  useEffect(() => {
    let active = true;
    const params = construirParametrosFiltro({ mes, dia, hora });

    api
      .get("/auditoria/", { params })
      .then(({ data }) => {
        if (active) setResultado({ filtro, auditorias: data, error: "" });
      })
      .catch((requestError) => {
        if (!active) return;
        const detail = requestError.response?.data?.detail;
        setResultado({
          filtro,
          auditorias: [],
          error:
            typeof detail === "string"
              ? detail
              : "No se pudieron cargar las auditorías. Intenta de nuevo.",
        });
      });

    return () => {
      active = false;
    };
  }, [mes, dia, hora, filtro]);

  const cargando = resultado.filtro !== filtro;
  const auditorias = cargando ? [] : resultado.auditorias;
  const error = cargando ? "" : resultado.error;
  const resumenFiltros = `Filtros: mes ${mes ? MESES[Number(mes) - 1] : "todos"}, día ${
    dia || "todos"
  }, hora ${hora === "" ? "todas" : `${String(hora).padStart(2, "0")}:00`}.`;

  const limpiarFiltros = () => {
    setMes("");
    setDia("");
    setHora("");
    setErrorExportacion("");
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleGuardarPdf = async () => {
    if (descargandoPdf || descargandoExcel || cargando || auditorias.length === 0) return;
    setDescargandoPdf(true);
    setErrorExportacion("");

    try {
      const params = construirParametrosFiltro({ mes, dia, hora });
      const { data } = await api.get("/auditoria/pdf", {
        params,
        responseType: "blob",
      });

      const blob = data instanceof Blob ? data : new Blob([data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = "reporte_auditorias.pdf";
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      const mensaje = await extraerDetalleErrorBlob(
        requestError,
        "No se pudo generar el PDF de auditorías. Intenta de nuevo."
      );
      setErrorExportacion(mensaje);
    } finally {
      setDescargandoPdf(false);
    }
  };

  const handleGuardarExcel = async () => {
    if (descargandoExcel || descargandoPdf || cargando || auditorias.length === 0) return;
    setDescargandoExcel(true);
    setErrorExportacion("");

    try {
      const params = construirParametrosFiltro({ mes, dia, hora });
      const { data } = await api.get("/auditoria/excel", {
        params,
        responseType: "blob",
      });

      const blob =
        data instanceof Blob
          ? data
          : new Blob([data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = "reporte_auditorias.xlsx";
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      const mensaje = await extraerDetalleErrorBlob(
        requestError,
        "No se pudo generar el Excel de auditorías. Intenta de nuevo."
      );
      setErrorExportacion(mensaje);
    } finally {
      setDescargandoExcel(false);
    }
  };

  return {
    mes,
    setMes,
    dia,
    setDia,
    hora,
    setHora,
    auditoriaSeleccionada,
    setAuditoriaSeleccionada,
    graficaAbierta,
    setGraficaAbierta,
    descargandoPdf,
    descargandoExcel,
    errorExportacion,
    cargando,
    auditorias,
    error,
    resumenFiltros,
    limpiarFiltros,
    handleImprimir,
    handleGuardarPdf,
    handleGuardarExcel,
  };
}
