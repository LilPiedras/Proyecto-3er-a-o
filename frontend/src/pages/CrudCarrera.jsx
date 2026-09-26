import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const CrudCarrera = () => {
  const [carrera, setCarrera] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados del formulario
  const [idcarrera, setIdcarrera] = useState('');
  const [nombrecarrera, setNombrecarrera] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [operation, setOperation] = useState(1);
  const [title, setTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Función robusta para obtener dinámicamente el ID
  const obtenerIdcarrera = (itemCarrera) => {
    if (!itemCarrera) return null;
    
    if (itemCarrera.idcarrera !== undefined) return itemCarrera.idcarrera;
    if (itemCarrera.id !== undefined) return itemCarrera.id;
    if (itemCarrera.id_carrera !== undefined) return itemCarrera.id_carrera;
    if (itemCarrera.carrera_id !== undefined) return itemCarrera.carrera_id;

    for (const key in itemCarrera) {
      if (key.toLowerCase().includes('id') && itemCarrera[key] !== null) {
        return itemCarrera[key];
      }
    }
    
    return null;
  };

  const cargarCarrera = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/carrera/');
      setCarrera(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar las carreras:', error);
      if (error.response?.status === 404) {
        setCarrera([]);
      } else {
        const detail = error.response?.data?.detail;
        show_alert(
          typeof detail === 'string' ? detail : 'Error al cargar las carreras',
          'error'
        );
        setCarrera([]);
      }
    } finally {
      setLoading(false);
    }
  }; 

  useEffect(() => {
    cargarCarrera();
  }, []);

  const limpiarFormulario = () => {
    setIdcarrera('');
    setNombrecarrera('');
    setDescripcion('');
  };

  const openModal = (op, itemCarrera = null) => {
    limpiarFormulario();
    setOperation(op);

    if (op === 1) {
      setTitle('Registrar Carrera');
      setIsModalOpen(true);
    } else if (itemCarrera) {
      setTitle('Editar Carrera');
      
      console.log("Objeto carrera completo recibido:", itemCarrera);
      const idEncontrado = obtenerIdcarrera(itemCarrera);
      console.log("ID resuelto por la función:", idEncontrado);

      if (!idEncontrado) {
        show_alert('Error interno: No se pudo identificar el ID de la carrera.', 'error');
        return; 
      }

      setIdcarrera(idEncontrado);
      setNombrecarrera(itemCarrera.nombrecarrera || '');
      setDescripcion(itemCarrera.descripcion || '');
      
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    limpiarFormulario();
  };

  const validar = (e) => {
    if (e) e.preventDefault();

    if (nombrecarrera.trim() === '') {
      show_alert('Escribe el nombre de la carrera', 'warning');
      return;
    }
    if (descripcion.trim() === '') {
      show_alert('Escribe la descripción de la carrera', 'warning');
      return;
    }

    const parametros = {
      nombrecarrera: nombrecarrera.trim(),
      descripcion: descripcion.trim(),
    };

    if (operation === 1) {
      enviarSolicitud('POST', parametros);
    } else {
      enviarSolicitud('PUT', parametros, idcarrera);
    }
  };

  const enviarSolicitud = async (metodo, parametros = {}, idPath = null) => {
    try {
      if (metodo === 'POST') {
        await api.post('/carrera/', parametros);
      } else if (metodo === 'PUT') {
        await api.put(`/carrera/${idPath}`, parametros); 
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
      await cargarCarrera();
    } catch (error) {
      console.error('Error HTTP:', error);
      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        const primerError = detail[0];
        const campo = primerError?.loc?.join(' -> ') || 'Campo';
        const msgError = primerError?.msg || 'Error de validación';
        show_alert(`${campo}: ${msgError}`, 'error');
      } else if (typeof detail === 'string') {
        show_alert(detail, 'error');
      } else {
        show_alert('Error al realizar la operación', 'error');
      }
    }
  };

  const deleteCarrera = (itemCarrera) => {
    const idParaEliminar = obtenerIdcarrera(itemCarrera);

    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: `¿Seguro de eliminar la carrera "${itemCarrera.nombrecarrera}"?`,
      text: 'No se podrá dar marcha atrás',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        enviarSolicitud('DELETE', {}, idParaEliminar);
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
                type="button"
                className="bg-yellow-400 text-black font-bold px-6 py-2 rounded-lg hover:bg-yellow-300 transition"
                onClick={() => openModal(1)}
              >
                <i className="fa-solid fa-circle-plus mr-2"></i> Añadir
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
                      <th>CARRERA</th>
                      <th>DESCRIPCIÓN</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrera.length > 0 ? (
                      carrera.map((c, index) => (
                        <tr key={obtenerIdcarrera(c) || index}>
                          <td>{c.nombrecarrera}</td>
                          <td>{c.descripcion}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => openModal(2, c)}
                              className="bg-yellow-400 text-black px-3 py-1 rounded mr-2 hover:bg-yellow-300"
                            >
                              <i className="fa-solid fa-edit"></i>
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteCarrera(c)}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center p-4 text-gray-400">
                          No hay datos para mostrar
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
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-white font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={validar} className="space-y-4">
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
                <input
                  type="text"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Ej. Carrera técnica de confección y patronaje"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-yellow-400 text-black font-bold hover:bg-yellow-300"
                >
                  {operation === 1 ? 'Guardar' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrudCarrera;