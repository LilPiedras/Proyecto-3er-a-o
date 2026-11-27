import { Pencil, Trash2, Plus, Search, RotateCcw, Trash, Users, FileSpreadsheet } from 'lucide-react';
import { useCrudEstudiantes } from '../use/useCrudEstudiantes.js';

const CrudEstudiantes = () => {
  const {
    estudiantes,
    loading,
    busqueda,
    setBusqueda,
    vistaInactivos,
    cambiarVistaInactivos,
    nacionalidad,
    setNacionalidad,
    ciestuNum,
    setCiestuNum,
    nombreestu,
    setNombreestu,
    apelliestu,
    setApelliestu,
    teleestu,
    setTeleestu,
    correoestu,
    setCorreoestu,
    operation,
    title,
    isModalOpen,
    setIsModalOpen,
    downloadingExcel,
    estudiantesFiltrados,
    openModal,
    validar,
    deleteEstudiante,
    restaurarEstudiante,
    descargarNominaExcel,
    inicial,
  } = useCrudEstudiantes();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p className="text-xl font-bold text-yellow-400">
          Cargando estudiantes...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-black text-white pt-24">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={`font-bold px-4 py-2.5 rounded-lg transition border flex items-center gap-2 ${
                vistaInactivos
                  ? 'bg-gray-800 text-yellow-400 border-yellow-400 hover:bg-gray-700'
                  : 'bg-red-900/40 text-red-400 border-red-700 hover:bg-red-900/60'
              }`}
              onClick={cambiarVistaInactivos}
            >
              {vistaInactivos ? <Users size={18} /> : <Trash size={18} />}
              {vistaInactivos ? 'Ver Estudiantes Activos' : 'Ver Papelera (Inactivos)'}
            </button>

            <button
              type="button"
              onClick={descargarNominaExcel}
              disabled={downloadingExcel}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500 px-4 py-2.5 font-semibold text-emerald-300 transition hover:bg-emerald-950 disabled:cursor-wait disabled:opacity-50"
            >
              <FileSpreadsheet size={18} />
              {downloadingExcel ? 'Generando...' : 'Exportar Excel'}
            </button>
          </div>

          <div className="text-center sm:text-right">
            <h2 className="text-3xl font-bold text-yellow-400 mb-1">
              {vistaInactivos ? 'Papelera de Estudiantes' : 'Gestión de Estudiantes'}
            </h2>
            <p className="text-gray-400 text-sm">
              {vistaInactivos ? 'Alumnos inactivos en el sistema' : 'Alumnos registrados en el sistema'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
            <p className="text-xs uppercase text-gray-400 mb-1">
              {vistaInactivos ? 'Total en papelera' : 'Total estudiantes'}
            </p>
            <p className="text-2xl font-bold text-yellow-400">
              {estudiantes.length}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
            <p className="text-xs uppercase text-gray-400 mb-1">
              Resultados filtro
            </p>
            <p className="text-2xl font-bold text-white">
              {estudiantesFiltrados.length}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg flex items-center justify-center">
            {!vistaInactivos ? (
              <button
                type="button"
                onClick={() => openModal(1)}
                className="w-full bg-yellow-400 text-black font-bold py-2.5 px-4 rounded-lg hover:bg-yellow-300 transition flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Añadir estudiante
              </button>
            ) : (
              <div className="text-center text-gray-400 text-xs uppercase font-bold tracking-wider">
                Modo Papelera Activo
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6 shadow-lg">
          <label className="block text-sm font-bold mb-2 text-yellow-400">
            Buscar
          </label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400 transition"
              placeholder="Nombre, cédula, correo o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">
            {vistaInactivos ? 'Listado de inactivos' : 'Listado de estudiantes'}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead className="bg-gray-800 border-b border-gray-700 text-yellow-400 text-xs uppercase">
                <tr>
                  <th className="p-3">Estudiante</th>
                  <th className="p-3">Cédula</th>
                  <th className="p-3">Contacto</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estudiantesFiltrados.length > 0 ? (
                  estudiantesFiltrados.map((e) => (
                    <tr
                      key={e.ciestu}
                      className="border-b border-gray-700 hover:bg-gray-800/80 transition"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400 font-bold shrink-0">
                            {inicial(e)}
                          </div>
                          <div>
                            <p className="font-semibold text-white leading-tight">
                              {e.nombreestu} {e.apelliestu}
                            </p>
                            <p className="text-xs text-gray-500">Estudiante</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-sm text-gray-300">
                        {e.ciestu}
                      </td>
                      <td className="p-3">
                        <p className="text-sm text-gray-200">
                          {e.correoestu || '—'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {e.teleestu || '—'}
                        </p>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          {vistaInactivos ? (
                            <button
                              type="button"
                              title="Restaurar"
                              onClick={() =>
                                restaurarEstudiante(e.ciestu, `${e.nombreestu} ${e.apelliestu}`)
                              }
                              className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-500 transition flex items-center gap-1 text-xs font-bold"
                            >
                              <RotateCcw size={16} /> Restaurar
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                title="Editar"
                                onClick={() =>
                                  openModal(
                                    2,
                                    e.ciestu,
                                    e.nombreestu,
                                    e.apelliestu,
                                    e.teleestu,
                                    e.correoestu
                                  )
                                }
                                className="bg-yellow-400 text-black px-3 py-1.5 rounded-lg hover:bg-yellow-300 transition"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                type="button"
                                title="Eliminar"
                                onClick={() =>
                                  deleteEstudiante(e.ciestu, `${e.nombreestu} ${e.apelliestu}`)
                                }
                                className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-500 transition"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center p-10 text-gray-500">
                      {busqueda
                        ? 'No hay estudiantes que coincidan con la búsqueda.'
                        : vistaInactivos
                        ? 'No hay estudiantes en la papelera.'
                        : 'No hay estudiantes registrados.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg p-6 text-white relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-yellow-400">{title}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Completa los datos del estudiante
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white font-bold text-xl w-8 h-8 flex items-center justify-center rounded hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Cédula
                </label>
                <div className="flex gap-2">
                  <select
                    className="bg-gray-800 border border-gray-600 rounded-lg p-2.5 text-white font-bold cursor-pointer disabled:opacity-50 outline-none"
                    value={nacionalidad}
                    disabled={operation === 2}
                    onChange={(e) => setNacionalidad(e.target.value)}
                  >
                    <option value="V">V</option>
                    <option value="E">E</option>
                  </select>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white disabled:opacity-50 outline-none focus:border-yellow-400"
                    placeholder="Ej. 31124567"
                    value={ciestuNum}
                    disabled={operation === 2}
                    onChange={(e) =>
                      setCiestuNum(e.target.value.replace(/\D/g, ''))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-yellow-400">
                    Nombre
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                    placeholder="Nombre"
                    value={nombreestu}
                    onChange={(e) => setNombreestu(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-yellow-400">
                    Apellido
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                    placeholder="Apellido"
                    value={apelliestu}
                    onChange={(e) => setApelliestu(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Teléfono
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                  placeholder="Teléfono"
                  value={teleestu}
                  onChange={(e) =>
                    setTeleestu(e.target.value.replace(/\D/g, ''))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                  placeholder="correo@ejemplo.com"
                  value={correoestu}
                  onChange={(e) => setCorreoestu(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition flex items-center gap-2"
                >
                  <i className="fa-solid fa-xmark"></i> Cancelar
                </button>
                <button
                  type="button"
                  onClick={validar}
                  className="px-5 py-2.5 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition flex items-center gap-2"
                >
                  <i className="fa-solid fa-save"></i>
                  {operation === 1 ? 'Guardar' : 'Actualizar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrudEstudiantes;