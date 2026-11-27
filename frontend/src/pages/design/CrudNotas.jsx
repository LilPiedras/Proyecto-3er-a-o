import { useCrudNotas } from "../use/useCrudNotas.js";

const CrudNotas = () => {
  const {
    cargando,
    esDocenteOAdmin,
    esEstudiante,
    estudiantes,
    evaluaciones,
    notasLista,
    oferta,
    setOferta,
    idevaluacion,
    setIdevaluacion,
    notaValor,
    setNotaValor,
    fechanota,
    setFechanota,
    busquedaOferta,
    setBusquedaOferta,
    mostrarSugerencias,
    setMostrarSugerencias,
    ofertaSeleccionadaLabel,
    setOfertaSeleccionadaLabel,
    listaOfertasDisponibles,
    sugerenciasOferta,
    normalizar,
    etiquetaOferta,
    seleccionarOferta,
    limpiarOferta,
    publicarNota,
  } = useCrudNotas();

  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p className="text-xl font-bold text-yellow-400">Cargando notas...</p>
      </div>
    );
  }

  return (
    <div className="CRUD p-6 min-h-screen bg-black text-white pt-24">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
          {esEstudiante ? "Mis Notas" : "Gestión de Notas"}
        </h2>

        {esEstudiante && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-800 text-yellow-400 text-xs uppercase">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Nota</th>
                    <th className="p-3">Estudiante</th>
                    <th className="p-3">Materia</th>
                    <th className="p-3">Evaluación</th>
                    <th className="p-3">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {notasLista.length > 0 ? (
                    notasLista.map((n) => (
                      <tr key={n.idnota} className="border-b border-gray-700">
                        <td className="p-3">#{n.idnota}</td>
                        <td className="p-3 font-bold text-yellow-400">
                          {Number(n.notas).toFixed(2)}
                        </td>
                        <td className="p-3">
                          {n.nombreestu
                            ? `${n.nombreestu} ${n.apelliestu || ""}`
                            : `Oferta #${n.oferta}`}
                        </td>
                        <td className="p-3">{n.nombremateria || "—"}</td>
                        <td className="p-3">
                          {n.titulo_evaluacion || n.idevaluacion || "—"}
                        </td>
                        <td className="p-3">{n.fechanota}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center p-6 text-gray-500">
                        No hay notas registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {esDocenteOAdmin && (
          <>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">Publicar nota</h3>
              <form onSubmit={publicarNota}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="relative">
                    <label className="block text-sm font-bold mb-2 text-yellow-400">
                      Oferta (buscar por cédula o nombre)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white outline-none"
                        placeholder="Ej. V-12345678"
                        value={busquedaOferta}
                        autoComplete="off"
                        onChange={(e) => {
                          const v = e.target.value;
                          setBusquedaOferta(v);
                          setMostrarSugerencias(true);
                          if (
                            oferta &&
                            normalizar(v) !== normalizar(ofertaSeleccionadaLabel)
                          ) {
                            setOferta("");
                            setOfertaSeleccionadaLabel("");
                            setIdevaluacion("");
                          }
                        }}
                        onFocus={() => setMostrarSugerencias(true)}
                        onBlur={() => {
                          setTimeout(() => setMostrarSugerencias(false), 150);
                        }}
                      />
                      {oferta && (
                        <button
                          type="button"
                          onClick={limpiarOferta}
                          className="px-3 rounded bg-gray-700 text-gray-200 hover:bg-gray-600 text-sm"
                          title="Limpiar"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {mostrarSugerencias && busquedaOferta.trim().length >= 2 && (
                      <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded border border-gray-600 bg-gray-900 shadow-lg">
                        {sugerenciasOferta.length > 0 ? (
                          sugerenciasOferta.map((item) => (
                            <li key={item.idseccmo}>
                              <button
                                type="button"
                                className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-yellow-400 hover:text-black"
                                onMouseDown={(ev) => ev.preventDefault()}
                                onClick={() => seleccionarOferta(item)}
                              >
                                {etiquetaOferta(item)}
                              </button>
                            </li>
                          ))
                        ) : (
                          <li className="px-3 py-2 text-sm text-gray-500">
                            Sin coincidencias. Prueba con la cédula completa.
                          </li>
                        )}
                      </ul>
                    )}

                    {oferta ? (
                      <p className="text-xs text-emerald-400 mt-1">
                        Seleccionado: oferta #{oferta}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        Escribe al menos 2 caracteres y elige un resultado de la lista.
                      </p>
                    )}

                    {listaOfertasDisponibles.length === 0 && (
                      <p className="text-xs text-red-400 mt-1">
                        No hay ofertas con estudiante asignado en tus materias.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-yellow-400">
                      Plan evaluación (obligatorio)
                    </label>
                    <select
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white outline-none"
                      value={idevaluacion}
                      onChange={(e) => setIdevaluacion(e.target.value)}
                      required
                    >
                      <option value="">-- Seleccionar evaluación --</option>
                      {evaluaciones.map((ev) => (
                        <option key={ev.idevaluacion} value={ev.idevaluacion}>
                          {ev.titulo} ({ev.porcentaje}%)
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Evaluaciones filtradas según la materia seleccionada.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-yellow-400">
                      Calificación (0–20)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="20"
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white outline-none"
                      value={notaValor}
                      onChange={(e) => setNotaValor(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-yellow-400">
                      Fecha
                    </label>
                    <input
                      type="date"
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white outline-none"
                      value={fechanota}
                      onChange={(e) => setFechanota(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-yellow-400 text-black font-bold py-2 px-6 rounded hover:bg-yellow-300 transition"
                  >
                    Publicar nota
                  </button>
                </div>
              </form>
            </div>

            {estudiantes.length > 0 && (
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8 shadow-lg">
                <h3 className="text-xl font-bold text-white mb-4">
                  Estudiantes en tus materias asignadas
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-800 text-yellow-400 text-xs uppercase">
                      <tr>
                        <th className="p-3">Oferta</th>
                        <th className="p-3">Cédula</th>
                        <th className="p-3">Nombre</th>
                        <th className="p-3">Materia</th>
                        <th className="p-3">Sección</th>
                        <th className="p-3">Horario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estudiantes.map((e, i) => (
                        <tr key={i} className="border-b border-gray-700">
                          <td className="p-3">#{e.idseccmo}</td>
                          <td className="p-3">{e.ciestu || e.ci || "—"}</td>
                          <td className="p-3">
                            {e.nombreestu || e.estudiante || "—"} {e.apelliestu || ""}
                          </td>
                          <td className="p-3 text-yellow-400">{e.nombremateria || "—"}</td>
                          <td className="p-3">{e.nomsecc || e.seccion || `Sección ${e.idsecc}`}</td>
                          <td className="p-3">{e.horario_texto || (e.dia? `${e.dia} ${e.horainicio || ""}-${e.horafin || ""}${e.salon ? ` · Aula ${e.salon}` : ""}`: e.horario? `Horario #${e.horario}`: "—")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">Notas registradas</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-800 text-yellow-400 text-xs uppercase">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Nota</th>
                      <th className="p-3">Oferta</th>
                      <th className="p-3">Evaluación</th>
                      <th className="p-3">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notasLista.length > 0 ? (
                      notasLista.map((n) => (
                        <tr key={n.idnota} className="border-b border-gray-700">
                          <td className="p-3">#{n.idnota}</td>
                          <td className="p-3 font-bold text-yellow-400">
                            {Number(n.notas).toFixed(2)}
                          </td>
                          <td className="p-3">{n.oferta}</td>
                          <td className="p-3">{n.idevaluacion ?? "—"}</td>
                          <td className="p-3">{n.fechanota}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center p-6 text-gray-500">
                          No hay notas registradas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CrudNotas;