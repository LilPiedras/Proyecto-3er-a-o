import { useEffect, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import api from '../../api'
import { show_alert } from '../../components/functions/Showpro_functions'

const MySwal = withReactContent(Swal)

const cargarLista = async (url) => {
  try {
    const { data } = await api.get(url)
    return Array.isArray(data) ? data : []
  } catch (error) {
    if (error.response?.status === 404) return []
    throw error
  }
}

const solicitarDatos = async () => {
  const [mensualidades, metodos, monedas, estudiantes, periodos, carreras, ofertas] = await Promise.all([
    cargarLista('/mensualidad/'),
    cargarLista('/metodo-pago/'),
    cargarLista('/moneda-pago/'),
    cargarLista('/estudiantes/'),
    cargarLista('/periodo/'),
    cargarLista('/carrera/'),
    cargarLista('/Oferta/'),
  ])
  return { mensualidades, metodos, monedas, estudiantes, periodos, carreras, ofertas }
}

export function useCrudMensualidad() {
  const [mensualidades, setMensualidades] = useState([])
  const [estudiantes, setEstudiantes] = useState([])
  const [periodos, setPeriodos] = useState([])
  const [carreras, setCarreras] = useState([])
  const [ofertas, setOfertas] = useState([])
  const [metodos, setMetodos] = useState([])
  const [monedas, setMonedas] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [checkingExpirations, setCheckingExpirations] = useState(false)
  const [downloadingReport, setDownloadingReport] = useState(false)
  const [downloadingExcel, setDownloadingExcel] = useState(false)
  const [cotizacion, setCotizacion] = useState(null)
  const [cargandoCotizacion, setCargandoCotizacion] = useState(false)
  const [errorCotizacion, setErrorCotizacion] = useState('')
  const solicitudCotizacion = useRef(0)
  const [modal, setModal] = useState(false)
  const [catalogoActivo, setCatalogoActivo] = useState(null)
  const [operation, setOperation] = useState('create')
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState({
    metodopago: '',
    monedapago: '',
    monto_carreras_usd: '',
    monto_guardado: '',
    monto_extra: '0',
    tasa_conversion: '',
    verificacion: false,
    periodo_id: '',
    fecha_corte: '',
    estudiante: '',
    estado: 'pendiente',
    factura: '',
    fechapago: '',
  })
  const puedeGestionar = Number(localStorage.getItem('idrol')) === 1

  const aplicarDatos = (data) => {
    setMensualidades(data.mensualidades)
    setMetodos(data.metodos)
    setMonedas(data.monedas)
    setEstudiantes(data.estudiantes)
    setPeriodos(data.periodos)
    setCarreras(data.carreras)
    setOfertas(data.ofertas)
  }

  const cargarDatos = async () => {
    setLoading(true)
    setErrorCarga('')
    try {
      aplicarDatos(await solicitarDatos())
    } catch (error) {
      const detail = error.response?.data?.detail
      const mensaje = typeof detail === 'string' ? detail : 'No se pudieron cargar las mensualidades y sus catálogos'
      setErrorCarga(mensaje)
      show_alert(mensaje, 'error')
    } finally {
      setLoading(false)
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
        const detail = error.response?.data?.detail
        const mensaje = typeof detail === 'string' ? detail : 'No se pudieron cargar las mensualidades y sus catálogos'
        setErrorCarga(mensaje)
        show_alert(mensaje, 'error')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const limpiarFormulario = () => {
    setSelectedId(null)
    setForm({
      metodopago: metodos.find((metodo) => Number(metodo.idmetodopago) === Number(form.metodopago))?.idmetodopago ?? metodos[0]?.idmetodopago ?? '',
      monedapago: monedas.find((moneda) => Number(moneda.idmoneda) === Number(form.monedapago))?.idmoneda ?? monedas[0]?.idmoneda ?? '',
      monto_carreras_usd: '',
      monto_guardado: '',
      monto_extra: '0',
      tasa_conversion: '',
      verificacion: false,
      periodo_id: periodos[0]?.id ?? '',
      fecha_corte: '',
      estudiante: estudiantes[0]?.ciestu ?? '',
      estado: 'pendiente',
      factura: '',
      fechapago: '',
    })
  }

  const cargarCotizacion = async (estudiante, periodoId) => {
    const solicitudActual = ++solicitudCotizacion.current
    setCotizacion(null)
    setErrorCotizacion('')
    if (!estudiante || !periodoId) {
      setCargandoCotizacion(false)
      return
    }

    setCargandoCotizacion(true)
    try {
      const { data } = await api.get('/mensualidad/cotizacion', {
        params: { estudiante, periodo_id: periodoId },
      })
      if (solicitudActual === solicitudCotizacion.current) setCotizacion(data)
    } catch (error) {
      if (solicitudActual === solicitudCotizacion.current) {
        const detail = error.response?.data?.detail
        setErrorCotizacion(typeof detail === 'string' ? detail : 'No se pudo calcular el precio de las carreras')
      }
    } finally {
      if (solicitudActual === solicitudCotizacion.current) setCargandoCotizacion(false)
    }
  }

  const abrirModal = (modo, mensualidad = null) => {
    setOperation(modo)
    let estudianteSeleccionado
    let periodoSeleccionado
    if (mensualidad) {
      solicitudCotizacion.current += 1
      setSelectedId(mensualidad.idmensualidad)
      setCotizacion(null)
      setErrorCotizacion('')
      setCargandoCotizacion(false)
      estudianteSeleccionado = mensualidad.estudiantes_asignados?.[0]?.estudiante ?? ''
      periodoSeleccionado = mensualidad.periodo_id ?? ''
      setForm({
        metodopago: mensualidad.metodopago ?? '',
        monedapago: mensualidad.monedapago ?? '',
        monto_carreras_usd: String(mensualidad.monto_carreras_usd ?? '0'),
        monto_guardado: String(mensualidad.monto ?? '0'),
        monto_extra: String(mensualidad.monto_extra ?? '0'),
        tasa_conversion: String(mensualidad.tasa_conversion ?? '1'),
        verificacion: Boolean(mensualidad.verificacion),
        periodo_id: periodoSeleccionado,
        fecha_corte: mensualidad.fecha_corte ?? '',
        estudiante: estudianteSeleccionado,
        estado: mensualidad.estudiantes_asignados?.[0]?.estado ?? mensualidad.estado ?? 'pendiente',
        factura: mensualidad.estudiantes_asignados?.[0]?.factura ?? '',
        fechapago: mensualidad.estudiantes_asignados?.[0]?.fechapago ?? '',
      })
    } else {
      limpiarFormulario()
      estudianteSeleccionado = estudiantes[0]?.ciestu || ''
      periodoSeleccionado = periodos[0]?.id || ''
    }
    cargarCotizacion(estudianteSeleccionado, periodoSeleccionado)
    setModal(true)
  }

  const cerrarModal = () => {
    solicitudCotizacion.current += 1
    setCotizacion(null)
    setErrorCotizacion('')
    setModal(false)
  }

  const actualizarCampo = (event) => {
    const { name, value, type, checked } = event.target
    setForm((actual) => ({ ...actual, [name]: type === 'checkbox' ? checked : value }))
    if (operation === 'create' && (name === 'estudiante' || name === 'periodo_id')) {
      cargarCotizacion(
        name === 'estudiante' ? value : form.estudiante,
        name === 'periodo_id' ? value : form.periodo_id,
      )
    }
  }

  const montoCarrerasUsd = Number(
    operation === 'create'
      ? cotizacion?.monto_carreras_usd ?? 0
      : form.monto_carreras_usd || 0,
  )
  const tasaConversion = Number(form.tasa_conversion)
  const montoExtra = Number(form.monto_extra)
  const montoCalculado = operation === 'create'
    ? Number.isFinite(montoCarrerasUsd * tasaConversion + montoExtra)
      ? Number((montoCarrerasUsd * tasaConversion + montoExtra).toFixed(2))
      : 0
    : Number(form.monto_guardado || 0)
  const carrerasRegistradas = [...new Set(
    ofertas
      .filter((oferta) => String(oferta.estudiante) === String(form.estudiante) && oferta.idcarrera != null)
      .map((oferta) => Number(oferta.idcarrera)),
  )].map((idcarrera) => (
    carreras.find((carrera) => Number(carrera.idcarrera) === idcarrera)?.nombrecarrera
      || `Carrera #${idcarrera}`
  ))

  const guardar = async (event) => {
    event.preventDefault()
    const pagoRegistrado = ['pagado', 'completado'].includes(form.estado)
    if (!form.metodopago || !form.monedapago || !form.periodo_id || !form.fecha_corte || (operation === 'create' && !form.estudiante)) {
      show_alert('Completa el estudiante, método, moneda, periodo y fecha de corte', 'warning')
      return
    }
    if (pagoRegistrado && (!form.factura.trim() || !form.fechapago)) {
      show_alert('Para registrar el pago, indica la referencia del comprobante y la fecha de pago', 'warning')
      return
    }
    if (operation === 'create' && (!cotizacion || cargandoCotizacion || errorCotizacion)) {
      show_alert(errorCotizacion || 'Espera a que se calcule el precio mínimo de las carreras', 'warning')
      return
    }
    if (operation === 'create' && (!Number.isFinite(tasaConversion) || tasaConversion <= 0 || !Number.isFinite(montoExtra) || montoExtra < 0 || montoCalculado <= 0)) {
      show_alert('Indica una tasa de cambio positiva y un extra igual o mayor que cero', 'warning')
      return
    }

    const payload = {
      metodopago: Number(form.metodopago),
      monedapago: Number(form.monedapago),
      ...(operation === 'create' && {
        periodo_id: Number(form.periodo_id),
        monto_extra: montoExtra,
        tasa_conversion: tasaConversion,
      }),
      verificacion: form.verificacion,
      fecha_corte: form.fecha_corte,
      estado: pagoRegistrado ? 'pagado' : form.estado,
      ...(pagoRegistrado && {
        factura: form.factura.trim(),
        fechapago: form.fechapago,
      }),
    }

    try {
      if (operation === 'create') {
        await api.post('/mensualidad/', { ...payload, estudiante: form.estudiante })
        show_alert('Mensualidad registrada correctamente', 'success')
      } else {
        await api.patch(`/mensualidad/${selectedId}`, payload)
        show_alert('Mensualidad actualizada correctamente', 'success')
      }
      cerrarModal()
      await cargarDatos()
    } catch (error) {
      const detail = error.response?.data?.detail
      show_alert(typeof detail === 'string' ? detail : 'No se pudo guardar la mensualidad', 'error')
    }
  }

  const verificarVencimientos = async () => {
    setCheckingExpirations(true)
    try {
      const { data } = await api.post('/mensualidad/verificar-vencimientos')
      const count = Number(data.actualizados) || 0
      show_alert(
        count
          ? `${count} pago(s) pendiente(s) marcado(s) como vencido(s)`
          : 'No hay pagos pendientes vencidos',
        'success'
      )
      await cargarDatos()
    } catch (error) {
      const detail = error.response?.data?.detail
      show_alert(typeof detail === 'string' ? detail : 'No se pudieron verificar los vencimientos', 'error')
    } finally {
      setCheckingExpirations(false)
    }
  }

  const descargarReporte = async () => {
    setDownloadingReport(true)
    try {
      const { data } = await api.get('/analitics/mensualidades/pdf', { responseType: 'blob' })
      const url = URL.createObjectURL(data)
      const enlace = document.createElement('a')
      enlace.href = url
      enlace.download = 'reporte_mensualidades.pdf'
      document.body.appendChild(enlace)
      enlace.click()
      enlace.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      const detail = error.response?.data?.detail
      show_alert(typeof detail === 'string' ? detail : 'No se pudo generar el reporte PDF de mensualidades', 'error')
    } finally {
      setDownloadingReport(false)
    }
  }

  const descargarExcel = async () => {
    setDownloadingExcel(true)
    try {
      const { data } = await api.get('/mensualidad/excel', { responseType: 'blob' })
      const blob = data instanceof Blob
        ? data
        : new Blob([data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          })
      const url = URL.createObjectURL(blob)
      const enlace = document.createElement('a')
      enlace.href = url
      enlace.download = 'reporte_mensualidades.xlsx'
      document.body.appendChild(enlace)
      enlace.click()
      enlace.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      const detail = error.response?.data?.detail
      show_alert(typeof detail === 'string' ? detail : 'No se pudo generar el reporte Excel de mensualidades', 'error')
    } finally {
      setDownloadingExcel(false)
    }
  }

  const obtenerNombrePeriodo = (id) => periodos.find((periodo) => Number(periodo.id) === Number(id))?.nombre ?? `ID ${id}`

  const eliminar = async (mensualidad) => {
    const result = await MySwal.fire({
      title: `¿Desactivar la mensualidad ${obtenerNombrePeriodo(mensualidad.periodo_id)}?`,
      text: 'La mensualidad se conservará en la base de datos y dejará de aparecer entre las activas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })
    if (!result.isConfirmed) return

    try {
      await api.delete(`/mensualidad/${mensualidad.idmensualidad}`)
      show_alert('Mensualidad desactivada correctamente', 'success')
      await cargarDatos()
    } catch (error) {
      const detail = error.response?.data?.detail
      show_alert(typeof detail === 'string' ? detail : 'No se pudo eliminar la mensualidad', 'error')
    }
  }

  const abrirCatalogo = (catalogo) => setCatalogoActivo(catalogo)
  const cerrarCatalogo = () => setCatalogoActivo(null)

  const crearMetodoPago = async () => {
    const result = await Swal.fire({
      title: 'Añadir método de pago',
      html: '<input id="metodo-nombre" class="swal2-input" placeholder="Nombre del método"><input id="metodo-registro" class="swal2-input" placeholder="Registro">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar método',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const metodousado = Swal.getPopup().querySelector('#metodo-nombre').value.trim()
        const registro = Swal.getPopup().querySelector('#metodo-registro').value.trim()
        if (!metodousado || !registro) {
          Swal.showValidationMessage('Completa el nombre del método y el registro')
          return false
        }
        return { metodousado, registro }
      },
    })
    if (!result.isConfirmed) return

    try {
      await api.post('/metodo-pago/', result.value)
      const lista = await cargarLista('/metodo-pago/')
      setMetodos(lista)
      const nuevoMetodo = lista.reduce((ultimo, metodo) => metodo.idmetodopago > (ultimo?.idmetodopago ?? 0) ? metodo : ultimo, null)
      if (nuevoMetodo) setForm((actual) => ({ ...actual, metodopago: nuevoMetodo.idmetodopago }))
      show_alert('Método de pago añadido correctamente', 'success')
    } catch (error) {
      const detail = error.response?.data?.detail
      show_alert(typeof detail === 'string' ? detail : 'No se pudo añadir el método de pago', 'error')
    }
  }

  const editarMetodoPago = async (metodo) => {
    const result = await Swal.fire({
      title: 'Editar método de pago',
      html: '<input id="metodo-nombre" class="swal2-input" maxlength="20" placeholder="Nombre del método"><input id="metodo-registro" class="swal2-input" maxlength="20" placeholder="Registro">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar cambios',
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        const popup = Swal.getPopup()
        popup.querySelector('#metodo-nombre').value = metodo.metodousado
        popup.querySelector('#metodo-registro').value = metodo.registro ?? ''
      },
      preConfirm: () => {
        const popup = Swal.getPopup()
        const metodousado = popup.querySelector('#metodo-nombre').value.trim()
        const registro = popup.querySelector('#metodo-registro').value.trim()
        if (!metodousado || !registro) {
          Swal.showValidationMessage('Completa el nombre del método y el registro')
          return false
        }
        return { metodousado, registro }
      },
    })
    if (!result.isConfirmed) return

    try {
      const { data } = await api.patch(`/metodo-pago/${metodo.idmetodopago}`, result.value)
      setMetodos((actuales) => actuales.map((actual) => (
        actual.idmetodopago === data.idmetodopago ? data : actual
      )))
      show_alert('Método de pago actualizado correctamente', 'success')
    } catch (error) {
      const detail = error.response?.data?.detail
      show_alert(typeof detail === 'string' ? detail : 'No se pudo actualizar el método de pago', 'error')
    }
  }

  const eliminarMetodoPago = async (metodo) => {
    const result = await MySwal.fire({
      title: `¿Eliminar el método ${metodo.metodousado}?`,
      text: 'No se puede eliminar si está asociado a una mensualidad.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })
    if (!result.isConfirmed) return

    try {
      await api.delete(`/metodo-pago/${metodo.idmetodopago}`)
      setMetodos((actuales) => actuales.filter((actual) => actual.idmetodopago !== metodo.idmetodopago))
      setForm((actual) => Number(actual.metodopago) === Number(metodo.idmetodopago)
        ? { ...actual, metodopago: '' }
        : actual)
      show_alert('Método de pago eliminado correctamente', 'success')
    } catch (error) {
      const detail = error.response?.data?.detail
      show_alert(typeof detail === 'string' ? detail : 'No se pudo eliminar el método de pago', 'error')
    }
  }

  const crearMonedaPago = async () => {
    const result = await Swal.fire({
      title: 'Añadir moneda de pago',
      html: '<input id="moneda-nombre" class="swal2-input" placeholder="Nombre de la moneda"><input id="moneda-total" class="swal2-input" type="number" min="0" step="1" placeholder="Monto total"><input id="moneda-registro" class="swal2-input" placeholder="Registro">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar moneda',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const tipomoneda = Swal.getPopup().querySelector('#moneda-nombre').value.trim()
        const montototalValue = Swal.getPopup().querySelector('#moneda-total').value.trim()
        const montototal = Number(montototalValue)
        const registro = Swal.getPopup().querySelector('#moneda-registro').value.trim()
        if (!tipomoneda || !montototalValue || !registro || !Number.isInteger(montototal) || montototal < 0) {
          Swal.showValidationMessage('Completa los datos e indica un monto total válido')
          return false
        }
        return { tipomoneda, montototal, registro }
      },
    })
    if (!result.isConfirmed) return

    try {
      await api.post('/moneda-pago/', result.value)
      const lista = await cargarLista('/moneda-pago/')
      setMonedas(lista)
      const nuevaMoneda = lista.reduce((ultima, moneda) => moneda.idmoneda > (ultima?.idmoneda ?? 0) ? moneda : ultima, null)
      if (nuevaMoneda) setForm((actual) => ({ ...actual, monedapago: nuevaMoneda.idmoneda }))
      show_alert('Moneda de pago añadida correctamente', 'success')
    } catch (error) {
      const detail = error.response?.data?.detail
      show_alert(typeof detail === 'string' ? detail : 'No se pudo añadir la moneda de pago', 'error')
    }
  }

  const editarMonedaPago = async (moneda) => {
    const result = await Swal.fire({
      title: 'Editar moneda de pago',
      html: '<input id="moneda-nombre" class="swal2-input" maxlength="40" placeholder="Nombre de la moneda"><input id="moneda-total" class="swal2-input" type="number" min="0" step="1" placeholder="Monto total"><input id="moneda-registro" class="swal2-input" maxlength="100" placeholder="Registro">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar cambios',
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        const popup = Swal.getPopup()
        popup.querySelector('#moneda-nombre').value = moneda.tipomoneda
        popup.querySelector('#moneda-total').value = moneda.montototal
        popup.querySelector('#moneda-registro').value = moneda.registro
      },
      preConfirm: () => {
        const popup = Swal.getPopup()
        const tipomoneda = popup.querySelector('#moneda-nombre').value.trim()
        const montototalValue = popup.querySelector('#moneda-total').value.trim()
        const montototal = Number(montototalValue)
        const registro = popup.querySelector('#moneda-registro').value.trim()
        if (!tipomoneda || !montototalValue || !registro || !Number.isInteger(montototal) || montototal < 0) {
          Swal.showValidationMessage('Completa los datos e indica un monto total válido')
          return false
        }
        return { tipomoneda, montototal, registro }
      },
    })
    if (!result.isConfirmed) return

    try {
      const { data } = await api.patch(`/moneda-pago/${moneda.idmoneda}`, result.value)
      setMonedas((actuales) => actuales.map((actual) => (
        actual.idmoneda === data.idmoneda ? data : actual
      )))
      show_alert('Moneda de pago actualizada correctamente', 'success')
    } catch (error) {
      const detail = error.response?.data?.detail
      show_alert(typeof detail === 'string' ? detail : 'No se pudo actualizar la moneda de pago', 'error')
    }
  }

  const eliminarMonedaPago = async (moneda) => {
    const result = await MySwal.fire({
      title: `¿Eliminar la moneda ${moneda.tipomoneda}?`,
      text: 'No se puede eliminar si está asociada a una mensualidad.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })
    if (!result.isConfirmed) return

    try {
      await api.delete(`/moneda-pago/${moneda.idmoneda}`)
      setMonedas((actuales) => actuales.filter((actual) => actual.idmoneda !== moneda.idmoneda))
      setForm((actual) => Number(actual.monedapago) === Number(moneda.idmoneda)
        ? { ...actual, monedapago: '' }
        : actual)
      show_alert('Moneda de pago eliminada correctamente', 'success')
    } catch (error) {
      const detail = error.response?.data?.detail
      show_alert(typeof detail === 'string' ? detail : 'No se pudo eliminar la moneda de pago', 'error')
    }
  }

  const obtenerNombreMetodo = (id) => metodos.find((metodo) => metodo.idmetodopago === id)?.metodousado ?? `ID ${id}`
  const obtenerNombreMoneda = (id) => monedas.find((moneda) => moneda.idmoneda === id)?.tipomoneda ?? `ID ${id}`

  return {
    mensualidades,
    estudiantes,
    periodos,
    metodos,
    monedas,
    loading,
    errorCarga,
    checkingExpirations,
    downloadingReport,
    downloadingExcel,
    cotizacion,
    cargandoCotizacion,
    errorCotizacion,
    modal,
    operation,
    catalogoActivo,
    form,
    setForm,
    puedeGestionar,
    montoCarrerasUsd,
    montoCalculado,
    carrerasRegistradas,
    abrirModal,
    cerrarModal,
    abrirCatalogo,
    cerrarCatalogo,
    actualizarCampo,
    guardar,
    verificarVencimientos,
    descargarReporte,
    descargarExcel,
    eliminar,
    editarMetodoPago,
    editarMonedaPago,
    eliminarMetodoPago,
    eliminarMonedaPago,
    crearMetodoPago,
    crearMonedaPago,
    obtenerNombreMetodo,
    obtenerNombreMoneda,
    obtenerNombrePeriodo,
  }
}
