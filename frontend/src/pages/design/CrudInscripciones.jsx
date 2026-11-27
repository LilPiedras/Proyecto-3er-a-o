import { Search, MapPin, Layers, Award } from 'lucide-react';
import { useCrudInscripciones } from '../use/useCrudInscripciones.js';

const CrudInscripciones = () => {
  const {
    estudiantes,
    periodos,
    secciones,
    modulos,
    ofertasSeccion,
    materiasModulo,
    inscripcionesDetalladas,
    ciestu,
    setCiestu,
    periodoId,
    setPeriodoId,
    seccionIds,
    setSeccionIds,
    estado,
    setEstado,
    cedulaUbicacion,
    setCedulaUbicacion,
    resultadoUbicacion,
    buscandoUbicacion,
    cargando,
    guardando,
    obtenerNombreSeccionConModulo,
    handleConsultarUbicacion,
    handleInscribir,
    handleEliminarInscripcion,
  } = useCrudInscripciones();  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p className="text-xl font-bold text-yellow-400">Cargando módulo de inscripciones...</p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-black text-white pt-24 space-y-10">

      <div className="container mx-auto max-w-4xl bg-gray-900 border border-gray-700 p-6 rounded-2xl shadow-2xl space-y-4">
        <div className="flex items-center gap-2 text-yellow-400">
          <MapPin size={22} />
          <h3 className="text-xl font-bold">Consultar Ubicación Académica del Estudiante</h3>
        </div>
        <p className="text-gray-400 text-xs">
          Ingresa la cédula para verificar al instante en qué Módulo y Sección está matriculado el alumno.
        </p>

        <form onSubmit={handleConsultarUbicacion} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Ej: V-12345678"
              value={cedulaUbicacion}
              onChange={(e) => setCedulaUbicacion(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white outline-none focus:border-yellow-400 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={buscandoUbicacion}
            className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-300 transition cursor-pointer disabled:opacity-50 text-sm shrink-0"
          >
            {buscandoUbicacion ? "Consultando..." : "Consultar Ubicación"}
          </button>
        </form>

        {resultadoUbicacion && (
          <div className="mt-4 pt-4 border-t border-gray-800 space-y-3">
            <h4 className="text-sm font-semibold text-gray-300">Asignaciones Encontradas:</h4>
            <div className="grid grid-cols-1 gap-2.5">
              {Array.isArray(resultadoUbicacion) && resultadoUbicacion.map((item, idx) => (
                <div key={idx} className="bg-gray-800/90 border border-gray-700 rounded-xl p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-xs">
                  <div className="space-y-1">
                    <p className="text-white font-medium flex items-center gap-1">
                      <Layers size={14} className="text-yellow-400" /> {item.seccion || item.seccionNombre || `Sección #${item.seccion_id}`}
                    </p>
                    {item.estudiante && <p className="text-gray-400">Alumno: {item.estudiante}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-900 px-2.5 py-1 rounded text-gray-300 border border-gray-700 font-mono">
                      {item.periodo || item.periodoNombre || `Período #${item.periodo_id}`}
                    </span>
                    <span className={`px-2 py-1 rounded font-bold ${
                      (item.estado || item.estado_inscripcion) === "ACTIVO" 
                        ? "bg-green-900/60 text-green-400 border border-green-600" 
                        : "bg-yellow-900/60 text-yellow-400 border border-yellow-600"
                    }`}>
                      {item.estado || item.estado_inscripcion}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="container mx-auto max-w-2xl bg-gray-900 border border-gray-700 p-8 rounded-2xl shadow-2xl space-y-6">
        <h2 className="text-3xl font-extrabold text-yellow-400 text-center">
          Inscripción de Estudiantes
        </h2>
        <p className="text-gray-400 text-sm text-center">
          Selecciona el estudiante, el período y las secciones correspondientes para formalizar la matrícula.
        </p>

        <form onSubmit={handleInscribir} className="space-y-5">

          <div>
            <label className="block text-sm font-bold mb-2 text-yellow-400">
              Estudiante
            </label>
            <select
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white outline-none focus:border-yellow-400"
              value={ciestu}
              onChange={(e) => setCiestu(e.target.value)}
              required
            >
              <option value="">-- Seleccionar Estudiante --</option>
              {estudiantes.map((est) => {
                const cedulaVal = est.ciestu || est.cedula || est.ci || est.id;
                const nombreVal = est.nombreestu || est.nombre || "";
                const apellidoVal = est.apelliestu || est.apellido || "";

                return (
                  <option key={cedulaVal} value={cedulaVal}>
                    {cedulaVal} — {nombreVal} {apellidoVal}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-yellow-400">
              Período Académico
            </label>
            <select
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white outline-none focus:border-yellow-400"
              value={periodoId}
              onChange={(e) => setPeriodoId(e.target.value)}
              required
            >
              <option value="">-- Seleccionar Período --</option>
              {periodos.map((per) => (
                <option key={per.id} value={per.id}>
                  {per.nombre || `Período #${per.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-yellow-400">
              Secciones y Módulos Disponibles
            </label>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-gray-600 bg-gray-800 p-3">
              {secciones.length ? secciones.map((sec) => {
                const idSeccion = Number(sec.idsecc || sec.id);
                const nombreSeccionConMod = obtenerNombreSeccionConModulo(sec, ofertasSeccion, modulos, materiasModulo);

                return (
                  <label key={idSeccion} className="flex cursor-pointer items-center gap-3 text-white hover:bg-gray-700/50 p-1.5 rounded-lg transition">
                    <input
                      type="checkbox"
                      checked={seccionIds.includes(idSeccion)}
                      onChange={(event) => setSeccionIds((actuales) => (
                        event.target.checked
                          ? [...actuales, idSeccion]
                          : actuales.filter((id) => id !== idSeccion)
                      ))}
                      className="h-4 w-4 accent-yellow-400 cursor-pointer"
                    />
                    <span className="text-sm font-medium">{nombreSeccionConMod}</span>
                  </label>
                );
              }) : <p className="text-sm text-gray-400">No hay secciones disponibles.</p>}
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              Seleccionadas: <span className="text-yellow-400 font-bold">{seccionIds.length}</span>. Se matricularán conjuntamente.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-yellow-400">
              Estado de la Inscripción
            </label>
            <select
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white outline-none focus:border-yellow-400"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="ACTIVO">ACTIVO</option>
              <option value="PENDIENTE">PENDIENTE</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="w-full py-4 bg-yellow-400 text-black text-lg font-bold rounded-xl hover:bg-yellow-300 transition-all shadow-lg cursor-pointer disabled:opacity-50 mt-4"
          >
            {guardando ? "Procesando..." : "Registrar Matrícula"}
          </button>
        </form>
      </div>

      <div className="container mx-auto max-w-6xl bg-gray-900 border border-gray-700 p-6 rounded-2xl shadow-2xl">
        <h3 className="text-xl font-bold text-yellow-400 mb-4">
          Historial General de Inscripciones
        </h3>

        {inscripcionesDetalladas.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay inscripciones registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-yellow-400">
                  <th className="p-3">ID</th>
                  <th className="p-3">Cédula</th>
                  <th className="p-3">Estudiante</th>
                  <th className="p-3">Período</th>
                  <th className="p-3">Módulo y Sección</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {inscripcionesDetalladas.map((ins) => (
                  <tr key={`${ins.id}-${ins.detalleId}`} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-3 font-semibold">{ins.id}</td>
                    <td className="p-3 font-mono text-gray-300">{ins.ciestu}</td>
                    <td className="p-3 font-medium text-white">{ins.estudianteNombre}</td>
                    <td className="p-3 text-gray-300">{ins.periodoNombre}</td>
                    <td className="p-3 text-yellow-300 font-bold">{ins.seccionNombre}</td>
                    <td className="p-3 text-gray-400">{ins.fecha}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          ins.estado === "ACTIVO"
                            ? "bg-green-900/60 text-green-400 border border-green-600"
                            : "bg-yellow-900/60 text-yellow-400 border border-yellow-600"
                        }`}
                      >
                        {ins.estado}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleEliminarInscripcion(ins.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded transition cursor-pointer"
                      >
                        Anular
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default CrudInscripciones;