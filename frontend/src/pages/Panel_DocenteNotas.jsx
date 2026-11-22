import { useState, useEffect } from 'react';
import api from '../api';

export default function PanelDocenteNotas() {
  const [materiasDocente, setMateriasDocente] = useState([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState('');
  const [estudiantes, setEstudiantes] = useState([]);
  const [todosEstudiantes, setTodosEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMaterias, setLoadingMaterias] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const ciDocente =
    localStorage.getItem('ciuser') ||
    localStorage.getItem('ciempleado') ||
    '';

  useEffect(() => {
    const cargar = async () => {
      if (!ciDocente) {
        setError('No se encontró la cédula del docente en sesión.');
        setLoadingMaterias(false);
        return;
      }
      try {
        setLoadingMaterias(true);

        const { data } = await api.get(`/Notas/docente/${ciDocente}/estudiantes`);
        const lista = Array.isArray(data) ? data : [];
        setTodosEstudiantes(lista);

        const map = new Map();
        lista.forEach((e) => {
          if (e.idmateria && !map.has(e.idmateria)) {
            map.set(e.idmateria, {
              idmateria: e.idmateria,
              nombremateria: e.nombremateria || `Materia #${e.idmateria}`,
            });
          }
        });
        setMateriasDocente(Array.from(map.values()));
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar tus materias asignadas.');
        setMateriasDocente([]);
        setTodosEstudiantes([]);
      } finally {
        setLoadingMaterias(false);
      }
    };
    cargar();
  }, [ciDocente]);

  const handleSeleccionarMateria = (e) => {
    const idMat = e.target.value;
    setMateriaSeleccionada(idMat);
    setMensaje('');
    setError('');
    setEstudiantes([]);

    if (!idMat) return;

    setLoading(true);
    const filtrados = todosEstudiantes
      .filter((est) => String(est.idmateria) === String(idMat))
      .map((est) => ({
        ...est,
        ciuser: est.ciestu,
        nombre: `${est.nombreestu || ''} ${est.apelliestu || ''}`.trim(),
        nuevaNota: '',
        idseccmo: est.idseccmo,
      }));
    setEstudiantes(filtrados);
    setLoading(false);
  };

  const handleNotaChange = (ciuser, valor) => {
    setEstudiantes((prev) =>
      prev.map((est) =>
        est.ciuser === ciuser ? { ...est, nuevaNota: valor } : est
      )
    );
  };

  const handlePublicarNotas = async () => {
    setError('');
    setMensaje('');

    const conNota = estudiantes.filter(
      (e) => e.nuevaNota !== '' && e.nuevaNota != null
    );
    if (conNota.length === 0) {
      setError('Ingresa al menos una calificación.');
      return;
    }

    try {
      for (const est of conNota) {
        const valor = parseFloat(est.nuevaNota);
        if (isNaN(valor) || valor < 0 || valor > 20) {
          setError(`Nota inválida para ${est.nombre} (debe ser 0–20).`);
          return;
        }
        await api.post(`/Notas/docente/${ciDocente}`, {
          notas: valor,
          oferta: est.idseccmo,
          fechanota: new Date().toISOString().slice(0, 10),
          idevaluacion: null,
        });
      }
      setMensaje('¡Notas publicadas correctamente!');
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === 'string'
          ? detail
          : 'Error al guardar las calificaciones.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#1c180e] text-white p-6 pt-24 flex justify-center items-start">
      <div className="w-full max-w-4xl bg-[#11141d] border border-[#2b2518] rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-100">PANEL DE DOCENTE</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Solo ves las materias y estudiantes que tienes asignados.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Selecciona tu Materia
          </label>
          <select
            value={materiaSeleccionada}
            onChange={handleSeleccionarMateria}
            disabled={loadingMaterias}
            className="w-full bg-[#161a25] border border-[#252c3d] rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">
              {loadingMaterias
                ? 'Cargando materias...'
                : materiasDocente.length === 0
                  ? 'No tienes materias asignadas'
                  : '-- Selecciona una materia --'}
            </option>
            {materiasDocente.map((mat) => (
              <option key={mat.idmateria} value={mat.idmateria}>
                {mat.nombremateria}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <p className="text-center text-yellow-400 py-8 text-sm">Cargando estudiantes...</p>
        )}
        {error && (
          <p className="text-red-400 text-sm bg-red-950/30 p-3 rounded-xl border border-red-900/50 mb-4">
            {error}
          </p>
        )}
        {mensaje && (
          <p className="text-emerald-400 text-sm bg-emerald-950/30 p-3 rounded-xl border border-emerald-900/50 mb-4">
            {mensaje}
          </p>
        )}

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
                    <tr
                      key={est.ciuser + '-' + est.idseccmo}
                      className="border-b border-[#252c3d] hover:bg-[#161a25]/60"
                    >
                      <td className="p-3.5 font-mono text-sm text-gray-300">{est.ciuser}</td>
                      <td className="p-3.5 text-sm text-gray-200">{est.nombre}</td>
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
                className="py-3 px-6 rounded-xl bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500 text-sm"
              >
                Publicar Notas
              </button>
            </div>
          </div>
        )}

        {!loading && materiaSeleccionada && estudiantes.length === 0 && !error && (
          <p className="text-gray-500 text-center py-8 text-sm">
            No hay estudiantes inscritos en esta materia.
          </p>
        )}
      </div>
    </div>
  );
}