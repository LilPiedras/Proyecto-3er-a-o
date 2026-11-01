import React, { useEffect, useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const CrudCarrera = () => {
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const [idcarrera, setIdcarrera] = useState('');
  const [nombrecarrera, setNombrecarrera] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [operation, setOperation] = useState(1);
  const [title, setTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cargarCarreras = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/carrera/');
      setCarreras(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === 'string' ? detail : 'Error al cargar carreras',
        'error'
      );
      setCarreras([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCarreras();
  }, []);

  const carrerasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return carreras;
    return carreras.filter((c) => {
      const nombre = String(c.nombrecarrera || '').toLowerCase();
      const desc = String(c.descripcion || '').toLowerCase();
      const id = String(c.idcarrera ?? '');
      return nombre.includes(q) || desc.includes(q) || id.includes(q);
    });
  }, [carreras, busqueda]);

  const limpiarFormulario = () => {
    setIdcarrera('');
    setNombrecarrera('');
    setDescripcion('');
  };

  const openModal = (op, id = '', nombre = '', desc = '') => {
    limpiarFormulario();
    setOperation(op);

    if (op === 1) {
      setTitle('Registrar Carrera');
    } else {
      setTitle('Editar Carrera');
      setIdcarrera(id);
      setNombrecarrera(nombre);
      setDescripcion(desc);
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    limpiarFormulario();
  };

  const validar = () => {
    if (nombrecarrera.trim() === '') {
      show_alert('Escribe el nombre de la carrera', 'warning');
      return;
    }
    if (descripcion.trim() === '') {
      show_alert('Escribe una descripción', 'warning');
      return;
    }

    const parametros = {
      nombrecarrera: nombrecarrera.trim(),
      descripcion: descripcion.trim(),
    };

    if (operation === 1) {
      enviarSolicitud('POST', parametros);
    } else {
      enviarSolicitud('PATCH', parametros, idcarrera);
    }
  };

  const enviarSolicitud = async (metodo, parametros, idPath = null) => {
    try {
      if (metodo === 'POST') {
        await api.post('/carrera/', parametros);
      } else if (metodo === 'PATCH') {
        await api.patch(`/carrera/${idPath}`, parametros);
      } else if (metodo === 'DELETE') {
        await api.delete(`/carrera/${idPath}`);
      }

      const msg =
        metodo === 'DELETE'
          ? 'Carrera eliminada correctamente'
          : metodo === 'POST'
            ? 'Carrera registrada correctamente'
            : 'Carrera actualizada correctamente';

      show_alert(msg, 'success');
      closeModal();
      await cargarCarreras();
    } catch (error) {
      console.error('Error detallado:', error.response?.data);
      const detail = error.response?.data?.detail;

      let mensajeError = 'Error en la operación';
      if (typeof detail === 'string') {
        mensajeError = detail;
      } else if (Array.isArray(detail)) {
        mensajeError = detail
          .map((err) => `${err.loc[err.loc.length - 1]}: ${err.msg}`)
          .join(' | ');
      }
      show_alert(mensajeError, 'error');
    }
  };

  const deleteCarrera = (id, nombre) => {
    if (!id) {
      show_alert('Error: ID de carrera no válido', 'error');
      return;
    }

    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: `¿Seguro de eliminar la carrera "${nombre}"?`,
      text: 'No se podrá dar marcha atrás',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    }).then((result) => {
      if (result.isConfirmed) {
        enviarSolicitud('DELETE', {}, id);
      } else {
        show_alert('La carrera no fue eliminada', 'info');
      }
    });
  };

  const inicial = (c) => {
    const n = (c.nombrecarrera || '?').trim();
    return n.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p className="text-xl font-bold text-yellow-400">
          Cargando carreras...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-black text-white pt-24">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-yellow-400 mb-2 text-center">
          Gestión de Carreras
        </h2>
        <p className="text-center text-gray-400 text-sm mb-8">
          Programas académicos disponibles en el sistema
        </p>

        {/* Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
            <p className="text-xs uppercase text-gray-400 mb-1">
              Total carreras
            </p>
            <p className="text-2xl font-bold text-yellow-400">
              {carreras.length}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
            <p className="text-xs uppercase text-gray-400 mb-1">
              Resultados filtro
            </p>
            <p className="text-2xl font-bold text-white">
              {carrerasFiltradas.length}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg flex items-center justify-center">
            <button
              type="button"
              onClick={() => openModal(1)}
              className="w-full bg-yellow-400 text-black font-bold py-2.5 px-4 rounded-lg hover:bg-yellow-300 transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-circle-plus"></i>
              Añadir carrera
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6 shadow-lg">
          <label className="block text-sm font-bold mb-2 text-yellow-400">
            Buscar
          </label>
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400 transition"
              placeholder="Nombre, descripción o ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">
            Listado de carreras
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead className="bg-gray-800 border-b border-gray-700 text-yellow-400 text-xs uppercase">
                <tr>
                  <th className="p-3">Carrera</th>
                  <th className="p-3">Descripción</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {carrerasFiltradas.length > 0 ? (
                  carrerasFiltradas.map((c, index) => (
                    <tr
                      key={c.idcarrera || index}
                      className="border-b border-gray-700 hover:bg-gray-800/80 transition"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400 font-bold shrink-0">
                            {inicial(c)}
                          </div>
                          <div>
                            <p className="font-semibold text-white leading-tight">
                              {c.nombrecarrera}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {c.idcarrera}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-300 max-w-md">
                        <span className="line-clamp-2">
                          {c.descripcion || '—'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            title="Editar"
                            onClick={() =>
                              openModal(
                                2,
                                c.idcarrera,
                                c.nombrecarrera,
                                c.descripcion
                              )
                            }
                            className="bg-yellow-400 text-black px-3 py-1.5 rounded-lg hover:bg-yellow-300 transition"
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button
                            type="button"
                            title="Eliminar"
                            onClick={() =>
                              deleteCarrera(c.idcarrera, c.nombrecarrera)
                            }
                            className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-500 transition"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center p-10 text-gray-500">
                      {busqueda
                        ? 'No hay carreras que coincidan con la búsqueda.'
                        : 'No hay carreras registradas.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg p-6 text-white relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-yellow-400">{title}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Completa los datos de la carrera
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-white font-bold text-xl w-8 h-8 flex items-center justify-center rounded hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Nombre de la carrera
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                  placeholder="Ej. Diseño de Modas"
                  value={nombrecarrera}
                  onChange={(e) => setNombrecarrera(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Descripción
                </label>
                <textarea
                  className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400 resize-none"
                  placeholder="Descripción de la carrera"
                  rows="4"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={validar}
                  className="px-5 py-2.5 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition"
                >
                  {operation === 1 ? 'Guardar' : 'Actualizar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrudCarrera;