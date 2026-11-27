import { useEffect, useState } from 'react'
import api from '../../api'
import { show_alert } from '../../components/functions/Showpro_functions'

export function useCursosDisponibles() {
  const [cursos, setCursos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let active = true
    api.get('/curso/')
      .then((response) => {
        if (active) {
          setCursos(Array.isArray(response.data) ? response.data : [])
        }
      })
      .catch((error) => {
        if (!active) return
        console.error('Error al cargar cursos:', error)
        show_alert('Error al obtener los cursos disponibles', 'error')
      })
      .finally(() => {
        if (active) setCargando(false)
      })

    return () => {
      active = false
    }
  }, [])

  const solicitarInscripcion = (nombre) => {
    show_alert(`¡Inscripción solicitada para el curso: ${nombre}!`, 'success')
  }

  return { cursos, cargando, solicitarInscripcion }
}
