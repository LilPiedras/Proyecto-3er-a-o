import { useResumenAsistencias } from "../use/useResumenAsistencias.js";

const ResumenAsistencias = () => {
  const {
    cargando,
    materias,
    materiaSeleccionada,
    seleccionarMateria,
    asistencias,
    profesor,
    nombreMateria,
    estadisticas,
  } = useResumenAsistencias();

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
        <div className="bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-center">
          <h1 className="text-lg md:text-xl font-bold uppercase tracking-wide text-yellow-400">
            Control y Registro de Asistencias
          </h1>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-sm font-bold text-yellow-400 whitespace-nowrap">
              MATERIAS INSCRITAS
            </label>
            <select
              className="flex-1 p-2.5 bg-gray-800 border border-gray-600 rounded text-white outline-none focus:border-yellow-400"
              value={materiaSeleccionada}
              onChange={(e) => seleccionarMateria(e.target.value)}
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

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-800 text-yellow-400 text-xs uppercase">
                    <th className="p-3 border border-gray-700">Fecha de Clase</th>
                    <th className="p-3 border border-gray-700 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {asistencias.length > 0 ? (
                    asistencias.map((a) => (
                      <tr key={a.idasistencia} className="border-b border-gray-700 hover:bg-gray-800/60">
                        <td className="p-3 border border-gray-700 font-medium">
                          {a.fecha}
                        </td>
                        <td className="p-3 border border-gray-700 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              a.verificar
                                ? "bg-green-900/40 text-green-400 border border-green-700"
                                : "bg-red-900/40 text-red-400 border border-red-700"
                            }`}
                          >
                            {a.verificar ? "Presente" : "Ausente"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="2"
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