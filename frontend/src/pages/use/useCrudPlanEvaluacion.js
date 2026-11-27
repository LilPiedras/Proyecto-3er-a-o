import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import api from "../../api";
import { show_alert } from "../../components/functions/Showpro_functions";

const MySwal = withReactContent(Swal);

const obtenerRol = () => {
  const rolRaw =
    localStorage.getItem("idrol") ||
    localStorage.getItem("user_role") ||
    localStorage.getItem("role");
  return rolRaw !== null && rolRaw !== "" && !isNaN(rolRaw)
    ? parseInt(rolRaw, 10)
    : rolRaw;
};

const obtenerPlanes = async () => {
  try {
    const { data } = await api.get("/plan-evaluacion/");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error.response?.status !== 404) {
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === "string" ? detail : "Error al cargar planes",
        "error"
      );
    }
    return [];
  }
};

const obtenerCatalogos = async (ciDocente, esAdmin) => {
  try {
    let materias = [];
    let secciones = [];

    if (ciDocente && !esAdmin) {
      const { data } = await api
        .get("/api/horarios-materias")
        .catch(() => ({ data: [] }));
      const lista = Array.isArray(data) ? data : [];
      const misClases = lista.filter(
        (item) =>
          item &&
          String(item.ciempleado || "").trim() === ciDocente
      );

      const materiasMap = new Map();
      misClases.forEach((asignacion) => {
        if (
          asignacion.idmateria != null &&
          !materiasMap.has(asignacion.idmateria)
        ) {
          materiasMap.set(asignacion.idmateria, {
            idmateria: asignacion.idmateria,
            nombremateria:
              asignacion.materia ||
              asignacion.nombremateria ||
              `Materia #${asignacion.idmateria}`,
            activo: true,
          });
        }
      });
      materias = Array.from(materiasMap.values());

      const seccionesMap = new Map();
      misClases.forEach((asignacion) => {
        if (asignacion.idsecc != null && !seccionesMap.has(asignacion.idsecc)) {
          seccionesMap.set(asignacion.idsecc, {
            idsecc: asignacion.idsecc,
            nomsecc:
              asignacion.seccion ||
              asignacion.nomsecc ||
              `Sección ${asignacion.idsecc}`,
            activo: true,
          });
        }
      });
      secciones = Array.from(seccionesMap.values());

      if (materias.length === 0) {
        try {
          const { data: asignaciones } = await api.get(
            `/asignacion_docente/docente/${ciDocente}`
          );
          const listaAsignaciones = Array.isArray(asignaciones) ? asignaciones : [];
          listaAsignaciones.forEach((asignacion) => {
            if (
              asignacion.materia_id != null &&
              !materiasMap.has(asignacion.materia_id)
            ) {
              materiasMap.set(asignacion.materia_id, {
                idmateria: asignacion.materia_id,
                nombremateria:
                  asignacion.nombremateria || `Materia #${asignacion.materia_id}`,
                activo: true,
              });
            }
            if (
              asignacion.seccion_id != null &&
              !seccionesMap.has(asignacion.seccion_id)
            ) {
              seccionesMap.set(asignacion.seccion_id, {
                idsecc: asignacion.seccion_id,
                nomsecc:
                  asignacion.nomsecc || `Sección ${asignacion.seccion_id}`,
                activo: true,
              });
            }
          });
          materias = Array.from(materiasMap.values());
          secciones = Array.from(seccionesMap.values());
        } catch {
          // The primary schedule endpoint remains the source when this fallback is unavailable.
        }
      }
    } else {
      const [resMat, resSec] = await Promise.all([
        api.get("/materia/").catch(() => ({ data: [] })),
        api.get("/seccion/").catch(() => ({ data: [] })),
      ]);
      materias = (Array.isArray(resMat.data) ? resMat.data : []).filter(
        (materia) => materia.activo !== false
      );
      secciones = (Array.isArray(resSec.data) ? resSec.data : []).filter(
        (seccion) => seccion.activo !== false
      );
    }

    if (!esAdmin && materias.length === 0) {
      show_alert(
        "No se encontraron materias asignadas a tu cédula. Revisa Oferta / asignación de horario.",
        "warning"
      );
    }
    return { materias, secciones };
  } catch (error) {
    console.error(error);
    return { materias: [], secciones: [] };
  }
};

