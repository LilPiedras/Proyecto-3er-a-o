import { useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import api from '../../api'
import { show_alert } from '../../components/functions/Showpro_functions'

const obtenerMensajeError = (error, accion) => {
  const estado = error.response?.status
  const detail = error.response?.data?.detail

  if (estado === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.'
  if (estado === 403) return 'No tienes permiso para gestionar cursos. Esta acción está reservada al rol 1.'
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const campo = item?.loc?.filter((parte) => parte !== 'body').join(' → ')
        return `${campo || 'Datos'}: ${item?.msg || 'Dato no válido'}`
      })
      .join('\n')
  }
  if (typeof detail === 'string' && detail !== 'Internal Server Error') return detail

  const serverMessage = error.response?.data?.error_detalle
    || error.response?.data?.message
    || error.response?.data?.error
  if (typeof serverMessage === 'string') return serverMessage
  if (!error.response) return 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.'
  if (estado >= 500) return `El servidor no pudo ${accion}. Inténtalo de nuevo; si continúa, comparte el código HTTP ${estado}.`
  return `No se pudo ${accion} (HTTP ${estado}).`
}

const solicitarCursos = async () => {
  const { data } = await api.get('/curso/')
  return Array.isArray(data) ? data : []
}

const solicitarProfesores = async () => {
  const { data } = await api.get('/empleado/')
  const lista = Array.isArray(data) ? data : []
  return lista.filter((empleado) => /docente|profesor/i.test(empleado.cargo || ''))
}

