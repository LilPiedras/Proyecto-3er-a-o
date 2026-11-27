import { Pencil, Trash2, Plus, Search, RotateCcw, Trash, Users } from 'lucide-react';
import { useCrudDocentes } from '../use/useCrudDocentes.js';

const CrudDocentes = () => {
  const {
    docentes,
    loading,
    busqueda,
    setBusqueda,
    vistaInactivos,
    cambiarVistaInactivos,
    nacionalidad,
    setNacionalidad,
    ciempleadoNum,
    setCiempleadoNum,
    nombre,
    setNombre,
    apellido,
    setApellido,
    telefono,
    setTelefono,
    correo,
    setCorreo,
    cargo,
    setCargo,
    fechacontra,
    setFechacontra,
    operation,
    title,
    isModalOpen,
    setIsModalOpen,
    puedeGestionar,
    puedeVer,
    docentesFiltrados,
    openModal,
    validar,
    deleteDocente,
    restaurarDocente,
    inicial,
  } = useCrudDocentes();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p className="text-xl font-bold text-yellow-400">Cargando docentes...</p>
      </div>
    );
  }

  if (!puedeVer) {
    return (
      <div className="p-6 min-h-screen bg-black text-white pt-24">
        <div className="container mx-auto max-w-4xl bg-gray-900 border border-gray-700 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">Acceso restringido</h2>
          <p className="text-gray-400">Tu rol actual no tiene permisos para consultar docentes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-black text-white pt-24">
      <div className="container mx-auto max-w-6xl">

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          {puedeGestionar ? (
            <button
              type="button"
              className={`font-bold px-4 py-2.5 rounded-lg transition border flex items-center gap-2 cursor-pointer ${
                vistaInactivos
                  ? 'bg-gray-800 text-yellow-400 border-yellow-400 hover:bg-gray-700'
                  : 'bg-red-900/40 text-red-400 border-red-700 hover:bg-red-900/60'
              }`}
              onClick={cambiarVistaInactivos}
            >
              {vistaInactivos ? <Users size={18} /> : <Trash size={18} />}
              {vistaInactivos ? 'Ver Docentes Activos' : 'Ver Papelera (Inactivos)'}
            </button>
          ) : (
            <div />
          )}

          <div className="text-center sm:text-right">
            <h2 className="text-3xl font-bold text-yellow-400 mb-1">
              {vistaInactivos && puedeGestionar ? 'Papelera de Docentes' : 'Gestión de Docentes'}
            </h2>
            <p className="text-gray-400 text-sm">
              {vistaInactivos && puedeGestionar
                ? 'Personal académico inactivo en el sistema'
                : puedeGestionar
                ? 'Personal académico registrado en el sistema'
                : 'Consulta de personal académico registrado en el sistema (solo lectura)'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
            <p className="text-xs uppercase text-gray-400 mb-1">
              {vistaInactivos && puedeGestionar ? 'Total en papelera' : 'Total docentes'}
            </p>
            <p className="text-2xl font-bold text-yellow-400">{docentes.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
            <p className="text-xs uppercase text-gray-400 mb-1">Resultados filtro</p>
            <p className="text-2xl font-bold text-white">{docentesFiltrados.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg flex items-center justify-center">
            {puedeGestionar ? (
              !vistaInactivos ? (
                <button
                  type="button"
                  onClick={() => openModal(1)}
                  className="w-full bg-yellow-400 text-black font-bold py-2.5 px-4 rounded-lg hover:bg-yellow-300 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={18} />
                  Añadir docente
                </button>
              ) : (
                <div className="text-center text-gray-400 text-xs uppercase font-bold tracking-wider">
                  Modo Papelera Activo
                </div>
              )
            ) : (
              <p className="text-center text-sm text-gray-400">
                Solo consulta: no puedes añadir ni modificar.
              </p>
            )}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6 shadow-lg">
          <label className="block text-sm font-bold mb-2 text-yellow-400">
            Buscar
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400 transition"
              placeholder="Nombre, cédula, correo o cargo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">
            {vistaInactivos && puedeGestionar ? 'Listado de inactivos' : 'Listado de docentes'}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead className="bg-gray-800 border-b border-gray-700 text-yellow-400 text-xs uppercase">
                <tr>
                  <th className="p-3">Docente</th>
                  <th className="p-3">Cédula</th>
                  <th className="p-3">Contacto</th>
                  <th className="p-3">Cargo</th>
                  <th className="p-3">Contratación</th>
                  {puedeGestionar && <th className="p-3 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {docentesFiltrados.length > 0 ? (
                  docentesFiltrados.map((d) => {
                    const nom = d.nombreempleado || d.nombre || '';
                    const ape = d.apellidoempleado || d.apellido || '';
                    const tel = d.telefempleado || d.telefono || '—';
                    const mail = d.correoempleado || d.correo || '—';
                    const fecha = d.fechacontra
                      ? String(d.fechacontra).split('T')[0]
                      : '—';

                    return (
                      <tr
                        key={d.ciempleado}
                        className="border-b border-gray-700 hover:bg-gray-800/80 transition"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400 font-bold shrink-0">
                              {inicial(d)}
                            </div>
                            <div>
                              <p className="font-semibold text-white leading-tight">
                                {nom} {ape}
                              </p>
                              <p className="text-xs text-gray-500">Personal</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-sm text-gray-300">
                          {d.ciempleado}
                        </td>
                        <td className="p-3">
                          <p className="text-sm text-gray-200">{mail}</p>
                          <p className="text-xs text-gray-500">{tel}</p>
                        </td>
                        <td className="p-3">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-800 border border-gray-600 text-yellow-300">
                            {d.cargo || '—'}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-300">{fecha}</td>
                        {puedeGestionar && (
                          <td className="p-3">
                            <div className="flex justify-end gap-2">
                              {vistaInactivos ? (
                                <button
                                  type="button"
                                  title="Restaurar"
                                  onClick={() =>
                                    restaurarDocente(d.ciempleado, `${nom} ${ape}`)
                                  }
                                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-500 transition flex items-center gap-1 text-xs font-bold cursor-pointer"
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
                                        d.ciempleado,
                                        nom,
                                        ape,
                                        d.telefempleado || d.telefono,
                                        d.correoempleado || d.correo,
                                        d.cargo,
                                        d.fechacontra
                                      )
                                    }
                                    className="bg-yellow-400 text-black p-2 rounded-lg hover:bg-yellow-300 transition cursor-pointer flex items-center justify-center"
                                  >
                                    <Pencil size={16} />
                                  </button>

                                  <button
                                    type="button"
                                    title="Eliminar"
                                    onClick={() => deleteDocente(d.ciempleado, nom)}
                                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-500 transition cursor-pointer flex items-center justify-center"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={puedeGestionar ? 6 : 5} className="text-center p-10 text-gray-500">
                      {busqueda
                        ? 'No hay docentes que coincidan con la búsqueda.'
                        : vistaInactivos && puedeGestionar
                        ? 'No hay docentes en la papelera.'
                        : 'No hay docentes registrados.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && puedeGestionar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg p-6 text-white relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-yellow-400">{title}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Completa los datos del personal
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white font-bold text-xl w-8 h-8 flex items-center justify-center rounded hover:bg-gray-800 cursor-pointer"
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
                    value={ciempleadoNum}
                    disabled={operation === 2}
                    onChange={(e) =>
                      setCiempleadoNum(e.target.value.replace(/\D/g, ''))
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
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
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
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-yellow-400">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                    placeholder="Teléfono"
                    value={telefono}
                    onChange={(e) =>
                      setTelefono(e.target.value.replace(/\D/g, ''))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-yellow-400">
                    Cargo
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                    placeholder="Ej. Docente"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                  placeholder="correo@ejemplo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Fecha de contratación
                </label>
                <input
                  type="date"
                  className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                  value={fechacontra}
                  onChange={(e) => setFechacontra(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={validar}
                  className="px-5 py-2.5 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition cursor-pointer"
                >
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

export default CrudDocentes;