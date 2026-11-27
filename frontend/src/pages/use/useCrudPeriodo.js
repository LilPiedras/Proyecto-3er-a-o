import { useEffect, useState } from 'react'
import api from '../../api'
import { show_alert } from '../../components/functions/Showpro_functions'

export function useCrudPeriodo() {
  const [periodos, setPeriodos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(null)
  const [form, setForm] = useState({
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
  })

  const cargar = async () => {
    try {
      const { data } = await api.get('/periodo/')
      setPeriodos(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
      show_alert('No se pudieron cargar los periodos', 'error')
      setPeriodos([])
    } finally {
      setCargando(false)
    }
  }

  const recargar = async () => {
    setCargando(true)
    await cargar()
  }

  useEffect(() => {
    let active = true
    const cargarInicialmente = async () => {
      try {
        const { data } = await api.get('/periodo/')
        if (active) setPeriodos(Array.isArray(data) ? data : [])
      } catch (error) {
        if (!active) return
        console.error(error)
        show_alert('No se pudieron cargar los periodos', 'error')
        setPeriodos([])
      } finally {
        if (active) setCargando(false)
      }
    }

    cargarInicialmente()
    return () => {
      active = false
    }
  }, [])

  const crear = async (e) => {
    e.preventDefault()
    if (!form.nombre || !form.fecha_inicio || !form.fecha_fin) {
      show_alert('Completa nombre, fecha inicio y fecha fin', 'warning')
      return
    }
    try {
      await api.post('/periodo/', form)
      show_alert('Periodo creado', 'success')
      setForm({ nombre: '', fecha_inicio: '', fecha_fin: '' })
      recargar()
    } catch (err) {
      show_alert(err.response?.data?.detail || 'Error al crear periodo', 'error')
    }
  }

  const cerrar = async (id, nombre) => {
    if (!window.confirm(`¿Cerrar el periodo "${nombre}"?\nNo se podrán editar notas, asistencias ni plan de evaluación.`)) {
      return
    }
    setProcesando(id)
    try {
      await api.patch(`/periodo/${id}/cerrar`)
      show_alert('Periodo cerrado', 'success')
      recargar()
    } catch (err) {
      show_alert(err.response?.data?.detail || 'No se pudo cerrar', 'error')
    } finally {
      setProcesando(null)
    }
  }

  const abrir = async (id, nombre) => {
    if (!window.confirm(`¿Reabrir el periodo "${nombre}"?`)) return
    setProcesando(id)
    try {
      await api.patch(`/periodo/${id}/abrir`)
      show_alert('Periodo reabierto', 'success')
      recargar()
    } catch (err) {
      show_alert(err.response?.data?.detail || 'No se pudo abrir', 'error')
    } finally {
      setProcesando(null)
    }
  }

  const eliminar = async (id, nombre) => {
    if (!window.confirm(`¿Desactivar el periodo "${nombre}"?`)) return
    try {
      await api.delete(`/periodo/${id}`)
      show_alert('Periodo desactivado', 'success')
      recargar()
    } catch (err) {
      show_alert(err.response?.data?.detail || 'No se pudo eliminar', 'error')
    }
  }

  return {
    periodos,
    cargando,
    procesando,
    form,
    setForm,
    cargar: recargar,
    crear,
    cerrar,
    abrir,
    eliminar,
  }
}
