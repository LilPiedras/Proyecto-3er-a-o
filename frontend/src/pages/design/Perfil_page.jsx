import { FaUserEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { usePerfil } from '../use/usePerfil.js';

const Perfil = () => {
  const {
    perfil,
    loading,
    error,
    editandoCorreo,
    setEditandoCorreo,
    nuevoCorreo,
    setNuevoCorreo,
    mensajeCorreo,
    guardando,
    actualizarCorreo,
    cancelarEdicionCorreo,
    obtenerIniciales,
    obtenerNombreRol,
  } = usePerfil();

  return (
    <div className="min-h-[80vh] w-full bg-[#1c180e] flex justify-center items-center py-12 px-4">
      <div className="w-full max-w-xl bg-[#11141d] border border-[#2b2518] rounded-3xl shadow-2xl overflow-hidden relative">

        <div className="h-28 bg-[#181d28] border-b border-[#232936] relative flex items-end justify-center">
          <div className="absolute -bottom-8 w-20 h-20 rounded-2xl bg-[#0f121a] border-4 border-[#11141d] flex items-center justify-center shadow-lg">
            <span className="text-2xl font-black text-[#fbbf24] tracking-wider">
              {perfil ? obtenerIniciales(perfil.nombre || perfil.nombreusuario, perfil.apellido || perfil.apellusuario) : '...'}
            </span>
          </div>
        </div>

        <div className="pt-12 pb-8 px-8 text-center">
          {loading ? (
            <div className="py-10">
              <div className="inline-block w-7 h-7 border-3 border-[#fbbf24] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-gray-400 text-sm">Cargando perfil...</p>
            </div>
          ) : error ? (
            <p className="text-red-400 font-medium py-6 bg-red-950/20 rounded-xl border border-red-900/40">{error}</p>
          ) : (
                perfil && (
                  <div>
                    <h2 className="text-3xl font-bold text-gray-100 mb-1">
                      {perfil.nombre || perfil.nombreusuario}{" "}
                      {perfil.apellido || perfil.apellusuario}
                    </h2>

                    <div className="flex justify-center items-center gap-2 mb-6">
                      <span className="px-3 py-1 bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24] text-xs font-semibold rounded-full">
                        {obtenerNombreRol(
                          perfil.idrol ?? perfil.rol ?? localStorage.getItem("idrol")
                        )}
                      </span>
                      {perfil.activo_detalle !== undefined && (
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 ${
                            perfil.activo_detalle
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              perfil.activo_detalle ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                            }`}
                          ></span>
                          {perfil.activo_detalle ? "Activo" : "Inactivo"}
                        </span>
                      )}
                    </div>

                {mensajeCorreo.texto && (
                  <p className={`text-xs p-2.5 rounded-xl border mb-4 font-medium ${mensajeCorreo.tipo === 'exito' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' : 'bg-red-950/30 text-red-400 border-red-900/50'}`}>
                    {mensajeCorreo.texto}
                  </p>
                )}

                <div className="grid grid-cols-1 gap-2.5 text-left bg-[#161a25] border border-[#252c3d] rounded-2xl p-4">

                  <div className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#1c2230] transition-colors border-b border-[#202736]">
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Cédula / ID</span>
                    <span className="text-gray-200 font-medium text-sm">{perfil.cedula || perfil.ciuser}</span>
                  </div>

                  <div className="py-2 px-3 rounded-xl hover:bg-[#1c2230] transition-colors border-b border-[#202736]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Correo Electrónico</span>
                      {!editandoCorreo ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-200 font-medium text-sm">{perfil.correo || perfil.correousuario}</span>
                          <button
                            type="button"
                            onClick={() => setEditandoCorreo(true)}
                            className="text-[#fbbf24] hover:text-yellow-300 p-1 transition cursor-pointer"
                            title="Editar correo"
                          >
                            <FaUserEdit size={14} />
                          </button>
                        </div>
                      ) : null}
                    </div>

                    {editandoCorreo && (
                      <form onSubmit={actualizarCorreo} className="mt-3 flex gap-2">
                        <input
                          type="email"
                          value={nuevoCorreo}
                          onChange={(e) => setNuevoCorreo(e.target.value)}
                          className="w-full text-gray-200 border border-[#252c3d] rounded-lg p-2 bg-[#11141d] text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          placeholder="nuevo@correo.com"
                          required
                        />
                        <button
                          type="submit"
                          disabled={guardando}
                          className="px-3 py-2 bg-yellow-400 text-gray-900 font-bold rounded-lg text-xs hover:bg-yellow-500 transition cursor-pointer disabled:opacity-50 flex items-center gap-1"
                          title="Guardar"
                        >
                          <FaCheck size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={cancelarEdicionCorreo}
                          className="px-3 py-2 border border-gray-600 text-gray-300 font-semibold rounded-lg text-xs hover:bg-gray-800 transition cursor-pointer flex items-center gap-1"
                          title="Cancelar"
                        >
                          <FaTimes size={12} />
                        </button>
                      </form>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#1c2230] transition-colors border-b border-[#202736]">
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Teléfono</span>
                    <span className="text-gray-200 font-medium text-sm">{perfil.telefono || perfil.teleusuario || "No registrado"}</span>
                  </div>

                  {perfil.cargo && (
                    <div className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#1c2230] transition-colors border-b border-[#202736]">
                      <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Cargo</span>
                      <span className="text-[#fbbf24] font-medium text-sm">{perfil.cargo}</span>
                    </div>
                  )}

                  {perfil.fecha_contrato && (
                    <div className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#1c2230] transition-colors">
                      <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Fecha de Contrato</span>
                      <span className="text-gray-200 font-medium text-sm">{perfil.fecha_contrato}</span>
                    </div>
                  )}

                </div>
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
};

export default Perfil;