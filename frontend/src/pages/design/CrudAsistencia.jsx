import { useCrudAsistencia } from '../use/useCrudAsistencia.js';

const CrudAsistencia = () => {
  const {
    secciones,
    idsecc,
    cambiarSeccion,
    materias,
    idmateria,
    cambiarMateria,
    fecha,
    cambiarFecha,
    estudiantes,
    marcas,
    setMarcas,
    cargandoSecciones,
    cargandoMaterias,
    cargandoLista,
    guardando,
    confirmandoAsistencia,
    errorAcceso,
    todosPresentes,
    alternarTodosPresentes,
    confirmarAsistencia,
    guardar,
    eliminar,
  } = useCrudAsistencia();

  return (
    <section className="min-h-screen bg-black p-6 pt-28 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-yellow-400">Control de asistencia</h1>
          <p className="mt-2 text-sm text-gray-400">Registra y actualiza la asistencia de estudiantes inscritos por sección y materia.</p>
        </div>

        {errorAcceso ? (
          <p role="alert" className="rounded border border-red-800 bg-red-950/50 p-4 text-red-200">{errorAcceso}</p>
        ) : (
          <>
            <div className="mb-6 grid gap-4 rounded-lg border border-gray-800 bg-gray-950 p-4 sm:grid-cols-[1fr_1fr_220px]">
              <label className="text-sm font-medium text-gray-200">
                Sección
                <select
                  value={idsecc}
                  onChange={(event) => cambiarSeccion(event.target.value)}
                  disabled={cargandoSecciones || !secciones.length}
                  className="mt-2 w-full rounded border border-gray-700 bg-gray-900 p-3 text-white focus:border-yellow-400 focus:outline-none"
                >
                  {!secciones.length && <option value="">{cargandoSecciones ? 'Cargando secciones...' : 'No tienes secciones con estudiantes inscritos'}</option>}
                  {secciones.map((seccion) => (
                    <option key={seccion.idsecc} value={seccion.idsecc}>{seccion.nomsecc}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-gray-200">
                Materia
                <select
                  value={idmateria}
                  onChange={(event) => cambiarMateria(event.target.value)}
                  disabled={!idsecc || cargandoMaterias || !materias.length}
                  className="mt-2 w-full rounded border border-gray-700 bg-gray-900 p-3 text-white focus:border-yellow-400 focus:outline-none"
                >
                  {!materias.length && <option value="">{cargandoMaterias ? 'Cargando materias...' : 'Esta sección no tiene materias inscritas'}</option>}
                  {materias.map((materia) => (
                    <option key={materia.idmateria} value={materia.idmateria}>{materia.nombremateria}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-gray-200">
                Fecha
                <input
                  type="date"
                  value={fecha}
                  onChange={(event) => cambiarFecha(event.target.value)}
                  className="mt-2 w-full rounded border border-gray-700 bg-gray-900 p-3 text-white focus:border-yellow-400 focus:outline-none"
                />
              </label>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-800">
              <div className="flex flex-wrap justify-end gap-2 border-b border-gray-800 bg-gray-950 p-3">
                <button
                  type="button"
                  onClick={alternarTodosPresentes}
                  disabled={!estudiantes.length || cargandoLista || confirmandoAsistencia || Boolean(guardando)}
                  className="rounded bg-emerald-500 px-4 py-2 font-semibold text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <i className={`fa-solid ${todosPresentes ? 'fa-square-minus' : 'fa-check-double'} mr-2`} aria-hidden="true" />
                  {todosPresentes ? 'Desmarcar todos' : 'Marcar todos presentes'}
                </button>
                <button
                  type="button"
                  onClick={confirmarAsistencia}
                  disabled={!estudiantes.length || cargandoLista || confirmandoAsistencia || Boolean(guardando)}
                  className="rounded bg-yellow-400 px-4 py-2 font-semibold text-black hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {confirmandoAsistencia ? 'Confirmando...' : 'Confirmar asistencia'}
                </button>
              </div>
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead className="bg-gray-900 text-sm text-yellow-300">
                  <tr>
                    <th className="p-3">ESTUDIANTE</th>
                    <th className="p-3">CÉDULA</th>
                    <th className="p-3">ASISTENCIA</th>
                    <th className="p-3">ESTADO</th>
                    <th className="p-3">ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {cargandoLista ? (
                    <tr><td colSpan="5" className="p-6 text-center text-gray-400">Cargando estudiantes...</td></tr>
                  ) : estudiantes.length ? estudiantes.map((alumno) => (
                    <tr key={alumno.asisestu} className="border-t border-gray-800 hover:bg-gray-900/60">
                      <td className="p-3 font-medium">{alumno.nombreestu} {alumno.apelliestu}</td>
                      <td className="p-3 text-gray-300">{alumno.asisestu}</td>
                      <td className="p-3">
                        <label className="inline-flex cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={Boolean(marcas[alumno.asisestu])}
                            onChange={(event) => setMarcas((actual) => ({ ...actual, [alumno.asisestu]: event.target.checked }))}
                            disabled={confirmandoAsistencia || Boolean(guardando)}
                            className="h-5 w-5 accent-emerald-400"
                            aria-label={`Asistencia de ${alumno.nombreestu} ${alumno.apelliestu}`}
                          />
                          <span>{marcas[alumno.asisestu] ? 'Presente' : 'Ausente'}</span>
                        </label>
                      </td>
                      <td className="p-3">
                        {Boolean(alumno.verificar) !== Boolean(marcas[alumno.asisestu]) ? (
                          <span className="text-amber-300">Pendiente de confirmar</span>
                        ) : alumno.idasis ? (
                          <span className="text-emerald-300">Registrada</span>
                        ) : (
                          <span className="text-gray-400">Sin registrar</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => guardar(alumno)}
                            disabled={guardando === alumno.asisestu || confirmandoAsistencia}
                            className="rounded bg-yellow-400 px-3 py-2 font-semibold text-black hover:bg-yellow-300 disabled:opacity-50"
                          >
                            {guardando === alumno.asisestu ? 'Guardando...' : alumno.idasis ? 'Actualizar' : 'Registrar'}
                          </button>
                          {alumno.idasis && (
                            <button
                              type="button"
                              onClick={() => eliminar(alumno)}
                              disabled={guardando === alumno.asisestu || confirmandoAsistencia}
                              className="rounded bg-red-700 px-3 py-2 hover:bg-red-600 disabled:opacity-50"
                              aria-label={`Eliminar asistencia de ${alumno.nombreestu} ${alumno.apelliestu}`}
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" className="p-6 text-center text-gray-400">No hay estudiantes inscritos en esta sección y materia.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default CrudAsistencia;