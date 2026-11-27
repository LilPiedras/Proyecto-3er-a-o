import {
  BarChart3,
  Eye,
  FileDown,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  MESES,
  formatFecha,
  leerDatos,
  mostrarValor,
  traducirAccion,
  traducirCampo,
} from "../../components/helpers/auditoriaHelpers.jsx";
import GraficaAuditorias, { ResumenGraficaContenido } from "./graficaAuditoria.jsx";
import { useAuditorias } from "../use/useAuditorias.js";

const PanelDatos = ({ titulo, datos, color }) => {
  const campos = Array.isArray(datos)
    ? datos.map((valor, indice) => [String(indice + 1), valor])
    : Object.entries(datos || {});

  return (
    <section className={`rounded-xl border p-4 ${color}`}>
      <h3 className="mb-3 font-semibold">{titulo}</h3>
      {campos.length > 0 ? (
        <dl className="space-y-3">
          {campos.map(([campo, valor]) => (
            <div key={campo} className="border-b border-current/10 pb-2 last:border-0 last:pb-0">
              <dt className="text-xs font-semibold uppercase tracking-wide opacity-70">
                {traducirCampo(campo)}
              </dt>
              <dd className="mt-1 whitespace-pre-wrap break-words text-sm">
                {mostrarValor(valor)}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-sm opacity-70">No hay información registrada.</p>
      )}
    </section>
  );
};

const Auditorias = () => {
  const {
    mes,
    setMes,
    dia,
    setDia,
    hora,
    setHora,
    auditoriaSeleccionada,
    setAuditoriaSeleccionada,
    graficaAbierta,
    setGraficaAbierta,
    descargandoPdf,
    descargandoExcel,
    errorExportacion,
    cargando,
    auditorias,
    error,
    resumenFiltros,
    limpiarFiltros,
    handleImprimir,
    handleGuardarPdf,
    handleGuardarExcel,
  } = useAuditorias();

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 text-left text-gray-900">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-700">
            <ShieldCheck size={18} />
            Control del sistema
          </div>
          <h1 className="text-3xl font-bold">Auditorías</h1>
          <p className="mt-1 text-gray-600">
            Consulta los cambios registrados, visualiza la gráfica, imprime o exporta a PDF o Excel.
          </p>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setGraficaAbierta(true)}
            disabled={cargando || auditorias.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-400 bg-white px-4 py-2 font-semibold text-amber-900 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BarChart3 size={18} />
            Ver gráfica
          </button>

          <button
            type="button"
            onClick={handleImprimir}
            disabled={cargando || auditorias.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Printer size={18} />
            Imprimir
          </button>

          <button
            type="button"
            onClick={handleGuardarPdf}
            disabled={cargando || descargandoPdf || descargandoExcel || auditorias.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2 font-semibold text-black transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileDown size={18} />
            {descargandoPdf ? "Guardando PDF..." : "Guardar PDF"}
          </button>

          <button
            type="button"
            onClick={handleGuardarExcel}
            disabled={cargando || descargandoExcel || descargandoPdf || auditorias.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-600 bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileSpreadsheet size={18} />
            {descargandoExcel ? "Guardando Excel..." : "Guardar Excel"}
          </button>
        </div>
      </div>

      <div className="no-print mb-6 grid gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto_auto] lg:items-end">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Mes
          <select
            value={mes}
            onChange={(event) => setMes(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2"
          >
            <option value="">Todos los meses</option>
            {MESES.map((nombre, index) => (
              <option key={nombre} value={index + 1}>
                {nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Día
          <select
            value={dia}
            onChange={(event) => setDia(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2"
          >
            <option value="">Todos los días</option>
            {Array.from({ length: 31 }, (_, index) => index + 1).map((numero) => (
              <option key={numero} value={numero}>
                {numero}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Hora
          <select
            value={hora}
            onChange={(event) => setHora(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2"
          >
            <option value="">Todas las horas</option>
            {Array.from({ length: 24 }, (_, index) => index).map((numero) => (
              <option key={numero} value={numero}>
                {String(numero).padStart(2, "0")}:00–{String(numero).padStart(2, "0")}:59
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={limpiarFiltros}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Limpiar
        </button>
        <p className="text-sm text-gray-600" aria-live="polite">
          {cargando ? "Consultando…" : `${auditorias.length} registro${auditorias.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {errorExportacion && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {errorExportacion}
        </div>
      )}

      <div className="auditorias-print overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="auditorias-print-heading">
          <h2>Reporte de auditorías</h2>
          <p>{resumenFiltros}</p>
        </div>

        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Hora</th>
              <th className="px-4 py-3 font-semibold">Acción</th>
              <th className="px-4 py-3 font-semibold">Realizado por</th>
              <th className="px-4 py-3 font-semibold">Usuario relacionado</th>
              <th className="px-4 py-3 font-semibold">Detalles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {auditorias.map((auditoria) => (
              <tr key={auditoria.idseria} className="align-top hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3">{formatFecha(auditoria.fecha)}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  {auditoria.hora ? auditoria.hora.slice(0, 8) : "No disponible"}
                </td>
                <td className="px-4 py-3 font-medium">{traducirAccion(auditoria.accion)}</td>
                <td className="px-4 py-3">
                  {auditoria.usuario_escritor_nombre || "Usuario no disponible"}
                </td>
                <td className="px-4 py-3">
                  {auditoria.usuario_objeto_nombre || "Usuario no disponible"}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setAuditoriaSeleccionada(auditoria)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-amber-800 transition hover:bg-amber-50 hover:text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    aria-label={`Ver cambios de ${traducirAccion(auditoria.accion)}`}
                  >
                    <Eye size={16} />
                    Ver cambios
                  </button>
                </td>
              </tr>
            ))}
            {!cargando && !error && auditorias.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-10 text-center text-gray-500">
                  No hay auditorías para los filtros seleccionados.
                </td>
              </tr>
            )}
            {cargando && (
              <tr>
                <td colSpan="6" className="px-4 py-10 text-center text-gray-500">
                  Cargando auditorías…
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {auditorias.length > 0 && (
          <div className="auditorias-print-heading border-t border-gray-200 p-4">
            <h3 className="mb-3 font-semibold text-gray-900">Resumen gráfico de acciones</h3>
            <ResumenGraficaContenido auditorias={auditorias} />
          </div>
        )}
      </div>

      <GraficaAuditorias
        abierta={graficaAbierta}
        onCerrar={() => setGraficaAbierta(false)}
        auditorias={auditorias}
        resumenFiltros={resumenFiltros}
      />

      {auditoriaSeleccionada && (
        <div
          className="no-print fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-4"
          onClick={() => setAuditoriaSeleccionada(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="detalle-auditoria-titulo"
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 text-gray-900 shadow-2xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
                  Detalle de auditoría
                </p>
                <h2 id="detalle-auditoria-titulo" className="mt-1 text-xl font-bold sm:text-2xl">
                  {traducirAccion(auditoriaSeleccionada.accion)}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {formatFecha(auditoriaSeleccionada.fecha)} ·{" "}
                  {auditoriaSeleccionada.hora
                    ? auditoriaSeleccionada.hora.slice(0, 8)
                    : "Hora no disponible"}
                  {" · "}Por{" "}
                  {auditoriaSeleccionada.usuario_escritor_nombre || "Usuario no disponible"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAuditoriaSeleccionada(null)}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                aria-label="Cerrar detalle"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <PanelDatos
                titulo="Antes del cambio"
                datos={leerDatos(auditoriaSeleccionada.datos_anteriores)}
                color="border-rose-200 bg-rose-50"
              />
              <PanelDatos
                titulo="Después del cambio"
                datos={leerDatos(auditoriaSeleccionada.datos_nuevos)}
                color="border-emerald-200 bg-emerald-50"
              />
            </div>
          </section>
        </div>
      )}
    </section>
  );
};

export default Auditorias;