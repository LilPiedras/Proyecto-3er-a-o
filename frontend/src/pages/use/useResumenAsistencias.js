import { useEffect, useMemo, useState } from "react";
import api from "../../api";
import { show_alert } from "../../components/functions/Showpro_functions";

export function useResumenAsistencias() {
  const [cargando, setCargando] = useState(true);
  const [materias, setMaterias] = useState([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [asistencias, setAsistencias] = useState([]);
  const ci = localStorage.getItem("ciuser") || "";
  const materia = materias.find(
    (item) => String(item.idmateria) === String(materiaSeleccionada)
  );
  const nombreMateria = materia?.nombremateria || `Materia #${materiaSeleccionada}`;
  const profesor = materia?.docente || "—";

  useEffect(() => {
    let active = true;
    api.get("/estudiante/mi-modulo")
      .then(({ data }) => {
        if (active) setMaterias(Array.isArray(data?.materias) ? data.materias : []);
      })
      .catch((error) => {
        if (!active) return;
        const detail = error.response?.data?.detail;
        show_alert(
          typeof detail === "string" ? detail : "No se pudieron cargar tus materias",
          "error"
        );
        setMaterias([]);
      })
      .finally(() => {
        if (active) setCargando(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!materiaSeleccionada || !ci) return undefined;

    let active = true;
    api
      .get(`/asistencias/estudiante/${ci}`, {
        params: { idmateria: materiaSeleccionada },
      })
      .then(({ data }) => {
        if (active) setAsistencias(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setAsistencias([]);
      });

    return () => {
      active = false;
    };
  }, [materiaSeleccionada, ci]);

  const seleccionarMateria = (id) => {
    setMateriaSeleccionada(id);
    setAsistencias([]);
  };

  const estadisticas = useMemo(() => {
    const total = asistencias.length;
    if (total === 0) return { total: 0, presentes: 0, ausencias: 0, porcentaje: 0 };

    const presentes = asistencias.filter((asistencia) => asistencia.verificar === true).length;
    const ausencias = total - presentes;
    const porcentaje = ((presentes / total) * 100).toFixed(1);

    return { total, presentes, ausencias, porcentaje };
  }, [asistencias]);

  return {
    cargando,
    materias,
    materiaSeleccionada,
    seleccionarMateria,
    asistencias,
    profesor,
    nombreMateria,
    estadisticas,
  };
}
