import { CalendarRange, Lock, Unlock, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useCrudPeriodo } from '../use/useCrudPeriodo.js';

const CrudPeriodo = () => {
  const {
    periodos,
    cargando,
    procesando,
    form,
    setForm,
    cargar,
    crear,
    cerrar,
    abrir,
    eliminar,
  } = useCrudPeriodo();

  return (
    <div className="min-h-screen bg-black p-6 pt-28 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400 flex items-center gap-3">
              <CalendarRange size={28} /> Periodos académicos
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Cierra el periodo para bloquear cambios en notas, asistencias y plan de evaluación.
            </p>
          </div>
          <button
            type="button"
            onClick={cargar}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2 text-sm font-bold hover:bg-gray-700"
          >
            <RefreshCw size={16} /> Actualizar
          </button>
        </div>

        <form
          onSubmit={crear}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <input
            type="text"
            placeholder="Nombre (ej. 2026-I)"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={form.fecha_inicio}
            onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={form.fecha_fin}
            onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-300"
          >
            <Plus size={16} /> Crear periodo
          </button>
        </form>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-800 text-yellow-400 text-xs uppercase">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Nombre</th>
                <th className="p-3">Inicio</th>
                <th className="p-3">Fin</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Cargando…
                  </td>
                </tr>
              ) : periodos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No hay periodos. Crea el primero.
                  </td>
                </tr>
              ) : (
                periodos.map((p) => (
                  <tr key={p.id} className="border-t border-gray-800 hover:bg-gray-800/40">
                    <td className="p-3 font-mono text-gray-400">{p.id}</td>
                    <td className="p-3 font-semibold">{p.nombre}</td>
                    <td className="p-3">{p.fecha_inicio}</td>
                    <td className="p-3">{p.fecha_fin}</td>
                    <td className="p-3">
                      {p.cerrado ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 text-xs font-bold">
                          <Lock size={12} /> Cerrado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-xs font-bold">
                          <Unlock size={12} /> Abierto
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        {p.cerrado ? (
                          <button
                            type="button"
                            disabled={procesando === p.id}
                            onClick={() => abrir(p.id, p.nombre)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold hover:bg-emerald-500/30 disabled:opacity-50"
                          >
                            <Unlock size={14} /> Abrir
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={procesando === p.id}
                            onClick={() => cerrar(p.id, p.nombre)}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1.5 text-xs font-bold hover:bg-red-500/30 disabled:opacity-50"
                          >
                            <Lock size={14} /> Cerrar
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => eliminar(p.id, p.nombre)}
                          className="inline-flex items-center gap-1 rounded-lg bg-gray-800 text-gray-300 border border-gray-700 px-3 py-1.5 text-xs font-bold hover:bg-gray-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CrudPeriodo;