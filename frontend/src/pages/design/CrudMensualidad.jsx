import { useCrudMensualidad } from '../use/useCrudMensualidad.js';
import {
  FaClock,
  FaCoins,
  FaCreditCard,
  FaEdit,
  FaFileExcel,
  FaFilePdf,
  FaPlusCircle,
  FaTrashAlt,
} from 'react-icons/fa';

const estados = ['pendiente', 'pagado', 'vencido', 'completado'];

const CrudMensualidad = () => {
  const {
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
    puedeGestionar,
    montoCarrerasUsd,
    montoCalculado,
    carrerasRegistradas,
    abrirModal,
    cerrarModal,
    cerrarCatalogo,
    actualizarCampo,
    guardar,
    verificarVencimientos,
    descargarReporte,
    descargarExcel,
    eliminar,
    abrirCatalogo,
    crearMetodoPago,
    crearMonedaPago,
    editarMetodoPago,
    editarMonedaPago,
    eliminarMetodoPago,
    eliminarMonedaPago,
    obtenerNombreMetodo,
    obtenerNombreMoneda,
    obtenerNombrePeriodo,
  } = useCrudMensualidad();
  const inputClass = 'w-full rounded border border-gray-700 bg-gray-800 p-2 text-white disabled:opacity-70';
  return (
    <section className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 mt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">Gestión de mensualidades</h1>
            <p className="mt-2 text-sm text-gray-400">
              {puedeGestionar
                ? 'Administra períodos, importes y formas de pago. Los pagos se marcan como vencidos después de la fecha de corte.'
                : 'Consulta los períodos, importes y estados de pago.'}
            </p>
          </div>
          {puedeGestionar && <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={descargarReporte}
              disabled={downloadingReport || downloadingExcel}
              className="rounded border border-red-500 px-4 py-2 font-semibold text-red-300 transition hover:bg-red-950 disabled:cursor-wait disabled:opacity-50"
            >
              <FaFilePdf className="mr-2 inline" aria-hidden="true" />
              {downloadingReport ? 'Generando PDF...' : 'Reporte PDF'}
            </button>
            <button
              type="button"
              onClick={descargarExcel}
              disabled={downloadingExcel || downloadingReport}
              className="rounded border border-emerald-500 px-4 py-2 font-semibold text-emerald-300 transition hover:bg-emerald-950 disabled:cursor-wait disabled:opacity-50"
            >
              <FaFileExcel className="mr-2 inline" aria-hidden="true" />
              {downloadingExcel ? 'Generando Excel...' : 'Reporte Excel'}
            </button>
            <button
              type="button"
              onClick={verificarVencimientos}
              disabled={checkingExpirations}
              className="rounded border border-yellow-500 px-4 py-2 font-semibold text-yellow-300 transition hover:bg-yellow-950 disabled:cursor-wait disabled:opacity-50"
            >
              <FaClock className="mr-2 inline" aria-hidden="true" />
              {checkingExpirations ? 'Verificando...' : 'Verificar vencimientos'}
            </button>
            <button type="button" onClick={() => abrirCatalogo('metodos')} className="rounded border border-gray-300 bg-white px-4 py-2 font-semibold text-black transition hover:bg-gray-200">
              <FaCreditCard className="mr-2 inline" aria-hidden="true" />Métodos
            </button>
            <button type="button" onClick={() => abrirCatalogo('monedas')} className="rounded border border-gray-300 bg-white px-4 py-2 font-semibold text-black transition hover:bg-gray-200">
              <FaCoins className="mr-2 inline" aria-hidden="true" />Monedas
            </button>
            <button
              type="button"
              onClick={() => abrirModal('create')}
              disabled={!metodos.length || !monedas.length || !estudiantes.length || !periodos.length}
              className="rounded bg-yellow-400 px-5 py-2 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaPlusCircle className="mr-2 inline" aria-hidden="true" />Añadir mensualidad
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
                        <FaEdit aria-hidden="true" />
                      </button>
                      <button type="button" title="Eliminar mensualidad" aria-label="Eliminar mensualidad" onClick={() => eliminar(mensualidad)} className="rounded bg-red-700 px-3 py-2 hover:bg-red-600">
                        <FaTrashAlt aria-hidden="true" />
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

      {catalogoActivo && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/80 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="catalogo-titulo"
            className="my-auto w-full max-w-2xl rounded-lg border border-gray-700 bg-gray-900 p-6"
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 id="catalogo-titulo" className="text-xl font-bold">
                {catalogoActivo === 'metodos' ? 'Métodos de pago' : 'Monedas de pago'}
              </h2>
              <button
                type="button"
                onClick={catalogoActivo === 'metodos' ? crearMetodoPago : crearMonedaPago}
                className="rounded bg-yellow-400 px-4 py-2 font-bold text-black transition hover:bg-yellow-300"
              >
                <FaPlusCircle className="mr-2 inline" aria-hidden="true" />
                Añadir {catalogoActivo === 'metodos' ? 'método' : 'moneda'}
              </button>
            </div>
            <div className="max-h-[60vh] space-y-3 overflow-y-auto">
              {catalogoActivo === 'metodos' ? (
                metodos.length ? metodos.map((metodo) => (
                  <div key={metodo.idmetodopago} className="flex items-center justify-between gap-4 rounded border border-gray-700 bg-gray-800 p-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{metodo.metodousado}</p>
                      <p className="break-all text-sm text-gray-400">Registro: {metodo.registro}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        title={`Editar ${metodo.metodousado}`}
                        aria-label={`Editar ${metodo.metodousado}`}
                        onClick={() => editarMetodoPago(metodo)}
                        className="rounded bg-yellow-400 px-3 py-2 text-black transition hover:bg-yellow-300"
                      >
                        <FaEdit aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        title={`Eliminar ${metodo.metodousado}`}
                        aria-label={`Eliminar ${metodo.metodousado}`}
                        onClick={() => eliminarMetodoPago(metodo)}
                        className="rounded bg-red-700 px-3 py-2 transition hover:bg-red-600"
                      >
                        <FaTrashAlt aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )) : <p className="py-6 text-center text-gray-400">No hay métodos de pago registrados.</p>
              ) : monedas.length ? monedas.map((moneda) => (
                <div key={moneda.idmoneda} className="flex items-center justify-between gap-4 rounded border border-gray-700 bg-gray-800 p-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{moneda.tipomoneda}</p>
                    <p className="break-all text-sm text-gray-400">
                      Total: {Number(moneda.montototal).toLocaleString('es-VE')} · Registro: {moneda.registro}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      title={`Editar ${moneda.tipomoneda}`}
                      aria-label={`Editar ${moneda.tipomoneda}`}
                      onClick={() => editarMonedaPago(moneda)}
                      className="rounded bg-yellow-400 px-3 py-2 text-black transition hover:bg-yellow-300"
                    >
                      <FaEdit aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      title={`Eliminar ${moneda.tipomoneda}`}
                      aria-label={`Eliminar ${moneda.tipomoneda}`}
                      onClick={() => eliminarMonedaPago(moneda)}
                      className="rounded bg-red-700 px-3 py-2 transition hover:bg-red-600"
                    >
                      <FaTrashAlt aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )) : <p className="py-6 text-center text-gray-400">No hay monedas de pago registradas.</p>}
            </div>
            <div className="mt-5 flex justify-end">
              <button type="button" onClick={cerrarCatalogo} className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CrudMensualidad;