export function useCrudPlanEvaluacion() {
  const [planes, setPlanes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idmateria, setIdmateria] = useState("");
  const [idsecc, setIdsecc] = useState("");
  const [titulo, setTitulo] = useState("");
  const [porcentaje, setPorcentaje] = useState("");

  const ciDocente = String(
    localStorage.getItem("ciuser") || localStorage.getItem("ciempleado") || ""
  ).trim();
  const esAdmin = [1, "1"].includes(obtenerRol());

  const cargarPlanes = async () => {
    setPlanes(await obtenerPlanes());
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      const [planesData, catalogos] = await Promise.all([
        obtenerPlanes(),
        obtenerCatalogos(ciDocente, esAdmin),
      ]);
      if (!active) return;
      setPlanes(planesData);
      setMaterias(catalogos.materias);
      setSecciones(catalogos.secciones);
      setLoading(false);
    };

    init();
    return () => {
      active = false;
    };
  }, [ciDocente, esAdmin]);

  const limpiar = () => {
    setIdmateria("");
    setIdsecc("");
    setTitulo("");
    setPorcentaje("");
  };

  const guardar = async (event) => {
    event.preventDefault();

    if (!idmateria || !idsecc || !titulo.trim() || porcentaje === "") {
      return show_alert("Completa todos los campos", "warning");
    }

    const pct = parseFloat(porcentaje);
    if (isNaN(pct) || pct <= 0 || pct > 100) {
      return show_alert("El porcentaje debe estar entre 0 y 100", "warning");
    }

    try {
      await api.post("/plan-evaluacion/", {
        idmateria: parseInt(idmateria, 10),
        idsecc: parseInt(idsecc, 10),
        titulo: titulo.trim(),
        porcentaje: pct,
      });
      show_alert("Plan de evaluación creado", "success");
      limpiar();
      await cargarPlanes();
    } catch (error) {
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === "string" ? detail : "Error al crear el plan",
        "error"
      );
    }
  };

  const eliminar = (idevaluacion, tituloPlan) => {
    MySwal.fire({
      title: `¿Eliminar "${tituloPlan}"?`,
      text: "No se podrá deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await api.delete(`/plan-evaluacion/${idevaluacion}`);
        show_alert("Plan eliminado", "success");
        await cargarPlanes();
      } catch (error) {
        const detail = error.response?.data?.detail;
        show_alert(
          typeof detail === "string" ? detail : "Error al eliminar",
          "error"
        );
      }
    });
  };

  const nombreMateria = (id) => {
    const materia = materias.find((item) => item.idmateria === id);
    return materia ? materia.nombremateria : `#${id}`;
  };

  const nombreSeccion = (id) => {
    const seccion = secciones.find((item) => item.idsecc === id);
    return seccion
      ? seccion.nomsecc || seccion.nombreseccion || `#${id}`
      : `#${id}`;
  };

  const planesVisibles = useMemo(
    () =>
      esAdmin
        ? planes
        : planes.filter((plan) => {
            const tieneMateria = materias.some(
              (materia) => materia.idmateria === plan.idmateria
            );
            const tieneSeccion = secciones.some(
              (seccion) => seccion.idsecc === plan.idsecc
            );
            return tieneMateria && tieneSeccion;
          }),
    [esAdmin, materias, planes, secciones]
  );

  return {
    planesVisibles,
    materias,
    secciones,
    loading,
    idmateria,
    setIdmateria,
    idsecc,
    setIdsecc,
    titulo,
    setTitulo,
    porcentaje,
    setPorcentaje,
    guardar,
    eliminar,
    nombreMateria,
    nombreSeccion,
  };
}
