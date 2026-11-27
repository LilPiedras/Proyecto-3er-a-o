import { useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import api from '../../api'
import { show_alert } from '../../components/functions/Showpro_functions'

export function useCrudCarrera() {
  const [carreras, setCarreras] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [idcarrera, setIdcarrera] = useState('')
  const [nombrecarrera, setNombrecarrera] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precioUsd, setPrecioUsd] = useState('')
  const [operation, setOperation] = useState(1)
  const [title, setTitle] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const cargarCarreras = async () => {
    try {
      const { data } = await api.get('/carrera/')
      setCarreras(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      const detail = error.response?.data?.detail
      show_alert(
        typeof detail === 'string' ? detail : 'Error al cargar carreras',
        'error'
      )
      setCarreras([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    const cargarInicialmente = async () => {
      try {
        const { data } = await api.get('/carrera/')
        if (active) setCarreras(Array.isArray(data) ? data : [])
      } catch (error) {
        if (!active) return
        console.error(error)
        const detail = error.response?.data?.detail
        show_alert(
          typeof detail === 'string' ? detail : 'Error al cargar carreras',
          'error'
        )
        setCarreras([])
      } finally {
        if (active) setLoading(false)
      }
    }

    cargarInicialmente()
    return () => {
      active = false
    }
  }, [])

  const carrerasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return carreras
    return carreras.filter((c) => {
      const nombre = String(c.nombrecarrera || '').toLowerCase()
      const desc = String(c.descripcion || '').toLowerCase()
      const id = String(c.idcarrera ?? '')
      return nombre.includes(q) || desc.includes(q) || id.includes(q) || String(c.precio_usd ?? '').includes(q)
    })
  }, [carreras, busqueda])

  const limpiarFormulario = () => {
    setIdcarrera('')
    setNombrecarrera('')
    setDescripcion('')
    setPrecioUsd('')
  }

  const openModal = (op, id = '', nombre = '', desc = '', precio = '') => {
    limpiarFormulario()
    setOperation(op)

    if (op === 1) {
      setTitle('Registrar Carrera')
    } else {
      setTitle('Editar Carrera')
      setIdcarrera(id)
      setNombrecarrera(nombre)
      setDescripcion(desc)
      setPrecioUsd(String(precio))
    }

    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    limpiarFormulario()
  }

  const enviarSolicitud = async (metodo, parametros, idPath = null) => {
    try {
      if (metodo === 'POST') {
        await api.post('/carrera/', parametros)
      } else if (metodo === 'PATCH') {
        await api.patch(`/carrera/${idPath}`, parametros)
      } else if (metodo === 'DELETE') {
        await api.delete(`/carrera/${idPath}`)
      }

      const msg =
        metodo === 'DELETE'
          ? 'Carrera eliminada correctamente'
          : metodo === 'POST'
            ? 'Carrera registrada correctamente'
            : 'Carrera actualizada correctamente'

      show_alert(msg, 'success')
      closeModal()
      setLoading(true)
      await cargarCarreras()
    } catch (error) {
      console.error('Error detallado:', error.response?.data)
      const detail = error.response?.data?.detail

      let mensajeError = 'Error en la operación'
      if (typeof detail === 'string') {
        mensajeError = detail
      } else if (Array.isArray(detail)) {
        mensajeError = detail
          .map((err) => `${err.loc[err.loc.length - 1]}: ${err.msg}`)
          .join(' | ')
      }
      show_alert(mensajeError, 'error')
    }
  }

  const validar = () => {
    if (nombrecarrera.trim() === '') {
      show_alert('Escribe el nombre de la carrera', 'warning')
      return
    }
    if (descripcion.trim() === '') {
      show_alert('Escribe una descripción', 'warning')
      return
    }
    const precio = Number(precioUsd)
    if (!Number.isFinite(precio) || precio <= 0) {
      show_alert('Indica un precio en dólares mayor que cero', 'warning')
      return
    }

    const parametros = {
      nombrecarrera: nombrecarrera.trim(),
      descripcion: descripcion.trim(),
      precio_usd: precio,
    }

    if (operation === 1) {
      enviarSolicitud('POST', parametros)
    } else {
      enviarSolicitud('PATCH', parametros, idcarrera)
    }
  }

  const deleteCarrera = (id, nombre) => {
    if (!id) {
      show_alert('Error: ID de carrera no válido', 'error')
      return
    }

    const MySwal = withReactContent(Swal)
    MySwal.fire({
      title: `¿Seguro de eliminar la carrera "${nombre}"?`,
      text: 'No se podrá dar marcha atrás',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    }).then((result) => {
      if (result.isConfirmed) {
        enviarSolicitud('DELETE', {}, id)
      } else {
        show_alert('La carrera no fue eliminada', 'info')
      }
    })
  }

  const inicial = (c) => {
    const n = (c.nombrecarrera || '?').trim()
    return n.charAt(0).toUpperCase()
  }

  return {
    carreras,
    loading,
    busqueda,
    setBusqueda,
    idcarrera,
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
  }
}
