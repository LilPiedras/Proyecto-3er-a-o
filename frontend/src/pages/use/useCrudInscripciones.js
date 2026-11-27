import { useEffect, useState } from 'react'
import api from '../../api'
import { show_alert } from '../../components/functions/Showpro_functions'

const obtenerNombreSeccionConModulo = (sec, listaOfertas, listaModulos, listaMatMod) => {
  if (!sec) return 'Sección'
  const idSeccion = Number(sec.idsecc || sec.id)
  const nombreSecBase = sec.nomsecc || sec.nombreseccion || sec.nombre || `Sección #${idSeccion}`
  const ofertaRel = listaOfertas.find((of) => Number(of.idsecc || of.id_seccion) === idSeccion)
  let nombreModulo = ''

  if (ofertaRel) {
    const idMod = ofertaRel.idmodulo || ofertaRel.modulo_id
    if (idMod) {
      const modObj = listaModulos.find((m) => Number(m.idmodulo || m.id) === Number(idMod))
      if (modObj) nombreModulo = modObj.nombremodulo || modObj.nombre
    } else if (ofertaRel.idcarremo) {
      const matModObj = listaMatMod.find((mm) => Number(mm.idmatemo || mm.id) === Number(ofertaRel.idcarremo))
      if (matModObj) {
        const modObj = listaModulos.find((m) => Number(m.idmodulo || m.id) === Number(matModObj.idmodulo))
        if (modObj) nombreModulo = modObj.nombremodulo || modObj.nombre
      }
    }
  }

  return nombreModulo ? `${nombreModulo} — Sección ${nombreSecBase}` : `Sección ${nombreSecBase}`
}

const solicitarDatos = async () => {
  const [resEst, resPer, resSec, resIns, resMod, resOfer, resMatMod] = await Promise.all([
    api.get('/estudiantes/').catch(() => api.get('/estudiante/').catch(() => ({ data: [] }))),
    api.get('/periodo/').catch(() => ({ data: [] })),
    api.get('/seccion/').catch(() => ({ data: [] })),
    api.get('/inscipcion/').catch(() => ({ data: [] })),
    api.get('/modulo/').catch(() => ({ data: [] })),
    api.get('/oferta-seccion/').catch(() => api.get('/oferta_seccion/').catch(() => ({ data: [] }))),
    api.get('/materias-modulo/').catch(() => ({ data: [] })),
  ])

  const estudiantes = Array.isArray(resEst.data) ? resEst.data : []
  const periodos = Array.isArray(resPer.data) ? resPer.data : []
  const secciones = Array.isArray(resSec.data) ? resSec.data : []
  const inscripciones = Array.isArray(resIns.data) ? resIns.data : []
  const modulos = Array.isArray(resMod.data) ? resMod.data : []
  const ofertasSeccion = Array.isArray(resOfer.data) ? resOfer.data : []
  const materiasModulo = Array.isArray(resMatMod.data) ? resMatMod.data : []

  const inscripcionesDetalladas = inscripciones.flatMap((ins) => {
    const estObj = estudiantes.find((e) => String(e.ciestu || e.cedula || e.ci) === String(ins.ciestu))
    const perObj = periodos.find((p) => Number(p.id) === Number(ins.periodo_id))
    const nombreEst = estObj
      ? `${estObj.nombreestu || estObj.nombre || ''} ${estObj.apelliestu || estObj.apellido || ''}`
      : 'Estudiante'

    return (ins.detalles || []).map((detalle) => {
      const seccionIdInscrita = detalle.seccion_id
      const secObj = detalle.seccion_rel || secciones.find(
        (seccion) => Number(seccion.idsecc || seccion.id) === Number(seccionIdInscrita)
      )
      const nombreSeccionCompleto = secObj
        ? obtenerNombreSeccionConModulo(secObj, ofertasSeccion, modulos, materiasModulo)
        : `Sección #${seccionIdInscrita}`

      return {
        id: ins.id,
        detalleId: detalle.id,
        ciestu: ins.ciestu,
        estudianteNombre: nombreEst,
        periodoNombre: perObj?.nombre || `Período #${ins.periodo_id}`,
        seccionNombre: nombreSeccionCompleto,
        fecha: ins.fecha_inscripcion || 'Registrada',
        estado: ins.estado,
      }
    })
  })

  return { estudiantes, periodos, secciones, modulos, ofertasSeccion, materiasModulo, inscripcionesDetalladas }
}

