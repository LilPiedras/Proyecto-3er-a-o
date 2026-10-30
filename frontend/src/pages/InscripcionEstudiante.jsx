import React, { useState, useEffect } from "react";
import api from "../api";
import { show_alert } from "../components/functions/Showpro_functions";

const InscripcionEstudiante = () => {
  const [usuario, setUsuario] = useState(null);
  const [misDatosAcademicos, setMisDatosAcademicos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const userStored = JSON.parse(localStorage.getItem("usuario") || "{}");
    setUsuario(userStored);
    cargarEstadoAcademico(userStored);
  }, []);

  const cargarEstadoAcademico = async (user) => {
    try {
      setCargando(true);
      const cedulaEst = user?.ciestu || user?.cedula || user?.ci;

      // Peticiones paralelas para obtener inscripciones, detalles, secciones y notas
      const [resIns, resDetalles, resSecciones, resNotas] = await Promise.all([
        api.get("/inscipcion/").catch(() => ({ data: [] })),
        api.get("/detalles-inscripcion/").catch(() => api.get("/detalle-inscripcion/").catch(() => ({ data: [] }))),
        api.get("/seccion/").catch(() => ({ data: [] })),
        api.get(`/Notas/estudiante/${cedulaEst}`).catch(() => ({ data: [] })),
      ]);

      const listaInscripciones = Array.isArray(resIns.data) ? resIns.data : [];
      const listaDetalles = Array.isArray(resDetalles.data) ? resDetalles.data : [];
      const listaSecciones = Array.isArray(resSecciones.data) ? resSecciones.data : [];
      const listaNotas = Array.isArray(resNotas.data) ? resNotas.data : [];

      // Filtrar inscripciones del estudiante
      const misIns = listaInscripciones.filter((ins) => String(ins.ciestu) === String(cedulaEst));

      // Cada detalle representa una sección asociada a la inscripción del período.
      const consolidado = misIns.flatMap((ins) => {
        const detallesInscripcion = ins.detalles?.length
          ? ins.detalles
          : listaDetalles.filter(
            (detalle) => Number(detalle.inscripcion_periodo_id || detalle.inscripcion_id) === Number(ins.id)
          );

        return detallesInscripcion.map((detalle) => {
          const seccionObj = detalle.seccion_rel || listaSecciones.find(
            (seccion) => Number(seccion.idsecc || seccion.id) === Number(detalle.seccion_id)
          );
          const notaModulo = listaNotas.find(
            (nota) => Number(nota.seccion_id || nota.idsecc) === Number(detalle.seccion_id)
          );
          const calificacion = notaModulo?.calificacion || notaModulo?.nota || 0;
          const aprobado = calificacion >= 10;

          return {
            id: ins.id,
            detalleId: detalle.id,
            estadoInscripcion: ins.estado,
            seccionNombre: seccionObj?.nomsecc || seccionObj?.nombresecc || seccionObj?.nombre || `Módulo #${detalle.seccion_id}`,
            calificacion,
            aprobado,
            observacion: aprobado ? "Módulo Aprobado - Elegible para siguiente nivel" : "En Curso / Pendiente"
          };
        });
      });

      setMisDatosAcademicos(consolidado);

    } catch (error) {
      console.error("Error al cargar estado académico:", error);
      show_alert("Error al cargar tu información", "error");
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p className="text-xl font-bold text-yellow-400">Cargando tu estado académico...</p>
      </div>
    );
  }

  const moduloActual = misDatosAcademicos[misDatosAcademicos.length - 1];

  return (
    <div className="p-6 min-h-screen bg-black text-white pt-24 space-y-8">
      <div className="container mx-auto max-w-3xl space-y-6">
        
        {/* ENCABEZADO DE BIENVENIDA */}
        <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-xs text-yellow-400 font-bold uppercase tracking-widest">Portal del Estudiante</span>
            <h2 className="text-2xl font-black text-white">{usuario?.nombre || usuario?.nombreestu || "Estudiante"}</h2>
            <p className="text-sm text-gray-400">Cédula: {usuario?.ciestu || usuario?.cedula || usuario?.ci}</p>
          </div>
          <div className="bg-yellow-400 text-black px-4 py-2 rounded-xl text-xs font-black uppercase">
            {moduloActual ? moduloActual.seccionNombre : "Sin Módulo Asignado"}
          </div>
        </div>

        {/* ESTADO DEL MÓDULO Y PASE AUTOMÁTICO */}
        {moduloActual ? (
          <div className={`p-6 rounded-2xl border shadow-2xl space-y-4 ${
            moduloActual.aprobado 
              ? "bg-green-950/40 border-green-500 text-green-300" 
              : "bg-gray-900 border-gray-700 text-white"
          }`}>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-yellow-400">Estado de Avance Académico</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                moduloActual.aprobado ? "bg-green-500 text-black" : "bg-yellow-400 text-black"
              }`}>
                {moduloActual.aprobado ? "MÓDULO APROBADO" : "EN PROGRESO"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-800/60 p-4 rounded-xl border border-gray-700">
              <div>
                <p className="text-gray-400 text-xs uppercase font-bold">Módulo Actual:</p>
                <p className="font-bold text-white text-base">{moduloActual.seccionNombre}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-bold">Calificación:</p>
                <p className="font-bold text-yellow-400 text-base">{moduloActual.calificacion} pts</p>
              </div>
            </div>

            <p className="text-sm font-semibold pt-2">
              {moduloActual.aprobado 
                ? "🎉 ¡Felicitaciones! Has completado y aprobado este módulo. El sistema ha registrado tu avance para la continuidad en el siguiente nivel académico asignado por administración."
                : "📚 Te encuentras cursando este módulo activamente. Una vez que el docente cargue tus notas finales y superes la puntuación requerida, avanzarás de nivel."}
            </p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-700 p-8 rounded-2xl text-center space-y-3">
            <h3 className="text-xl font-bold text-yellow-400">Sin Asignación Activa</h3>
            <p className="text-sm text-gray-400">
              Aún no posees un módulo o sección asignada por el departamento administrativo.
            </p>
          </div>
        )}

        {misDatosAcademicos.length > 1 && (
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-yellow-400">Secciones inscritas</h3>
            {misDatosAcademicos.map((modulo) => (
              <div
                key={`${modulo.id}-${modulo.detalleId}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-700 bg-gray-900 p-4"
              >
                <span className="font-semibold">{modulo.seccionNombre}</span>
                <span className="text-sm text-gray-300">
                  {modulo.calificacion} pts · {modulo.aprobado ? "Aprobado" : "En progreso"}
                </span>
              </div>
            ))}
          </section>
        )}

      </div>
    </div>
  );
};

export default InscripcionEstudiante;