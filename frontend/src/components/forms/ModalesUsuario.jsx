import { FaShieldAlt, FaUserCheck, FaKey, FaUserTag, FaPlus, FaTrash } from "react-icons/fa"

const CATALOGO_ROLES = [
  { id: 1, nombre: "Director" },
  { id: 2, nombre: "SubDirector" },
  { id: 3, nombre: "Coordinador" },
  { id: 4, nombre: "Docente" },
  { id: 5, nombre: "Estudiante" }
]

export default function ModalesUsuario({ gestion }) {
  const {
    modalRolOpen, setModalRolOpen, cedulaRegistrada, tipoVinculoMsg,
    rolesSeleccionados, setRolesSeleccionados, loadingRol, errorRol, successRol, handleAsignarRol,

    modalPreguntaOpen, setModalPreguntaOpen, listaPreguntasCatalogo,
    idPreguntaSeleccionada, setIdPreguntaSeleccionada, respuestaSecreta, setRespuestaSecreta,
    loadingPregunta, errorPregunta, successPregunta, handleAsignarPregunta,

    modalModificar, setModalModificar, modalEliminar, setModalEliminar,

    cedulaGestion, setCedulaGestion, usuarioEncontrado, editForm, setEditForm,
    accionLoading, modalMsg, handleBuscarUsuario, handleActualizarUsuario, handleEliminarUsuario,

    rolesActualesUsuario, nuevoRolAAsignar, setNuevoRolAAsignar,
    loadingGestionRoles, handleAgregarRolExtra, handleEliminarRolUsuario
  } = gestion

  return (
    <>
      {modalRolOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md bg-[#11141d] border border-[#2b2518] rounded-2xl p-6 shadow-2xl relative">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-400/10 text-yellow-400 mb-2 border border-yellow-400/20">
                <FaShieldAlt size={22} />
              </div>
              <h3 className="text-xl font-bold text-gray-100">¡Usuario Registrado!</h3>
              <div className="mt-2 p-2.5 rounded-xl bg-[#161a25] border border-[#252c3d] text-xs">
                <p className="text-gray-400">Cédula: <span className="text-yellow-400 font-semibold">{cedulaRegistrada}</span></p>
                <p className="text-emerald-400 font-semibold mt-1 flex items-center justify-center gap-1">
                  <FaUserCheck size={14} /> Estado: {tipoVinculoMsg}
                </p>
              </div>
              <p className="text-gray-400 text-xs mt-3">Selecciona los roles que tendrá el usuario en el sistema.</p>
            </div>

            <form onSubmit={handleAsignarRol} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
                  Roles del Usuario (Puedes seleccionar varios)
                </label>
                <div className="flex flex-col gap-2.5 mt-1.5 bg-[#161a25] border border-[#252c3d] rounded-xl p-3.5">
                  {CATALOGO_ROLES.map((rol) => (
                    <label key={rol.id} className="flex items-center gap-3 text-sm text-gray-200 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        value={rol.id}
                        checked={rolesSeleccionados.includes(rol.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRolesSeleccionados([...rolesSeleccionados, rol.id])
                          } else if (rolesSeleccionados.length > 1) {
                            setRolesSeleccionados(rolesSeleccionados.filter((id) => id !== rol.id))
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-yellow-400 focus:ring-yellow-400 accent-yellow-400 cursor-pointer"
                      />
                      {rol.nombre}
                    </label>
                  ))}
                </div>
              </div>

              {errorRol && <p className="text-red-400 text-xs p-2.5 rounded-lg border bg-red-950/30 border-red-900/50">{errorRol}</p>}
              {successRol && <p className="text-emerald-400 text-xs p-2.5 rounded-lg border bg-emerald-950/30 border-emerald-900/50">{successRol}</p>}

              <div className="flex gap-3 mt-3">
                <button type="button" onClick={() => setModalRolOpen(false)} className="w-1/2 py-2.5 rounded-xl border border-gray-600 text-gray-300 font-semibold hover:bg-gray-800 transition text-sm cursor-pointer">
                  Omitir
                </button>
                <button type="submit" disabled={loadingRol} className="w-1/2 py-2.5 rounded-xl bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500 transition text-sm cursor-pointer disabled:opacity-50">
                  {loadingRol ? "Guardando..." : "Siguiente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalPreguntaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md bg-[#11141d] border border-[#2b2518] rounded-2xl p-6 shadow-2xl relative">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-400/10 text-yellow-400 mb-2 border border-yellow-400/20">
                <FaKey size={22} />
              </div>
              <h3 className="text-xl font-bold text-gray-100">Seguridad de la Cuenta</h3>
              <p className="text-gray-400 text-xs mt-1">Configura una pregunta secreta para recuperar la contraseña en caso de olvido.</p>
            </div>

            <form onSubmit={handleAsignarPregunta} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Selecciona una Pregunta</label>
                <select
                  value={idPreguntaSeleccionada}
                  onChange={(e) => setIdPreguntaSeleccionada(Number(e.target.value))}
                  className="text-gray-200 w-full border border-[#252c3d] rounded-xl p-3 mt-1.5 bg-[#161a25] focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                  required
                >
                  {listaPreguntasCatalogo.map((item) => (
                    <option key={item.idpregunta} value={item.idpregunta}>{item.preguntas}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Respuesta Secreta</label>
                <input
                  type="text"
                  placeholder="Escribe la respuesta"
                  value={respuestaSecreta}
                  onChange={(e) => setRespuestaSecreta(e.target.value)}
                  className="text-gray-200 w-full border border-[#252c3d] rounded-xl p-3 mt-1.5 bg-[#161a25] focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                  required
                />
              </div>

              {errorPregunta && <p className="text-red-400 text-xs p-2.5 rounded-lg border bg-red-950/30 border-red-900/50">{errorPregunta}</p>}
              {successPregunta && <p className="text-emerald-400 text-xs p-2.5 rounded-lg border bg-emerald-950/30 border-emerald-900/50">{successPregunta}</p>}

              <div className="flex gap-3 mt-3">
                <button type="button" onClick={() => setModalPreguntaOpen(false)} className="w-1/2 py-2.5 rounded-xl border border-gray-600 text-gray-300 font-semibold hover:bg-gray-800 transition text-sm cursor-pointer">
                  Omitir
                </button>
                <button type="submit" disabled={loadingPregunta} className="w-1/2 py-2.5 rounded-xl bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500 transition text-sm cursor-pointer disabled:opacity-50">
                  {loadingPregunta ? "Guardando..." : "Finalizar Registro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalModificar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg bg-[#11141d] border border-[#2b2518] rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-100 mb-2 text-center">Modificar Usuario y Roles</h3>
            <p className="text-gray-400 text-xs text-center mb-4">Ingresa la cédula para actualizar sus datos o agregar/quitar roles.</p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Ej: V-12345678"
                value={cedulaGestion}
                onChange={(e) => setCedulaGestion(e.target.value)}
                className="w-full text-gray-200 border border-[#252c3d] rounded-xl p-2.5 bg-[#161a25] text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button type="button" onClick={handleBuscarUsuario} disabled={accionLoading} className="px-4 py-2.5 bg-yellow-400 text-gray-900 font-bold rounded-xl text-sm hover:bg-yellow-500 cursor-pointer shrink-0">
                Buscar
              </button>
            </div>

            {modalMsg.texto && (
              <p className={`text-xs p-2.5 rounded-lg border mb-4 ${modalMsg.tipo === "exito" ? "bg-emerald-950/30 text-emerald-400 border-emerald-900/50" : "bg-red-950/30 text-red-400 border-red-900/50"}`}>
                {modalMsg.texto}
              </p>
            )}

            {usuarioEncontrado ? (
              <div className="flex flex-col gap-5">
                <div className="bg-[#161a25] border border-[#252c3d] rounded-xl p-4 shadow-inner">
                  <p className="text-xs font-bold uppercase text-yellow-400 mb-3 flex items-center gap-1.5">
                    <FaUserTag size={14} /> Roles Activos del Usuario
                  </p>

                  {loadingGestionRoles ? (
                    <p className="text-xs text-gray-400">Cargando roles...</p>
                  ) : rolesActualesUsuario.length > 0 ? (
                    <div className="flex flex-col gap-2 mb-3">
                      {rolesActualesUsuario.map((r) => {
                        const rolInfo = CATALOGO_ROLES.find((c) => c.id === r.idrol)
                        return (
                          <div key={r.ciuser_log} className="flex justify-between items-center bg-[#11141d] px-3.5 py-2 rounded-lg border border-gray-800 text-xs">
                            <span className="text-gray-200 font-semibold">{rolInfo ? rolInfo.nombre : `Rol #${r.idrol}`}</span>
                            <button type="button" onClick={() => handleEliminarRolUsuario(r.ciuser_log)} className="text-red-400 hover:text-red-300 p-1 cursor-pointer" title="Retirar este rol">
                              <FaTrash size={13} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 mb-3">El usuario no posee roles asignados actualmente.</p>
                  )}

                  <div className="flex gap-2 pt-3 border-t border-gray-800">
                    <select
                      value={nuevoRolAAsignar}
                      onChange={(e) => setNuevoRolAAsignar(Number(e.target.value))}
                      className="w-full text-gray-200 border border-[#252c3d] rounded-lg p-2.5 bg-[#11141d] text-xs focus:outline-none"
                    >
                      {CATALOGO_ROLES.map((r) => (
                        <option key={r.id} value={r.id}>{r.nombre}</option>
                      ))}
                    </select>
                    <button type="button" onClick={handleAgregarRolExtra} disabled={loadingGestionRoles} className="bg-yellow-400 text-gray-900 px-3.5 py-2.5 rounded-lg font-bold text-xs hover:bg-yellow-500 transition cursor-pointer flex items-center gap-1.5 shrink-0">
                      <FaPlus size={11} /> Añadir Rol
                    </button>
                  </div>
                </div>

                <form onSubmit={handleActualizarUsuario} className="flex flex-col gap-3 pt-2 border-t border-gray-800">
                  <p className="text-xs font-bold uppercase text-gray-400 mb-1">Datos Personales</p>
                  <div>
                    <label className="text-xs font-semibold uppercase text-gray-400">Nombre</label>
                    <input type="text" value={editForm.nombreusuario} onChange={(e) => setEditForm({ ...editForm, nombreusuario: e.target.value })} className="w-full text-gray-200 border border-[#252c3d] rounded-xl p-2.5 mt-1 bg-[#161a25] text-sm" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-gray-400">Apellido</label>
                    <input type="text" value={editForm.apellusuario} onChange={(e) => setEditForm({ ...editForm, apellusuario: e.target.value })} className="w-full text-gray-200 border border-[#252c3d] rounded-xl p-2.5 mt-1 bg-[#161a25] text-sm" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-gray-400">Correo Electrónico</label>
                    <input type="email" value={editForm.correousuario} onChange={(e) => setEditForm({ ...editForm, correousuario: e.target.value })} className="w-full text-gray-200 border border-[#252c3d] rounded-xl p-2.5 mt-1 bg-[#161a25] text-sm" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-gray-400">Teléfono</label>
                    <input type="text" value={editForm.teleusuario} onChange={(e) => setEditForm({ ...editForm, teleusuario: e.target.value })} className="w-full text-gray-200 border border-[#252c3d] rounded-xl p-2.5 mt-1 bg-[#161a25] text-sm" />
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button type="button" onClick={() => setModalModificar(false)} className="w-1/2 py-2.5 rounded-xl border border-gray-600 text-gray-300 font-semibold hover:bg-gray-800 transition text-sm cursor-pointer">
                      Cancelar
                    </button>
                    <button type="submit" disabled={accionLoading} className="w-1/2 py-2.5 rounded-xl bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500 transition text-sm cursor-pointer disabled:opacity-50">
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex justify-end mt-4">
                <button type="button" onClick={() => setModalModificar(false)} className="py-2 px-5 rounded-xl border border-gray-600 text-gray-300 font-semibold hover:bg-gray-800 transition text-sm cursor-pointer">
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {modalEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md bg-[#11141d] border border-[#2b2518] rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-red-400 mb-2 text-center">Eliminar Usuario</h3>
            <p className="text-gray-400 text-xs text-center mb-4">Ingresa la cédula del usuario que deseas eliminar.</p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Ej: V-12345678"
                value={cedulaGestion}
                onChange={(e) => setCedulaGestion(e.target.value)}
                className="w-full text-gray-200 border border-[#252c3d] rounded-xl p-2.5 bg-[#161a25] text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <button type="button" onClick={handleBuscarUsuario} disabled={accionLoading} className="px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl text-sm hover:bg-red-700 cursor-pointer">
                Buscar
              </button>
            </div>

            {modalMsg.texto && (
              <p className={`text-xs p-2.5 rounded-lg border mb-4 ${modalMsg.tipo === "exito" ? "bg-emerald-950/30 text-emerald-400 border-emerald-900/50" : "bg-red-950/30 text-red-400 border-red-900/50"}`}>
                {modalMsg.texto}
              </p>
            )}

            {usuarioEncontrado && (
              <div className="bg-[#161a25] border border-[#252c3d] rounded-xl p-3 mb-4 text-xs text-gray-300">
                <p><strong>Usuario:</strong> {usuarioEncontrado.nombreusuario} {usuarioEncontrado.apellusuario}</p>
                <p><strong>Cédula:</strong> {usuarioEncontrado.ciuser}</p>
                <p><strong>Correo:</strong> {usuarioEncontrado.correousuario}</p>
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={() => setModalEliminar(false)} className="w-1/2 py-2.5 rounded-xl border border-gray-600 text-gray-300 font-semibold hover:bg-gray-800 transition text-sm cursor-pointer">
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEliminarUsuario}
                disabled={!usuarioEncontrado || accionLoading}
                className={`w-1/2 py-2.5 rounded-xl font-bold transition text-sm ${usuarioEncontrado ? "bg-red-600 text-white hover:bg-red-700 cursor-pointer" : "bg-gray-700 text-gray-300 cursor-not-allowed opacity-50"}`}
              >
                Confirmar Baja
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}