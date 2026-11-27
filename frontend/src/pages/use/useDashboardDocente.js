import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { show_alert } from "../../components/functions/Showpro_functions";

export function useDashboardDocente() {
  const navigate = useNavigate();
  const ciDocente =
    localStorage.getItem("ciuser") || localStorage.getItem("ciempleado") || "";
  const [cargando, setCargando] = useState(Boolean(ciDocente));
  const [misAsignaciones, setMisAsignaciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [filtroMateria, setFiltroMateria] = useState("");
  const [filtroSeccion, setFiltroSeccion] = useState("");
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  useEffect(() => {
    if (!ciDocente) return undefined;
    let active = true;

    const cargarCargaAcademica = async () => {
      try {
        const res = await api
          .get("/api/horarios-materias")
          .catch(() => ({ data: [] }));

        const lista = Array.isArray(res.data) ? res.data : [];
        const misClases = lista.filter((item) => {
          if (!item || typeof item !== "object") return false;
          const itemCi = String(item.ciempleado || "").trim();
          return itemCi && itemCi === String(ciDocente).trim();
        });

        const unicos = new Map();
        misClases.forEach((item) => {
          const key = [
            item.idmateria,
            item.idsecc,
            item.dia,
            item.horainicio,
            item.horafin,
            item.salon,
          ].join("|");
          if (!unicos.has(key)) unicos.set(key, item);
        });

        if (active) setMisAsignaciones(Array.from(unicos.values()));

        try {
          const resEst = await api.get(`/Notas/docente/${ciDocente}/estudiantes`);
          if (active) setEstudiantes(Array.isArray(resEst.data) ? resEst.data : []);
        } catch {
          if (active) setEstudiantes([]);
        }
      } catch (error) {
        if (!active) return;
        console.error("Error al cargar carga académica:", error);
        show_alert("No se pudo cargar tu información docente", "error");
        setMisAsignaciones([]);
      } finally {
        if (active) setCargando(false);
      }
    };

    cargarCargaAcademica();
    return () => {
      active = false;
    };
  }, [ciDocente]);

  const horariosParaGrid = useMemo(
    () =>
      misAsignaciones.map((asignacion) => ({
        dia: asignacion.dia,
        horainicio: asignacion.horainicio,
        horafin: asignacion.horafin,
        salon: asignacion.salon,
        materia: asignacion.materia || asignacion.nombremateria || "Materia",
        docente: asignacion.docente || "Yo",
      })),
    [misAsignaciones]
  );

  const materiasUnicas = useMemo(() => {
    const map = new Map();
    estudiantes.forEach((estudiante) => {
      if (estudiante.idmateria && !map.has(estudiante.idmateria)) {
        map.set(
          estudiante.idmateria,
          estudiante.nombremateria || `Materia ${estudiante.idmateria}`
        );
      }
    });
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [estudiantes]);

  const seccionesUnicas = useMemo(() => {
    const map = new Map();
    estudiantes
      .filter(
        (estudiante) =>
          !filtroMateria || String(estudiante.idmateria) === String(filtroMateria)
      )
      .forEach((estudiante) => {
        if (estudiante.idsecc != null && !map.has(estudiante.idsecc)) {
          map.set(
            estudiante.idsecc,
            estudiante.nomsecc || `Sección ${estudiante.idsecc}`
          );
        }
      });
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [estudiantes, filtroMateria]);

  const listaFiltrada = useMemo(
    () =>
      estudiantes.filter((estudiante) => {
        if (filtroMateria && String(estudiante.idmateria) !== String(filtroMateria)) {
          return false;
        }
        if (filtroSeccion && String(estudiante.idsecc) !== String(filtroSeccion)) {
          return false;
        }
        return true;
      }),
    [estudiantes, filtroMateria, filtroSeccion]
  );

  const cambiarMateria = (value) => {
    setFiltroMateria(value);
    setFiltroSeccion("");
  };

  const generarNominaPDF = async () => {
    try {
      const params = {};
      if (filtroMateria) params.idmateria = filtroMateria;
      if (filtroSeccion) params.idsecc = filtroSeccion;

      const res = await api.get("/analitics/nomina-docente/pdf", {
        params,
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `nomina_${ciDocente || "docente"}.pdf`;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      show_alert("No se pudo generar la nómina en PDF", "error");
    }
  };

  const generarNominaExcel = async () => {
    if (!filtroMateria || !filtroSeccion) {
      show_alert("Selecciona materia y sección para exportar Excel", "warning");
      return;
    }
    setDownloadingExcel(true);
    try {
      const res = await api.get("/estudiantes/excel", {
        params: {
          idmateria: filtroMateria,
          idsecc: filtroSeccion,
        },
        responseType: "blob",
      });
      const blob =
        res.data instanceof Blob
          ? res.data
          : new Blob([res.data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `nomina_materia_${filtroMateria}_seccion_${filtroSeccion}.xlsx`;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === "string" ? detail : "No se pudo generar la nómina en Excel",
        "error"
      );
    } finally {
      setDownloadingExcel(false);
    }
  };

  const imprimirHorarioPDF = async () => {
    try {
      const res = await api.get("/analitics/horario-docente/pdf", {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `horario_${ciDocente || "docente"}.pdf`;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      show_alert("No se pudo generar el PDF del horario", "error");
    }
  };

  const irAAsistencia = (asignacion) => {
    navigate(
      `/crudasistencia?idsecc=${asignacion.idsecc ?? ""}&idmateria=${asignacion.idmateria ?? ""}`
    );
  };

  const irANotas = (asignacion) => {
    navigate(
      `/crudnotas?idsecc=${asignacion.idsecc ?? ""}&idmateria=${asignacion.idmateria ?? ""}`
    );
  };

  return {
    cargando,
    misAsignaciones,
    ciDocente,
    filtroMateria,
    filtroSeccion,
    downloadingExcel,
    materiasUnicas,
    seccionesUnicas,
    listaFiltrada,
    horariosParaGrid,
    setFiltroSeccion,
    cambiarMateria,
    generarNominaPDF,
    generarNominaExcel,
    imprimirHorarioPDF,
    irAAsistencia,
    irANotas,
  };
}
