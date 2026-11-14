import { useState, useEffect } from 'react';
import api from '../api';

export default function PanelDocenteNotas() {
  const [materiasDocente, setMateriasDocente] = useState([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMaterias, setLoadingMaterias] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  // 1. Cargar la lista de materias que imparte el docente al montar el componente
  useEffect(() => {
    const cargarMaterias = async () => {
      try {
        setLoadingMaterias(true);
        // Ajusta el endpoint según la ruta de materias que maneje tu backend
        const { data } = await api.get('/materias/'); 
        setMateriasDocente(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al cargar las materias:", err);
      } finally {
        setLoadingMaterias(false);
      }
    };
    cargarMaterias();
  }, []);

  // 2. Al seleccionar una materia, consultar los estudiantes inscritos
  const handleSeleccionarMateria = async (e) => {
    const idMat = e.target.value;
    setMateriaSeleccionada(idMat);
    setEstudiantes([]);
    setMensaje("");
    setError("");

    if (!idMat) return;

    setLoading(true);
    try {
      const { data } = await api.get(`/docente/materias/${idMat}/estudiantes`);
      // Mapeamos los datos para añadir un campo editable "nuevaNota"
      setEstudiantes(
        Array.isArray(data) ? data.map(est => ({ ...est, nuevaNota: est.nota })) : []
      );
    } catch (err) {
      console.error("Error al cargar estudiantes:", err);
      setError("No se pudieron cargar los estudiantes inscritos.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Manejar el cambio de notas en tiempo real dentro del input de la tabla
  const handleNotaChange = (ciuser, valor) => {
    setEstudiantes(prev =>
      prev.map(est => est.ciuser === ciuser ? { ...est, nuevaNota: valor } : est)
    );
  };

  // 4. Enviar las calificaciones al backend usando el endpoint masivo
  const handlePublicarNotas = async () => {
    setError("");
    setMensaje("");

    try {
      const payload = estudiantes.map(est => ({
        ciuser: est.ciuser,
        idmateria: Number(materiaSeleccionada),
        calificacion: parseFloat(est.nuevaNota) || 0.0
      }));

      await api.post('/docente/notas/publicar', payload);
      setMensaje("¡Notas publicadas y actualizadas correctamente!");
    } catch (err) {
      console.error("Error al publicar notas:", err);
      setError("Ocurrió un error al intentar guardar las calificaciones.");
    }
  };

  return (
    <div className="min-h-screen bg-[#1c180e] text-white p-6 pt-24 flex justify-center items-start">
      <div className="w-full max-w-4xl bg-[#11141d] border border-[#2b2518] rounded-3xl shadow-2xl p-8">
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-100">PANEL DE DOCENTE</h1>
          <p className="text-gray-400 mt-1 text-sm">Gestión de calificaciones y estudiantes inscritos.</p>
        </div>

        {/* Selector de Materias */}
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Selecciona tu Materia
          </label>
          <select
            value={materiaSeleccionada}
            onChange={handleSeleccionarMateria}
            disabled={loadingMaterias}
            className="w-full bg-[#161a25] border border-[#252c3d] rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
          >
            <option value="">{loadingMaterias ? "Cargando materias..." : "-- Selecciona una materia --"}</option>
            {materiasDocente.map(mat => (
              <option key={mat.idmateria || mat.id} value={mat.idmateria || mat.id}>
                {mat.nombremateria || mat.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Estados de carga y mensajes */}
        {loading && (
          <p className="text-center text-yellow-400 py-8 text-sm font-medium">Buscando estudiantes inscritos...</p>
        )}

        {error && (
          <p className="text-red-400 text-sm font-medium bg-red-950/30 p-3 rounded-xl border border-red-900/50 mb-4">
            {error}
          </p>
        )}

        {mensaje && (
          <p className="text-emerald-400 text-sm font-medium bg-emerald-950/30 p-3 rounded-xl border border-emerald-900/50 mb-4">
            {mensaje}
          </p>
        )}

        {/* Tabla de Estudiantes */}
        {!loading && estudiantes.length > 0 && (
          <div>
            <div className="overflow-x-auto mb-6 border border-[#252c3d] rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#181d28] text-yellow-400 text-xs uppercase border-b border-[#252c3d]">
                  <tr>
                    <th className="p-3.5">Cédula</th>
                    <th className="p-3.5">Estudiante</th>
                    <th className="p-3.5 w-36 text-center">Calificación</th>
                  </tr>
                </thead>
                <tbody>
                  {estudiantes.map((est) => (
                    <tr key={est.ciuser} className="border-b border-[#252c3d] hover:bg-[#161a25]/60 transition-all">
                      <td className="p-3.5 font-mono text-sm text-gray-300">{est.ciuser}</td>
                      <td className="p-3.5 text-sm text-gray-200 font-medium">{est.nombre}</td>
                      <td className="p-3.5 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="20"
                          value={est.nuevaNota}
                          onChange={(e) => handleNotaChange(est.ciuser, e.target.value)}
                          className="w-24 text-center bg-[#161a25] border border-[#252c3d] rounded-lg p-2 text-sm text-yellow-300 font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handlePublicarNotas}
                className="py-3 px-6 rounded-xl bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500 transition-all shadow-lg cursor-pointer text-sm"
              >
                Publicar Notas
              </button>
            </div>
          </div>
        )}

        {!loading && materiaSeleccionada && estudiantes.length === 0 && !error && (
          <p className="text-gray-500 text-center py-8 text-sm">No hay estudiantes inscritos en esta materia actualmente.</p>
        )}

      </div>
    </div>
  );
}