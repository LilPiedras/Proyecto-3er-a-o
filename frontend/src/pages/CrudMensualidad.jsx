import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const MySwal = withReactContent(Swal);
const estados = ['pendiente', 'pagado', 'vencido', 'completado'];

const CrudMensualidad = () => {
  const [mensualidades, setMensualidades] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [metodos, setMetodos] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [operation, setOperation] = useState('create');
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({
    metodopago: '',
    monedapago: '',
    monto: '',
    verificacion: false,
    periodo: '',
    fecha_corte: '',
    estudiante: '',
    estado: 'pendiente',
  });

  const cargarDatos = async () => {
    setLoading(true);
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
      const [lista, listaMetodos, listaMonedas, listaEstudiantes] = await Promise.all([
        cargarLista('/mensualidad/'),
        cargarLista('/metodo-pago/'),
        cargarLista('/moneda-pago/'),
        cargarLista('/estudiantes/'),
      ]);
      setMensualidades(lista);
      setMetodos(listaMetodos);
      setMonedas(listaMonedas);
      setEstudiantes(listaEstudiantes);
    } catch (error) {
      const detail = error.response?.data?.detail;
      show_alert(typeof detail === 'string' ? detail : 'No se pudieron cargar las mensualidades y sus catálogos', 'error');
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
      metodopago: metodos[0]?.idmetodopago ?? '',
      monedapago: monedas[0]?.idmoneda ?? '',
      monto: '',
      verificacion: false,
      periodo: '',
      fecha_corte: '',
      estudiante: estudiantes[0]?.ciestu ?? '',
      estado: 'pendiente',
    });
  };

  const abrirModal = (modo, mensualidad = null) => {
    setOperation(modo);
    if (mensualidad) {
      setSelectedId(mensualidad.idmensualidad);
      setForm({
        metodopago: mensualidad.metodopago ?? '',
        monedapago: mensualidad.monedapago ?? '',
        monto: mensualidad.monto ?? '',
        verificacion: Boolean(mensualidad.verificacion),
        periodo: mensualidad.periodo ?? '',
        fecha_corte: mensualidad.fecha_corte ?? '',
        estudiante: mensualidad.estudiantes_asignados?.[0]?.estudiante ?? '',
        estado: mensualidad.estado ?? 'pendiente',
      });
    } else {
      limpiarFormulario();
    }
    setModal(true);
  };

  const cerrarModal = () => setModal(false);

  const actualizarCampo = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((actual) => ({ ...actual, [name]: type === 'checkbox' ? checked : value }));
  };

  const guardar = async (event) => {
    event.preventDefault();
    if (!form.metodopago || !form.monedapago || !form.periodo.trim() || !form.fecha_corte || (operation === 'create' && !form.estudiante)) {
      show_alert('Completa el estudiante, método, moneda, periodo y fecha de corte', 'warning');
      return;
    }
    if (!Number.isFinite(Number(form.monto)) || Number(form.monto) <= 0) {
      show_alert('Escribe un monto válido mayor que cero', 'warning');
      return;
    }

    const payload = {
      metodopago: Number(form.metodopago),
      monedapago: Number(form.monedapago),
      monto: Number(form.monto),
      verificacion: form.verificacion,
      periodo: form.periodo.trim(),
      fecha_corte: form.fecha_corte,
      estado: form.estado,
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

  const eliminar = async (mensualidad) => {
    const result = await MySwal.fire({
      title: `¿Desactivar la mensualidad ${mensualidad.periodo}?`,
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

  const obtenerNombreMetodo = (id) => metodos.find((metodo) => metodo.idmetodopago === id)?.metodousado ?? `ID ${id}`;
  const obtenerNombreMoneda = (id) => monedas.find((moneda) => moneda.idmoneda === id)?.tipomoneda ?? `ID ${id}`;
  const inputClass = 'w-full rounded border border-gray-700 bg-gray-800 p-2 text-white disabled:opacity-70';

  return (
    <section className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">Gestión de mensualidades</h1>
            <p className="mt-1 text-sm text-gray-400">Administra periodos, importes y formas de pago.</p>
          </div>
          <button
            type="button"
            onClick={() => abrirModal('create')}
            disabled={!metodos.length || !monedas.length || !estudiantes.length}
            className="rounded bg-yellow-400 px-5 py-2 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <i className="fa-solid fa-circle-plus mr-2" aria-hidden="true" />Añadir mensualidad
          </button>
        </div>

        {(!metodos.length || !monedas.length || !estudiantes.length) && !loading && (
          <p className="mb-4 rounded border border-yellow-700 bg-yellow-950/40 p-3 text-sm text-yellow-200">
            Para registrar mensualidades deben existir estudiantes activos, métodos de pago y monedas configurados.
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
                <th className="border border-gray-700 p-3">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="p-6 text-center text-gray-400">Cargando mensualidades...</td></tr>
              ) : mensualidades.length ? mensualidades.map((mensualidad) => (
                <tr key={mensualidad.idmensualidad} className="hover:bg-gray-900/70">
                  <td className="border border-gray-800 p-3">{mensualidad.periodo}</td>
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
                  <td className="border border-gray-800 p-3 capitalize">{mensualidad.estado}</td>
                  <td className="border border-gray-800 p-3">
                    <div className="flex gap-2">
                      <button type="button" title="Editar mensualidad" aria-label="Editar mensualidad" onClick={() => abrirModal('edit', mensualidad)} className="rounded bg-yellow-400 px-3 py-2 text-black hover:bg-yellow-300">
                        <i className="fa-solid fa-edit" aria-hidden="true" />
                      </button>
                      <button type="button" title="Eliminar mensualidad" aria-label="Eliminar mensualidad" onClick={() => eliminar(mensualidad)} className="rounded bg-red-700 px-3 py-2 hover:bg-red-600">
                        <i className="fa-solid fa-trash" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="p-6 text-center text-gray-400">No hay mensualidades para mostrar.</td></tr>
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
              <label className="text-sm">Periodo
                <input name="periodo" value={form.periodo} onChange={actualizarCampo} placeholder="Ej. 2026-09" required className={inputClass} />
              </label>
              <label className="text-sm">Monto
                <input name="monto" type="number" min="0.01" step="0.01" value={form.monto} onChange={actualizarCampo} required className={inputClass} />
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
              <label className="text-sm">Fecha de corte
                <input name="fecha_corte" type="date" value={form.fecha_corte} onChange={actualizarCampo} required className={inputClass} />
              </label>
              <label className="text-sm">Estado
                <select name="estado" value={form.estado} onChange={actualizarCampo} className={inputClass}>
                  {estados.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                </select>
              </label>
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