export function useCrudCursos() {
  const [cursos, setCursos] = useState([])
  const [profesores, setProfesores] = useState([])
  const [cargandoProfesores, setCargandoProfesores] = useState(
    () => Number(localStorage.getItem('idrol')) === 1,
  )
  const [errorProfesores, setErrorProfesores] = useState('')
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const esAdministrador = Number(localStorage.getItem('idrol')) === 1

  const [idcurso, setIdcurso] = useState('')
  const [nomcurso, setNomcurso] = useState('')
  const [preciocurso, setPreciocurso] = useState('')
  const [nivelcur, setNivelcur] = useState('')
  const [docenasig, setDocenasig] = useState('')
  const [operation, setOperation] = useState(1)
  const [title, setTitle] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const obtenerIdCurso = (curso) => {
    if (!curso) return null
    if (curso.idcurso !== undefined) return curso.idcurso
    if (curso.id !== undefined) return curso.id
    if (curso.id_curso !== undefined) return curso.id_curso
    if (curso.curso_id !== undefined) return curso.curso_id

    for (const key in curso) {
      if (key.toLowerCase().includes('id') && curso[key] !== null) {
        return curso[key]
      }
    }

    return null
  }

  const formatearPrecio = (valor) =>
    `$${new Intl.NumberFormat('es-MX').format(valor || 0)}`

  const cargarCursos = async () => {
    try {
      setCursos(await solicitarCursos())
    } catch (error) {
      console.error('Error al cargar cursos:', error)
      if (error.response?.status === 404) {
        setCursos([])
      } else {
        const detail = error.response?.data?.detail
        show_alert(
          typeof detail === 'string' ? detail : 'Error al cargar cursos',
          'error'
        )
        setCursos([])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    solicitarCursos()
      .then((data) => {
        if (active) setCursos(data)
      })
      .catch((error) => {
        if (!active) return
        console.error('Error al cargar cursos:', error)
        if (error.response?.status === 404) {
          setCursos([])
        } else {
          show_alert(obtenerMensajeError(error, 'cargar los cursos'), 'error')
          setCursos([])
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    if (esAdministrador) {
      solicitarProfesores()
        .then((data) => {
          if (active) setProfesores(data)
        })
        .catch((error) => {
          if (!active) return
          if (error.response?.status === 404) {
            setProfesores([])
            return
          }
          const mensaje = obtenerMensajeError(error, 'cargar la lista de profesores')
          setErrorProfesores(mensaje)
          show_alert(mensaje, 'error')
        })
        .finally(() => {
          if (active) setCargandoProfesores(false)
        })
    }

    return () => {
      active = false
    }
  }, [esAdministrador])

  const cursosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return cursos
    return cursos.filter((c) => {
      const nombre = String(c.nomcurso || c.nombrecurso || '').toLowerCase()
      const nivel = String(c.nivelcur || '').toLowerCase()
      const doc = String(c.docenasig || '').toLowerCase()
      const precio = String(c.preciocurso ?? '')
      return (
        nombre.includes(q) ||
        nivel.includes(q) ||
        doc.includes(q) ||
        precio.includes(q)
      )
    })
  }, [cursos, busqueda])

  const limpiarFormulario = () => {
    setIdcurso('')
    setNomcurso('')
    setPreciocurso('')
    setNivelcur('')
    setDocenasig('')
  }

  const openModal = (op, curso = null) => {
    limpiarFormulario()
    setOperation(op)

    if (op === 1) {
      setTitle('Registrar Curso')
      setIsModalOpen(true)
    } else if (curso) {
      setTitle('Editar Curso')

      const idEncontrado = obtenerIdCurso(curso)
      if (!idEncontrado) {
        show_alert(
          'Error interno: No se pudo identificar el ID del curso.',
          'error'
        )
        return
      }

      setIdcurso(idEncontrado)
      setNomcurso(curso.nomcurso || curso.nombrecurso || '')
      setPreciocurso(
        curso.preciocurso !== undefined ? String(curso.preciocurso) : ''
      )
      setNivelcur(curso.nivelcur || '')
      setDocenasig(curso.docenasig || '')
      setIsModalOpen(true)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    limpiarFormulario()
  }

  const enviarSolicitud = async (metodo, parametros = {}, idPath = null) => {
    if (!esAdministrador) {
      show_alert('No tienes permiso para gestionar cursos. Esta acción está reservada al rol 1.', 'warning')
      return
    }

    try {
      if (metodo === 'POST') {
        await api.post('/curso/', parametros)
      } else if (metodo === 'PUT') {
        await api.put(`/curso/${idPath}`, parametros)
      } else if (metodo === 'DELETE') {
        await api.delete(`/curso/${idPath}`)
      }

      const msg =
        metodo === 'DELETE'
          ? 'Curso eliminado correctamente'
          : metodo === 'POST'
            ? 'Curso registrado correctamente'
            : 'Curso actualizado correctamente'

      show_alert(msg, 'success')
      closeModal()
      setLoading(true)
      await cargarCursos()
    } catch (error) {
      console.error('Error HTTP:', error)
      const accion = metodo === 'POST' ? 'registrar el curso' : metodo === 'PUT' ? 'actualizar el curso' : 'eliminar el curso'
      show_alert(obtenerMensajeError(error, accion), 'error')
    }
  }

  const validar = (e) => {
    if (e) e.preventDefault()

    if (nomcurso.trim() === '') {
      show_alert('Escribe el nombre del curso', 'warning')
      return
    }
    if (preciocurso === '' || isNaN(Number(preciocurso))) {
      show_alert('Escribe un precio válido para el curso', 'warning')
      return
    }
    if (nivelcur.trim() === '') {
      show_alert('Escribe el nivel del curso', 'warning')
      return
    }
    if (!['Basico', 'Intermedio', 'Avanzado'].includes(nivelcur)) {
      show_alert('Selecciona el nivel: Basico, Intermedio o Avanzado', 'warning')
      return
    }

    const parametros = {
      nomcurso: nomcurso.trim(),
      preciocurso: parseInt(preciocurso, 10),
      nivelcur: nivelcur.trim(),
      docenasig: docenasig.trim() || null,
    }

    if (operation === 1) {
      enviarSolicitud('POST', parametros)
    } else {
      enviarSolicitud('PUT', parametros, idcurso)
    }
  }

  const deleteCurso = (curso) => {
    const idParaEliminar = obtenerIdCurso(curso)
    const MySwal = withReactContent(Swal)

    MySwal.fire({
      title: `¿Seguro de eliminar el curso "${curso.nomcurso}"?`,
      text: 'No se podrá dar marcha atrás',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    }).then((result) => {
      if (result.isConfirmed) {
        enviarSolicitud('DELETE', {}, idParaEliminar)
      } else {
        show_alert('El curso no fue eliminado', 'info')
      }
    })
  }

  const inicial = (c) => {
    const n = (c.nomcurso || c.nombrecurso || '?').trim()
    return n.charAt(0).toUpperCase()
  }

  return {
    cursos,
    profesores,
    cargandoProfesores,
    errorProfesores,
    loading,
    busqueda,
    setBusqueda,
    esAdministrador,
    nomcurso,
    setNomcurso,
    preciocurso,
    setPreciocurso,
    nivelcur,
    setNivelcur,
    docenasig,
    setDocenasig,
    operation,
    title,
    isModalOpen,
    cursosFiltrados,
    obtenerIdCurso,
    formatearPrecio,
    openModal,
    closeModal,
    validar,
    deleteCurso,
    inicial,
  }
}
