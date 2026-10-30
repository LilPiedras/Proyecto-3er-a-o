import React, { useEffect, useState } from "react";
import api from "../api";
import { show_alert } from "../components/functions/Showpro_functions";

const MiModulo = () => {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);
        const { data: res } = await api.get("/estudiante/mi-modulo");
        setData(res);
      } catch (err) {
        const detail = err.response?.data?.detail;
        const msg =
          typeof detail === "string"
            ? detail
            : "No se pudo cargar tu información académica.";
        setError(msg);
        show_alert(msg, "error");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-black text-white">
        <p className="text-xl font-bold text-yellow-400">Cargando tu módulo...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 min-h-[60vh] bg-black text-white pt-8">
        <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-yellow-400 mb-2">Sin datos académicos</h2>
          <p className="text-gray-400 text-sm">{error || "No hay información disponible."}</p>
        </div>
      </div>
    );
  }

  const { modulo, materias, horarios, notas, inscripcion, secciones } = data;

  return (
    <div className="p-4 md:p-8 min-h-screen bg-black text-white space-y-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Cabecera */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-yellow-400">
              Portal del estudiante
            </span>
            <h1 className="text-2xl font-black mt-1">
              {data.nombre} {data.apellido}
            </h1>
            <p className="text-sm text-gray-400">Cédula: {data.ciestu}</p>
          </div>
          <div className="bg-yellow-400 text-black px-4 py-2 rounded-xl text-sm font-black uppercase text-center">
            {modulo?.nombremodulo || "Sin módulo asignado"}
          </div>
        </div>

        {/* Módulo / inscripción */}
        <section className="bg-gray-900 border border-gray-700 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-bold text-yellow-400">Mi módulo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs uppercase font-bold">Módulo</p>
              <p className="font-semibold">{modulo?.nombremodulo || "—"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase font-bold">Estado inscripción</p>
              <p className="font-semibold">{inscripcion?.estado || "—"}</p>
            </div>
            {secciones?.length > 0 && (
              <div className="sm:col-span-2">
                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Secciones</p>
                <div className="flex flex-wrap gap-2">
                  {secciones.map((s) => (
                    <span
                      key={s.seccion_id}
                      className="px-3 py-1 rounded-full bg-gray-800 border border-gray-600 text-xs"
                    >
                      {s.nombre_seccion}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Materias */}
        <section className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-yellow-400 mb-4">Materias que curso</h2>
          {materias?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-yellow-400 text-xs uppercase border-b border-gray-700">
                  <tr>
                    <th className="p-2">Materia</th>
                    <th className="p-2">Docente</th>
                    <th className="p-2">Módulo</th>
                    <th className="p-2">Sección</th>
                  </tr>
                </thead>
                <tbody>
                  {materias.map((m, i) => (
                    <tr key={`${m.idmateria}-${i}`} className="border-b border-gray-800">
                      <td className="p-2 font-medium">{m.nombremateria}</td>
                      <td className="p-2 text-gray-300">{m.docente}</td>
                      <td className="p-2">{m.nombremodulo || "—"}</td>
                      <td className="p-2">{m.nombre_seccion || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Aún no tienes materias asignadas.</p>
          )}
        </section>

        {/* Horario */}
        <section className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-yellow-400 mb-4">Mi horario</h2>
          {horarios?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-yellow-400 text-xs uppercase border-b border-gray-700">
                  <tr>
                    <th className="p-2">Día</th>
                    <th className="p-2">Hora</th>
                    <th className="p-2">Salón</th>
                    <th className="p-2">Materia</th>
                    <th className="p-2">Docente</th>
                  </tr>
                </thead>
                <tbody>
                  {horarios.map((h, i) => (
                    <tr key={`${h.idhorario}-${i}`} className="border-b border-gray-800">
                      <td className="p-2 font-medium">{h.dia}</td>
                      <td className="p-2">
                        {h.horainicio} – {h.horafin}
                      </td>
                      <td className="p-2">{h.salon}</td>
                      <td className="p-2">{h.materia || "—"}</td>
                      <td className="p-2 text-gray-300">{h.docente || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hay horario registrado todavía.</p>
          )}
        </section>

        {/* Notas */}
        <section className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-yellow-400 mb-4">Mis notas</h2>
          {notas?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-yellow-400 text-xs uppercase border-b border-gray-700">
                  <tr>
                    <th className="p-2">Materia</th>
                    <th className="p-2">Evaluación</th>
                    <th className="p-2">Nota</th>
                    <th className="p-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {notas.map((n) => (
                    <tr key={n.idnota} className="border-b border-gray-800">
                      <td className="p-2">{n.nombremateria || `Oferta #${n.oferta}`}</td>
                      <td className="p-2">{n.titulo_evaluacion || "—"}</td>
                      <td className="p-2">
                        <span
                          className={`font-bold ${
                            (n.calificacion ?? 0) >= 10 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {n.calificacion != null ? n.calificacion.toFixed(2) : "—"}
                        </span>
                      </td>
                      <td className="p-2 text-gray-400">{n.fechanota || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Aún no tienes notas registradas.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default MiModulo;