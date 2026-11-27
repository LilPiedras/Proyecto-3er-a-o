import { useCallback, useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import api from '../../api'
import { show_alert } from '../../components/functions/Showpro_functions'

const MySwal = withReactContent(Swal)
const solicitarBloques = async () => {
  const { data } = await api.get('/bloque/')
  return Array.isArray(data) ? data : []
}
const solicitarHorarios = async () => {
  const { data } = await api.get('/horarios/')
  return Array.isArray(data) ? data : []
}

export function useCrudHorarios() {
  const [tab, setTab] = useState('horarios')
  const [bloques, setBloques] = useState([])
  const [horarios, setHorarios] = useState([])
  const [loadingBloques, setLoadingBloques] = useState(true)
  const [loadingHorarios, setLoadingHorarios] = useState(true)
  const [busquedaHorario, setBusquedaHorario] = useState('')
  const [busquedaBloque, setBusquedaBloque] = useState('')
  const [idbloque, setIdbloque] = useState('')
  const [horainicio, setHorainicio] = useState('')
  const [horafin, setHorafin] = useState('')
  const [opBloque, setOpBloque] = useState(1)
  const [titleBloque, setTitleBloque] = useState('')
  const [modalBloque, setModalBloque] = useState(false)
  const [idhorario, setIdhorario] = useState('')
  const [bloque, setBloque] = useState('')
  const [dia, setDia] = useState('')
  const [salon, setSalon] = useState('')
  const [opHorario, setOpHorario] = useState(1)
  const [titleHorario, setTitleHorario] = useState('')
  const [modalHorario, setModalHorario] = useState(false)

  const cargarBloques = async () => {
    try {
      setLoadingBloques(true)
      setBloques(await solicitarBloques())
    } catch (error) {
      if (error.response?.status === 404) {
        setBloques([])
      } else {
        const detail = error.response?.data?.detail
        show_alert(
          typeof detail === 'string' ? detail : 'Error al cargar bloques',
          'error'
        )
        setBloques([])
      }
    } finally {
      setLoadingBloques(false)
    }
  }

  const cargarHorarios = async () => {
    try {
      setLoadingHorarios(true)
      setHorarios(await solicitarHorarios())
    } catch (error) {
      if (error.response?.status === 404) {
        setHorarios([])
      } else {
        const detail = error.response?.data?.detail
        show_alert(
          typeof detail === 'string' ? detail : 'Error al cargar horarios',
          'error'
        )
        setHorarios([])
      }
    } finally {
      setLoadingHorarios(false)
    }
  }

  useEffect(() => {
    let active = true
    solicitarBloques()
      .then((data) => {
        if (active) setBloques(data)
      })
      .catch((error) => {
        if (!active) return
        if (error.response?.status !== 404) {
          const detail = error.response?.data?.detail
          show_alert(
            typeof detail === 'string' ? detail : 'Error al cargar bloques',
            'error'
          )
        }
        setBloques([])
      })
      .finally(() => {
        if (active) setLoadingBloques(false)
      })

    solicitarHorarios()
      .then((data) => {
        if (active) setHorarios(data)
      })
      .catch((error) => {
        if (!active) return
        if (error.response?.status !== 404) {
          const detail = error.response?.data?.detail
          show_alert(
            typeof detail === 'string' ? detail : 'Error al cargar horarios',
            'error'
          )
        }
        setHorarios([])
      })
      .finally(() => {
        if (active) setLoadingHorarios(false)
      })

    return () => {
      active = false
    }
  }, [])

  const getTextoBloque = useCallback((id) => {
    const b = bloques.find((x) => Number(x.idbloque) === Number(id))
    return b ? `${b.horainicio} - ${b.horafin}` : id
  }, [bloques])

  const horariosFiltrados = useMemo(() => {
    const q = busquedaHorario.trim().toLowerCase()
    if (!q) return horarios
    return horarios.filter((h) => {
      const diaTxt = String(h.dia || '').toLowerCase()
      const salonTxt = String(h.salon || '').toLowerCase()
      const bloqueTxt = String(getTextoBloque(h.bloque) || '').toLowerCase()
      return diaTxt.includes(q) || salonTxt.includes(q) || bloqueTxt.includes(q)
    })
  }, [horarios, busquedaHorario, getTextoBloque])

  const bloquesFiltrados = useMemo(() => {
    const q = busquedaBloque.trim().toLowerCase()
    if (!q) return bloques
    return bloques.filter((b) => {
      const ini = String(b.horainicio || '').toLowerCase()
      const fin = String(b.horafin || '').toLowerCase()
      const id = String(b.idbloque ?? '')
      return ini.includes(q) || fin.includes(q) || id.includes(q)
    })
  }, [bloques, busquedaBloque])

  const limpiarBloque = () => {
    setIdbloque('')
    setHorainicio('')
    setHorafin('')
  }

  const openModalBloque = (op, item = null) => {
    limpiarBloque()
    setOpBloque(op)
    if (op === 1) {
      setTitleBloque('Registrar Bloque')
    } else if (item) {
      setTitleBloque('Editar Bloque')
      setIdbloque(item.idbloque)
      setHorainicio(item.horainicio || '')
      setHorafin(item.horafin || '')
    }
    setModalBloque(true)
  }

  const enviarBloque = async (metodo, body = {}, idPath = null) => {
    try {
      if (metodo === 'POST') await api.post('/bloque/', body)
      else if (metodo === 'PUT') await api.put(`/bloque/${idPath}`, body)
      else if (metodo === 'DELETE') await api.delete(`/bloque/${idPath}`)

      show_alert(
        metodo === 'DELETE'
          ? 'Bloque eliminado correctamente'
          : metodo === 'POST'
            ? 'Bloque registrado correctamente'
            : 'Bloque actualizado correctamente',
        'success'
      )
      setModalBloque(false)
      limpiarBloque()
      await cargarBloques()
      await cargarHorarios()
    } catch (error) {
      const detail = error.response?.data?.detail
      show_alert(
        typeof detail === 'string' ? detail : 'Error en la operación',
        'error'
      )
    }
  }

  const validarBloque = () => {
    if (!horainicio.trim()) {
      show_alert('Ingrese la hora de inicio', 'warning')
      return
    }
    if (!horafin.trim()) {
      show_alert('Ingrese la hora de fin', 'warning')
      return
    }
    const body = { horainicio: horainicio.trim(), horafin: horafin.trim() }
    enviarBloque(opBloque === 1 ? 'POST' : 'PUT', body, idbloque)
  }

  const deleteBloque = (item) => {
    MySwal.fire({
      title: `¿Eliminar bloque ${item.horainicio} - ${item.horafin}?`,
      text: 'No se podrá dar marcha atrás',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    }).then((result) => {
      if (result.isConfirmed) enviarBloque('DELETE', {}, item.idbloque)
      else show_alert('El bloque no fue eliminado', 'info')
    })
  }

  const limpiarHorario = () => {
    setIdhorario('')
    setBloque('')
    setDia('')
    setSalon('')
  }

  const openModalHorario = (op, item = null) => {
    limpiarHorario()
    setOpHorario(op)
    if (op === 1) {
      setTitleHorario('Registrar Horario')
    } else if (item) {
      setTitleHorario('Editar Horario')
      setIdhorario(item.idhorario)
      setBloque(item.bloque != null ? String(item.bloque) : '')
      setDia(item.dia || '')
      setSalon(item.salon || '')
    }
    setModalHorario(true)
  }

  const enviarHorario = async (metodo, body = {}, idPath = null) => {
    try {
      if (metodo === 'POST') await api.post('/horarios/', body)
      else if (metodo === 'PUT') await api.put(`/horarios/${idPath}`, body)
      else if (metodo === 'DELETE') await api.delete(`/horarios/${idPath}`)

      show_alert(
        metodo === 'DELETE'
          ? 'Horario eliminado correctamente'
          : metodo === 'POST'
            ? 'Horario registrado correctamente'
            : 'Horario actualizado correctamente',
        'success'
      )
      setModalHorario(false)
      limpiarHorario()
      await cargarHorarios()
    } catch (error) {
      const detail = error.response?.data?.detail
      if (Array.isArray(detail)) {
        show_alert(detail.map((e) => e.msg).join('\n'), 'error')
      } else {
        show_alert(
          typeof detail === 'string' ? detail : 'Error en la operación',
          'error'
        )
      }
    }
  }

  const validarHorario = () => {
    const diaOk = String(dia || '').trim()
    const salonOk = String(salon || '').trim()
    const bloqueOk = parseInt(String(bloque), 10)

    if (!diaOk) {
      show_alert('Seleccione un día', 'warning')
      return
    }
    if (!salonOk) {
      show_alert('Ingrese el salón', 'warning')
      return
    }
    if (!bloque || Number.isNaN(bloqueOk) || bloqueOk <= 0) {
      show_alert('Seleccione un bloque válido', 'warning')
      return
    }

    const body = { dia: diaOk, bloque: bloqueOk, salon: salonOk }
    enviarHorario(opHorario === 1 ? 'POST' : 'PUT', body, idhorario)
  }

  const deleteHorario = (item) => {
    MySwal.fire({
      title: `¿Eliminar horario del ${item.dia}?`,
      text: 'No se podrá dar marcha atrás',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    }).then((result) => {
      if (result.isConfirmed) enviarHorario('DELETE', {}, item.idhorario)
      else show_alert('El horario no fue eliminado', 'info')
    })
  }

  return {
    tab,
    setTab,
    bloques,
    horarios,
    loadingBloques,
    loadingHorarios,
    busquedaHorario,
    setBusquedaHorario,
    busquedaBloque,
    setBusquedaBloque,
    horainicio,
    setHorainicio,
    horafin,
    setHorafin,
    opBloque,
    titleBloque,
    modalBloque,
    setModalBloque,
    bloque,
    setBloque,
    dia,
    setDia,
    salon,
    setSalon,
    opHorario,
    titleHorario,
    modalHorario,
    setModalHorario,
    horariosFiltrados,
    bloquesFiltrados,
    getTextoBloque,
    openModalBloque,
    validarBloque,
    deleteBloque,
    openModalHorario,
    validarHorario,
    deleteHorario,
  }
}
