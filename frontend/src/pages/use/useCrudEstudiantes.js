import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import api from "../../api";
import { show_alert } from "../../components/functions/Showpro_functions";

export function useCrudEstudiantes() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [vistaInactivos, setVistaInactivos] = useState(false);
  const [nacionalidad, setNacionalidad] = useState("V");
  const [ciestuNum, setCiestuNum] = useState("");
  const [nombreestu, setNombreestu] = useState("");
  const [apelliestu, setApelliestu] = useState("");
  const [teleestu, setTeleestu] = useState("");
  const [correoestu, setCorreoestu] = useState("");
  const [operation, setOperation] = useState(1);
  const [title, setTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ciestuOriginal, setCiestuOriginal] = useState("");
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    let active = true;
    const endpoint = vistaInactivos ? "/estudiantes/inactivos" : "/estudiantes/";

    api
      .get(endpoint)
      .then(({ data }) => {
        if (active) setEstudiantes(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (!active) return;
        console.error(error);
        if (error.response?.status === 404) {
          setEstudiantes([]);
        } else {
          const detail = error.response?.data?.detail;
          show_alert(
            typeof detail === "string" ? detail : "Error al cargar estudiantes",
            "error"
          );
          setEstudiantes([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [vistaInactivos, reloadVersion]);

  const estudiantesFiltrados = useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    if (!query) return estudiantes;
    return estudiantes.filter((estudiante) => {
      const nombre = `${estudiante.nombreestu || ""} ${estudiante.apelliestu || ""}`.toLowerCase();
      const ci = String(estudiante.ciestu || "").toLowerCase();
      const mail = String(estudiante.correoestu || "").toLowerCase();
      const telefono = String(estudiante.teleestu || "").toLowerCase();
      return (
        nombre.includes(query) ||
        ci.includes(query) ||
        mail.includes(query) ||
        telefono.includes(query)
      );
    });
  }, [estudiantes, busqueda]);

  const limpiarFormulario = () => {
    setNacionalidad("V");
    setCiestuNum("");
    setNombreestu("");
    setApelliestu("");
    setTeleestu("");
    setCorreoestu("");
    setCiestuOriginal("");
  };

  const openModal = (
    op,
    cedulaCompleta = "",
    nombre = "",
    apellido = "",
    telefono = "",
    correo = ""
  ) => {
    limpiarFormulario();
    setOperation(op);

    if (op === 1) {
      setTitle("Registrar Estudiante");
    } else {
      setTitle("Editar Estudiante");
      setCiestuOriginal(cedulaCompleta);

      if (cedulaCompleta.includes("-")) {
        const [nac, num] = cedulaCompleta.split("-");
        setNacionalidad(nac || "V");
        setCiestuNum(num || "");
      } else {
        setCiestuNum(cedulaCompleta);
      }

      setNombreestu(nombre || "");
      setApelliestu(apellido || "");
      setTeleestu(telefono || "");
      setCorreoestu(correo || "");
    }

    setIsModalOpen(true);
  };

  const enviarSolicitud = async (metodo, parametros, ciestuPath = null) => {
    try {
      if (metodo === "POST") {
        await api.post("/estudiantes/", parametros);
      } else if (metodo === "PUT") {
        await api.put(`/estudiantes/${ciestuPath}`, parametros);
      } else if (metodo === "DELETE") {
        await api.delete(`/estudiantes/${parametros.ciestu}`);
      } else if (metodo === "RESTORE") {
        await api.patch(`/estudiantes/${parametros.ciestu}/restaurar`);
      }

      const mensajes = {
        DELETE: "Estudiante enviado a la papelera correctamente",
        RESTORE: "Estudiante restaurado exitosamente",
        POST: "Estudiante registrado correctamente",
        PUT: "Estudiante actualizado correctamente",
      };

      show_alert(mensajes[metodo] || "Operación exitosa", "success");
      setIsModalOpen(false);
      limpiarFormulario();
      setLoading(true);
      setReloadVersion((version) => version + 1);
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === "string" ? detail : "Error en la operación",
        "error"
      );
    }
  };

  const validar = () => {
    const ciestu = `${nacionalidad}-${ciestuNum.trim()}`;

    if (ciestuNum.trim() === "") {
      show_alert("Ingrese el número de cédula", "warning");
      return;
    }
    if (nombreestu.trim() === "") {
      show_alert("Escribe el nombre del estudiante", "warning");
      return;
    }
    if (apelliestu.trim() === "") {
      show_alert("Escribe el apellido del estudiante", "warning");
      return;
    }
    if (teleestu.trim() !== "" && isNaN(Number(teleestu))) {
      show_alert("Escribe un número telefónico válido", "warning");
      return;
    }
    if (correoestu.trim() === "") {
      show_alert("Escribe una dirección de correo válida", "warning");
      return;
    }

    const parametros = {
      ciestu,
      nombreestu: nombreestu.trim(),
      apelliestu: apelliestu.trim(),
      teleestu: teleestu.trim() || null,
      correoestu: correoestu.trim() || null,
    };

    if (operation === 1) {
      enviarSolicitud("POST", parametros);
    } else {
      const { ciestu: _omit, ...bodyUpdate } = parametros;
      enviarSolicitud("PUT", bodyUpdate, ciestuOriginal || ciestu);
    }
  };

  const deleteEstudiante = (ciestu, nombre) => {
    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: `¿Seguro de enviar al estudiante "${nombre}" a la papelera?`,
      text: "El estudiante quedará inactivo en el sistema",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
    }).then((result) => {
      if (result.isConfirmed) {
        enviarSolicitud("DELETE", { ciestu });
      } else {
        show_alert("El estudiante no fue eliminado", "info");
      }
    });
  };

  const restaurarEstudiante = (ciestu, nombre) => {
    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: `¿Desea restaurar al estudiante "${nombre}"?`,
      text: "Volverá a estar activo en el sistema",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, restaurar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#10b981",
    }).then((result) => {
      if (result.isConfirmed) {
        enviarSolicitud("RESTORE", { ciestu });
      }
    });
  };

  const descargarNominaExcel = async () => {
    setDownloadingExcel(true);
    try {
      const { data } = await api.get("/estudiantes/excel", {
        params: { incluir_inactivos: vistaInactivos },
        responseType: "blob",
      });
      const blob =
        data instanceof Blob
          ? data
          : new Blob([data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = vistaInactivos
        ? "nomina_estudiantes_inactivos.xlsx"
        : "nomina_estudiantes.xlsx";
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === "string" ? detail : "No se pudo generar la nómina en Excel",
        "error"
      );
    } finally {
      setDownloadingExcel(false);
    }
  };

  const inicial = (estudiante) => {
    const nombre = (estudiante.nombreestu || "?").trim();
    return nombre.charAt(0).toUpperCase();
  };

  const cambiarVistaInactivos = () => {
    setLoading(true);
    setVistaInactivos((actual) => !actual);
  };

  return {
    estudiantes,
    loading,
    busqueda,
    setBusqueda,
    vistaInactivos,
    cambiarVistaInactivos,
    nacionalidad,
    setNacionalidad,
    ciestuNum,
    setCiestuNum,
    nombreestu,
    setNombreestu,
    apelliestu,
    setApelliestu,
    teleestu,
    setTeleestu,
    correoestu,
    setCorreoestu,
    operation,
    title,
    isModalOpen,
    setIsModalOpen,
    downloadingExcel,
    estudiantesFiltrados,
    openModal,
    validar,
    deleteEstudiante,
    restaurarEstudiante,
    descargarNominaExcel,
    inicial,
  };
}
