import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import api from "../api";
import { show_alert } from "../components/functions/Showpro_functions";

const MySwal = withReactContent(Swal);

const CrudPlanEvaluacion = () => {
  const [planes, setPlanes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const [idmateria, setIdmateria] = useState("");
  const [idsecc, setIdsecc] = useState("");
  const [titulo, setTitulo] = useState("");
  const [porcentaje, setPorcentaje] = useState("");

  const cargarPlanes = async () => {
    try {
      const { data } = await api.get("/plan-evaluacion/");
      setPlanes(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.response?.status === 404) {
        setPlanes([]);
      } else {
        const detail = error.response?.data?.detail;
        show_alert(
          typeof detail === "string" ? detail : "Error al cargar planes",
          "error"
        );
        setPlanes([]);
      }
    }
  };

  const cargarCatalogos = async () => {
    try {
      const [resMat, resSec] = await Promise.all([
        api.get("/materia/").catch(() => api.get("/materias/").catch(() => ({ data: [] }))),
        api.get("/seccion/").catch(() => api.get("/secciones/").catch(() => ({ data: [] }))),
      ]);

      const mats = Array.isArray(resMat.data) ? resMat.data : [];
      const secs = Array.isArray(resSec.data) ? resSec.data : [];

      setMaterias(mats.filter((m) => m.activo !== false));
      setSecciones(secs.filter((s) => s.activo !== false));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([cargarPlanes(), cargarCatalogos()]);
      setLoading(false);
    };
    init();
  }, []);

  const limpiar = () => {
    setIdmateria("");
    setIdsecc("");
    setTitulo("");
    setPorcentaje("");
  };

  const guardar = async (e) => {
    e.preventDefault();

    if (!idmateria || !idsecc || !titulo.trim() || porcentaje === "") {
      return show_alert("Completa todos los campos", "warning");
    }

    const pct = parseFloat(porcentaje);
    if (isNaN(pct) || pct <= 0 || pct > 100) {
      return show_alert("El porcentaje debe estar entre 0 y 100", "warning");
    }

    try {
      await api.post("/plan-evaluacion/", {
        idmateria: parseInt(idmateria, 10),
        idsecc: parseInt(idsecc, 10),
        titulo: titulo.trim(),
        porcentaje: pct,
      });
      show_alert("Plan de evaluación creado", "success");
      limpiar();
      await cargarPlanes();
    } catch (error) {
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === "string" ? detail : "Error al crear el plan",
        "error"
      );
    }
  };

  const eliminar = (idevaluacion, tituloPlan) => {
    MySwal.fire({
      title: `¿Eliminar "${tituloPlan}"?`,
      text: "No se podrá deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await api.delete(`/plan-evaluacion/${idevaluacion}`);
        show_alert("Plan eliminado", "success");
        await cargarPlanes();
      } catch (error) {
        const detail = error.response?.data?.detail;
        show_alert(
          typeof detail === "string" ? detail : "Error al eliminar",
          "error"
        );
      }
    });
  };

  const nombreMateria = (id) => {
    const m = materias.find((x) => x.idmateria === id);
    return m ? m.nombremateria : `#${id}`;
  };

  const nombreSeccion = (id) => {
    const s = secciones.find((x) => x.idsecc === id);
    return s ? s.nomsecc || s.nombreseccion || `#${id}` : `#${id}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p className="text-xl font-bold text-yellow-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="CRUD p-6 min-h-screen bg-black text-white pt-24">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
          Plan de Evaluación
        </h2>

        {/* Formulario */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">Nuevo plan</h3>
          <form onSubmit={guardar}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Materia
                </label>
                <select
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white outline-none"
                  value={idmateria}
                  onChange={(e) => setIdmateria(e.target.value)}
                  required
                >
                  <option value="">-- Seleccionar --</option>
                  {materias.map((m) => (
                    <option key={m.idmateria} value={m.idmateria}>
                      {m.nombremateria}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Sección
                </label>
                <select
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white outline-none"
                  value={idsecc}
                  onChange={(e) => setIdsecc(e.target.value)}
                  required
                >
                  <option value="">-- Seleccionar --</option>
                  {secciones.map((s) => (
                    <option key={s.idsecc} value={s.idsecc}>
                      {s.nomsecc || s.nombreseccion || `Sección ${s.idsecc}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Título
                </label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white outline-none"
                  placeholder="Ej. Parcial 1"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Porcentaje (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="100"
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white outline-none"
                  placeholder="30"
                  value={porcentaje}
                  onChange={(e) => setPorcentaje(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-yellow-400 text-black font-bold py-2 px-6 rounded hover:bg-yellow-300 transition"
              >
                Guardar plan
              </button>
            </div>
          </form>
        </div>

        {/* Tabla */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">Planes registrados</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-800 text-yellow-400 text-xs uppercase">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Título</th>
                  <th className="p-3">Materia</th>
                  <th className="p-3">Sección</th>
                  <th className="p-3">%</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {planes.length > 0 ? (
                  planes.map((p) => (
                    <tr key={p.idevaluacion} className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="p-3 font-mono text-gray-400">#{p.idevaluacion}</td>
                      <td className="p-3 text-white font-medium">{p.titulo}</td>
                      <td className="p-3">{nombreMateria(p.idmateria)}</td>
                      <td className="p-3">{nombreSeccion(p.idsecc)}</td>
                      <td className="p-3 text-yellow-400 font-bold">
                        {Number(p.porcentaje).toFixed(2)}%
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => eliminar(p.idevaluacion, p.titulo)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center p-6 text-gray-500">
                      No hay planes de evaluación. Crea uno arriba.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrudPlanEvaluacion;