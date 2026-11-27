import { useEffect, useState } from 'react'
import api from '../../api'
import { show_alert } from '../../components/functions/Showpro_functions'

export function useInscripcionEstudiante() {
  const [usuario] = useState(() => JSON.parse(localStorage.getItem('usuario') || '{}'))
  const [misDatosAcademicos, setMisDatosAcademicos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let active = true

    const cargarEstadoAcademico = async () => {
      try {
        const cedulaEst = usuario?.ciestu || usuario?.cedula || usuario?.ci

        const [resIns, resDetalles, resSecciones, resNotas] = await Promise.all([
          api.get('/inscipcion/').catch(() => ({ data: [] })),
          api.get('/detalles-inscripcion/').catch(() => api.get('/detalle-inscripcion/').catch(() => ({ data: [] }))),
          api.get('/seccion/').catch(() => ({ data: [] })),
          api.get(`/Notas/estudiante/${cedulaEst}`).catch(() => ({ data: [] })),
        ])

        const listaInscripciones = Array.isArray(resIns.data) ? resIns.data : []
        const listaDetalles = Array.isArray(resDetalles.data) ? resDetalles.data : []
        const listaSecciones = Array.isArray(resSecciones.data) ? resSecciones.data : []
        const listaNotas = Array.isArray(resNotas.data) ? resNotas.data : []
        const misIns = listaInscripciones.filter((ins) => String(ins.ciestu) === String(cedulaEst))

        const consolidado = misIns.flatMap((ins) => {
          const detallesInscripcion = ins.detalles?.length
            ? ins.detalles
            : listaDetalles.filter(
              (detalle) => Number(detalle.inscripcion_periodo_id || detalle.inscripcion_id) === Number(ins.id)
            )

          return detallesInscripcion.map((detalle) => {
            const seccionObj = detalle.seccion_rel || listaSecciones.find(
              (seccion) => Number(seccion.idsecc || seccion.id) === Number(detalle.seccion_id)
            )
            const notaModulo = listaNotas.find(
              (nota) => Number(nota.seccion_id || nota.idsecc) === Number(detalle.seccion_id)
            )
            const calificacion = notaModulo?.calificacion || notaModulo?.nota || 0
            const aprobado = calificacion >= 10

            return {
              id: ins.id,
              detalleId: detalle.id,
              estadoInscripcion: ins.estado,
              seccionNombre: seccionObj?.nomsecc || seccionObj?.nombresecc || seccionObj?.nombre || `Módulo #${detalle.seccion_id}`,
              calificacion,
              aprobado,
              observacion: aprobado ? 'Módulo Aprobado - Elegible para siguiente nivel' : 'En Curso / Pendiente',
            }
          })
        })

        if (active) setMisDatosAcademicos(consolidado)
      } catch (error) {
        if (!active) return
        console.error('Error al cargar estado académico:', error)
        show_alert('Error al cargar tu información', 'error')
      } finally {
        if (active) setCargando(false)
      }
    }

    cargarEstadoAcademico()
    return () => {
      active = false
    }
  }, [usuario])

  const moduloActual = misDatosAcademicos[misDatosAcademicos.length - 1]

  return { usuario, misDatosAcademicos, moduloActual, cargando }
}
