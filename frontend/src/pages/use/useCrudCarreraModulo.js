import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import api from '../../api'
import { show_alert } from '../../components/functions/Showpro_functions'

const MySwal = withReactContent(Swal)

const solicitarDatos = () => Promise.all([
  api.get('/Carrera_Modulo/').catch(() => ({ data: [] })),
  api.get('/carrera/').catch(() => ({ data: [] })),
  api.get('/modulo_materia/').catch(() => ({ data: [] })),
])

export function useCrudCarreraModulo() {
  const [relaciones, setRelaciones] = useState([])
  const [carreras, setCarreras] = useState([])
  const [materiasModulos, setMateriasModulos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [idCarreraSeleccionada, setIdCarreraSeleccionada] = useState('')
  const [modalExportOpen, setModalExportOpen] = useState(false)
  const [urlPdfGenerado, setUrlPdfGenerado] = useState('')

  const aplicarDatos = ([relRes, carrerasRes, matModRes]) => {
    setRelaciones(Array.isArray(relRes.data) ? relRes.data : [])
    setCarreras(Array.isArray(carrerasRes.data) ? carrerasRes.data : [])
    setMateriasModulos(Array.isArray(matModRes.data) ? matModRes.data : [])
  }

  const cargarDatos = async () => {
    setCargando(true)
    try {
      aplicarDatos(await solicitarDatos())
    } catch (error) {
      console.error(error)
      show_alert('Error al cargar datos de Carrera-Módulo', 'error')
      setRelaciones([])
      setCarreras([])
      setMateriasModulos([])
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    let active = true
    solicitarDatos()
      .then((data) => {
        if (active) aplicarDatos(data)
      })
      .catch((error) => {
        if (!active) return
        console.error(error)
        show_alert('Error al cargar datos de Carrera-Módulo', 'error')
        setRelaciones([])
        setCarreras([])
        setMateriasModulos([])
      })
      .finally(() => {
        if (active) setCargando(false)
      })

    return () => {
      active = false
    }
  }, [])

  const getNombreCarrera = (id) => {
    const c = carreras.find((item) => Number(item.idcarrera) === Number(id))
    return c?.nombrecarrera || `Carrera #${id}`
  }

  const getLabelMateriaModulo = (m) => {
    if (!m) return '—'
    const mat = m.nombremateria || `Materia ${m.idmateria ?? ''}`
    const mod = m.nombremodulo || `Módulo ${m.idmodulo ?? ''}`
    return `${mat} · ${mod}`
  }

  const relacionesDeCarrera = relaciones.filter(
    (r) => Number(r.idcarrera) === Number(idCarreraSeleccionada)
  )

  const idsMatemoAsignados = relacionesDeCarrera.map((r) =>
    String(r.idmatemo)
  )

  const vincular = async (idmatemo) => {
    if (!idCarreraSeleccionada) {
      return show_alert('Selecciona una carrera primero', 'warning')
    }

    try {
      await api.post('/Carrera_Modulo/', {
        idcarrera: Number(idCarreraSeleccionada),
        idmatemo: Number(idmatemo),
      })
      show_alert('Materia-módulo vinculada a la carrera', 'success')
      await cargarDatos()
    } catch (error) {
      console.error(error)
      const detail = error.response?.data?.detail
      show_alert(
        typeof detail === 'string' ? detail : 'Error al vincular',
        'error'
      )
    }
  }

  const desvincular = async (idcarremo) => {
    const confirm = await MySwal.fire({
      title: '¿Quitar esta relación?',
      text: 'La materia-módulo dejará de estar asociada a esta carrera.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    })

    if (!confirm.isConfirmed) return

    try {
      await api.delete(`/Carrera_Modulo/${idcarremo}`)
      show_alert('Relación eliminada', 'success')
      await cargarDatos()
    } catch (error) {
      console.error(error)
      const detail = error.response?.data?.detail
      show_alert(
        typeof detail === 'string' ? detail : 'Error al eliminar',
        'error'
      )
    }
  }

  const abrirModalExportar = () => {
    if (!idCarreraSeleccionada) {
      return show_alert('Selecciona una carrera para exportar', 'warning')
    }

    const baseURL = api.defaults.baseURL || 'http://localhost:8000'
    const urlCompleta = `${baseURL.replace(/\/$/, "")}/Carrera_Modulo/${idCarreraSeleccionada}/exportar-pdf`

    setUrlPdfGenerado(urlCompleta)
    setModalExportOpen(true)
  }

  const descargarPdfDirecto = async () => {
    try {
      const response = await api.get(`/Carrera_Modulo/${idCarreraSeleccionada}/exportar-pdf`, {
        responseType: 'blob',
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = `reporte_carrera_${idCarreraSeleccionada}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      show_alert('PDF descargado con éxito', 'success')
    } catch (error) {
      console.error('Error al generar PDF:', error)
      show_alert('Error al exportar el PDF de la carrera', 'error')
    }
  }

  return {
    relaciones,
    carreras,
    materiasModulos,
    cargando,
    idCarreraSeleccionada,
    setIdCarreraSeleccionada,
    modalExportOpen,
    setModalExportOpen,
    urlPdfGenerado,
    relacionesDeCarrera,
    idsMatemoAsignados,
    getNombreCarrera,
    getLabelMateriaModulo,
    vincular,
    desvincular,
    abrirModalExportar,
    descargarPdfDirecto,
  }
}
