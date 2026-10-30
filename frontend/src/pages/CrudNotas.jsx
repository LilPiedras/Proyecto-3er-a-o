import React, { useEffect, useState } from "react";
import api from "../api";
import { show_alert } from "../components/functions/Showpro_functions";

const CrudNotas = () => {
  const [rolUsuario, setRolUsuario] = useState(null);
  const [ciuser, setCiuser] = useState("");
  const [cargando, setCargando] = useState(true);

  const [misNotas, setMisNotas] = useState([]);

  const [estudiantes, setEstudiantes] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [notasLista, setNotasLista] = useState([]);

  const [oferta, setOferta] = useState("");
  const [idevaluacion, setIdevaluacion] = useState("");
  const [notaValor, setNotaValor] = useState("");
  const [fechanota, setFechanota] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const obtenerRol = () => {
    const saved =
      localStorage.getItem("idrol") ||
      localStorage.getItem("user_role") ||
      localStorage.getItem("role");
    if (saved !== null && saved !== undefined && saved !== "") {
      return !isNaN(saved) ? parseInt(saved, 10) : saved;
    }
    return 5;
  };

  useEffect(() => {
    setRolUsuario(obtenerRol());
    setCiuser(localStorage.getItem("ciuser") || "");
  }, []);

  const esDocenteOAdmin = [1, 2, "1", "2"].includes(rolUsuario);
  const esEstudiante = [5, "5"].includes(rolUsuario);

  const cargarNotasEstudiante = async (ci) => {
    try {
      const { data } = await api.get(`/Notas/estudiante/${ci}`);
      setMisNotas(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.response?.status === 404) {
        setMisNotas([]);
      } else {
        const detail = error.response?.data?.detail;
        show_alert(
          typeof detail === "string" ? detail : "Error al cargar tus notas",
          "error"
        );
        setMisNotas([]);
      }
    }
  };

    const cargarDatosDocente = async () => {
    try {
        const ci = localStorage.getItem("ciuser") || "";

        const promesas = [
        api.get("/Oferta/").catch(() => ({ data: [] })),
        api.get("/Notas/").catch(() => ({ data: [] })),
        api.get("/plan-evaluacion/").catch(() => ({ data: [] })), // ← NUEVO
        ];

        if (ci) {
        promesas.push(
            api.get(`/Notas/docente/${ci}/estudiantes`).catch(() => ({ data: [] }))
        );
        }

        const [resOfertas, resNotas, resPlanes, resEstu] = await Promise.all(promesas);

        setOfertas(Array.isArray(resOfertas.data) ? resOfertas.data : []);
        setNotasLista(Array.isArray(resNotas.data) ? resNotas.data : []);
        setEvaluaciones(Array.isArray(resPlanes.data) ? resPlanes.data : []); // ← NUEVO
        setEstudiantes(
        resEstu && Array.isArray(resEstu.data) ? resEstu.data : []
        );
    } catch (error) {
        console.error(error);
        show_alert("Error al cargar datos de notas", "error");
    }
    };

  const cargarEvaluaciones = async (idmateria) => {
    if (!idmateria) {
      setEvaluaciones([]);
      return;
    }
    try {
      const { data } = await api.get(`/plan-evaluacion/materia/${idmateria}`);
      setEvaluaciones(Array.isArray(data) ? data : []);
    } catch {
      setEvaluaciones([]);
    }
  };

  useEffect(() => {
    if (rolUsuario === null) return;

    const init = async () => {
      setCargando(true);
      const ci = localStorage.getItem("ciuser") || "";

      if (esEstudiante && ci) {
        await cargarNotasEstudiante(ci);
      } else if (esDocenteOAdmin) {
        await cargarDatosDocente();
      }
      setCargando(false);
    };

    init();
  }, [rolUsuario]);

  const publicarNota = async (e) => {
    e.preventDefault();
    const ci = localStorage.getItem("ciuser");

    if (!ci) {
      return show_alert("No se encontró tu cédula en sesión. Vuelve a iniciar sesión.", "warning");
    }
    if (!oferta || notaValor === "") {
      return show_alert("Completa oferta y calificación", "warning");
    }

    const valor = parseFloat(notaValor);
    if (isNaN(valor) || valor < 0 || valor > 20) {
      return show_alert("La nota debe estar entre 0 y 20", "warning");
    }

    try {
      const payload = {
        notas: valor,
        oferta: parseInt(oferta, 10),
        fechanota: fechanota,
        idevaluacion: idevaluacion ? parseInt(idevaluacion, 10) : null,
      };

      await api.post(`/Notas/docente/${ci}`, payload);
      show_alert("Nota publicada correctamente", "success");

      setOferta("");
      setIdevaluacion("");
      setNotaValor("");
      setFechanota(new Date().toISOString().slice(0, 10));
      await cargarDatosDocente();
    } catch (error) {
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === "string" ? detail : "Error al publicar la nota",
        "error"
      );
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p className="text-xl font-bold text-yellow-400">Cargando notas...</p>
      </div>
    );
  }

  return (
    <div className="CRUD p-6 min-h-screen bg-black text-white pt-24">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
          {esEstudiante ? "Mis Notas" : "Gestión de Notas"}
        </h2>

        {/* ========== VISTA ESTUDIANTE ========== */}
        {esEstudiante && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-800 border-b border-gray-700 text-yellow-400 text-xs uppercase">
                  <tr>
                    <th className="p-3">ID Nota</th>
                    <th className="p-3">Calificación</th>
                    <th className="p-3">Oferta</th>
                    <th className="p-3">Evaluación</th>
                    <th className="p-3">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {misNotas.length > 0 ? (
                    misNotas.map((n) => (
                      <tr
                        key={n.idnota}
                        className="border-b border-gray-700 hover:bg-gray-800"
                      >
                        <td className="p-3 font-mono text-gray-400">#{n.idnota}</td>
                        <td className="p-3">
                          <span
                            className={`font-bold text-lg ${
                              n.notas >= 10 ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {Number(n.notas).toFixed(2)}
                          </span>
                        </td>
                        <td className="p-3">{n.oferta}</td>
                        <td className="p-3">{n.idevaluacion ?? "—"}</td>
                        <td className="p-3">{n.fechanota}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center p-6 text-gray-500">
                        Aún no tienes notas registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== VISTA DOCENTE / ADMIN ========== */}
        {esDocenteOAdmin && (
          <>
            {/* Formulario publicar */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">Publicar nota</h3>
              <form onSubmit={publicarNota}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-yellow-400">
                      Oferta (idseccmo)
                    </label>
                    <select
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white outline-none"
                      value={oferta}
                      onChange={(e) => setOferta(e.target.value)}
                      required
                    >
                      <option value="">-- Seleccionar --</option>
                      {ofertas
                        .filter((o) => o.estudiante)
                        .map((o) => (
                          <option key={o.idseccmo} value={o.idseccmo}>
                            #{o.idseccmo} — Est: {o.estudiante} — Secc: {o.idsecc}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-yellow-400">
                      Plan evaluación (opcional)
                    </label>
                    <select
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white outline-none"
                      value={idevaluacion}
                      onChange={(e) => setIdevaluacion(e.target.value)}
                    >
                      <option value="">-- Ninguno --</option>
                      {evaluaciones.map((ev) => (
                        <option key={ev.idevaluacion} value={ev.idevaluacion}>
                          {ev.titulo} ({ev.porcentaje}%)
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Si no carga, déjalo vacío o crea el plan antes.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-yellow-400">
                      Calificación (0–20)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="20"
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white outline-none"
                      value={notaValor}
                      onChange={(e) => setNotaValor(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-yellow-400">
                      Fecha
                    </label>
                    <input
                      type="date"
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white outline-none"
                      value={fechanota}
                      onChange={(e) => setFechanota(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-yellow-400 text-black font-bold py-2 px-6 rounded hover:bg-yellow-300 transition"
                  >
                    Publicar nota
                  </button>
                </div>
              </form>
            </div>

            {/* Estudiantes del docente */}
            {estudiantes.length > 0 && (
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8 shadow-lg">
                <h3 className="text-xl font-bold text-white mb-4">
                  Estudiantes asignados
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-800 text-yellow-400 text-xs uppercase">
                      <tr>
                        <th className="p-3">Oferta</th>
                        <th className="p-3">Cédula</th>
                        <th className="p-3">Nombre</th>
                        <th className="p-3">Sección</th>
                        <th className="p-3">Horario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estudiantes.map((e, i) => (
                        <tr key={i} className="border-b border-gray-700">
                          <td className="p-3">#{e.idseccmo}</td>
                          <td className="p-3">{e.ciestu}</td>
                          <td className="p-3">
                            {e.nombreestu} {e.apelliestu}
                          </td>
                          <td className="p-3">{e.idsecc}</td>
                          <td className="p-3">{e.horario ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Lista de notas */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">Notas registradas</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-800 text-yellow-400 text-xs uppercase">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Nota</th>
                      <th className="p-3">Oferta</th>
                      <th className="p-3">Evaluación</th>
                      <th className="p-3">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notasLista.length > 0 ? (
                      notasLista.map((n) => (
                        <tr key={n.idnota} className="border-b border-gray-700">
                          <td className="p-3">#{n.idnota}</td>
                          <td className="p-3 font-bold text-yellow-400">
                            {Number(n.notas).toFixed(2)}
                          </td>
                          <td className="p-3">{n.oferta}</td>
                          <td className="p-3">{n.idevaluacion ?? "—"}</td>
                          <td className="p-3">{n.fechanota}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center p-6 text-gray-500">
                          No hay notas registradas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CrudNotas;