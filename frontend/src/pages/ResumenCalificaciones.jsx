import React, { useEffect, useState, useMemo } from "react";
import api from "../api";
import { show_alert } from "../components/functions/Showpro_functions";

const ResumenCalificaciones = () => {
  const [cargando, setCargando] = useState(true);
  const [materias, setMaterias] = useState([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [planes, setPlanes] = useState([]);
  const [notas, setNotas] = useState([]);
  const [profesor, setProfesor] = useState("");
  const [nombreMateria, setNombreMateria] = useState("");

  const ci = localStorage.getItem("ciuser") || "";

  // Cargar materias del estudiante (desde mi-modulo)
  useEffect(() => {
    const init = async () => {
      try {
        setCargando(true);
        const { data } = await api.get("/estudiante/mi-modulo");
        const mats = Array.isArray(data?.materias) ? data.materias : [];
        setMaterias(mats);

        setMateriaSeleccionada("")
      } catch (err) {
        const detail = err.response?.data?.detail;
        show_alert(
          typeof detail === "string" ? detail : "No se pudieron cargar tus materias",
          "error"
        );
        setMaterias([]);
      } finally {
        setCargando(false);
      }
    };
    init();
  }, []);

  // Cuando cambia la materia seleccionada → cargar plan + notas
  useEffect(() => {
    if (!materiaSeleccionada || !ci) {
      setPlanes([]);
      setNotas([]);
      setProfesor("");
      setNombreMateria("");
      return;
    }

    const cargarDetalle = async () => {
      try {
        // Info de la materia (nombre + docente)
        const mat = materias.find(
          (m) => String(m.idmateria) === String(materiaSeleccionada)
        );
        setNombreMateria(mat?.nombremateria || `Materia #${materiaSeleccionada}`);
        setProfesor(mat?.docente || "—");

        // Plan de evaluación de esa materia
        const [resPlan, resNotas] = await Promise.all([
          api
            .get(`/plan-evaluacion/materia/${materiaSeleccionada}`)
            .catch(() => ({ data: [] })),
          api
            .get(`/Notas/estudiante/${ci}`, {
              params: { idmateria: materiaSeleccionada },
            })
            .catch(() => ({ data: [] })),
        ]);

        setPlanes(Array.isArray(resPlan.data) ? resPlan.data : []);
        setNotas(Array.isArray(resNotas.data) ? resNotas.data : []);
      } catch (err) {
        console.error(err);
        setPlanes([]);
        setNotas([]);
      }
    };

    cargarDetalle();
  }, [materiaSeleccionada, ci, materias]);

  // Combinar plan + nota y calcular % acumulado
  const filas = useMemo(() => {
    return planes.map((p) => {
      const notaObj = notas.find(
        (n) => Number(n.idevaluacion) === Number(p.idevaluacion)
      );
      const nota = notaObj ? Number(notaObj.notas) : null;
      const ponderacion = Number(p.porcentaje) || 0;
      // Misma lógica que SAREC: nota * (ponderacion / 100)
      const acumulado =
        nota !== null && !isNaN(nota) ? (nota * ponderacion) / 100 : null;

      return {
        idevaluacion: p.idevaluacion,
        evaluacion: p.titulo,
        semana: "—", // el modelo actual no tiene semana
        ponderacion,
        nota,
        acumulado,
      };
    });
  }, [planes, notas]);

  const totalAcumulado = useMemo(() => {
    return filas.reduce((sum, f) => sum + (f.acumulado ?? 0), 0);
  }, [filas]);

  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p className="text-xl font-bold text-yellow-400">Cargando resumen...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen bg-black text-white pt-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Título principal estilo SAREC */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-center">
          <h1 className="text-lg md:text-xl font-bold uppercase tracking-wide text-yellow-400">
            Resumen de Calificaciones hasta la fecha
          </h1>
        </div>

        {/* Selector de materias inscritas */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-sm font-bold text-yellow-400 whitespace-nowrap">
              MATERIAS INSCRITAS
            </label>
            <select
              className="flex-1 p-2.5 bg-gray-800 border border-gray-600 rounded text-white outline-none focus:border-yellow-400"
              value={materiaSeleccionada}
              onChange={(e) => setMateriaSeleccionada(e.target.value)}
            >
              <option value="">-- Selecciona una materia --</option>
              {materias.map((m) => (
                <option key={m.idmateria} value={m.idmateria}>
                  {m.nombremateria}
                  {m.nombre_seccion ? ` (${m.nombre_seccion})` : ""}
                </option>
              ))}
            </select>
          </div>

          {materias.length === 0 && (
            <p className="text-sm text-gray-500 mt-3">
              No tienes materias inscritas en este período.
            </p>
          )}
        </div>

        {/* Detalle de la materia seleccionada */}
        {materiaSeleccionada && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg space-y-5">
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-bold text-yellow-400">PROFESOR(A):</span>{" "}
                <span className="text-white">{profesor}</span>
              </p>
              <p className="text-sm">
                <span className="font-bold text-yellow-400">
                  UNIDAD CURRICULAR:
                </span>{" "}
                <span className="text-white uppercase">{nombreMateria}</span>
              </p>
            </div>

            <p className="text-center text-sm text-gray-400 italic">
              Evaluaciones cargadas en el sistema hasta la fecha por el docente
            </p>

            {/* Tabla estilo SAREC */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-800 text-yellow-400 text-xs uppercase">
                    <th className="p-3 border border-gray-700">Evaluación</th>
                    <th className="p-3 border border-gray-700 text-center">Ponderación</th>
                    <th className="p-3 border border-gray-700 text-center">Nota</th>
                    <th className="p-3 border border-gray-700 text-center">% Acumulado</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.length > 0 ? (
                    filas.map((f) => (
                    <tr key={f.idevaluacion} className="border-b border-gray-700 hover:bg-gray-800/60">
                      <td className="p-3 border border-gray-700 font-medium">{f.evaluacion}</td>
                      <td className="p-3 border border-gray-700 text-center">{f.ponderacion.toFixed(0)} %</td>
                      <td className="p-3 border border-gray-700 text-center">
                        {f.nota !== null ? (
                          <span className={`font-bold ${f.nota >= 10 ? "text-green-400" : "text-red-400"}`}>
                            {f.nota.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="p-3 border border-gray-700 text-center font-semibold text-yellow-400">
                        {f.acumulado !== null ? f.acumulado.toFixed(2) : "—"}
                      </td>
                    </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-8 text-center text-gray-500 border border-gray-700"
                      >
                        El docente aún no ha registrado el plan de evaluación
                        para esta materia.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-800">
                    <td colSpan="3" className="p-3 border border-gray-700 text-left font-bold text-sm">
                      Total Acumulado hasta la fecha
                    </td>
                    <td className="p-3 border border-gray-700 text-center font-black text-xl text-yellow-400">
                      {totalAcumulado.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumenCalificaciones;