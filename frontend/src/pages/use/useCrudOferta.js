import { useCallback, useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import api from '../../api'
import { show_alert } from '../../components/functions/Showpro_functions'

const MySwal = withReactContent(Swal)

const obtenerRolInicial = () => {
  const saved =
    localStorage.getItem('idrol') ||
    localStorage.getItem('user_role') ||
    localStorage.getItem('role') ||
    localStorage.getItem('rol')

  if (saved === null || saved === undefined || saved === '') return 5
  return !isNaN(saved) ? parseInt(saved, 10) : saved
}

export function useCrudOferta() {
  const [rolUsuario] = useState(obtenerRolInicial)
  const esGestion = [1, 2, 3, '1', '2', '3'].includes(rolUsuario)
  const [cargando, setCargando] = useState(esGestion)
  const [materias, setMaterias] = useState([])
  const [docentes, setDocentes] = useState([])
  const [modulos, setModulos] = useState([])
  const [horarios, setHorarios] = useState([])
  const [carreras, setCarreras] = useState([])
  const [secciones, setSecciones] = useState([])
  const [asignaciones, setAsignaciones] = useState([])
  const [idMateria, setIdMateria] = useState('')
  const [ciEmpleado, setCiEmpleado] = useState('')
  const [idModulo, setIdModulo] = useState('')
  const [idHorario, setIdHorario] = useState('')
  const [idCarrera, setIdCarrera] = useState('')
  const [idSecc, setIdSecc] = useState('')
  const [estudiantes, setEstudiantes] = useState([])
  const [idOfertaAsignar, setIdOfertaAsignar] = useState('')
  const [ciEstudiante, setCiEstudiante] = useState('')
  const [downloadingExcel, setDownloadingExcel] = useState(false)

  const fetchResiliente = useCallback(async (rutas) => {
    for (const ruta of rutas) {
      try {
        const res = await api.get(ruta, { timeout: 8000 })
        if (!res?.data) continue
        if (Array.isArray(res.data)) return res.data
        if (Array.isArray(res.data.data)) return res.data.data
        const arr = Object.values(res.data).find((v) => Array.isArray(v))
        if (arr) return arr
      } catch (err) {
        console.warn('Fallo ruta', ruta, err?.response?.status || err.message)
      }
    }
    return []
  }, [])

  const solicitarDatos = useCallback(async () => {
    const [
      dataMaterias,
      dataDocentes,
      dataModulos,
      dataHorarios,
      dataCarreras,
      dataSecciones,
      dataAsignaciones,
      dataEstudiantes,
    ] = await Promise.all([
      fetchResiliente(['/materia/', '/materias/']),
      fetchResiliente(['/empleado/', '/empleados/']),
      fetchResiliente(['/modulo/', '/modulos/']),
      fetchResiliente(['/horarios/', '/horario/']),
      fetchResiliente(['/carrera/', '/carreras/']),
      fetchResiliente(['/seccion/', '/secciones/']),
      fetchResiliente(['/api/horarios-materias']),
      fetchResiliente(['/estudiantes/', '/estudiante/']),
    ])

    const activos = (lista) =>
      Array.isArray(lista)
        ? lista.filter((i) => i && typeof i === 'object' && i.activo !== false)
        : []

    return {
      materias: activos(dataMaterias),
      docentes: activos(dataDocentes),
      modulos: activos(dataModulos),
      horarios: activos(dataHorarios),
      carreras: activos(dataCarreras),
      secciones: activos(dataSecciones),
      asignaciones: Array.isArray(dataAsignaciones) ? dataAsignaciones : [],
      estudiantes: activos(dataEstudiantes),
    }
  }, [fetchResiliente])

  const aplicarDatos = (data) => {
    setMaterias(data.materias)
    setDocentes(data.docentes)
    setModulos(data.modulos)
    setHorarios(data.horarios)
    setCarreras(data.carreras)
    setSecciones(data.secciones)
    setAsignaciones(data.asignaciones)
    setEstudiantes(data.estudiantes)
  }

  const cargarDatos = async () => {
    setCargando(true)
    try {
      if (!esGestion) {
        setAsignaciones([])
        return
      }
      aplicarDatos(await solicitarDatos())
    } catch (error) {
      console.error('Error cargarDatos Oferta:', error)
      show_alert('Error al cargar datos de oferta. Revisa el backend.', 'error')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (!esGestion) return undefined

    let active = true
    solicitarDatos()
      .then((data) => {
        if (active) aplicarDatos(data)
      })
      .catch((error) => {
        if (!active) return
        console.error('Error cargarDatos Oferta:', error)
        show_alert('Error al cargar datos de oferta. Revisa el backend.', 'error')
      })
      .finally(() => {
        if (active) setCargando(false)
      })

    return () => {
      active = false
    }
  }, [esGestion, solicitarDatos])

  const crearAsignacion = async (e) => {
    e.preventDefault()
    if (!idMateria || !ciEmpleado || !idModulo || !idHorario || !idCarrera || !idSecc) {
      return show_alert('Completa todos los campos (incluye carrera y sección)', 'warning')
    }

    try {
      const payload = {
        idmateria: parseInt(idMateria, 10),
        ciempleado: String(ciEmpleado),
        idmodulo: parseInt(idModulo, 10),
        idhorario: parseInt(idHorario, 10),
        idcarrera: parseInt(idCarrera, 10),
        idsecc: parseInt(idSecc, 10),
      }
      const { data } = await api.post('/api/asignar-horario', payload)
      show_alert(data?.mensaje || 'Asignación registrada', 'success')
      setIdMateria('')
      setCiEmpleado('')
      setIdModulo('')
      setIdHorario('')
      setIdCarrera('')
      setIdSecc('')
      cargarDatos()
    } catch (error) {
      console.error(error)
      const detail = error.response?.data?.error_detalle || error.response?.data?.detail
      show_alert(
        typeof detail === 'string' ? detail : 'Error al guardar la asignación',
        'error'
      )
    }
  }

  const eliminarAsignacion = async (item) => {
    if (Number(rolUsuario) !== 1) {
      return show_alert('Solo el rol 1 puede eliminar ofertas', 'warning')
    }
    if (!item.idseccmo) {
      return show_alert('Falta idseccmo. Recarga la lista.', 'error')
    }
    const result = await MySwal.fire({
      title: '¿Eliminar esta oferta?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })
    if (!result.isConfirmed) return

    try {
      await api.delete(`/Oferta/${item.idseccmo}`)
      show_alert('Eliminada', 'success')
      cargarDatos()
    } catch (error) {
      const detail = error.response?.data?.detail ?? error.response?.data?.error_detalle
      show_alert(typeof detail === 'string' ? detail : 'No se pudo eliminar', 'error')
    }
  }

  const asignarEstudiante = async (e) => {
    e.preventDefault()
    if (!idOfertaAsignar || !ciEstudiante) {
      return show_alert('Elige oferta y estudiante', 'warning')
    }
    try {
      await api.patch(`/Oferta/${idOfertaAsignar}/asignar-estudiante`, {
        ciestu: String(ciEstudiante),
      })
      show_alert('Estudiante asignado a la oferta', 'success')
      setIdOfertaAsignar('')
      setCiEstudiante('')
      cargarDatos()
    } catch (error) {
      const detail = error.response?.data?.detail
      show_alert(
        typeof detail === 'string' ? detail : 'No se pudo asignar el estudiante',
        'error'
      )
    }
  }

  const descargarExcelOferta = async () => {
    setDownloadingExcel(true)
    try {
      const { data } = await api.get('/Oferta/excel', { responseType: 'blob' })
      const blob =
        data instanceof Blob
          ? data
          : new Blob([data], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            })
      const url = URL.createObjectURL(blob)
      const enlace = document.createElement('a')
      enlace.href = url
      enlace.download = 'oferta_academica.xlsx'
      document.body.appendChild(enlace)
      enlace.click()
      enlace.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      const detail = error.response?.data?.detail
      show_alert(
        typeof detail === 'string' ? detail : 'No se pudo generar el Excel de oferta académica',
        'error'
      )
    } finally {
      setDownloadingExcel(false)
    }
  }

  return {
    esGestion,
    cargando,
    materias,
    docentes,
    modulos,
    horarios,
    carreras,
    secciones,
    asignaciones,
    idMateria,
    setIdMateria,
    ciEmpleado,
    setCiEmpleado,
    idModulo,
    setIdModulo,
    idHorario,
    setIdHorario,
    idCarrera,
    setIdCarrera,
    idSecc,
    setIdSecc,
    estudiantes,
    idOfertaAsignar,
    setIdOfertaAsignar,
    ciEstudiante,
    setCiEstudiante,
    downloadingExcel,
    crearAsignacion,
    eliminarAsignacion,
    asignarEstudiante,
    descargarExcelOferta,
  }
}
