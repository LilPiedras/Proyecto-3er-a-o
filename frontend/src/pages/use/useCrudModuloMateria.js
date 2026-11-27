import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import api from '../../api'
import { show_alert } from '../../components/functions/Showpro_functions'

const MySwal = withReactContent(Swal)

const solicitarDatos = async () => {
  const resModulos = await api.get('/modulo/')
  const resMaterias = await api.get('/materia/')

  let resRelaciones = { data: [] }
  try {
    resRelaciones = await api.get('/materias-modulo/')
  } catch {
    console.warn('No se pudo cargar la tabla intermedia o está vacía.')
  }

  return {
    modulos: Array.isArray(resModulos.data) ? resModulos.data : [],
    materias: Array.isArray(resMaterias.data) ? resMaterias.data : [],
    relaciones: Array.isArray(resRelaciones.data) ? resRelaciones.data : [],
  }
}

export function useCrudModuloMateria() {
  const [modulos, setModulos] = useState([])
  const [materias, setMaterias] = useState([])
  const [relaciones, setRelaciones] = useState([])
  const [idModuloSeleccionado, setIdModuloSeleccionado] = useState('')
  const [cargando, setCargando] = useState(true)
  const [modalExportOpen, setModalExportOpen] = useState(false)
  const [urlPdfGenerado, setUrlPdfGenerado] = useState('')

  const aplicarDatos = ({ modulos: datosModulos, materias: datosMaterias, relaciones: datosRelaciones }) => {
    setModulos(datosModulos)
    setMaterias(datosMaterias)
    setRelaciones(datosRelaciones)
  }

  const cargarDatos = async () => {
    setCargando(true)
    try {
      aplicarDatos(await solicitarDatos())
    } catch (error) {
      console.error('Error al cargar datos:', error)
      show_alert('Error al obtener datos del servidor', 'error')
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
        show_alert('Error al obtener datos del servidor', 'error')
      })
      .finally(() => {
        if (active) setCargando(false)
      })

    return () => {
      active = false
    }
  }, [])

  const crearModulo = async () => {
    const { value: nombre } = await MySwal.fire({
      title: 'Nuevo Módulo',
      input: 'text',
      inputPlaceholder: 'Ej. Módulo 1...',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      confirmButtonColor: '#facc15',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'El nombre del módulo no puede estar vacío'
        }
      },
    })

    if (nombre) {
      try {
        await api.post('/modulo/', { nombremodulo: nombre.trim(), activo: true })
        show_alert('Módulo creado', 'success')
        cargarDatos()
      } catch {
        show_alert('Error al crear módulo', 'error')
      }
    }
  }

  const editarModulo = async () => {
    const moduloActual = modulos.find(m => (m.idmodulo ?? m.id)?.toString() === idModuloSeleccionado?.toString())
    if (!moduloActual) return show_alert('Selecciona un módulo válido', 'error')

    const { value: nuevoNombre } = await MySwal.fire({
      title: 'Editar Módulo',
      input: 'text',
      inputValue: moduloActual.nombremodulo || moduloActual.nombre || '',
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      confirmButtonColor: '#3b82f6',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'El nombre no puede estar vacío'
        }
      },
    })

    if (nuevoNombre) {
      try {
        const idTarget = moduloActual.idmodulo ?? moduloActual.id
        await api.put(`/modulo/${idTarget}`, { nombremodulo: nuevoNombre.trim() })
        show_alert('Módulo actualizado', 'success')
        cargarDatos()
      } catch {
        show_alert('Error al actualizar módulo', 'error')
      }
    }
  }

  const eliminarModulo = async () => {
    if (!idModuloSeleccionado) return
    const confirm = await MySwal.fire({
      title: '¿Eliminar Módulo?',
      text: 'Se eliminará el módulo seleccionado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#ef4444',
    })

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/modulo/${idModuloSeleccionado}`)
        show_alert('Módulo eliminado', 'success')
        setIdModuloSeleccionado('')
        cargarDatos()
      } catch {
        show_alert('Error al eliminar', 'error')
      }
    }
  }

  const crearMateria = async () => {
    const { value: formValues } = await MySwal.fire({
      title: 'Nueva Materia',
      html:
        '<input id="swal-mat1" class="swal2-input" placeholder="Nombre de la Materia">' +
        '<input id="swal-mat2" class="swal2-input" placeholder="Docente (Opcional)">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      confirmButtonColor: '#facc15',
      preConfirm: () => {
        const nombre = document.getElementById('swal-mat1').value.trim()
        const docente = document.getElementById('swal-mat2').value.trim()
        if (!nombre) {
          Swal.showValidationMessage('El nombre de la materia es obligatorio')
          return false
        }
        return [nombre, docente]
      },
    })

    if (formValues && formValues[0]) {
      try {
        await api.post('/materia/', {
          nombremateria: formValues[0],
          docente: formValues[1] ? formValues[1] : null,
          activo: true,
        })
        show_alert('Materia creada', 'success')
        cargarDatos()
      } catch {
        show_alert('Error al crear materia', 'error')
      }
    }
  }

  const editarMateria = async (mat) => {
    const idMat = mat?.idmateria ?? mat?.id
    if (!idMat) return

    const { value: formValues } = await MySwal.fire({
      title: 'Editar Materia',
      html:
        '<input id="swal-mat1" class="swal2-input" placeholder="Nombre">' +
        '<input id="swal-mat2" class="swal2-input" placeholder="Docente">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      confirmButtonColor: '#3b82f6',
      didOpen: () => {
        document.getElementById('swal-mat1').value = mat.nombremateria || mat.nombre || ''
        document.getElementById('swal-mat2').value = mat.docente || ''
      },
      preConfirm: () => {
        const nombre = document.getElementById('swal-mat1').value.trim()
        const docente = document.getElementById('swal-mat2').value.trim()
        if (!nombre) {
          Swal.showValidationMessage('El nombre de la materia es obligatorio')
          return false
        }
        return [nombre, docente]
      },
    })

    if (formValues && formValues[0]) {
      try {
        await api.put(`/materia/${idMat}`, {
          nombremateria: formValues[0],
          docente: formValues[1] ? formValues[1] : null,
        })
        show_alert('Materia actualizada', 'success')
        cargarDatos()
      } catch {
        show_alert('Error al actualizar materia', 'error')
      }
    }
  }

  const eliminarMateria = async (idmateria) => {
    if (!idmateria) return
    const confirm = await MySwal.fire({
      title: '¿Eliminar Materia?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#ef4444',
    })

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/materia/${idmateria}`)
        show_alert('Materia eliminada', 'success')
        cargarDatos()
      } catch {
        show_alert('Error al eliminar', 'error')
      }
    }
  }

  const asignarMateriaAModulo = async (idmateria) => {
    if (!idModuloSeleccionado) return show_alert('Selecciona un módulo', 'warning')

    const datosAEnviar = {
      idmodulo: parseInt(idModuloSeleccionado, 10),
      idmateria: parseInt(idmateria, 10),
    }

    try {
      await api.post('/materias-modulo/', datosAEnviar)
      show_alert('Materia vinculada', 'success')
      cargarDatos()
    } catch (error) {
      console.error('Error al vincular:', error.response?.data)
      show_alert('Error al vincular materia', 'error')
    }
  }

  const desvincularMateria = async (idmatemo) => {
    try {
      await api.delete(`/materias-modulo/${idmatemo}`)
      show_alert('Materia removida', 'success')
      cargarDatos()
    } catch {
      show_alert('Error al remover', 'error')
    }
  }

  const abrirModalExportar = () => {
    if (!idModuloSeleccionado) {
      return show_alert('Selecciona un módulo para exportar', 'warning')
    }

    const baseURL = api.defaults.baseURL || 'http://localhost:8000'
    const urlCompleta = `${baseURL.replace(/\/$/, "")}/modulo_materia/${idModuloSeleccionado}/exportar-pdf`

    setUrlPdfGenerado(urlCompleta)
    setModalExportOpen(true)
  }

  const descargarPdfDirecto = async () => {
    try {
      setCargando(true)
      const response = await api.get(`/modulo_materia/${idModuloSeleccionado}/exportar-pdf`, {
        responseType: 'blob',
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = `reporte_modulo_${idModuloSeleccionado}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      show_alert('PDF descargado con éxito', 'success')
    } catch (error) {
      console.error('Error al generar PDF:', error)
      show_alert('Error al exportar el PDF del módulo', 'error')
    } finally {
      setCargando(false)
    }
  }

  const relacionesDelModulo = relaciones.filter(r =>
    (r?.idmodulo ?? r?.id_modulo)?.toString() === idModuloSeleccionado?.toString()
  )

  const idsMateriasDelModulo = relacionesDelModulo.map(r =>
    (r?.idmateria ?? r?.id_materia)?.toString()
  )

  return {
    modulos,
    materias,
    idModuloSeleccionado,
    setIdModuloSeleccionado,
    cargando,
    modalExportOpen,
    setModalExportOpen,
    urlPdfGenerado,
    crearModulo,
    editarModulo,
    eliminarModulo,
    crearMateria,
    editarMateria,
    eliminarMateria,
    asignarMateriaAModulo,
    desvincularMateria,
    abrirModalExportar,
    descargarPdfDirecto,
    relacionesDelModulo,
    idsMateriasDelModulo,
  }
}
