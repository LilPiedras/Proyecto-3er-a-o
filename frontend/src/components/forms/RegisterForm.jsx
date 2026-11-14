import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaShieldAlt, FaUserEdit, FaUserTimes, FaUserCheck, FaKey, FaUserTag, FaPlus, FaTrash } from "react-icons/fa"
import api from "../../api"

export default function RegisterForm() {
  const navigate = useNavigate()
  
  // Estados para el Registro del Usuario (Paso 1)
  const [name, setName] = useState("")
  const [lastname, setLastName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [nationality, setNationality] = useState("V")
  const [dni, setDni] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  // Estados para el Modal de Asignación de Rol Inicial (Paso 2)
  const [modalRolOpen, setModalRolOpen] = useState(false)
  const [cedulaRegistrada, setCedulaRegistrada] = useState("")
  const [rolesSeleccionados, setRolesSeleccionados] = useState([5])
  const [tipoVinculoMsg, setTipoVinculoMsg] = useState("")
  const [loadingRol, setLoadingRol] = useState(false)
  const [errorRol, setErrorRol] = useState("")
  const [successRol, setSuccessRol] = useState("")

  // Estados para el Modal de Pregunta de Seguridad (Paso 3)
  const [modalPreguntaOpen, setModalPreguntaOpen] = useState(false)
  const [listaPreguntasCatalogo, setListaPreguntasCatalogo] = useState([])
  const [idPreguntaSeleccionada, setIdPreguntaSeleccionada] = useState(1)
  const [respuestaSecreta, setRespuestaSecreta] = useState("")
  const [loadingPregunta, setLoadingPregunta] = useState(false)
  const [errorPregunta, setErrorPregunta] = useState("")
  const [successPregunta, setSuccessPregunta] = useState("")

  // Estados para Modificar y Eliminar Usuarios
  const [modalModificar, setModalModificar] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(false)
  const [cedulaGestion, setCedulaGestion] = useState("")
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null)
  const [editForm, setEditForm] = useState({
    nombreusuario: "",
    apellusuario: "",
    correousuario: "",
    teleusuario: "",
  })
  const [accionLoading, setAccionLoading] = useState(false)
  const [modalMsg, setModalMsg] = useState({ tipo: "", texto: "" })

  // ESTADOS PARA LA GESTIÓN DE ROLES EXTRA
  const [rolesActualesUsuario, setRolesActualesUsuario] = useState([])
  const [nuevoRolAAsignar, setNuevoRolAAsignar] = useState(5)
  const [loadingGestionRoles, setLoadingGestionRoles] = useState(false)

  const catalogoRoles = [
    { id: 1, nombre: "Director" },
    { id: 2, nombre: "SubDirector" },
    { id: 3, nombre: "Coordinador" },
    { id: 4, nombre: "Docente" },
    { id: 5, nombre: "Estudiante" }
  ]

  // Cargar lista de roles de un usuario desde /usuario_login/usuario/{ciuser}
  const cargarRolesUsuario = async (ciuser) => {
    setLoadingGestionRoles(true)
    try {
      const { data } = await api.get(`/usuario_login/usuario/${encodeURIComponent(ciuser)}`)
      setRolesActualesUsuario(Array.isArray(data) ? data : [])
    } catch (err) {
      setRolesActualesUsuario([])
    } finally {
      setLoadingGestionRoles(false)
    }
  }

  // Agregar un Rol Extra a un usuario existente
  const handleAgregarRolExtra = async () => {
    if (!usuarioEncontrado) return
    setModalMsg({ tipo: "", texto: "" })
    setLoadingGestionRoles(true)

    try {
      await api.post('/usuario_login/', {
        ciuser: usuarioEncontrado.ciuser,
        idrol: Number(nuevoRolAAsignar)
      })

      setModalMsg({ tipo: "exito", texto: "¡Nuevo rol asignado con éxito!" })
      await cargarRolesUsuario(usuarioEncontrado.ciuser)
    } catch (err) {
      const detail = err.response?.data?.detail
      setModalMsg({ tipo: "error", texto: typeof detail === 'string' ? detail : "Error al asignar el nuevo rol" })
    } finally {
      setLoadingGestionRoles(false)
    }
  }

  // Eliminar/Desactivar un Rol de un usuario existente
  const handleEliminarRolUsuario = async (ciuser_log) => {
    setModalMsg({ tipo: "", texto: "" })
    setLoadingGestionRoles(true)

    try {
      await api.delete(`/usuario_login/${ciuser_log}`)
      setModalMsg({ tipo: "exito", texto: "Rol retirado del usuario." })
      await cargarRolesUsuario(usuarioEncontrado.ciuser)
    } catch (err) {
      const detail = err.response?.data?.detail
      setModalMsg({ tipo: "error", texto: typeof detail === 'string' ? detail : "No se pudo retirar el rol" })
    } finally {
      setLoadingGestionRoles(false)
    }
  }

  // Registro inicial del usuario (Paso 1)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMsg("")
    setLoading(true)

    const formattedDni = `${nationality}-${dni.trim()}`

    try {
      let vinculadoEstudiante = null
      let vinculadoEmpleado = null
      let mensajeVinculo = "Usuario Registrado"
      let rolSugerido = 5

      try {
        const resEstu = await api.get('/estudiantes/')
        const listaEstud = Array.isArray(resEstu.data) ? resEstu.data : []
        if (listaEstud.some(est => est.ciestu === formattedDni)) {
          vinculadoEstudiante = formattedDni
          mensajeVinculo = "Estudiante Verificado"
          rolSugerido = 5
        }
      } catch (err) {
        console.warn("Error consultando estudiantes:", err)
      }

      try {
        const resEmp = await api.get('/empleado/')
        const listaEmp = Array.isArray(resEmp.data) ? resEmp.data : []
        if (listaEmp.some(emp => emp.ciempleado === formattedDni)) {
          vinculadoEmpleado = formattedDni
          mensajeVinculo = "Empleado / Docente Verificado"
          rolSugerido = 4
        }
      } catch (err) {
        console.warn("Error consultando empleados:", err)
      }

      const payload = {
        ciuser: formattedDni,
        nombreusuario: name.trim(),
        apellusuario: lastname.trim(),
        contrase: password,
        correousuario: email.trim(),
        teleusuario: phoneNumber.trim() || null,
        estudiante: vinculadoEstudiante,
        empleado: vinculadoEmpleado
      }

      await api.post('/usuario/', payload)

      setCedulaRegistrada(formattedDni)
      setTipoVinculoMsg(mensajeVinculo)
      setRolesSeleccionados([rolSugerido])
      setSuccessMsg(`¡Usuario registrado! Detectado como: ${mensajeVinculo}`)
      setModalRolOpen(true)

    } catch (err) {
      console.error(err)
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : "Error al registrar usuario")
    } finally {
      setLoading(false)
    }
  }

  // Asignar roles iniciales (Paso 2)
  const handleAsignarRol = async (e) => {
    e.preventDefault()
    setErrorRol("")
    setSuccessRol("")
    setLoadingRol(true)

    try {
      for (const idrol of rolesSeleccionados) {
        await api.post('/usuario_login/', {
          ciuser: cedulaRegistrada,
          idrol: Number(idrol)
        })
      }

      setSuccessRol("¡Roles vinculados correctamente!")

      try {
        const { data } = await api.get('/PreguntasSeguridad/')
        if (Array.isArray(data) && data.length > 0) {
          setListaPreguntasCatalogo(data)
          setIdPreguntaSeleccionada(data[0].idpregunta)
        }
      } catch (err) {
        console.warn("Error cargando preguntas:", err)
      }

      setTimeout(() => {
        setModalRolOpen(false)
        setSuccessRol("")
        setRespuestaSecreta("")
        setModalPreguntaOpen(true)
      }, 1000)

    } catch (err) {
      const detail = err.response?.data?.detail
      setErrorRol(typeof detail === 'string' ? detail : "Error al asignar los roles.")
    } finally {
      setLoadingRol(false)
    }
  }

  // Pregunta de seguridad (Paso 3)
  const handleAsignarPregunta = async (e) => {
    e.preventDefault()
    setErrorPregunta("")
    setSuccessPregunta("")
    setLoadingPregunta(true)

    try {
      await api.post('/PreguntasSeguridad/asignar', {
        ciuser: cedulaRegistrada,
        idpregunta: Number(idPreguntaSeleccionada),
        respuesta: respuestaSecreta.trim()
      })

      setSuccessPregunta("¡Pregunta de seguridad configurada con éxito!")

      setTimeout(() => {
        setModalPreguntaOpen(false)
        setSuccessMsg("")
        setSuccessPregunta("")
        setName("")
        setLastName("")
        setPhoneNumber("")
        setEmail("")
        setDni("")
        setPassword("")
        setRolesSeleccionados([5])
      }, 1500)

    } catch (err) {
      const detail = err.response?.data?.detail
      setErrorPregunta(typeof detail === 'string' ? detail : "Error al guardar la pregunta de seguridad.")
    } finally {
      setLoadingPregunta(false)
    }
  }

  // Buscar usuario
  const handleBuscarUsuario = async () => {
    setModalMsg({ tipo: "", texto: "" })
    const cedulaLimpia = cedulaGestion.trim()
    if (!cedulaLimpia) {
      setModalMsg({ tipo: "error", texto: "Ingresa una cédula válida." })
      return
    }

    setAccionLoading(true)
    try {
      const { data } = await api.get(`/usuario/${encodeURIComponent(cedulaLimpia)}`)
      setUsuarioEncontrado(data)
      setEditForm({
        nombreusuario: data.nombreusuario || "",
        apellusuario: data.apellusuario || "",
        correousuario: data.correousuario || "",
        teleusuario: data.teleusuario || "",
      })
      setModalMsg({ tipo: "exito", texto: "¡Usuario encontrado!" })

      // Cargar también sus roles actuales
      await cargarRolesUsuario(data.ciuser)

    } catch (err) {
      setUsuarioEncontrado(null)
      const detail = err.response?.data?.detail
      setModalMsg({ tipo: "error", texto: typeof detail === 'string' ? detail : "Usuario no encontrado." })
    } finally {
      setAccionLoading(false)
    }
  }

  // Guardar Modificación de Usuario (PATCH)
  const handleActualizarUsuario = async (e) => {
    e.preventDefault()
    if (!usuarioEncontrado) return
    setAccionLoading(true)
    setModalMsg({ tipo: "", texto: "" })

    try {
      await api.patch(`/usuario/${encodeURIComponent(usuarioEncontrado.ciuser)}`, editForm)
      setModalMsg({ tipo: "exito", texto: "¡Usuario modificado con éxito!" })
      setTimeout(() => {
        setModalModificar(false)
        setUsuarioEncontrado(null)
        setCedulaGestion("")
      }, 1500)
    } catch (err) {
      const detail = err.response?.data?.detail
      setModalMsg({ tipo: "error", texto: typeof detail === 'string' ? detail : "Error al actualizar" })
    } finally {
      setAccionLoading(false)
    }
  }

  // Eliminar usuario
  const handleEliminarUsuario = async () => {
    if (!usuarioEncontrado) return
    setAccionLoading(true)
    setModalMsg({ tipo: "", texto: "" })

    try {
      await api.delete(`/usuario/${encodeURIComponent(usuarioEncontrado.ciuser)}`)
      setModalMsg({ tipo: "exito", texto: "¡Usuario eliminado lógicamente con éxito!" })
      setTimeout(() => {
        setModalEliminar(false)
        setUsuarioEncontrado(null)
        setCedulaGestion("")
      }, 1500)
    } catch (err) {
      const detail = err.response?.data?.detail
      setModalMsg({ tipo: "error", texto: typeof detail === 'string' ? detail : "Error al eliminar" })
    } finally {
      setAccionLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] w-full bg-[#1c180e] flex justify-center items-center py-12 px-4 relative">
      <div className="w-full max-w-xl bg-[#11141d] border border-[#2b2518] rounded-3xl shadow-2xl overflow-hidden p-8">
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-100">REGISTRO DE USUARIOS</h1>
          <p className="text-gray-400 mt-2 text-sm">Panel administrativo para dar de alta cuentas en el sistema.</p>
        </div>

        {/* Botones de gestión */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => { setUsuarioEncontrado(null); setCedulaGestion(""); setModalMsg({tipo:"", texto:""}); setModalModificar(true); }}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#181d28] border border-[#232936] text-[#fbbf24] hover:bg-[#202736] transition-all text-xs font-semibold cursor-pointer shadow-md"
          >
            <FaUserEdit size={14} /> Modificar Usuario / Roles
          </button>
          <button
            type="button"
            onClick={() => { setUsuarioEncontrado(null); setCedulaGestion(""); setModalMsg({tipo:"", texto:""}); setModalEliminar(true); }}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#181d28] border border-[#232936] text-red-400 hover:bg-red-950/30 hover:border-red-900/50 transition-all text-xs font-semibold cursor-pointer shadow-md"
          >
            <FaUserTimes size={14} /> Eliminar Usuario
          </button>
        </div>

        {/* Formulario de Registro Principal (Paso 1) */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="name" className="text-sm font-semibold uppercase tracking-wider text-gray-400">Nombres</label>
            <input
              id="name"
              type="text"
              className="text-gray-200 w-full border border-[#252c3d] rounded-xl p-3 mt-1.5 bg-[#161a25] focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              placeholder="Ingresa el nombre"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="lastname" className="text-sm font-semibold uppercase tracking-wider text-gray-400">Apellidos</label>
            <input
              id="lastname"
              type="text"
              className="text-gray-200 w-full border border-[#252c3d] rounded-xl p-3 mt-1.5 bg-[#161a25] focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              placeholder="Ingresa el apellido"
              required
              value={lastname}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="text-sm font-semibold uppercase tracking-wider text-gray-400">Número de Teléfono</label>
            <input
              id="phoneNumber"
              type="text"
              className="text-gray-200 w-full border border-[#252c3d] rounded-xl p-3 mt-1.5 bg-[#161a25] focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              placeholder="Ingresa el teléfono"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-semibold uppercase tracking-wider text-gray-400">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              className="text-gray-200 w-full border border-[#252c3d] rounded-xl p-3 mt-1.5 bg-[#161a25] focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              placeholder="Ingresa el correo"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="dni" className="text-sm font-semibold uppercase tracking-wider text-gray-400">Número de Cédula</label>
            <div className="flex gap-2 mt-1.5">
              <select
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="text-gray-200 border border-[#252c3d] rounded-xl p-3 bg-[#161a25] focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all font-semibold"
              >
                <option value="V">V-</option>
                <option value="E">E-</option>
              </select>
              <input
                id="dni"
                type="text"
                className="text-gray-200 w-full border border-[#252c3d] rounded-xl p-3 bg-[#161a25] focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                placeholder="12345678"
                required
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-semibold uppercase tracking-wider text-gray-400">Contraseña</label>
            <div className="relative mt-1.5">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="text-gray-200 w-full border border-[#252c3d] rounded-xl p-3 pr-20 bg-[#161a25] focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                placeholder="Crea una contraseña"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute inset-y-0 right-4 font-semibold text-yellow-400 hover:text-yellow-300 text-sm"
              >
                {showPassword ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm font-medium bg-red-950/30 p-3 rounded-xl border border-red-900/50">{error}</p>
          )}

          {successMsg && (
            <p className="text-emerald-400 text-sm font-medium bg-emerald-950/30 p-3 rounded-xl border border-emerald-900/50">{successMsg}</p>
          )}

          <div className="flex flex-col gap-4 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-yellow-400 text-gray-900 text-base font-bold hover:bg-yellow-500 transition-all shadow-lg cursor-pointer disabled:opacity-50"
            >
              {loading ? "Verificando y Registrando..." : "Registrar Usuario"}
            </button>
          </div>
        </form>
      </div>

      {/* VENTANA MODAL 1: ASIGNAR ROL INICIAL (PASO 2 MULTIPLE) */}
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

              <p className="text-gray-400 text-xs mt-3">
                Selecciona los roles que tendrá el usuario en el sistema.
              </p>
            </div>

            <form onSubmit={handleAsignarRol} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
                  Roles del Usuario (Puedes seleccionar varios)
                </label>
                <div className="flex flex-col gap-2.5 mt-1.5 bg-[#161a25] border border-[#252c3d] rounded-xl p-3.5">
                  {catalogoRoles.map((rol) => {
                    const isChecked = rolesSeleccionados.includes(rol.id)
                    return (
                      <label key={rol.id} className="flex items-center gap-3 text-sm text-gray-200 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          value={rol.id}
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRolesSeleccionados([...rolesSeleccionados, rol.id])
                            } else {
                              if (rolesSeleccionados.length > 1) {
                                setRolesSeleccionados(rolesSeleccionados.filter(id => id !== rol.id))
                              }
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-yellow-400 focus:ring-yellow-400 accent-yellow-400 cursor-pointer"
                        />
                        {rol.nombre}
                      </label>
                    )
                  })}
                </div>
              </div>

              {errorRol && (
                <p className="text-red-400 text-xs p-2.5 rounded-lg border bg-red-950/30 border-red-900/50">{errorRol}</p>
              )}

              {successRol && (
                <p className="text-emerald-400 text-xs p-2.5 rounded-lg border bg-emerald-950/30 border-emerald-900/50">{successRol}</p>
              )}

              <div className="flex gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setModalRolOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-gray-600 text-gray-300 font-semibold hover:bg-gray-800 transition text-sm cursor-pointer"
                >
                  Omitir
                </button>
                <button
                  type="submit"
                  disabled={loadingRol}
                  className="w-1/2 py-2.5 rounded-xl bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500 transition text-sm cursor-pointer disabled:opacity-50"
                >
                  {loadingRol ? "Guardando..." : "Siguiente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VENTANA MODAL 2: CONFIGURAR PREGUNTA DE SEGURIDAD (PASO 3) */}
      {modalPreguntaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md bg-[#11141d] border border-[#2b2518] rounded-2xl p-6 shadow-2xl relative">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-400/10 text-yellow-400 mb-2 border border-yellow-400/20">
                <FaKey size={22} />
              </div>
              <h3 className="text-xl font-bold text-gray-100">Seguridad de la Cuenta</h3>
              <p className="text-gray-400 text-xs mt-1">
                Configura una pregunta secreta para que el usuario pueda recuperar su contraseña en caso de olvido.
              </p>
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
                    <option key={item.idpregunta} value={item.idpregunta}>
                      {item.preguntas}
                    </option>
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

              {errorPregunta && (
                <p className="text-red-400 text-xs p-2.5 rounded-lg border bg-red-950/30 border-red-900/50">{errorPregunta}</p>
              )}

              {successPregunta && (
                <p className="text-emerald-400 text-xs p-2.5 rounded-lg border bg-emerald-950/30 border-emerald-900/50">{successPregunta}</p>
              )}

              <div className="flex gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setModalPreguntaOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-gray-600 text-gray-300 font-semibold hover:bg-gray-800 transition text-sm cursor-pointer"
                >
                  Omitir
                </button>
                <button
                  type="submit"
                  disabled={loadingPregunta}
                  className="w-1/2 py-2.5 rounded-xl bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500 transition text-sm cursor-pointer disabled:opacity-50"
                >
                  {loadingPregunta ? "Guardando..." : "Finalizar Registro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MODIFICAR USUARIO Y ROLES EXTRA */}
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
              <button
                type="button"
                onClick={handleBuscarUsuario}
                disabled={accionLoading}
                className="px-4 py-2.5 bg-yellow-400 text-gray-900 font-bold rounded-xl text-sm hover:bg-yellow-500 cursor-pointer shrink-0"
              >
                Buscar
              </button>
            </div>

            {modalMsg.texto && (
              <p className={`text-xs p-2.5 rounded-lg border mb-4 ${modalMsg.tipo === 'exito' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' : 'bg-red-950/30 text-red-400 border-red-900/50'}`}>
                {modalMsg.texto}
              </p>
            )}

            {usuarioEncontrado && (
              <div className="flex flex-col gap-5">
                
                {/* 1. SECCIÓN PRINCIPAL: GESTIÓN DE ROLES (APARECE DE PRIMERO) */}
                <div className="bg-[#161a25] border border-[#252c3d] rounded-xl p-4 shadow-inner">
                  <p className="text-xs font-bold uppercase text-yellow-400 mb-3 flex items-center gap-1.5">
                    <FaUserTag size={14} /> Roles Activos del Usuario
                  </p>

                  {loadingGestionRoles ? (
                    <p className="text-xs text-gray-400">Cargando roles...</p>
                  ) : rolesActualesUsuario.length > 0 ? (
                    <div className="flex flex-col gap-2 mb-3">
                      {rolesActualesUsuario.map((r) => {
                        const rolInfo = catalogoRoles.find(c => c.id === r.idrol)
                        return (
                          <div key={r.ciuser_log} className="flex justify-between items-center bg-[#11141d] px-3.5 py-2 rounded-lg border border-gray-800 text-xs">
                            <span className="text-gray-200 font-semibold">{rolInfo ? rolInfo.nombre : `Rol #${r.idrol}`}</span>
                            <button
                              type="button"
                              onClick={() => handleEliminarRolUsuario(r.ciuser_log)}
                              className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                              title="Retirar este rol"
                            >
                              <FaTrash size={13} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 mb-3">El usuario no posee roles asignados actualmente.</p>
                  )}

                  {/* FORMULARIO PARA AÑADIR UN ROL EXTRA */}
                  <div className="flex gap-2 pt-3 border-t border-gray-800">
                    <select
                      value={nuevoRolAAsignar}
                      onChange={(e) => setNuevoRolAAsignar(Number(e.target.value))}
                      className="w-full text-gray-200 border border-[#252c3d] rounded-lg p-2.5 bg-[#11141d] text-xs focus:outline-none"
                    >
                      {catalogoRoles.map(r => (
                        <option key={r.id} value={r.id}>{r.nombre}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAgregarRolExtra}
                      disabled={loadingGestionRoles}
                      className="bg-yellow-400 text-gray-900 px-3.5 py-2.5 rounded-lg font-bold text-xs hover:bg-yellow-500 transition cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <FaPlus size={11} /> Añadir Rol
                    </button>
                  </div>
                </div>

                {/* 2. FORMULARIO DE DATOS PERSONALES DEL USUARIO */}
                <form onSubmit={handleActualizarUsuario} className="flex flex-col gap-3 pt-2 border-t border-gray-800">
                  <p className="text-xs font-bold uppercase text-gray-400 mb-1">Datos Personales</p>
                  
                  <div>
                    <label className="text-xs font-semibold uppercase text-gray-400">Nombre</label>
                    <input
                      type="text"
                      value={editForm.nombreusuario}
                      onChange={(e) => setEditForm({ ...editForm, nombreusuario: e.target.value })}
                      className="w-full text-gray-200 border border-[#252c3d] rounded-xl p-2.5 mt-1 bg-[#161a25] text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-gray-400">Apellido</label>
                    <input
                      type="text"
                      value={editForm.apellusuario}
                      onChange={(e) => setEditForm({ ...editForm, apellusuario: e.target.value })}
                      className="w-full text-gray-200 border border-[#252c3d] rounded-xl p-2.5 mt-1 bg-[#161a25] text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-gray-400">Correo Electrónico</label>
                    <input
                      type="email"
                      value={editForm.correousuario}
                      onChange={(e) => setEditForm({ ...editForm, correousuario: e.target.value })}
                      className="w-full text-gray-200 border border-[#252c3d] rounded-xl p-2.5 mt-1 bg-[#161a25] text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-gray-400">Teléfono</label>
                    <input
                      type="text"
                      value={editForm.teleusuario}
                      onChange={(e) => setEditForm({ ...editForm, teleusuario: e.target.value })}
                      className="w-full text-gray-200 border border-[#252c3d] rounded-xl p-2.5 mt-1 bg-[#161a25] text-sm"
                    />
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setModalModificar(false)}
                      className="w-1/2 py-2.5 rounded-xl border border-gray-600 text-gray-300 font-semibold hover:bg-gray-800 transition text-sm cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={accionLoading}
                      className="w-1/2 py-2.5 rounded-xl bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500 transition text-sm cursor-pointer disabled:opacity-50"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            )}

            {!usuarioEncontrado && (
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setModalModificar(false)}
                  className="py-2 px-5 rounded-xl border border-gray-600 text-gray-300 font-semibold hover:bg-gray-800 transition text-sm cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ELIMINAR USUARIO */}
      {modalEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md bg-[#11141d] border border-[#2b2518] rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-red-400 mb-2 text-center">Eliminar Usuario</h3>
            <p className="text-gray-400 text-xs text-center mb-4">Ingresa la cédula del usuario que deseas desactivar del sistema.</p>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Ej: V-12345678"
                value={cedulaGestion}
                onChange={(e) => setCedulaGestion(e.target.value)}
                className="w-full text-gray-200 border border-[#252c3d] rounded-xl p-2.5 bg-[#161a25] text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <button
                type="button"
                onClick={handleBuscarUsuario}
                disabled={accionLoading}
                className="px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl text-sm hover:bg-red-700 cursor-pointer"
              >
                Buscar
              </button>
            </div>

            {modalMsg.texto && (
              <p className={`text-xs p-2.5 rounded-lg border mb-4 ${modalMsg.tipo === 'exito' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' : 'bg-red-950/30 text-red-400 border-red-900/50'}`}>
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
              <button
                type="button"
                onClick={() => setModalEliminar(false)}
                className="w-1/2 py-2.5 rounded-xl border border-gray-600 text-gray-300 font-semibold hover:bg-gray-800 transition text-sm cursor-pointer"
              >
                Cancelar
              </button>
              {usuarioEncontrado ? (
                <button
                  type="button"
                  onClick={handleEliminarUsuario}
                  disabled={accionLoading}
                  className="w-1/2 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition text-sm cursor-pointer disabled:opacity-50"
                >
                  Confirmar Baja
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setModalEliminar(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-gray-700 text-gray-300 font-bold text-sm cursor-not-allowed opacity-50"
                  disabled
                >
                  Confirmar Baja
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}