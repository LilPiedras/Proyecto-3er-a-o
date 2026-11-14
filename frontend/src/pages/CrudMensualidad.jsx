import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const MySwal = withReactContent(Swal);
const estados = ['pendiente', 'pagado', 'vencido', 'completado'];

const CrudMensualidad = () => {
  const [mensualidades, setMensualidades] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [metodos, setMetodos] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [checkingExpirations, setCheckingExpirations] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [cotizacion, setCotizacion] = useState(null);
  const [cargandoCotizacion, setCargandoCotizacion] = useState(false);
  const [errorCotizacion, setErrorCotizacion] = useState('');
  const solicitudCotizacion = useRef(0);
  const [modal, setModal] = useState(false);
  const [operation, setOperation] = useState('create');
  const [selectedId, setSelectedId] = useState(null);
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
  });
  const puedeGestionar = Number(localStorage.getItem('idrol')) === 1;

  const cargarDatos = async () => {
    setLoading(true);
    setErrorCarga('');
    const cargarLista = async (url) => {
      try {
        const { data } = await api.get(url);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        if (error.response?.status === 404) return [];
        throw error;
      }
    };

    try {
      const [lista, listaMetodos, listaMonedas, listaEstudiantes, listaPeriodos, listaCarreras, listaOfertas] = await Promise.all([
        cargarLista('/mensualidad/'),
        cargarLista('/metodo-pago/'),
        cargarLista('/moneda-pago/'),
        cargarLista('/estudiantes/'),
        cargarLista('/periodo/'),
        cargarLista('/carrera/'),
        cargarLista('/Oferta/'),
      ]);
      setMensualidades(lista);
      setMetodos(listaMetodos);
      setMonedas(listaMonedas);
      setEstudiantes(listaEstudiantes);
      setPeriodos(listaPeriodos);
      setCarreras(listaCarreras);
      setOfertas(listaOfertas);
    } catch (error) {
      const detail = error.response?.data?.detail;
      const mensaje = typeof detail === 'string' ? detail : 'No se pudieron cargar las mensualidades y sus catálogos';
      setErrorCarga(mensaje);
      show_alert(mensaje, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const limpiarFormulario = () => {
    setSelectedId(null);
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
    });
  };

  const cargarCotizacion = async (estudiante, periodoId) => {
    const solicitudActual = ++solicitudCotizacion.current;
    setCotizacion(null);
    setErrorCotizacion('');
    if (!estudiante || !periodoId) {
      setCargandoCotizacion(false);
      return;
    }

    setCargandoCotizacion(true);
    try {
      const { data } = await api.get('/mensualidad/cotizacion', {
        params: { estudiante, periodo_id: periodoId },
      });
      if (solicitudActual === solicitudCotizacion.current) setCotizacion(data);
    } catch (error) {
      if (solicitudActual === solicitudCotizacion.current) {
        const detail = error.response?.data?.detail;
        setErrorCotizacion(typeof detail === 'string' ? detail : 'No se pudo calcular el precio de las carreras');
      }
    } finally {
      if (solicitudActual === solicitudCotizacion.current) setCargandoCotizacion(false);
    }
  };

  const abrirModal = (modo, mensualidad = null) => {
    setOperation(modo);
    let estudianteSeleccionado;
    let periodoSeleccionado;
    if (mensualidad) {
      solicitudCotizacion.current += 1;
      setSelectedId(mensualidad.idmensualidad);
      setCotizacion(null);
      setErrorCotizacion('');
      setCargandoCotizacion(false);
      estudianteSeleccionado = mensualidad.estudiantes_asignados?.[0]?.estudiante ?? '';
      periodoSeleccionado = mensualidad.periodo_id ?? '';
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
      });
    } else {
      limpiarFormulario();
      estudianteSeleccionado = estudiantes[0]?.ciestu || '';
      periodoSeleccionado = periodos[0]?.id || '';
    }
    cargarCotizacion(estudianteSeleccionado, periodoSeleccionado);
    setModal(true);
  };

  const cerrarModal = () => {
    solicitudCotizacion.current += 1;
    setCotizacion(null);
    setErrorCotizacion('');
    setModal(false);
  };

  const actualizarCampo = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((actual) => ({ ...actual, [name]: type === 'checkbox' ? checked : value }));
    if (operation === 'create' && (name === 'estudiante' || name === 'periodo_id')) {
      cargarCotizacion(
        name === 'estudiante' ? value : form.estudiante,
        name === 'periodo_id' ? value : form.periodo_id,
      );
    }
  };

  const montoCarrerasUsd = Number(
    operation === 'create'
      ? cotizacion?.monto_carreras_usd ?? 0
      : form.monto_carreras_usd || 0,
  );
  const tasaConversion = Number(form.tasa_conversion);
  const montoExtra = Number(form.monto_extra);
  const montoCalculado = operation === 'create'
    ? Number.isFinite(montoCarrerasUsd * tasaConversion + montoExtra)
      ? Number((montoCarrerasUsd * tasaConversion + montoExtra).toFixed(2))
      : 0
    : Number(form.monto_guardado || 0);
  const carrerasRegistradas = [...new Set(
    ofertas
      .filter((oferta) => String(oferta.estudiante) === String(form.estudiante) && oferta.idcarrera != null)
      .map((oferta) => Number(oferta.idcarrera)),
  )].map((idcarrera) => (
    carreras.find((carrera) => Number(carrera.idcarrera) === idcarrera)?.nombrecarrera
      || `Carrera #${idcarrera}`
  ));

  const guardar = async (event) => {
    event.preventDefault();
    const pagoRegistrado = ['pagado', 'completado'].includes(form.estado);
    if (!form.metodopago || !form.monedapago || !form.periodo_id || !form.fecha_corte || (operation === 'create' && !form.estudiante)) {
      show_alert('Completa el estudiante, método, moneda, periodo y fecha de corte', 'warning');
      return;
    }
    if (pagoRegistrado && (!form.factura.trim() || !form.fechapago)) {
      show_alert('Para registrar el pago, indica la referencia del comprobante y la fecha de pago', 'warning');
      return;
    }
    if (operation === 'create' && (!cotizacion || cargandoCotizacion || errorCotizacion)) {
      show_alert(errorCotizacion || 'Espera a que se calcule el precio mínimo de las carreras', 'warning');
      return;
    }
    if (operation === 'create' && (!Number.isFinite(tasaConversion) || tasaConversion <= 0 || !Number.isFinite(montoExtra) || montoExtra < 0 || montoCalculado <= 0)) {
      show_alert('Indica una tasa de cambio positiva y un extra igual o mayor que cero', 'warning');
      return;
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
    };

    try {
      if (operation === 'create') {
        await api.post('/mensualidad/', { ...payload, estudiante: form.estudiante });
        show_alert('Mensualidad registrada correctamente', 'exito');
      } else {
        await api.patch(`/mensualidad/${selectedId}`, payload);
        show_alert('Mensualidad actualizada correctamente', 'exito');
      }
      cerrarModal();
      await cargarDatos();
    } catch (error) {
      const detail = error.response?.data?.detail;
      show_alert(typeof detail === 'string' ? detail : 'No se pudo guardar la mensualidad', 'error');
    }
  };

  const verificarVencimientos = async () => {
    setCheckingExpirations(true);
    try {
      const { data } = await api.post('/mensualidad/verificar-vencimientos');
      const count = Number(data.actualizados) || 0;
      show_alert(
        count
          ? `${count} pago(s) pendiente(s) marcado(s) como vencido(s)`
          : 'No hay pagos pendientes vencidos',
        'success'
      );
      await cargarDatos();
    } catch (error) {
      const detail = error.response?.data?.detail;
      show_alert(typeof detail === 'string' ? detail : 'No se pudieron verificar los vencimientos', 'error');
    } finally {
      setCheckingExpirations(false);
    }
  };

  const descargarReporte = async () => {
    setDownloadingReport(true);
    try {
      const { data } = await api.get('/analitics/mensualidades/pdf', { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = 'reporte_mensualidades.pdf';
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      const detail = error.response?.data?.detail;
      show_alert(typeof detail === 'string' ? detail : 'No se pudo generar el reporte PDF de mensualidades', 'error');
    } finally {
      setDownloadingReport(false);
    }
  };

  const eliminar = async (mensualidad) => {
    const result = await MySwal.fire({
      title: `¿Desactivar la mensualidad ${obtenerNombrePeriodo(mensualidad.periodo_id)}?`,
      text: 'La mensualidad se conservará en la base de datos y dejará de aparecer entre las activas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;

    try {
      await api.delete(`/mensualidad/${mensualidad.idmensualidad}`);
      show_alert('Mensualidad desactivada correctamente', 'success');
      await cargarDatos();
    } catch (error) {
      const detail = error.response?.data?.detail;
      show_alert(typeof detail === 'string' ? detail : 'No se pudo eliminar la mensualidad', 'error');
    }
  };

  const crearMetodoPago = async () => {
    const result = await Swal.fire({
      title: 'Añadir método de pago',
      html: '<input id="metodo-nombre" class="swal2-input" placeholder="Nombre del método"><input id="metodo-registro" class="swal2-input" placeholder="Registro">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar método',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const metodousado = Swal.getPopup().querySelector('#metodo-nombre').value.trim();
        const registro = Swal.getPopup().querySelector('#metodo-registro').value.trim();
        if (!metodousado || !registro) {
          Swal.showValidationMessage('Completa el nombre del método y el registro');
          return false;
        }
        return { metodousado, registro };
      },
    });
    if (!result.isConfirmed) return;

    try {
      await api.post('/metodo-pago/', result.value);
      const { data } = await api.get('/metodo-pago/');
      const lista = Array.isArray(data) ? data : [];
      setMetodos(lista);
      const nuevoMetodo = lista.reduce((ultimo, metodo) => metodo.idmetodopago > (ultimo?.idmetodopago ?? 0) ? metodo : ultimo, null);
      if (nuevoMetodo) setForm((actual) => ({ ...actual, metodopago: nuevoMetodo.idmetodopago }));
      show_alert('Método de pago añadido correctamente', 'exito');
    } catch (error) {
      const detail = error.response?.data?.detail;
      show_alert(typeof detail === 'string' ? detail : 'No se pudo añadir el método de pago', 'error');
    }
  };

  const crearMonedaPago = async () => {
    const result = await Swal.fire({
      title: 'Añadir moneda de pago',
      html: '<input id="moneda-nombre" class="swal2-input" placeholder="Nombre de la moneda"><input id="moneda-total" class="swal2-input" type="number" min="0" step="1" placeholder="Monto total"><input id="moneda-registro" class="swal2-input" placeholder="Registro">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar moneda',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const tipomoneda = Swal.getPopup().querySelector('#moneda-nombre').value.trim();
        const montototalValue = Swal.getPopup().querySelector('#moneda-total').value.trim();
        const montototal = Number(montototalValue);
        const registro = Swal.getPopup().querySelector('#moneda-registro').value.trim();
        if (!tipomoneda || !montototalValue || !registro || !Number.isInteger(montototal) || montototal < 0) {
          Swal.showValidationMessage('Completa los datos e indica un monto total válido');
          return false;
        }
        return { tipomoneda, montototal, registro };
      },
    });
    if (!result.isConfirmed) return;

    try {
      await api.post('/moneda-pago/', result.value);
      const { data } = await api.get('/moneda-pago/');
      const lista = Array.isArray(data) ? data : [];
      setMonedas(lista);
      const nuevaMoneda = lista.reduce((ultima, moneda) => moneda.idmoneda > (ultima?.idmoneda ?? 0) ? moneda : ultima, null);
      if (nuevaMoneda) setForm((actual) => ({ ...actual, monedapago: nuevaMoneda.idmoneda }));
      show_alert('Moneda de pago añadida correctamente', 'exito');
    } catch (error) {
      const detail = error.response?.data?.detail;
      show_alert(typeof detail === 'string' ? detail : 'No se pudo añadir la moneda de pago', 'error');
    }
  };

  const obtenerNombreMetodo = (id) => metodos.find((metodo) => metodo.idmetodopago === id)?.metodousado ?? `ID ${id}`;
  const obtenerNombreMoneda = (id) => monedas.find((moneda) => moneda.idmoneda === id)?.tipomoneda ?? `ID ${id}`;
  const obtenerNombrePeriodo = (id) => periodos.find((periodo) => Number(periodo.id) === Number(id))?.nombre ?? `ID ${id}`;
  const inputClass = 'w-full rounded border border-gray-700 bg-gray-800 p-2 text-white disabled:opacity-70';

  return (
    <section className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 mt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">Gestión de mensualidades</h1>
            <p className="mt-2 text-sm text-gray-400">
              {puedeGestionar
                ? 'Administra períodos, importes y formas de pago. Los pagos se marcan como vencidos tras un mes de retraso.'
                : 'Consulta los períodos, importes y estados de pago.'}
            </p>
          </div>
          {puedeGestionar && <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={descargarReporte}
              disabled={downloadingReport}
              className="rounded border border-red-500 px-4 py-2 font-semibold text-red-300 transition hover:bg-red-950 disabled:cursor-wait disabled:opacity-50"
            >
              <i className="fa-solid fa-file-pdf mr-2" aria-hidden="true" />
              {downloadingReport ? 'Generando PDF...' : 'Reporte PDF'}
            </button>
            <button
              type="button"
              onClick={verificarVencimientos}
              disabled={checkingExpirations}
              className="rounded border border-yellow-500 px-4 py-2 font-semibold text-yellow-300 transition hover:bg-yellow-950 disabled:cursor-wait disabled:opacity-50"
            >
              <i className="fa-solid fa-clock mr-2" aria-hidden="true" />
              {checkingExpirations ? 'Verificando...' : 'Verificar vencimientos'}
            </button>
            <button type="button" onClick={crearMetodoPago} className="rounded border border-gray-300 bg-white px-4 py-2 font-semibold text-black transition hover:bg-gray-200">
              <i className="fa-solid fa-credit-card mr-2" aria-hidden="true" />Añadir método
            </button>
            <button type="button" onClick={crearMonedaPago} className="rounded border border-gray-300 bg-white px-4 py-2 font-semibold text-black transition hover:bg-gray-200">
              <i className="fa-solid fa-coins mr-2" aria-hidden="true" />Añadir moneda
            </button>
            <button
              type="button"
              onClick={() => abrirModal('create')}
              disabled={!metodos.length || !monedas.length || !estudiantes.length || !periodos.length}
              className="rounded bg-yellow-400 px-5 py-2 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <i className="fa-solid fa-circle-plus mr-2" aria-hidden="true" />Añadir mensualidad
            </button>
          </div>}
        </div>

        {puedeGestionar && (!metodos.length || !monedas.length || !estudiantes.length || !periodos.length) && !loading && (
          <p className="mb-4 rounded border border-yellow-700 bg-yellow-950/40 p-4 text-sm text-yellow-200">
            Para registrar mensualidades deben existir estudiantes activos, períodos académicos, métodos de pago y monedas configurados.
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="bg-gray-900 text-sm text-yellow-300">
              <tr>
                <th className="border border-gray-700 p-3">PERIODO</th>
                <th className="border border-gray-700 p-3">MONTO</th>
                <th className="border border-gray-700 p-3">MÉTODO</th>
                <th className="border border-gray-700 p-3">MONEDA</th>
                <th className="border border-gray-700 p-3">ESTUDIANTE</th>
                <th className="border border-gray-700 p-3">FECHA DE CORTE</th>
                <th className="border border-gray-700 p-3">ESTADO</th>
                {puedeGestionar && <th className="border border-gray-700 p-3">ACCIONES</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={puedeGestionar ? 8 : 7} className="p-6 text-center text-gray-400">Cargando mensualidades...</td></tr>
              ) : errorCarga ? (
                <tr><td colSpan={puedeGestionar ? 8 : 7} role="alert" className="p-6 text-center text-red-300">{errorCarga}</td></tr>
              ) : mensualidades.length ? mensualidades.map((mensualidad) => (
                <tr key={mensualidad.idmensualidad} className="hover:bg-gray-900/70">
                  <td className="border border-gray-800 p-3">{obtenerNombrePeriodo(mensualidad.periodo_id)}</td>
                  <td className="border border-gray-800 p-3">{Number(mensualidad.monto).toLocaleString('es-VE')}</td>
                  <td className="border border-gray-800 p-3">{obtenerNombreMetodo(mensualidad.metodopago)}</td>
                  <td className="border border-gray-800 p-3">{obtenerNombreMoneda(mensualidad.monedapago)}</td>
                  <td className="border border-gray-800 p-3">
                    {mensualidad.estudiantes_asignados?.length ? mensualidad.estudiantes_asignados.map((asignacion) => (
                      <div key={asignacion.estudiante} className="mb-1 last:mb-0">
                        <div className="font-semibold">{asignacion.datos_estudiante.nombreestu} {asignacion.datos_estudiante.apelliestu}</div>
                        <div className="text-sm text-gray-400">{asignacion.datos_estudiante.ciestu}</div>
                        <div className="text-xs text-gray-500">{asignacion.datos_estudiante.correoestu || asignacion.datos_estudiante.teleestu || 'Sin contacto'}</div>
                      </div>
                    )) : 'Sin estudiante asignado'}
                  </td>
                  <td className="border border-gray-800 p-3">{mensualidad.fecha_corte}</td>
                  <td className="border border-gray-800 p-3 capitalize">
                    {mensualidad.estudiantes_asignados?.length
                      ? mensualidad.estudiantes_asignados.map((asignacion) => (
                        <div key={asignacion.estudiante} className="mb-1 last:mb-0">
                          <div>{asignacion.estado}</div>
                          {asignacion.factura && <div className="text-xs text-gray-400">Comprobante: {asignacion.factura}</div>}
                          {asignacion.fechapago && <div className="text-xs text-gray-400">Pagado el: {asignacion.fechapago}</div>}
                        </div>
                      ))
                      : mensualidad.estado}
                  </td>
                  {puedeGestionar && <td className="border border-gray-800 p-3">
                    <div className="flex gap-2">
                      <button type="button" title="Editar mensualidad" aria-label="Editar mensualidad" onClick={() => abrirModal('edit', mensualidad)} className="rounded bg-yellow-400 px-3 py-2 text-black hover:bg-yellow-300">
                        <i className="fa-solid fa-edit" aria-hidden="true" />
                      </button>
                      <button type="button" title="Eliminar mensualidad" aria-label="Eliminar mensualidad" onClick={() => eliminar(mensualidad)} className="rounded bg-red-700 px-3 py-2 hover:bg-red-600">
                        <i className="fa-solid fa-trash" aria-hidden="true" />
                      </button>
                    </div>
                  </td>}
                </tr>
              )) : (
                <tr><td colSpan={puedeGestionar ? 8 : 7} className="p-6 text-center text-gray-400">No hay mensualidades para mostrar.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/80 p-4">
          <div className="my-auto w-full max-w-xl rounded-lg border border-gray-700 bg-gray-900 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">{operation === 'create' ? 'Añadir mensualidad' : 'Editar mensualidad'}</h2>
              <button type="button" onClick={cerrarModal} aria-label="Cerrar" className="text-xl text-gray-400 hover:text-white">&times;</button>
            </div>
            <form onSubmit={guardar} className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm">Período académico
                <select name="periodo_id" value={form.periodo_id} onChange={actualizarCampo} disabled={operation !== 'create'} required className={inputClass}>
                  <option value="">Selecciona un período</option>
                  {periodos.map((periodo) => <option key={periodo.id} value={periodo.id}>{periodo.nombre}</option>)}
                </select>
              </label>
              <label className="text-sm">Método de pago
                <select name="metodopago" value={form.metodopago} onChange={actualizarCampo} required className={inputClass}>
                  <option value="">Selecciona un método</option>
                  {metodos.map((metodo) => <option key={metodo.idmetodopago} value={metodo.idmetodopago}>{metodo.metodousado}</option>)}
                </select>
              </label>
              <label className="text-sm">Moneda de pago
                <select name="monedapago" value={form.monedapago} onChange={actualizarCampo} required className={inputClass}>
                  <option value="">Selecciona una moneda</option>
                  {monedas.map((moneda) => <option key={moneda.idmoneda} value={moneda.idmoneda}>{moneda.tipomoneda}</option>)}
                </select>
              </label>
              <label className="text-sm">Estudiante
                <select name="estudiante" value={form.estudiante} onChange={actualizarCampo} disabled={operation !== 'create'} required={operation === 'create'} className={inputClass}>
                  <option value="">Selecciona un estudiante</option>
                  {estudiantes.map((estudiante) => (
                    <option key={estudiante.ciestu} value={estudiante.ciestu}>
                      {estudiante.nombreestu} {estudiante.apelliestu} ({estudiante.ciestu})
                    </option>
                  ))}
                </select>
                {operation !== 'create' && <span className="text-xs text-gray-400">La asignación del estudiante no se cambia al editar la mensualidad.</span>}
              </label>
              {operation === 'create' && form.estudiante && (
                <div
                  role="status"
                  className={`rounded border p-3 text-sm sm:col-span-2 ${
                    carrerasRegistradas.length
                      ? 'border-green-700 bg-green-950/40 text-green-200'
                      : 'border-yellow-700 bg-yellow-950/30 text-yellow-200'
                  }`}
                >
                  {carrerasRegistradas.length ? (
                    <>
                      <p className="font-semibold">Estudiante registrado en carrera</p>
                      <p>{carrerasRegistradas.join(', ')}</p>
                    </>
                  ) : (
                    <p>Este estudiante no aparece asignado a ninguna carrera.</p>
                  )}
                </div>
              )}
              <div className="rounded border border-gray-700 bg-gray-800/60 p-3 text-sm sm:col-span-2">
                {operation !== 'create' ? (
                  <>
                    <p className="mb-2 font-semibold text-yellow-300">Desglose guardado de esta mensualidad</p>
                    <p className="text-gray-200">Base de carreras: ${montoCarrerasUsd.toFixed(2)} USD</p>
                    <p className="text-gray-200">Extra: {Number(form.monto_extra || 0).toFixed(2)} · Tasa: {form.tasa_conversion}</p>
                    {montoCarrerasUsd === 0 && (
                      <p className="mt-1 text-xs text-gray-400">Esta mensualidad es anterior al registro del desglose de precios.</p>
                    )}
                  </>
                ) : cargandoCotizacion ? (
                  <p className="text-gray-300">Calculando carreras asignadas...</p>
                ) : errorCotizacion ? (
                  <p className="text-red-300">{errorCotizacion}</p>
                ) : cotizacion ? (
                  <>
                    <p className="mb-2 font-semibold text-yellow-300">Carreras asignadas — precio base en USD</p>
                    <ul className="mb-2 space-y-1">
                      {cotizacion.carreras.map((carrera) => (
                        <li key={carrera.idcarrera} className="flex justify-between gap-3 text-gray-200">
                          <span>{carrera.nombrecarrera}</span>
                          <span>${Number(carrera.precio_usd).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="border-t border-gray-700 pt-2 font-bold text-white">
                      Mínimo base: ${Number(cotizacion.monto_carreras_usd).toFixed(2)} USD
                    </p>
                  </>
                ) : (
                  <p className="text-gray-400">Selecciona estudiante y período para calcular el precio base.</p>
                )}
              </div>
              <label className="text-sm">Tasa de cambio
                <input
                  name="tasa_conversion"
                  type="number"
                  min="0.000001"
                  step="0.000001"
                  value={form.tasa_conversion}
                  onChange={actualizarCampo}
                  disabled={operation !== 'create'}
                  required
                  className={inputClass}
                />
                <span className="text-xs text-gray-400">Unidades de la moneda elegida por cada 1 USD. Para USD, usa 1.</span>
              </label>
              <label className="text-sm">Extra en moneda seleccionada
                <input
                  name="monto_extra"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.monto_extra}
                  onChange={actualizarCampo}
                  disabled={operation !== 'create'}
                  required
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-semibold">Total mensualidad (calculado)
                <input
                  type="number"
                  value={montoCalculado.toFixed(2)}
                  readOnly
                  className={`${inputClass} cursor-not-allowed text-yellow-300`}
                />
                <span className="text-xs text-gray-400">Carreras × tasa de cambio + extra.</span>
              </label>
              <label className="text-sm">Fecha de corte
                <input name="fecha_corte" type="date" value={form.fecha_corte} onChange={actualizarCampo} required className={inputClass} />
              </label>
              <label className="text-sm">Estado
                <select name="estado" value={form.estado} onChange={actualizarCampo} className={inputClass}>
                  {estados.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                </select>
              </label>
              {['pagado', 'completado'].includes(form.estado) && (
                <fieldset className="grid gap-4 rounded border border-yellow-700 bg-yellow-950/30 p-4 sm:col-span-2 sm:grid-cols-2">
                  <legend className="px-2 font-semibold text-yellow-300">Datos del pago</legend>
                  <label className="text-sm">Referencia del comprobante
                    <input
                      name="factura"
                      value={form.factura}
                      onChange={actualizarCampo}
                      maxLength={100}
                      required
                      placeholder="Número o referencia de operación"
                      className={inputClass}
                    />
                  </label>
                  <label className="text-sm">Fecha del pago
                    <input
                      name="fechapago"
                      type="date"
                      value={form.fechapago}
                      onChange={actualizarCampo}
                      required
                      className={inputClass}
                    />
                  </label>
                </fieldset>
              )}
              <label className="flex items-center gap-3 text-sm sm:col-span-2">
                <input name="verificacion" type="checkbox" checked={form.verificacion} onChange={actualizarCampo} className="h-4 w-4 accent-yellow-400" />
                Verificación confirmada
              </label>
              <div className="flex justify-end gap-3 pt-2 sm:col-span-2">
                <button type="button" onClick={cerrarModal} className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600">Cancelar</button>
                <button type="submit" className="rounded bg-yellow-400 px-4 py-2 font-bold text-black hover:bg-yellow-300">{operation === 'create' ? 'Guardar' : 'Actualizar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default CrudMensualidad;