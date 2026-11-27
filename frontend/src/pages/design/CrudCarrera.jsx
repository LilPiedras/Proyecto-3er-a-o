import { Pencil, Trash2 } from 'lucide-react';
import { useCrudCarrera } from '../use/useCrudCarrera.js';

const CrudCarrera = () => {
  const {
    carreras,
    loading,
    busqueda,
    setBusqueda,
    nombrecarrera,
    setNombrecarrera,
    descripcion,
    setDescripcion,
    precioUsd,
    setPrecioUsd,
    operation,
    title,
    isModalOpen,
    carrerasFiltradas,
    openModal,
    closeModal,
    validar,
    deleteCarrera,
    inicial,
  } = useCrudCarrera();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p className="text-xl font-bold text-yellow-400">
          Cargando carreras...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-black text-white pt-24">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-yellow-400 mb-2 text-center">
          Gestión de Carreras
        </h2>
        <p className="text-center text-gray-400 text-sm mb-8">
          Programas académicos disponibles en el sistema
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
            <p className="text-xs uppercase text-gray-400 mb-1">
              Total carreras
            </p>
            <p className="text-2xl font-bold text-yellow-400">
              {carreras.length}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
            <p className="text-xs uppercase text-gray-400 mb-1">
              Resultados filtro
            </p>
            <p className="text-2xl font-bold text-white">
              {carrerasFiltradas.length}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg flex items-center justify-center">
            <button
              type="button"
              onClick={() => openModal(1)}
              className="w-full bg-yellow-400 text-black font-bold py-2.5 px-4 rounded-lg hover:bg-yellow-300 transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-circle-plus"></i>
              Añadir carrera
            </button>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6 shadow-lg">
          <label className="block text-sm font-bold mb-2 text-yellow-400">
            Buscar
          </label>
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400 transition"
              placeholder="Nombre, descripción o ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">
            Listado de carreras
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead className="bg-gray-800 border-b border-gray-700 text-yellow-400 text-xs uppercase">
                <tr>
                  <th className="p-3">Carrera</th>
                  <th className="p-3">Descripción</th>
                  <th className="p-3 text-right">Precio base (USD)</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {carrerasFiltradas.length > 0 ? (
                  carrerasFiltradas.map((c, index) => (
                    <tr
                      key={c.idcarrera || index}
                      className="border-b border-gray-700 hover:bg-gray-800/80 transition"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400 font-bold shrink-0">
                            {inicial(c)}
                          </div>
                          <div>
                            <p className="font-semibold text-white leading-tight">
                              {c.nombrecarrera}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {c.idcarrera}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-300 max-w-md">
                        <span className="line-clamp-2">
                          {c.descripcion || '—'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-semibold text-yellow-300">
                        ${Number(c.precio_usd || 0).toFixed(2)}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            title="Editar"
                            onClick={() =>
                              openModal(
                                2,
                                c.idcarrera,
                                c.nombrecarrera,
                                c.descripcion,
                                c.precio_usd
                              )
                            }
                            className="bg-yellow-400 text-black px-3 py-1.5 rounded-lg hover:bg-yellow-300 transition flex items-center justify-center"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            title="Eliminar"
                            onClick={() =>
                              deleteCarrera(c.idcarrera, c.nombrecarrera)
                            }
                            className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-500 transition flex items-center justify-center"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center p-10 text-gray-500">
                      {busqueda
                        ? 'No hay carreras que coincidan con la búsqueda.'
                        : 'No hay carreras registradas.'}
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
                  Completa los datos de la carrera
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-white font-bold text-xl w-8 h-8 flex items-center justify-center rounded hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Nombre de la carrera
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                  placeholder="Ej. Diseño de Modas"
                  value={nombrecarrera}
                  onChange={(e) => setNombrecarrera(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Descripción
                </label>
                <textarea
                  className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400 resize-none"
                  placeholder="Descripción de la carrera"
                  rows="4"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Precio base mensual (USD)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                  placeholder="Ej. 25.00"
                  value={precioUsd}
                  onChange={(e) => setPrecioUsd(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={validar}
                  className="px-5 py-2.5 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition"
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

export default CrudCarrera;