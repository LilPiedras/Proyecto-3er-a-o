import { useState } from "react"
import api from "../../api"

export function useUsuarioGestion() {
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

  // Estados para la gestión de roles extra
  const [rolesActualesUsuario, setRolesActualesUsuario] = useState([])
  const [nuevoRolAAsignar, setNuevoRolAAsignar] = useState(5)
  const [loadingGestionRoles, setLoadingGestionRoles] = useState(false)

  // --- GESTIÓN DE ROLES ---
  const cargarRolesUsuario = async (ciuser) => {
    setLoadingGestionRoles(true)
    try {
      const { data } = await api.get(`/usuario_login/usuario/${encodeURIComponent(ciuser)}`)
      setRolesActualesUsuario(Array.isArray(data) ? data : [])
    } catch {
      setRolesActualesUsuario([])
    } finally {
      setLoadingGestionRoles(false)
    }
  }

  const handleAgregarRolExtra = async () => {
    if (!usuarioEncontrado) return
    setModalMsg({ tipo: "", texto: "" })
    setLoadingGestionRoles(true)
    try {
      await api.post("/usuario_login/", {
        ciuser: usuarioEncontrado.ciuser,
        idrol: Number(nuevoRolAAsignar)
      })
      setModalMsg({ tipo: "exito", texto: "¡Nuevo rol asignado con éxito!" })
      await cargarRolesUsuario(usuarioEncontrado.ciuser)
    } catch (err) {
      const detail = err.response?.data?.detail
      setModalMsg({ tipo: "error", texto: typeof detail === "string" ? detail : "Error al asignar el nuevo rol" })
    } finally {
      setLoadingGestionRoles(false)
    }
  }

  const handleEliminarRolUsuario = async (ciuser_log) => {
    setModalMsg({ tipo: "", texto: "" })
    setLoadingGestionRoles(true)
    try {
      await api.delete(`/usuario_login/${ciuser_log}`)
      setModalMsg({ tipo: "exito", texto: "Rol retirado del usuario." })
      await cargarRolesUsuario(usuarioEncontrado.ciuser)
    } catch (err) {
      const detail = err.response?.data?.detail
      setModalMsg({ tipo: "error", texto: typeof detail === "string" ? detail : "No se pudo retirar el rol" })
    } finally {
      setLoadingGestionRoles(false)
    }
  }

  // --- REGISTRO (PASOS 1, 2 Y 3) ---
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
        const resEstu = await api.get("/estudiantes/")
        const listaEstud = Array.isArray(resEstu.data) ? resEstu.data : []
        if (listaEstud.some((est) => est.ciestu === formattedDni)) {
          vinculadoEstudiante = formattedDni
          mensajeVinculo = "Estudiante Verificado"
          rolSugerido = 5
        }
      } catch (err) {
        console.warn("Error consultando estudiantes:", err)
      }

      try {
        const resEmp = await api.get("/empleado/")
        const listaEmp = Array.isArray(resEmp.data) ? resEmp.data : []
        if (listaEmp.some((emp) => emp.ciempleado === formattedDni)) {
          vinculadoEmpleado = formattedDni
          mensajeVinculo = "Empleado / Docente Verificado"
          rolSugerido = 4
        }
      } catch (err) {
        console.warn("Error consultando empleados:", err)
      }

      await api.post("/usuario/", {
        ciuser: formattedDni,
        nombreusuario: name.trim(),
        apellusuario: lastname.trim(),
        contrase: password,
        correousuario: email.trim(),
        teleusuario: phoneNumber.trim() || null,
        estudiante: vinculadoEstudiante,
        empleado: vinculadoEmpleado
      })

      setCedulaRegistrada(formattedDni)
      setTipoVinculoMsg(mensajeVinculo)
      setRolesSeleccionados([rolSugerido])
      setSuccessMsg(`¡Usuario registrado! Detectado como: ${mensajeVinculo}`)
      setModalRolOpen(true)
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === "string" ? detail : "Error al registrar usuario")
    } finally {
      setLoading(false)
    }
  }

  const handleAsignarRol = async (e) => {
    e.preventDefault()
    setErrorRol("")
    setSuccessRol("")
    setLoadingRol(true)

    try {
      for (const idrol of rolesSeleccionados) {
        await api.post("/usuario_login/", {
          ciuser: cedulaRegistrada,
          idrol: Number(idrol)
        })
      }

      setSuccessRol("¡Roles vinculados correctamente!")

      try {
        const { data } = await api.get("/PreguntasSeguridad/")
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
      setErrorRol(typeof detail === "string" ? detail : "Error al asignar los roles.")
    } finally {
      setLoadingRol(false)
    }
  }

  const handleAsignarPregunta = async (e) => {
    e.preventDefault()
    setErrorPregunta("")
    setSuccessPregunta("")
    setLoadingPregunta(true)

    try {
      await api.post("/PreguntasSeguridad/asignar", {
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
      setErrorPregunta(typeof detail === "string" ? detail : "Error al guardar la pregunta de seguridad.")
    } finally {
      setLoadingPregunta(false)
    }
  }

  // --- BÚSQUEDA, EDICIÓN Y BAJA ---
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
      await cargarRolesUsuario(data.ciuser)
    } catch (err) {
      setUsuarioEncontrado(null)
      const detail = err.response?.data?.detail
      setModalMsg({ tipo: "error", texto: typeof detail === "string" ? detail : "Usuario no encontrado." })
    } finally {
      setAccionLoading(false)
    }
  }

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
      setModalMsg({ tipo: "error", texto: typeof detail === "string" ? detail : "Error al actualizar" })
    } finally {
      setAccionLoading(false)
    }
  }

  const handleEliminarUsuario = async () => {
    if (!usuarioEncontrado) return
    setAccionLoading(true)
    setModalMsg({ tipo: "", texto: "" })

    try {
      await api.delete(`/usuario/${encodeURIComponent(usuarioEncontrado.ciuser)}`)
      setModalMsg({ tipo: "exito", texto: "¡Usuario eliminado con éxito!" })
      setTimeout(() => {
        setModalEliminar(false)
        setUsuarioEncontrado(null)
        setCedulaGestion("")
      }, 1500)
    } catch (err) {
      const detail = err.response?.data?.detail
      setModalMsg({ tipo: "error", texto: typeof detail === "string" ? detail : "Error al eliminar" })
    } finally {
      setAccionLoading(false)
    }
  }

  const abrirModalGestion = (tipo) => {
    setUsuarioEncontrado(null)
    setCedulaGestion("")
    setModalMsg({ tipo: "", texto: "" })
    if (tipo === "modificar") setModalModificar(true)
    if (tipo === "eliminar") setModalEliminar(true)
  }

  return {
    name, setName,
    lastname, setLastName,
    phoneNumber, setPhoneNumber,
    email, setEmail,
    nationality, setNationality,
    dni, setDni,
    password, setPassword,
    showPassword, setShowPassword,
    loading, error, successMsg,
    handleSubmit,

    modalRolOpen, setModalRolOpen,
    cedulaRegistrada, tipoVinculoMsg,
    rolesSeleccionados, setRolesSeleccionados,
    loadingRol, errorRol, successRol,
    handleAsignarRol,

    modalPreguntaOpen, setModalPreguntaOpen,
    listaPreguntasCatalogo,
    idPreguntaSeleccionada, setIdPreguntaSeleccionada,
    respuestaSecreta, setRespuestaSecreta,
    loadingPregunta, errorPregunta, successPregunta,
    handleAsignarPregunta,

    modalModificar, setModalModificar,
    modalEliminar, setModalEliminar,
    abrirModalGestion,

    cedulaGestion, setCedulaGestion,
    usuarioEncontrado,
    editForm, setEditForm,
    accionLoading, modalMsg,
    handleBuscarUsuario,
    handleActualizarUsuario,
    handleEliminarUsuario,

    rolesActualesUsuario,
    nuevoRolAAsignar, setNuevoRolAAsignar,
    loadingGestionRoles,
    handleAgregarRolExtra,
    handleEliminarRolUsuario
  }
}