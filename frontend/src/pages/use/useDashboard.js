import { useEffect, useState } from 'react'
import api from '../../api'
import { show_alert } from '../../components/functions/Showpro_functions'

export function useDashboard() {
  const [resumen, setResumen] = useState(null)
  const idrol = Number(localStorage.getItem('idrol'))
  const puedeVer = [1, 2, 3].includes(idrol)
  const puedeVerMensualidades = [1, 2].includes(idrol)
  const [loading, setLoading] = useState(puedeVer)

  const cargarDashboard = async () => {
    if (!puedeVer) return

    setLoading(true)
    try {
      const { data } = await api.get('/dashboard/resumen')
      setResumen(data)
    } catch (error) {
      console.error(error)
      const detail = error.response?.data?.detail
      show_alert(
        typeof detail === 'string' ? detail : 'Error al cargar los indicadores del dashboard',
        'error'
      )
      setResumen(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!puedeVer) return undefined

    let active = true
    api.get('/dashboard/resumen')
      .then(({ data }) => {
        if (active) setResumen(data)
      })
      .catch((error) => {
        if (!active) return
        console.error(error)
        const detail = error.response?.data?.detail
        show_alert(
          typeof detail === 'string' ? detail : 'Error al cargar los indicadores del dashboard',
          'error'
        )
        setResumen(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [puedeVer])

  const totalEstudiantes = resumen?.total_estudiantes ?? 0
  const totalDocentes = resumen?.total_docentes ?? 0
  const totalModulos = resumen?.total_modulos ?? 0
  const modulosLista = Array.isArray(resumen?.estudiantes_por_modulo)
    ? resumen.estudiantes_por_modulo
    : []
  const maxCantidadModulo = Math.max(
    1,
    ...modulosLista.map((item) => Number(item.cantidad) || 0)
  )

  const mensualidades = resumen?.mensualidades
  const totalPagados = mensualidades?.pagados ?? 0
  const totalPendientes = mensualidades?.pendientes ?? 0
  const totalRegistrosMensualidad = Math.max(1, totalPagados + totalPendientes)
  const porcentajePagados = Math.round((totalPagados / totalRegistrosMensualidad) * 100)
  const porcentajePendientes = Math.round((totalPendientes / totalRegistrosMensualidad) * 100)

  return {
    loading,
    puedeVer,
    puedeVerMensualidades,
    cargarDashboard,
    mensualidades,
    totalEstudiantes,
    totalDocentes,
    totalModulos,
    modulosLista,
    maxCantidadModulo,
    totalPagados,
    totalPendientes,
    totalRegistrosMensualidad,
    porcentajePagados,
    porcentajePendientes,
  }
}
