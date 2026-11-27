import { useEffect, useMemo, useState } from "react";
import api from "../../api";
import { show_alert } from "../../components/functions/Showpro_functions";

export function useResumenCalificaciones() {
  const [cargando, setCargando] = useState(true);
  const [materias, setMaterias] = useState([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [planes, setPlanes] = useState([]);
  const [notas, setNotas] = useState([]);
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
    Promise.all([
      api
        .get(`/plan-evaluacion/materia/${materiaSeleccionada}`)
        .catch(() => ({ data: [] })),
      api
        .get(`/Notas/estudiante/${ci}`, {
          params: { idmateria: materiaSeleccionada },
        })
        .catch(() => ({ data: [] })),
    ])
      .then(([resPlan, resNotas]) => {
        if (!active) return;
        setPlanes(Array.isArray(resPlan.data) ? resPlan.data : []);
        setNotas(Array.isArray(resNotas.data) ? resNotas.data : []);
      })
      .catch((error) => {
        if (!active) return;
        console.error(error);
        setPlanes([]);
        setNotas([]);
      });

    return () => {
      active = false;
    };
  }, [materiaSeleccionada, ci]);

  const seleccionarMateria = (id) => {
    setMateriaSeleccionada(id);
    setPlanes([]);
    setNotas([]);
  };

  const filas = useMemo(
    () =>
      planes.map((plan) => {
        const notaObj = notas.find(
          (nota) => Number(nota.idevaluacion) === Number(plan.idevaluacion)
        );
        const nota = notaObj ? Number(notaObj.notas) : null;
        const ponderacion = Number(plan.porcentaje) || 0;
        const acumulado =
          nota !== null && !isNaN(nota) ? (nota * ponderacion) / 100 : null;

        return {
          idevaluacion: plan.idevaluacion,
          evaluacion: plan.titulo,
          semana: "—",
          ponderacion,
          nota,
          acumulado,
        };
      }),
    [planes, notas]
  );

  const totalAcumulado = useMemo(
    () => filas.reduce((sum, fila) => sum + (fila.acumulado ?? 0), 0),
    [filas]
  );

  return {
    cargando,
    materias,
    materiaSeleccionada,
    seleccionarMateria,
    profesor,
    nombreMateria,
    filas,
    totalAcumulado,
  };
}