export function useCrudInscripciones() {
  const [estudiantes, setEstudiantes] = useState([])
  const [periodos, setPeriodos] = useState([])
  const [secciones, setSecciones] = useState([])
  const [modulos, setModulos] = useState([])
  const [ofertasSeccion, setOfertasSeccion] = useState([])
  const [materiasModulo, setMateriasModulo] = useState([])
  const [inscripcionesDetalladas, setInscripcionesDetalladas] = useState([])
  const [ciestu, setCiestu] = useState('')
  const [periodoId, setPeriodoId] = useState('')
  const [seccionIds, setSeccionIds] = useState([])
  const [estado, setEstado] = useState('ACTIVO')
  const [cedulaUbicacion, setCedulaUbicacion] = useState('')
  const [resultadoUbicacion, setResultadoUbicacion] = useState(null)
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const aplicarDatos = (data) => {
    setEstudiantes(data.estudiantes)
    setPeriodos(data.periodos)
    setSecciones(data.secciones)
    setModulos(data.modulos)
    setOfertasSeccion(data.ofertasSeccion)
    setMateriasModulo(data.materiasModulo)
    setInscripcionesDetalladas(data.inscripcionesDetalladas)
  }

  const cargarDatos = async () => {
    setCargando(true)
    try {
      aplicarDatos(await solicitarDatos())
    } catch (error) {
      console.error('Error al cargar datos:', error)
      show_alert('Error al cargar los datos de inscripciones', 'error')
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
        console.error('Error al cargar datos:', error)
        show_alert('Error al cargar los datos de inscripciones', 'error')
      })
      .finally(() => {
        if (active) setCargando(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handleConsultarUbicacion = async (e) => {
    e.preventDefault()
    if (!cedulaUbicacion.trim()) {
      return show_alert('Ingresa la cédula del estudiante', 'warning')
    }

    setBuscandoUbicacion(true)
    setResultadoUbicacion(null)

    try {
      const response = await api.get(`/ubicacion-academica/estudiante/${encodeURIComponent(cedulaUbicacion.trim())}`)
        .catch(() => null)

      if (response && response.data) {
        setResultadoUbicacion(response.data.ubicacion_academica || response.data)
        show_alert('Ubicación encontrada', 'success')
      } else {
        const inscripcionesEstudiante = inscripcionesDetalladas.filter(
          ins => String(ins.ciestu).trim() === String(cedulaUbicacion).trim()
        )

        if (inscripcionesEstudiante.length > 0) {
          setResultadoUbicacion(inscripcionesEstudiante.map(ins => ({
            periodo: ins.periodoNombre,
            seccion: ins.seccionNombre,
            estado: ins.estado,
            estudiante: ins.estudianteNombre,
          })))
          show_alert('Ubicación encontrada', 'success')
        } else {
          show_alert('No se encontraron inscripciones activas para esta cédula', 'error')
        }
      }
    } catch (err) {
      console.error('Error en consulta de ubicación:', err)
      show_alert('Error al consultar la ubicación académica', 'error')
    } finally {
      setBuscandoUbicacion(false)
    }
  }

  const handleInscribir = async (e) => {
    e.preventDefault()
    if (!ciestu || !periodoId || !seccionIds.length) {
      return show_alert('Por favor completa todos los campos requeridos', 'warning')
    }

    try {
      setGuardando(true)
      const payloadInscripcion = {
        ciestu,
        periodo_id: parseInt(periodoId, 10),
        seccion_ids: seccionIds,
        estado,
      }
      await api.post('/inscipcion/', payloadInscripcion)
      show_alert('Estudiante matriculado con éxito', 'success')
      setCiestu('')
      setPeriodoId('')
      setSeccionIds([])
      cargarDatos()
    } catch (error) {
      console.error('Detalle del Error en FastAPI:', error.response?.data)
      const detail = error.response?.data?.detail
      show_alert(
        typeof detail === 'string' ? detail : 'Error al procesar la inscripción',
        'error'
      )
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminarInscripcion = async (id) => {
    try {
      await api.delete(`/inscipcion/${id}`)
      show_alert('Inscripción anulada correctamente', 'success')
      cargarDatos()
    } catch (error) {
      console.error(error)
      show_alert('Error al anular la inscripción', 'error')
    }
  }

  return {
    estudiantes,
    periodos,
    secciones,
    modulos,
    ofertasSeccion,
    materiasModulo,
    inscripcionesDetalladas,
    ciestu,
    setCiestu,
    periodoId,
    setPeriodoId,
    seccionIds,
    setSeccionIds,
    estado,
    setEstado,
    cedulaUbicacion,
    setCedulaUbicacion,
    resultadoUbicacion,
    buscandoUbicacion,
    cargando,
    guardando,
    obtenerNombreSeccionConModulo,
    cargarDatos,
    handleConsultarUbicacion,
    handleInscribir,
    handleEliminarInscripcion,
  }
}
