import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';
import { BookOpen, Users, CheckCircle, Award, Clock, CalendarDays, Printer } from 'lucide-react';
import HorarioVisual from '../components/HorarioVisual';

const DashboardDocente = () => {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [misAsignaciones, setMisAsignaciones] = useState([]);
  const [ciDocente, setCiDocente] = useState('');
  const [estudiantes, setEstudiantes] = useState([]);
  const [filtroMateria, setFiltroMateria] = useState('');
  const [filtroSeccion, setFiltroSeccion] = useState('');

  useEffect(() => {
    const ci =
      localStorage.getItem('ciuser') ||
      localStorage.getItem('ciempleado') ||
      '';
    setCiDocente(ci);

    if (ci) {
      cargarCargaAcademica(ci);
    } else {
      setCargando(false);
    }
  }, []);

  const cargarCargaAcademica = async (ci) => {
    try {
      setCargando(true);
      const res = await api
        .get("/api/horarios-materias")
        .catch(() => ({ data: [] }));

      const lista = Array.isArray(res.data) ? res.data : [];

      const misClases = lista.filter((item) => {
        if (!item || typeof item !== "object") return false;
        const itemCi = String(item.ciempleado || "").trim();
        return itemCi && itemCi === String(ci).trim();
      });

      // Evitar duplicados: misma materia + sección + día + hora + salón
      const unicos = new Map();
      misClases.forEach((item) => {
        const key = [
          item.idmateria,
          item.idsecc,
          item.dia,
          item.horainicio,
          item.horafin,
          item.salon,
        ].join("|");
        if (!unicos.has(key)) {
          unicos.set(key, item);
        }
      });

      setMisAsignaciones(Array.from(unicos.values()));
      try {
      const resEst = await api.get(`/Notas/docente/${ci}/estudiantes`);
      setEstudiantes(Array.isArray(resEst.data) ? resEst.data : []);
    } catch {
      setEstudiantes([]);
    }

    } catch (error) {
      console.error("Error al cargar carga académica:", error);
      show_alert("No se pudo cargar tu información docente", "error");
      setMisAsignaciones([]);
    } finally {
      setCargando(false);
    }
  };

  // Formato que espera HorarioVisual
  const horariosParaGrid = useMemo(
    () =>
      misAsignaciones.map((a) => ({
        dia: a.dia,
        horainicio: a.horainicio,
        horafin: a.horafin,
        salon: a.salon,
        materia: a.materia || a.nombremateria || 'Materia',
        docente: a.docente || 'Yo',
      })),
    [misAsignaciones]
  );

  const materiasUnicas = useMemo(() => {
    const map = new Map();
    estudiantes.forEach((e) => {
      if (e.idmateria && !map.has(e.idmateria)) {
        map.set(e.idmateria, e.nombremateria || `Materia ${e.idmateria}`);
      }
    });
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [estudiantes]);

  const seccionesUnicas = useMemo(() => {
    const map = new Map();
    estudiantes
      .filter((e) => !filtroMateria || String(e.idmateria) === String(filtroMateria))
      .forEach((e) => {
        if (e.idsecc != null && !map.has(e.idsecc)) {
          map.set(e.idsecc, e.nomsecc || `Sección ${e.idsecc}`);
        }
      });
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [estudiantes, filtroMateria]);

  const listaFiltrada = useMemo(() => {
    return estudiantes.filter((e) => {
      if (filtroMateria && String(e.idmateria) !== String(filtroMateria)) return false;
      if (filtroSeccion && String(e.idsecc) !== String(filtroSeccion)) return false;
      return true;
    });
  }, [estudiantes, filtroMateria, filtroSeccion]);

  const generarNominaPDF = async () => {
    try {
      const params = {};
      if (filtroMateria) params.idmateria = filtroMateria;
      if (filtroSeccion) params.idsecc = filtroSeccion;

      const res = await api.get('/analitics/nomina-docente/pdf', {
        params,
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nomina_${ciDocente || 'docente'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      show_alert('No se pudo generar la nómina en PDF', 'error');
    }
  };

  const imprimirHorarioPDF = async () => {
    try {
      const res = await api.get('/analitics/horario-docente/pdf', {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `horario_${ciDocente || 'docente'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      show_alert('No se pudo generar el PDF del horario', 'error');
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p className="text-xl font-bold text-yellow-400">
          Cargando tu panel docente...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 pt-28 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Cabecera */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400 flex items-center gap-3">
              <BookOpen size={30} /> Panel Académico del Docente
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Visualiza tu horario, secciones activas, asistencia y calificaciones.
            </p>
          </div>
          <div className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-xl text-xs font-mono text-gray-300">
            Cédula Docente:{' '}
            <span className="text-yellow-400 font-bold">{ciDocente}</span>
          </div>
        </div>

        {/* Horario visual */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CalendarDays className="text-yellow-400" size={20} />
              Mi horario semanal
            </h2>
            <button
              type="button"
              onClick={imprimirHorarioPDF}
              disabled={!misAsignaciones.length}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer size={16} />
              Imprimir horario (PDF)
            </button>
          </div>
          <HorarioVisual horarios={horariosParaGrid} />
        </section>

        {/* Cards de materias */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="text-yellow-400" size={20} /> Secciones y Aulas
            Asignadas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {misAsignaciones.length > 0 ? (
              misAsignaciones.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg space-y-4 hover:border-yellow-400/50 transition"
                >
                  <div className="flex justify-between items-start">
                    <span className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 text-xs px-3 py-1 rounded-full font-bold">
                      Módulo: {item.modulo || item.nombremodulo || 'General'}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={14} /> {item.horainicio || ''} -{' '}
                      {item.horafin || ''}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {item.materia || item.nombremateria || "Materia Asignada"}
                    </h3>
                    <p className="text-xs text-yellow-300 mt-1">
                      Sección: {item.seccion || item.nomsecc || item.idsecc || "S/N"} | Salón:{" "}
                      {item.salon || "S/N"} | Día: {item.dia || "Por definir"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/crudasistencia?idsecc=${item.idsecc ?? ""}&idmateria=${item.idmateria ?? ""}`
                        )
                      }
                      className="bg-gray-800 hover:bg-yellow-400 hover:text-black text-gray-200 text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle size={14} /> Asistencia
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                          navigate(`/crudnotas?idsecc=${item.idsecc ?? ""}&idmateria=${item.idmateria ?? ""}`)
                        }
                      className="bg-gray-800 hover:bg-yellow-400 hover:text-black text-gray-200 text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Award size={14} /> Notas
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-gray-900 rounded-2xl border border-gray-800 text-gray-400">
                <p className="text-base font-semibold">
                  No se encontraron asignaciones activas para la cédula{' '}
                  {ciDocente}.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Verifica en Oferta / Asignación que el docente esté vinculado.
                </p>
              </div>
            )}
          </div>

          {/* ===== NÓMINA DE ESTUDIANTES ===== */}
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="text-yellow-400" size={20} />
              Nómina de estudiantes
            </h2>

            <div className="flex flex-wrap gap-3">
              <select
                value={filtroMateria}
                onChange={(e) => {
                  setFiltroMateria(e.target.value);
                  setFiltroSeccion('');
                }}
                className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white"
              >
                <option value="">Todas las materias</option>
                {materiasUnicas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>

              <select
                value={filtroSeccion}
                onChange={(e) => setFiltroSeccion(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white"
              >
                <option value="">Todas las secciones</option>
                {seccionesUnicas.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={generarNominaPDF}
                disabled={!listaFiltrada.length}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer size={16} />
                Generar nómina (PDF)
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-800 rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-800 text-yellow-400 text-xs uppercase">
                  <tr>
                    <th className="p-3">Cédula</th>
                    <th className="p-3">Estudiante</th>
                    <th className="p-3">Materia</th>
                    <th className="p-3">Sección</th>
                    <th className="p-3">Horario</th>
                  </tr>
                </thead>
                <tbody>
                  {listaFiltrada.length > 0 ? (
                    listaFiltrada.map((e) => (
                      <tr
                        key={`${e.ciestu}-${e.idseccmo}`}
                        className="border-b border-gray-800 hover:bg-gray-800/50"
                      >
                        <td className="p-3 font-mono text-gray-300">{e.ciestu}</td>
                        <td className="p-3 text-gray-200">
                          {e.apelliestu} {e.nombreestu}
                        </td>
                        <td className="p-3">{e.nombremateria || '—'}</td>
                        <td className="p-3">{e.nomsecc || e.idsecc || '—'}</td>
                        <td className="p-3 text-gray-400">{e.horario_texto || 'Sin horario'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500">
                        No hay estudiantes con esos filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardDocente;