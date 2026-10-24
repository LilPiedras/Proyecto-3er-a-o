import React, { useState, useEffect } from "react";
import api from "../api";
import { show_alert } from "../components/functions/Showpro_functions";

const CrudInscripciones = () => {
  // Catálogos
  const [estudiantes, setEstudiantes] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [inscripcionesDetalladas, setInscripcionesDetalladas] = useState([]);

  // Formulario
  const [ciestu, setCiestu] = useState("");
  const [periodoId, setPeriodoId] = useState("");
  const [seccionIds, setSeccionIds] = useState([]);
  const [estado, setEstado] = useState("ACTIVO");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);

      // Peticiones únicamente a endpoints confirmados
      const [resEst, resPer, resSec, resIns] = await Promise.all([
        api.get("/estudiantes/").catch(() => api.get("/estudiante/").catch(() => ({ data: [] }))),
        api.get("/periodo/").catch(() => ({ data: [] })),
        api.get("/seccion/").catch(() => ({ data: [] })),
        api.get("/inscipcion/").catch(() => ({ data: [] })),
      ]);

      const listaEst = Array.isArray(resEst.data) ? resEst.data : [];
      const listaPer = Array.isArray(resPer.data) ? resPer.data : [];
      const listaSec = Array.isArray(resSec.data) ? resSec.data : [];
      const listaIns = Array.isArray(resIns.data) ? resIns.data : [];

      setEstudiantes(listaEst);
      setPeriodos(listaPer);
      setSecciones(listaSec);

      // Cada detalle representa una sección inscrita en la cabecera del estudiante/período.
      const completas = listaIns.flatMap((ins) => {
        const estObj = listaEst.find((e) => String(e.ciestu || e.cedula || e.ci) === String(ins.ciestu));
        const perObj = listaPer.find((p) => Number(p.id) === Number(ins.periodo_id));
        const nombreEst = estObj 
          ? `${estObj.nombreestu || estObj.nombre || ""} ${estObj.apelliestu || estObj.apellido || ""}`
          : "Estudiante";

        return (ins.detalles || []).map((detalle) => {
          const seccionIdInscrita = detalle.seccion_id;
          const secObj = detalle.seccion_rel || listaSec.find(
            (seccion) => Number(seccion.idsecc || seccion.id) === Number(seccionIdInscrita)
          );
          const nombreSeccion = secObj?.nomsecc || secObj?.nombresecc || secObj?.nombre || `Sección #${seccionIdInscrita}`;

          return {
            id: ins.id,
            detalleId: detalle.id,
            ciestu: ins.ciestu,
            estudianteNombre: nombreEst,
            periodoNombre: perObj?.nombre || `Período #${ins.periodo_id}`,
            seccionNombre: nombreSeccion,
            fecha: ins.fecha_inscripcion || "Registrada",
            estado: ins.estado
          };
        });
      });

      setInscripcionesDetalladas(completas);

    } catch (error) {
      console.error("Error al cargar datos:", error);
      show_alert("Error al cargar los datos de inscripciones", "error");
    } finally {
      setCargando(false);
    }
  };

  const handleInscribir = async (e) => {
    e.preventDefault();

    if (!ciestu || !periodoId || !seccionIds.length) {
      return show_alert("Por favor completa todos los campos requeridos", "warning");
    }

    try {
      setGuardando(true);

      const payloadInscripcion = {
        ciestu: ciestu,
        periodo_id: parseInt(periodoId, 10),
        seccion_ids: seccionIds,
        estado: estado,
      };

      await api.post("/inscipcion/", payloadInscripcion);

      show_alert("Estudiante matriculado con éxito", "success");
      setCiestu("");
      setPeriodoId("");
      setSeccionIds([]);
      cargarDatos();
    } catch (error) {
      console.error("Detalle del Error 500 en FastAPI:", error.response?.data);
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === "string" ? detail : "Error 500: Revisa la terminal de Python para ver el fallo del backend",
        "error"
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarInscripcion = async (id) => {
    try {
      await api.delete(`/inscipcion/${id}`);
      show_alert("Inscripción anulada correctamente", "success");
      cargarDatos();
    } catch (error) {
      console.error(error);
      show_alert("Error al anular la inscripción", "error");
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p className="text-xl font-bold text-yellow-400">Cargando módulo de inscripciones...</p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-black text-white pt-24 space-y-10">
      
      {/* FORMULARIO DE INSCRIPCIÓN */}
      <div className="container mx-auto max-w-2xl bg-gray-900 border border-gray-700 p-8 rounded-2xl shadow-2xl space-y-6">
        <h2 className="text-3xl font-extrabold text-yellow-400 text-center">
          Inscripción de Estudiantes
        </h2>
        <p className="text-gray-400 text-sm text-center">
          Selecciona el estudiante, el período y la sección para formalizar la matrícula.
        </p>

        <form onSubmit={handleInscribir} className="space-y-5">
          
          {/* SELECCIONAR ESTUDIANTE */}
          <div>
            <label className="block text-sm font-bold mb-2 text-yellow-400">
              Estudiante
            </label>
            <select
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white outline-none focus:border-yellow-400"
              value={ciestu}
              onChange={(e) => setCiestu(e.target.value)}
              required
            >
              <option value="">-- Seleccionar Estudiante --</option>
              {estudiantes.map((est) => {
                const cedulaVal = est.ciestu || est.cedula || est.ci || est.id;
                const nombreVal = est.nombreestu || est.nombre || "";
                const apellidoVal = est.apelliestu || est.apellido || "";

                return (
                  <option key={cedulaVal} value={cedulaVal}>
                    {cedulaVal} — {nombreVal} {apellidoVal}
                  </option>
                );
              })}
            </select>
          </div>

          {/* SELECCIONAR PERÍODO */}
          <div>
            <label className="block text-sm font-bold mb-2 text-yellow-400">
              Período Académico
            </label>
            <select
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white outline-none focus:border-yellow-400"
              value={periodoId}
              onChange={(e) => setPeriodoId(e.target.value)}
              required
            >
              <option value="">-- Seleccionar Período --</option>
              {periodos.map((per) => (
                <option key={per.id} value={per.id}>
                  {per.nombre || `Período #${per.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* SELECCIONAR SECCIONES */}
          <div>
            <label className="block text-sm font-bold mb-2 text-yellow-400">
              Secciones / Módulos
            </label>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-gray-600 bg-gray-800 p-3">
              {secciones.length ? secciones.map((sec) => {
                const idSeccion = Number(sec.idsecc || sec.id);
                const nombreSeccion = sec.nomsecc || sec.nombresecc || sec.nombre || `Sección #${idSeccion}`;

                return (
                  <label key={idSeccion} className="flex cursor-pointer items-center gap-3 text-white">
                    <input
                      type="checkbox"
                      checked={seccionIds.includes(idSeccion)}
                      onChange={(event) => setSeccionIds((actuales) => (
                        event.target.checked
                          ? [...actuales, idSeccion]
                          : actuales.filter((id) => id !== idSeccion)
                      ))}
                      className="h-4 w-4 accent-yellow-400"
                    />
                    <span>{nombreSeccion}</span>
                  </label>
                );
              }) : <p className="text-sm text-gray-400">No hay secciones disponibles.</p>}
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Seleccionadas: {seccionIds.length}. Se validarán y guardarán juntas.
            </p>
          </div>

          {/* ESTADO */}
          <div>
            <label className="block text-sm font-bold mb-2 text-yellow-400">
              Estado de la Inscripción
            </label>
            <select
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white outline-none focus:border-yellow-400"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="ACTIVO">ACTIVO</option>
              <option value="PENDIENTE">PENDIENTE</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="w-full py-4 bg-yellow-400 text-black text-lg font-bold rounded-xl hover:bg-yellow-300 transition-all shadow-lg cursor-pointer disabled:opacity-50 mt-4"
          >
            {guardando ? "Procesando..." : "Registrar Matrícula"}
          </button>
        </form>
      </div>

      {/* HISTORIAL GENERAL */}
      <div className="container mx-auto max-w-6xl bg-gray-900 border border-gray-700 p-6 rounded-2xl shadow-2xl">
        <h3 className="text-xl font-bold text-yellow-400 mb-4">
          Historial General de Inscripciones
        </h3>

        {inscripcionesDetalladas.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay inscripciones registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-yellow-400">
                  <th className="p-3">ID</th>
                  <th className="p-3">Cédula</th>
                  <th className="p-3">Estudiante</th>
                  <th className="p-3">Período</th>
                  <th className="p-3">Sección</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {inscripcionesDetalladas.map((ins) => (
                  <tr key={`${ins.id}-${ins.detalleId}`} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-3 font-semibold">{ins.id}</td>
                    <td className="p-3">{ins.ciestu}</td>
                    <td className="p-3 font-medium text-white">{ins.estudianteNombre}</td>
                    <td className="p-3 text-gray-300">{ins.periodoNombre}</td>
                    <td className="p-3 text-yellow-300 font-bold">{ins.seccionNombre}</td>
                    <td className="p-3 text-gray-400">{ins.fecha}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          ins.estado === "ACTIVO"
                            ? "bg-green-900/60 text-green-400 border border-green-600"
                            : "bg-yellow-900/60 text-yellow-400 border border-yellow-600"
                        }`}
                      >
                        {ins.estado}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleEliminarInscripcion(ins.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded transition"
                      >
                        Anular
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default CrudInscripciones;