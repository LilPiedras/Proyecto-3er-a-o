import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const MySwal = withReactContent(Swal);

const CrudCarreraModulo = () => {
  const [relaciones, setRelaciones] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [materiasModulos, setMateriasModulos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [idCarreraSeleccionada, setIdCarreraSeleccionada] = useState('');

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [relRes, carrerasRes, matModRes] = await Promise.all([
        api.get('/Carrera_Modulo/').catch(() => ({ data: [] })),
        api.get('/carrera/').catch(() => ({ data: [] })),
        api.get('/modulo_materia/').catch(() => ({ data: [] })),
      ]);

      setRelaciones(Array.isArray(relRes.data) ? relRes.data : []);
      setCarreras(Array.isArray(carrerasRes.data) ? carrerasRes.data : []);
      setMateriasModulos(Array.isArray(matModRes.data) ? matModRes.data : []);
    } catch (error) {
      console.error(error);
      show_alert('Error al cargar datos de Carrera-Módulo', 'error');
      setRelaciones([]);
      setCarreras([]);
      setMateriasModulos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const getNombreCarrera = (id) => {
    const c = carreras.find((item) => Number(item.idcarrera) === Number(id));
    return c?.nombrecarrera || `Carrera #${id}`;
  };

  const getLabelMateriaModulo = (m) => {
    if (!m) return '—';
    const mat = m.nombremateria || `Materia ${m.idmateria ?? ''}`;
    const mod = m.nombremodulo || `Módulo ${m.idmodulo ?? ''}`;
    return `${mat} · ${mod}`;
  };

  const relacionesDeCarrera = relaciones.filter(
    (r) => Number(r.idcarrera) === Number(idCarreraSeleccionada)
  );

  const idsMatemoAsignados = relacionesDeCarrera.map((r) =>
    String(r.idmatemo)
  );

  const vincular = async (idmatemo) => {
    if (!idCarreraSeleccionada) {
      return show_alert('Selecciona una carrera primero', 'warning');
    }

    try {
      await api.post('/Carrera_Modulo/', {
        idcarrera: Number(idCarreraSeleccionada),
        idmatemo: Number(idmatemo),
      });
      show_alert('Materia-módulo vinculada a la carrera', 'success');
      await cargarDatos();
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === 'string' ? detail : 'Error al vincular',
        'error'
      );
    }
  };

  const desvincular = async (idcarremo) => {
    const confirm = await MySwal.fire({
      title: '¿Quitar esta relación?',
      text: 'La materia-módulo dejará de estar asociada a esta carrera.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/Carrera_Modulo/${idcarremo}`);
      show_alert('Relación eliminada', 'success');
      await cargarDatos();
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === 'string' ? detail : 'Error al eliminar',
        'error'
      );
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p className="text-xl font-bold text-yellow-400">
          Cargando Carrera-Módulo...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-black text-white pt-24">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-yellow-400 mb-2 text-center">
          Gestor de Carrera y Módulo-Materia
        </h2>
        <p className="text-center text-gray-400 text-sm mb-8">
          Vincula materias-módulo a cada carrera. Estas relaciones alimentan el
          select de Secciones.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* COLUMNA IZQUIERDA */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">1. Selección de Carrera</h3>
            </div>

            <div className="mb-6">
              <select
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white outline-none"
                value={idCarreraSeleccionada}
                onChange={(e) => setIdCarreraSeleccionada(e.target.value)}
              >
                <option value="">-- Selecciona una carrera --</option>
                {carreras.map((c) => (
                  <option key={c.idcarrera} value={c.idcarrera}>
                    {c.nombrecarrera}
                  </option>
                ))}
              </select>
              {carreras.length === 0 && (
                <p className="text-xs text-yellow-400 mt-2">
                  No hay carreras. Créalas en el CRUD de Carreras.
                </p>
              )}
            </div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">2. Banco de Materia-Módulo</h3>
            </div>

            <div className="max-h-80 overflow-y-auto bg-gray-800 rounded border border-gray-700 p-2 space-y-2">
              {materiasModulos.length > 0 ? (
                materiasModulos.map((m) => {
                  const id = m.idmatemo;
                  const yaAsignada = idsMatemoAsignados.includes(String(id));

                  return (
                    <div
                      key={id}
                      className="flex justify-between items-center p-2 bg-gray-900 rounded border border-gray-700"
                    >
                      <div className="flex flex-col pr-2">
                        <span className="font-bold text-sm">
                          {m.nombremateria || `Materia ${m.idmateria}`}
                        </span>
                        <span className="text-xs text-gray-400">
                          Módulo: {m.nombremodulo || m.idmodulo} · ID:{' '}
                          {id}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => vincular(id)}
                        disabled={!idCarreraSeleccionada || yaAsignada}
                        className="bg-yellow-400 text-black px-2 py-1 rounded text-xs disabled:opacity-50 font-bold hover:bg-yellow-300 cursor-pointer whitespace-nowrap"
                      >
                        {yaAsignada ? 'Asignada' : 'Vincular'}
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-6 text-sm">
                  No hay materia-módulo. Créalos en{' '}
                  <span className="text-yellow-400">Módulo Materia</span>.
                </p>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-lg">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">
              Materia-Módulo de la carrera
            </h3>

            {!idCarreraSeleccionada ? (
              <p className="text-gray-500 text-center mt-10">
                Selecciona una carrera en la izquierda.
              </p>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-4">
                  Carrera:{' '}
                  <span className="text-white font-semibold">
                    {getNombreCarrera(idCarreraSeleccionada)}
                  </span>
                </p>

                <ul className="space-y-2 max-h-96 overflow-y-auto">
                  {relacionesDeCarrera.length > 0 ? (
                    relacionesDeCarrera.map((rel) => {
                      const matInfo = materiasModulos.find(
                        (m) => Number(m.idmatemo) === Number(rel.idmatemo)
                      );

                      return (
                        <li
                          key={rel.idcarremo}
                          className="bg-gray-800 p-3 rounded border border-gray-600 flex justify-between items-center"
                        >
                          <div>
                            <span className="font-bold text-white block text-sm">
                              {getLabelMateriaModulo(matInfo)}
                            </span>
                            <span className="text-gray-400 text-xs">
                              idcarremo: {rel.idcarremo} · idmatemo:{' '}
                              {rel.idmatemo}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => desvincular(rel.idcarremo)}
                            className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-500 cursor-pointer"
                          >
                            <i className="fa-solid fa-xmark"></i> Quitar
                          </button>
                        </li>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-center mt-4">
                      Esta carrera aún no tiene materia-módulo vinculadas.
                    </p>
                  )}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Resumen global (estilo tabla de Notas) */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mt-8 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">
            Todas las relaciones
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-800 border-b border-gray-700 text-yellow-400 text-xs uppercase">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Carrera</th>
                  <th className="p-3">Materia · Módulo</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {relaciones.length > 0 ? (
                  relaciones.map((r) => {
                    const matInfo = materiasModulos.find(
                      (m) => Number(m.idmatemo) === Number(r.idmatemo)
                    );
                    return (
                      <tr
                        key={r.idcarremo}
                        className="border-b border-gray-700 hover:bg-gray-800"
                      >
                        <td className="p-3 font-mono text-gray-400">
                          #{r.idcarremo}
                        </td>
                        <td className="p-3">{getNombreCarrera(r.idcarrera)}</td>
                        <td className="p-3">{getLabelMateriaModulo(matInfo)}</td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => desvincular(r.idcarremo)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-500"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center p-6 text-gray-500"
                    >
                      No hay relaciones registradas.
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

export default CrudCarreraModulo;