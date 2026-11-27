import { useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import api from '../../api'
import { show_alert } from '../../components/functions/Showpro_functions'

const MySwal = withReactContent(Swal)

const solicitarSecciones = async () => {
  const [
    seccionesRes,
    ofertasRes,
    estudiantesRes,
    carrerasModulosRes,
    materiasModulosRes,
  ] = await Promise.all([
    api.get('/seccion/'),
    api.get('/Oferta/'),
    api.get('/estudiantes/'),
    api.get('/Carrera_Modulo/'),
    api.get('/modulo_materia/'),
  ])

  return {
    secciones: Array.isArray(seccionesRes.data) ? seccionesRes.data : [],
    ofertas: Array.isArray(ofertasRes.data) ? ofertasRes.data : [],
    estudiantes: Array.isArray(estudiantesRes.data) ? estudiantesRes.data : [],
    carrerasModulos: Array.isArray(carrerasModulosRes.data) ? carrerasModulosRes.data : [],
    materiasModulos: Array.isArray(materiasModulosRes.data) ? materiasModulosRes.data : [],
  }
}

export function useCrudSeccion() {
  const [secciones, setSecciones] = useState([])
  const [ofertas, setOfertas] = useState([])
  const [estudiantes, setEstudiantes] = useState([])
  const [carrerasModulos, setCarrerasModulos] = useState([])
  const [materiasModulos, setMateriasModulos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [sectionStudents, setSectionStudents] = useState([])
  const [selectedSection, setSelectedSection] = useState(null)
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false)
  const [studentForm, setStudentForm] = useState({
    estudiante: '',
    idcarremo: '',
    horario: '',
  })
  const [idsecc, setIdsecc] = useState('')
  const [nomsecc, setNomsecc] = useState('')
  const [operation, setOperation] = useState(1)
  const [title, setTitle] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const aplicarSecciones = (data) => {
    setSecciones(data.secciones)
    setOfertas(data.ofertas)
    setEstudiantes(data.estudiantes)
    setCarrerasModulos(data.carrerasModulos)
    setMateriasModulos(data.materiasModulos)
  }

  const cargarSecciones = async () => {
    setLoading(true)
    try {
      aplicarSecciones(await solicitarSecciones())
    } catch (error) {
      console.error(error)
      const detail = error.response?.data?.detail
      show_alert(
        typeof detail === 'string'
          ? detail
          : 'Error al cargar secciones y estudiantes',
        'error'
      )
      setSecciones([])
      setOfertas([])
      setEstudiantes([])
      setCarrerasModulos([])
      setMateriasModulos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    solicitarSecciones()
      .then((data) => {
        if (active) aplicarSecciones(data)
      })
      .catch((error) => {
        if (!active) return
        console.error(error)
        const detail = error.response?.data?.detail
        show_alert(
          typeof detail === 'string'
            ? detail
            : 'Error al cargar secciones y estudiantes',
          'error'
        )
        setSecciones([])
        setOfertas([])
        setEstudiantes([])
        setCarrerasModulos([])
        setMateriasModulos([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const contarEstudiantes = (seccionId) =>
    ofertas.filter(
      (o) =>
        Number(o.idsecc) === Number(seccionId) &&
        o.estudiante != null &&
        String(o.estudiante).trim() !== ''
    ).length

  const openStudentsModal = (seccion) => {
    setSelectedSection(seccion)

    const lista = ofertas
      .filter(
        (oferta) =>
          Number(oferta.idsecc) === Number(seccion.idsecc) &&
          oferta.estudiante != null &&
          String(oferta.estudiante).trim() !== ''
      )
      .map((oferta) => {
        const estudiante = estudiantes.find(
          (item) => item.ciestu === oferta.estudiante
        )
        return {
          ...oferta,
          nombreCompleto: estudiante
            ? `${estudiante.nombreestu ?? ''} ${estudiante.apelliestu ?? ''}`.trim()
            : oferta.estudiante,
          estudianteData: estudiante ?? null,
        }
      })

    setSectionStudents(lista)
    setStudentForm({
      estudiante: '',
      idcarremo: carrerasModulos[0]?.idcarremo ?? '',
      horario: '',
    })
    setIsStudentsModalOpen(true)
  }

  const closeStudentsModal = () => {
    setSelectedSection(null)
    setSectionStudents([])
    setIsStudentsModalOpen(false)
    setStudentForm({ estudiante: '', idcarremo: '', horario: '' })
  }

  const eliminarEstudianteDeSeccion = async (oferta) => {
    try {
      await api.delete(`/Oferta/${oferta.idseccmo}`)
      show_alert('Estudiante eliminado de la sección', 'success')
      await cargarSecciones()
      if (selectedSection) {
        openStudentsModal(selectedSection)
      }
    } catch (error) {
      console.error(error)
      const detail = error.response?.data?.detail
      show_alert(
        typeof detail === 'string'
          ? detail
          : 'No se pudo eliminar al estudiante de la sección',
        'error'
      )
    }
  }

  const guardarEstudianteEnSeccion = async () => {
    if (!selectedSection) {
      show_alert('Selecciona una sección primero', 'warning')
      return
    }
    if (!studentForm.estudiante) {
      show_alert('Selecciona un estudiante', 'warning')
      return
    }
    if (!studentForm.idcarremo) {
      show_alert('Selecciona la materia / enlace académico', 'warning')
      return
    }

    const idcarremo = Number(studentForm.idcarremo)
    if (!Number.isInteger(idcarremo) || idcarremo <= 0) {
      show_alert(
        'La materia seleccionada no tiene un enlace académico válido',
        'warning'
      )
      return
    }

    const relacion = carrerasModulos.find(
      (cm) => Number(cm.idcarremo) === idcarremo
    )
    if (!relacion || !relacion.idcarrera) {
      show_alert(
        'No se pudo determinar la carrera de ese enlace académico',
        'warning'
      )
      return
    }

    try {
      const payload = {
        idcarrera: Number(relacion.idcarrera),
        idcarremo,
        idsecc: Number(selectedSection.idsecc),
        estudiante: studentForm.estudiante,
        horario: studentForm.horario ? Number(studentForm.horario) : null,
      }

      await api.post('/Oferta/', payload)
      show_alert('Estudiante agregado a la sección', 'success')
      closeStudentsModal()
      await cargarSecciones()
    } catch (error) {
      console.error(error)
      const detail = error.response?.data?.detail
      show_alert(
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((d) => d.msg || JSON.stringify(d)).join(' | ')
            : 'No se pudo agregar al estudiante a la sección',
        'error'
      )
    }
  }

  const seccionesFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return secciones
    return secciones.filter((s) => {
      const nombre = String(s.nomsecc || '').toLowerCase()
      const id = String(s.idsecc ?? '')
      return nombre.includes(q) || id.includes(q)
    })
  }, [secciones, busqueda])

  const limpiarFormulario = () => {
    setIdsecc('')
    setNomsecc('')
  }

  const openModal = (op, item = null) => {
    limpiarFormulario()
    setOperation(op)

    if (op === 1) {
      setTitle('Registrar Sección')
    } else if (item) {
      setTitle('Editar Sección')
      setIdsecc(item.idsecc)
      setNomsecc(item.nomsecc || '')
    }

    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    limpiarFormulario()
  }

  const enviarSolicitud = async (metodo, parametros = {}, idPath = null) => {
    try {
      if (metodo === 'POST') {
        await api.post('/seccion/', parametros)
      } else if (metodo === 'PATCH') {
        await api.patch(`/seccion/${idPath}`, parametros)
      } else if (metodo === 'DELETE') {
        await api.delete(`/seccion/${idPath}`)
      }

      const msg =
        metodo === 'DELETE'
          ? 'Sección eliminada correctamente'
          : metodo === 'POST'
            ? 'Sección registrada correctamente'
            : 'Sección actualizada correctamente'
      show_alert(msg, 'success')
      closeModal()
      await cargarSecciones()
    } catch (error) {
      console.error(error)
      const detail = error.response?.data?.detail
      show_alert(
        typeof detail === 'string' ? detail : 'Error en la operación',
        'error'
      )
    }
  }

  const validar = () => {
    if (nomsecc.trim() === '') {
      show_alert('Escribe el nombre de la sección', 'warning')
      return
    }

    const parametros = { nomsecc: nomsecc.trim() }
    if (operation === 1) {
      enviarSolicitud('POST', parametros)
    } else {
      enviarSolicitud('PATCH', parametros, idsecc)
    }
  }

  const deleteSeccion = (item) => {
    MySwal.fire({
      title: `¿Seguro de eliminar la sección "${item.nomsecc}"?`,
      text: 'No se podrá dar marcha atrás',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    }).then((result) => {
      if (result.isConfirmed) {
        enviarSolicitud('DELETE', {}, item.idsecc)
      } else {
        show_alert('La sección no fue eliminada', 'info')
      }
    })
  }

  const inicial = (s) => {
    const n = (s.nomsecc || '?').trim()
    return n.charAt(0).toUpperCase()
  }

  return {
    secciones,
    ofertas,
    estudiantes,
    carrerasModulos,
    materiasModulos,
    loading,
    busqueda,
    setBusqueda,
    sectionStudents,
    selectedSection,
    isStudentsModalOpen,
    studentForm,
    setStudentForm,
    nomsecc,
    setNomsecc,
    operation,
    title,
    isModalOpen,
    contarEstudiantes,
    openStudentsModal,
    closeStudentsModal,
    eliminarEstudianteDeSeccion,
    guardarEstudianteEnSeccion,
    seccionesFiltradas,
    openModal,
    closeModal,
    validar,
    deleteSeccion,
    inicial,
  }
}
