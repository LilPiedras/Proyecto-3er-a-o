import { useCrudPlanEvaluacion } from "../use/useCrudPlanEvaluacion.js";

const CrudPlanEvaluacion = () => {
  const {
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
  } = useCrudPlanEvaluacion();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p className="text-xl font-bold text-yellow-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="CRUD p-6 min-h-screen bg-black text-white pt-24">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
          Plan de Evaluación
        </h2>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">Nuevo plan</h3>
          <form onSubmit={guardar}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Materia
                </label>
                <select
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white outline-none"
                  value={idmateria}
                  onChange={(e) => setIdmateria(e.target.value)}
                  required
                >
                  <option value="">-- Seleccionar --</option>
                  {materias.map((m) => (
                    <option key={m.idmateria} value={m.idmateria}>
                      {m.nombremateria}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Sección
                </label>
                <select
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white outline-none"
                  value={idsecc}
                  onChange={(e) => setIdsecc(e.target.value)}
                  required
                >
                  <option value="">-- Seleccionar --</option>
                  {secciones.map((s) => (
                    <option key={s.idsecc} value={s.idsecc}>
                      {s.nomsecc || s.nombreseccion || `Sección ${s.idsecc}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Título
                </label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white outline-none"
                  placeholder="Ej. Parcial 1"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Porcentaje (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="100"
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white outline-none"
                  placeholder="30"
                  value={porcentaje}
                  onChange={(e) => setPorcentaje(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-yellow-400 text-black font-bold py-2 px-6 rounded hover:bg-yellow-300 transition"
              >
                Guardar plan
              </button>
            </div>
          </form>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">Planes registrados</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-800 text-yellow-400 text-xs uppercase">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Título</th>
                  <th className="p-3">Materia</th>
                  <th className="p-3">Sección</th>
                  <th className="p-3">%</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {planesVisibles.length > 0 ? (
                  planesVisibles.map((p) => (
                    <tr key={p.idevaluacion} className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="p-3 font-mono text-gray-400">#{p.idevaluacion}</td>
                      <td className="p-3 text-white font-medium">{p.titulo}</td>
                      <td className="p-3">{nombreMateria(p.idmateria)}</td>
                      <td className="p-3">{nombreSeccion(p.idsecc)}</td>
                      <td className="p-3 text-yellow-400 font-bold">
                        {Number(p.porcentaje).toFixed(2)}%
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => eliminar(p.idevaluacion, p.titulo)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500">
                      {materias.length === 0
                        ? "No tienes materias asignadas. No hay planes que mostrar."
                        : "No hay planes de evaluación para tus materias."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrudPlanEvaluacion;