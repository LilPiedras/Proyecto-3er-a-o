import React, { useMemo } from "react";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const COLORES = [
  "#F59E0B", // amber
  "#3B82F6", // blue
  "#10B981", // emerald
  "#8B5CF6", // violet
  "#EF4444", // red
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F97316", // orange
  "#6366F1", // indigo
  "#84CC16", // lime
];

function normalizarDia(dia) {
  if (!dia) return "";
  const d = String(dia).trim().toLowerCase();
  const map = {
    lunes: "Lunes",
    martes: "Martes",
    miercoles: "Miércoles",
    miércoles: "Miércoles",
    jueves: "Jueves",
    viernes: "Viernes",
    sabado: "Sábado",
    sábado: "Sábado",
    domingo: "Domingo",
  };
  return map[d] || dia;
}

function colorPorMateria(nombre, mapa) {
  if (!nombre) return "#6B7280";
  if (!mapa[nombre]) {
    const idx = Object.keys(mapa).length % COLORES.length;
    mapa[nombre] = COLORES[idx];
  }
  return mapa[nombre];
}

/**
 * horarios: array de {
 *   dia, horainicio, horafin, salon, materia, docente
 * }
 */
export default function HorarioVisual({ horarios = [] }) {
  const { franjas, grid, leyenda } = useMemo(() => {
    const colorMap = {};
    const setFranjas = new Set();
    const items = [];

    (horarios || []).forEach((h) => {
      const dia = normalizarDia(h.dia);
      const inicio = String(h.horainicio || "").trim();
      const fin = String(h.horafin || "").trim();
      if (!dia || !inicio) return;

      const franja = fin ? `${inicio} - ${fin}` : inicio;
      setFranjas.add(franja);

      const materia = h.materia || "Sin materia";
      const color = colorPorMateria(materia, colorMap);

      items.push({
        dia,
        franja,
        materia,
        docente: h.docente || "—",
        salon: h.salon || "S/N",
        color,
      });
    });

    // Ordenar franjas por hora de inicio si se puede parsear
    const franjasOrd = Array.from(setFranjas).sort((a, b) => {
      const ha = a.split("-")[0].trim();
      const hb = b.split("-")[0].trim();
      return ha.localeCompare(hb, undefined, { numeric: true });
    });

    const grid = {};
    franjasOrd.forEach((f) => {
      grid[f] = {};
      DIAS.forEach((d) => {
        grid[f][d] = null;
      });
    });

    items.forEach((it) => {
      if (!grid[it.franja]) return;
      if (!DIAS.includes(it.dia)) return;
      // si hay choque, dejamos el primero
      if (!grid[it.franja][it.dia]) {
        grid[it.franja][it.dia] = it;
      }
    });

    const leyenda = Object.entries(colorMap).map(([materia, color]) => {
      const sample = items.find((i) => i.materia === materia);
      return {
        materia,
        color,
        docente: sample?.docente || "—",
        salon: sample?.salon || "S/N",
      };
    });

    return { franjas: franjasOrd, grid, leyenda };
  }, [horarios]);

  if (!horarios?.length || franjas.length === 0) {
    return (
      <p className="text-gray-500 text-sm">No hay horario registrado todavía.</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-xl border border-gray-700">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="bg-gray-800">
              <th className="p-3 text-left text-yellow-400 font-bold border-b border-r border-gray-700 w-36">
                Hora
              </th>
              {DIAS.map((d) => (
                <th
                  key={d}
                  className="p-3 text-center text-yellow-400 font-bold border-b border-gray-700"
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {franjas.map((franja) => (
              <tr key={franja} className="border-b border-gray-800">
                <td className="p-2 text-xs text-gray-300 font-mono border-r border-gray-800 bg-gray-950/80 whitespace-nowrap">
                  {franja}
                </td>
                {DIAS.map((dia) => {
                  const celda = grid[franja]?.[dia];
                  return (
                    <td key={dia} className="p-1.5 align-middle h-16">
                      {celda ? (
                        <div
                          className="h-full min-h-[52px] rounded-lg flex items-center justify-center px-2 text-center text-xs font-bold text-black shadow-sm"
                          style={{ backgroundColor: celda.color }}
                          title={`${celda.materia} · ${celda.docente} · ${celda.salon}`}
                        >
                          {celda.materia}
                        </div>
                      ) : (
                        <div className="h-full min-h-[52px] rounded-lg bg-gray-900/40 border border-dashed border-gray-800" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Leyenda */}
      <div>
        <h3 className="text-sm font-bold text-yellow-400 mb-3 uppercase tracking-wide">
          Leyenda
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {leyenda.map((item) => (
            <div
              key={item.materia}
              className="flex items-start gap-3 rounded-xl border border-gray-700 bg-gray-900/80 p-3"
            >
              <span
                className="mt-0.5 h-5 w-5 shrink-0 rounded-md border border-white/10"
                style={{ backgroundColor: item.color }}
              />
              <div className="text-xs space-y-0.5 min-w-0">
                <p className="font-bold text-white truncate">{item.materia}</p>
                <p className="text-gray-400 truncate">
                  Docente: <span className="text-gray-300">{item.docente}</span>
                </p>
                <p className="text-gray-400">
                  Aula: <span className="text-gray-300">{item.salon}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}