import { useMemo } from "react";
import { PieChart, X } from "lucide-react";
import { traducirAccion } from "../../components/helpers/auditoriaHelpers.jsx";

const COLORES_TORTA = [
  "#f59e0b",
  "#3b82f6",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#6b7280",
];

export const ResumenGraficaContenido = ({ auditorias }) => {
  const { segmentos, gradienteConico } = useMemo(() => {
    const conteo = new Map();
    for (const item of auditorias) {
      const etiqueta = traducirAccion(item.accion);
      conteo.set(etiqueta, (conteo.get(etiqueta) || 0) + 1);
    }

    const total = auditorias.length;
    const ordenados = Array.from(conteo.entries())
      .map(([etiqueta, cantidad]) => ({ etiqueta, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    const calculados = ordenados.map((row, idx) => {
      const fraccion = total > 0 ? row.cantidad / total : 0;
      const cantidadAnterior = ordenados
        .slice(0, idx)
        .reduce((acumulado, anterior) => acumulado + anterior.cantidad, 0);
      const inicio = total > 0 ? (cantidadAnterior / total) * 360 : 0;
      const fin = idx === ordenados.length - 1 ? 360 : inicio + fraccion * 360;

      return {
        ...row,
        porcentaje: (fraccion * 100).toFixed(1),
        color: COLORES_TORTA[idx % COLORES_TORTA.length],
        inicio,
        fin,
      };
    });

    const partesGradiente = calculados.map(
      (seg) => `${seg.color} ${seg.inicio.toFixed(2)}deg ${seg.fin.toFixed(2)}deg`
    );

    return {
      segmentos: calculados,
      gradienteConico:
        partesGradiente.length > 0
          ? `conic-gradient(${partesGradiente.join(", ")})`
          : "conic-gradient(#e5e7eb 0deg 360deg)",
    };
  }, [auditorias]);

  if (!auditorias.length) {
    return (
      <p className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
        No hay registros para graficar con los filtros actuales.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-500">
        <span>Distribución por acción</span>
        <span>Total: {auditorias.length}</span>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div
            role="img"
            aria-label="Gráfica de torta de auditorías"
            className="h-48 w-48 rounded-full border border-gray-200 shadow-sm"
            style={{ background: gradienteConico }}
          />
          <span className="text-xs text-gray-500">
            {segmentos.length} {segmentos.length === 1 ? "categoría" : "categorías"}
          </span>
        </div>

        <ul className="w-full flex-1 space-y-2.5">
          {segmentos.map((fila) => (
            <li
              key={fila.etiqueta}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: fila.color }}
                />
                <span className="truncate font-medium text-gray-800">{fila.etiqueta}</span>
              </div>
              <span className="shrink-0 font-semibold text-gray-900">
                {fila.cantidad}{" "}
                <span className="font-normal text-gray-500">({fila.porcentaje}%)</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const GraficaAuditorias = ({ abierta, onCerrar, auditorias, resumenFiltros }) => {
  if (!abierta) return null;

  return (
    <div
      className="no-print fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-4"
      onClick={onCerrar}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="grafica-auditoria-titulo"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 text-gray-900 shadow-2xl sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
              <PieChart size={16} />
              Resumen visual
            </div>
            <h2 id="grafica-auditoria-titulo" className="mt-1 text-xl font-bold sm:text-2xl">
              Gráfica de auditorías
            </h2>
            <p className="mt-1 text-xs text-gray-500">{resumenFiltros}</p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label="Cerrar gráfica"
          >
            <X size={20} />
          </button>
        </div>

        <ResumenGraficaContenido auditorias={auditorias} />
      </section>
    </div>
  );
};

export default GraficaAuditorias;