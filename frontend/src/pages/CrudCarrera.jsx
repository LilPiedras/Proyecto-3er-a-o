import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const CrudCarrera = () => {
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados del formulario
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
      show_alert(typeof detail === 'string' ? detail : 'Error al cargar carreras', 'error');
      setCarreras([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCarreras();
  }, []);

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
        metodo === 'DELETE' ? 'Carrera eliminada correctamente'
          : metodo === 'POST' ? 'Carrera registrada correctamente'
          : 'Carrera actualizada correctamente';

      show_alert(msg, 'success');
      setIsModalOpen(false);
      limpiarFormulario();
      await cargarCarreras();
    } catch (error) {
      console.error('Error detallado:', error.response?.data);
      const detail = error.response?.data?.detail;
      
      let mensajeError = 'Error en la operación';
      if (typeof detail === 'string') {
        mensajeError = detail;
      } else if (Array.isArray(detail)) {
        mensajeError = detail.map((err) => `${err.loc[err.loc.length - 1]}: ${err.msg}`).join(' | ');
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
    }).then((result) => {
      if (result.isConfirmed) {
        enviarSolicitud('DELETE', {}, id);
      } else {
        show_alert('La carrera no fue eliminada', 'info');
      }
    });
  };

  return (
    <div className="CRUD p-6 min-h-screen bg-black text-white">
      <div className="container mx-auto">
        <div className="row mt-3">
          <div className="col-md-4 offset-md-4">
            <div className="d-grid mx-auto text-center">
              <button
                className="bg-yellow-400 text-black font-bold px-6 py-2 rounded-lg hover:bg-yellow-300 transition"
                onClick={() => openModal(1)}
              >
                <i className="fa-solid fa-circle-plus"></i> Añadir Carrera
              </button>
            </div>
          </div>
        </div>

        <div className="row mt-6">
          <div className="col-12 col-lg-10 offset-lg-1">
            <div className="table-responsive">
              {loading ? (
                <p className="text-center text-gray-400 p-4">Cargando carreras...</p>
              ) : (
                <table className="table table-dark table-bordered w-full text-left">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>CARRERA</th>
                      <th>DESCRIPCIÓN</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carreras.length > 0 ? (
                      carreras.map((c, index) => (
                        <tr key={c.idcarrera || index}>
                          <td>{c.idcarrera}</td>
                          <td>{c.nombrecarrera}</td>
                          <td>{c.descripcion}</td>
                          <td>
                            <button
                              onClick={() => openModal(2, c.idcarrera, c.nombrecarrera, c.descripcion)}
                              className="bg-yellow-400 text-black px-3 py-1 rounded mr-2 hover:bg-yellow-300"
                            >
                              <i className="fa-solid fa-edit"></i>
                            </button>
                            <button
                              onClick={() => deleteCarrera(c.idcarrera, c.nombrecarrera)}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center p-4 text-gray-400">
                          No hay carreras registradas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md p-6 text-white relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{title}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white font-bold text-xl">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Nombre de la Carrera</label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Ej. Diseño de Modas"
                  value={nombrecarrera}
                  onChange={(e) => setNombrecarrera(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Descripción</label>
                <textarea
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Descripción de la carrera"
                  rows="3"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={validar}
                  className="px-4 py-2 rounded bg-yellow-400 text-black font-bold hover:bg-yellow-300"
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