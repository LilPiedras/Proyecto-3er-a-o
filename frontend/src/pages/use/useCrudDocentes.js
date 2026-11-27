import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import api from "../../api";
import { show_alert } from "../../components/functions/Showpro_functions";

export function useCrudDocentes() {
  const [docentes, setDocentes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [vistaInactivos, setVistaInactivos] = useState(false);
  const [nacionalidad, setNacionalidad] = useState("V");
  const [ciempleadoNum, setCiempleadoNum] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [cargo, setCargo] = useState("");
  const [fechacontra, setFechacontra] = useState("");
  const [operation, setOperation] = useState(1);
  const [title, setTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ciempleadoOriginal, setCiempleadoOriginal] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);

  const idrol = Number(localStorage.getItem("idrol"));
  const puedeGestionar = [1, 2].includes(idrol);
  const puedeVer = [1, 2, 3].includes(idrol);
  const [loading, setLoading] = useState(puedeVer);

  useEffect(() => {
    if (!puedeVer) return undefined;
    let active = true;
    const endpoint =
      vistaInactivos && puedeGestionar ? "/empleado/inactivos" : "/empleado/";

    api
      .get(endpoint)
      .then(({ data }) => {
        if (active) setDocentes(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (!active) return;
        console.error(error);
        if (error.response?.status === 404) {
          setDocentes([]);
        } else {
          const detail = error.response?.data?.detail;
          show_alert(
            typeof detail === "string" ? detail : "Error al cargar docentes",
            "error"
          );
          setDocentes([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [vistaInactivos, puedeGestionar, puedeVer, reloadVersion]);

  const docentesFiltrados = useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    if (!query) return docentes;
    return docentes.filter((docente) => {
      const nombreCompleto = `${docente.nombreempleado || docente.nombre || ""} ${
        docente.apellidoempleado || docente.apellido || ""
      }`.toLowerCase();
      const ci = String(docente.ciempleado || "").toLowerCase();
      const mail = String(docente.correoempleado || docente.correo || "").toLowerCase();
      const cargoDocente = String(docente.cargo || "").toLowerCase();
      return (
        nombreCompleto.includes(query) ||
        ci.includes(query) ||
        mail.includes(query) ||
        cargoDocente.includes(query)
      );
    });
  }, [docentes, busqueda]);

  const limpiarFormulario = () => {
    setNacionalidad("V");
    setCiempleadoNum("");
    setNombre("");
    setApellido("");
    setTelefono("");
    setCorreo("");
    setCargo("");
    setFechacontra("");
    setCiempleadoOriginal("");
  };

  const openModal = (
    op,
    cedulaCompleta = "",
    nom = "",
    ape = "",
    tel = "",
    mail = "",
    car = "",
    fecha = ""
  ) => {
    if (!puedeGestionar) {
      show_alert("No tienes permisos para añadir o modificar docentes.", "warning");
      return;
    }

    limpiarFormulario();
    setOperation(op);

    if (op === 1) {
      setTitle("Registrar Docente");
    } else {
      setTitle("Editar Docente");
      setCiempleadoOriginal(cedulaCompleta);

      if (cedulaCompleta.includes("-")) {
        const [nac, num] = cedulaCompleta.split("-");
        setNacionalidad(nac || "V");
        setCiempleadoNum(num || "");
      } else {
        setCiempleadoNum(cedulaCompleta);
      }

      setNombre(nom || "");
      setApellido(ape || "");
      setTelefono(tel || "");
      setCorreo(mail || "");
      setCargo(car || "");
      setFechacontra(fecha ? String(fecha).split("T")[0] : "");
    }

    setIsModalOpen(true);
  };

  const enviarSolicitud = async (metodo, parametros, ciempleadoPath = null) => {
    if (!puedeGestionar) {
      show_alert("No tienes permisos para realizar esta acción.", "warning");
      return;
    }

    try {
      if (metodo === "POST") {
        await api.post("/empleado/", parametros);
      } else if (metodo === "PUT") {
        await api.put(`/empleado/${ciempleadoPath}`, parametros);
      } else if (metodo === "DELETE") {
        await api.delete(`/empleado/${parametros.ciempleado}`);
      } else if (metodo === "RESTORE") {
        await api.patch(`/empleado/${parametros.ciempleado}/restaurar`);
      }

      const mensajes = {
        DELETE: "Docente enviado a la papelera correctamente",
        RESTORE: "Docente restaurado exitosamente",
        POST: "Docente registrado correctamente",
        PUT: "Docente actualizado correctamente",
      };

      show_alert(mensajes[metodo] || "Operación exitosa", "success");
      setIsModalOpen(false);
      limpiarFormulario();
      setLoading(true);
      setReloadVersion((version) => version + 1);
    } catch (error) {
      console.error("Error detallado del backend:", error.response?.data);

      const detail = error.response?.data?.detail;
      let mensajeError = "Error en la operación";

      if (typeof detail === "string") {
        mensajeError = detail;
      } else if (Array.isArray(detail)) {
        mensajeError = detail
          .map((item) => `${item.loc[item.loc.length - 1]}: ${item.msg}`)
          .join(" | ");
      }

      show_alert(mensajeError, "error");
    }
  };

  const validar = () => {
    const ciempleado = `${nacionalidad}-${ciempleadoNum.trim()}`;

    if (ciempleadoNum.trim() === "") {
      show_alert("Ingrese el número de cédula", "warning");
      return;
    }
    if (nombre.trim() === "") {
      show_alert("Escribe el nombre del docente", "warning");
      return;
    }
    if (apellido.trim() === "") {
      show_alert("Escribe el apellido del docente", "warning");
      return;
    }
    if (telefono.trim() !== "" && isNaN(Number(telefono))) {
      show_alert("Escribe un número telefónico válido", "warning");
      return;
    }
    if (correo.trim() === "") {
      show_alert("Escribe una dirección de correo válida", "warning");
      return;
    }
    if (cargo.trim() === "") {
      show_alert("Escribe el cargo del docente", "warning");
      return;
    }
    if (!fechacontra) {
      show_alert("Selecciona la fecha de contratación", "warning");
      return;
    }

    const parametros = {
      ciempleado,
      nombreempleado: nombre.trim(),
      apellidoempleado: apellido.trim(),
      telefempleado: telefono.trim() || null,
      correoempleado: correo.trim() || null,
      cargo: cargo.trim(),
      fechacontra,
    };

    if (operation === 1) {
      enviarSolicitud("POST", parametros);
    } else {
      const { ciempleado: _omit, ...bodyUpdate } = parametros;
      enviarSolicitud("PUT", bodyUpdate, ciempleadoOriginal || ciempleado);
    }
  };

  const deleteDocente = (ciempleado, nom) => {
    if (!puedeGestionar) {
      show_alert("No tienes permisos para eliminar docentes.", "warning");
      return;
    }

    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: `¿Enviar al docente "${nom}" a la papelera?`,
      text: "Quedará inactivo en el sistema",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
    }).then((result) => {
      if (result.isConfirmed) {
        enviarSolicitud("DELETE", { ciempleado });
      } else {
        show_alert("El docente no fue eliminado", "info");
      }
    });
  };

  const restaurarDocente = (ciempleado, nom) => {
    if (!puedeGestionar) {
      show_alert("No tienes permisos para restaurar docentes.", "warning");
      return;
    }

    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: `¿Desea restaurar al docente "${nom}"?`,
      text: "Volverá a estar activo en el sistema",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, restaurar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#10b981",
    }).then((result) => {
      if (result.isConfirmed) {
        enviarSolicitud("RESTORE", { ciempleado });
      }
    });
  };

  const inicial = (docente) => {
    const nombreDocente = (docente.nombreempleado || docente.nombre || "?").trim();
    return nombreDocente.charAt(0).toUpperCase();
  };

  const cambiarVistaInactivos = () => {
    setLoading(true);
    setVistaInactivos((actual) => !actual);
  };

  return {
    docentes,
    loading,
    busqueda,
    setBusqueda,
    vistaInactivos,
    cambiarVistaInactivos,
    nacionalidad,
    setNacionalidad,
    ciempleadoNum,
    setCiempleadoNum,
    nombre,
    setNombre,
    apellido,
    setApellido,
    telefono,
    setTelefono,
    correo,
    setCorreo,
    cargo,
    setCargo,
    fechacontra,
    setFechacontra,
    operation,
    title,
    isModalOpen,
    setIsModalOpen,
    puedeGestionar,
    puedeVer,
    docentesFiltrados,
    openModal,
    validar,
    deleteDocente,
    restaurarDocente,
    inicial,
  };
}
