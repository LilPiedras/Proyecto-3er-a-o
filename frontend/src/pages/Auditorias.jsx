import { useEffect, useState } from "react";
import { Printer, RefreshCw, ShieldCheck } from "lucide-react";
import api from "../api";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const formatFecha = (fecha) => {
  if (!fecha) return "—";
  return new Date(`${fecha}T12:00:00`).toLocaleDateString("es-VE");
};

const Auditorias = () => {
  const [mes, setMes] = useState("");
  const [dia, setDia] = useState("");
  const [hora, setHora] = useState("");
  const [resultado, setResultado] = useState({ filtro: null, auditorias: [], error: "" });
  const filtro = `${mes}-${dia}-${hora}`;

  useEffect(() => {
    let active = true;
    const params = {};
    if (mes) params.mes = Number(mes);
    if (dia) params.dia = Number(dia);
    if (hora !== "") params.hora = Number(hora);

    api.get("/auditoria/", { params })
      .then(({ data }) => {
        if (active) setResultado({ filtro, auditorias: data, error: "" });
      })
      .catch((requestError) => {
        if (!active) return;
        const detail = requestError.response?.data?.detail;
        setResultado({
          filtro,
          auditorias: [],
          error: typeof detail === "string" ? detail : "No se pudieron cargar las auditorías. Intenta de nuevo.",
        });
      });

    return () => {
      active = false;
    };
  }, [mes, dia, hora, filtro]);

  const cargando = resultado.filtro !== filtro;
  const auditorias = cargando ? [] : resultado.auditorias;
  const error = cargando ? "" : resultado.error;

  const limpiarFiltros = () => {
    setMes("");
    setDia("");
    setHora("");
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 text-left text-gray-900">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-700">
            <ShieldCheck size={18} />
            Control del sistema
          </div>
          <h1 className="text-3xl font-bold">Auditorías</h1>
          <p className="mt-1 text-gray-600">Consulta los cambios registrados y prepara una copia para imprimir o guardar como PDF.</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          disabled={cargando || auditorias.length === 0}
          className="no-print inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2 font-semibold text-black transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Printer size={18} />
          Imprimir / Guardar PDF
        </button>
      </div>

      <div className="no-print mb-6 grid gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto_auto] lg:items-end">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Mes
          <select value={mes} onChange={(event) => setMes(event.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2">
            <option value="">Todos los meses</option>
            {MESES.map((nombre, index) => (
              <option key={nombre} value={index + 1}>{nombre}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Día
          <select value={dia} onChange={(event) => setDia(event.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2">
            <option value="">Todos los días</option>
            {Array.from({ length: 31 }, (_, index) => index + 1).map((numero) => (
              <option key={numero} value={numero}>{numero}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Hora
          <select value={hora} onChange={(event) => setHora(event.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2">
            <option value="">Todas las horas</option>
            {Array.from({ length: 24 }, (_, index) => index).map((numero) => (
              <option key={numero} value={numero}>{String(numero).padStart(2, "0")}:00–{String(numero).padStart(2, "0")}:59</option>
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

      <div className="auditorias-print overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="auditorias-print-heading">
          <h2>Reporte de auditorías</h2>
          <p>
            Filtros: mes {mes ? MESES[Number(mes) - 1] : "todos"}, día {dia || "todos"}, hora {hora === "" ? "todas" : `${String(hora).padStart(2, "0")}:00`}.
          </p>
        </div>
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Hora</th>
              <th className="px-4 py-3 font-semibold">Acción</th>
              <th className="px-4 py-3 font-semibold">Usuario que realizó</th>
              <th className="px-4 py-3 font-semibold">Usuario afectado</th>
              <th className="px-4 py-3 font-semibold">Detalles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {auditorias.map((auditoria) => (
              <tr key={auditoria.idseria} className="align-top hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3">{formatFecha(auditoria.fecha)}</td>
                <td className="whitespace-nowrap px-4 py-3">{auditoria.hora ? auditoria.hora.slice(0, 8) : "No disponible"}</td>
                <td className="px-4 py-3 font-medium">{auditoria.accion}</td>
                <td className="px-4 py-3">{auditoria.usuario_escritor_id}</td>
                <td className="px-4 py-3">{auditoria.usuario_objeto_id}</td>
                <td className="px-4 py-3">
                  <details>
                    <summary className="cursor-pointer font-medium text-amber-800">Ver cambios</summary>
                    <div className="mt-2 space-y-2">
                      {auditoria.datos_anteriores && (
                        <div>
                          <p className="font-semibold">Antes</p>
                          <pre className="whitespace-pre-wrap break-all text-xs">{auditoria.datos_anteriores}</pre>
                        </div>
                      )}
                      {auditoria.datos_nuevos && (
                        <div>
                          <p className="font-semibold">Después</p>
                          <pre className="whitespace-pre-wrap break-all text-xs">{auditoria.datos_nuevos}</pre>
                        </div>
                      )}
                      {!auditoria.datos_anteriores && !auditoria.datos_nuevos && <p>Sin detalles adicionales.</p>}
                    </div>
                  </details>
                </td>
              </tr>
            ))}
            {!cargando && !error && auditorias.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-10 text-center text-gray-500">No hay auditorías para los filtros seleccionados.</td>
              </tr>
            )}
            {cargando && (
              <tr>
                <td colSpan="6" className="px-4 py-10 text-center text-gray-500">Cargando auditorías…</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Auditorias;
