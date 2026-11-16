import React, { useEffect, useState, useMemo } from "react";
import api from "../api";
import { show_alert } from "../components/functions/Showpro_functions";

const ResumenAsistencias = () => {
  const [cargando, setCargando] = useState(true);
  const [materias, setMaterias] = useState([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [asistencias, setAsistencias] = useState([]);
  const [profesor, setProfesor] = useState("");
  const [nombreMateria, setNombreMateria] = useState("");

  const ci = localStorage.getItem("ciuser") || "";

  // 1. Cargar materias del estudiante (igual que en ResumenCalificaciones)
  useEffect(() => {
    const init = async () => {
      try {
        setCargando(true);
        const { data } = await api.get("/estudiante/mi-modulo");
        const mats = Array.isArray(data?.materias) ? data.materias : [];
        setMaterias(mats);
        setMateriaSeleccionada("");
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

  // 2. Cuando cambia la materia seleccionada → cargar asistencias de esa materia
  useEffect(() => {
    if (!materiaSeleccionada || !ci) {
      setAsistencias([]);
      setProfesor("");
      setNombreMateria("");
      return;
    }

    const cargarAsistenciasMateria = async () => {
      try {
        const mat = materias.find(
          (m) => String(m.idmateria) === String(materiaSeleccionada)
        );
        setNombreMateria(mat?.nombremateria || `Materia #${materiaSeleccionada}`);
        setProfesor(mat?.docente || "—");

        // Llamada al endpoint de asistencias del estudiante filtrado por materia
        // (Asegúrate de que tu backend tenga un endpoint similar a /Asistencias/estudiante/{ci}?idmateria=...)
        const { data } = await api.get(`/Asistencias/estudiante/${ci}`, {
          params: { idmateria: materiaSeleccionada },
        }).catch(() => ({ data: [] }));

        setAsistencias(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setAsistencias([]);
      }
    };

    cargarAsistenciasMateria();
  }, [materiaSeleccionada, ci, materias]);

  // Contadores estadísticos rápidos (Presente, Ausente, etc.)
  const estadisticas = useMemo(() => {
    const total = asistencias.length;
    if (total === 0) return { total: 0, presentes: 0, ausencias: 0, porcentaje: 0 };

    const presentes = asistencias.filter(
      (a) => String(a.estado || a.asistio).toLowerCase() === "presente" || a.estado === true || a.asistio === 1
    ).length;

    const ausencias = total - presentes;
    const porcentaje = ((presentes / total) * 100).toFixed(1);

    return { total, presentes, ausencias, porcentaje };
  }, [asistencias]);

  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p className="text-xl font-bold text-yellow-400">Cargando asistencias...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen bg-black text-white pt-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Título principal */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-center">
          <h1 className="text-lg md:text-xl font-bold uppercase tracking-wide text-yellow-400">
            Control y Registro de Asistencias
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

            {/* Tarjetas de Resumen de Asistencia */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 uppercase">Clases Registradas</p>
                <p className="text-xl font-bold text-white">{estadisticas.total}</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 uppercase">Asistencias</p>
                <p className="text-xl font-bold text-green-400">{estadisticas.presentes}</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 uppercase">Inasistencias</p>
                <p className="text-xl font-bold text-red-400">{estadisticas.ausencias}</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 uppercase">% Asistencia</p>
                <p className="text-xl font-bold text-yellow-400">{estadisticas.porcentaje}%</p>
              </div>
            </div>

            {/* Tabla de Asistencias */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-800 text-yellow-400 text-xs uppercase">
                    <th className="p-3 border border-gray-700">Fecha</th>
                    <th className="p-3 border border-gray-700 text-center">Estado</th>
                    <th className="p-3 border border-gray-700">Observación / Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {asistencias.length > 0 ? (
                    asistencias.map((a, idx) => {
                      const esPresente = 
                        String(a.estado || a.asistio).toLowerCase() === "presente" || 
                        a.estado === true || 
                        a.asistio === 1;

                      return (
                        <tr key={a.idasistencia || idx} className="border-b border-gray-700 hover:bg-gray-800/60">
                          <td className="p-3 border border-gray-700 font-medium">
                            {a.fecha || a.fechaclase || "—"}
                          </td>
                          <td className="p-3 border border-gray-700 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                esPresente
                                  ? "bg-green-900/40 text-green-400 border border-green-700"
                                  : "bg-red-900/40 text-red-400 border border-red-700"
                              }`}
                            >
                              {esPresente ? "Presente" : "Ausente"}
                            </span>
                          </td>
                          <td className="p-3 border border-gray-700 text-gray-300">
                            {a.observacion || a.detalle || "Sin observaciones"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="p-8 text-center text-gray-500 border border-gray-700"
                      >
                        No hay registros de asistencia cargados para esta materia.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumenAsistencias;