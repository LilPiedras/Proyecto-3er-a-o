import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const CrudSeccion = () => {
  const [secciones, setSecciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const [idsecc, setIdsecc] = useState('');
  const [nomsecc, setNomsecc] = useState('');

  const [operation, setOperation] = useState(1);
  const [title, setTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cargarSecciones = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/seccion/');
      setSecciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 404) {
        setSecciones([]);
      } else {
        const detail = error.response?.data?.detail;
        show_alert(
          typeof detail === 'string' ? detail : 'Error al cargar secciones',
          'error'
        );
        setSecciones([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSecciones();
  }, []);

  const limpiarFormulario = () => {
    setIdsecc('');
    setNomsecc('');
  };

  const openModal = (op, item = null) => {
    limpiarFormulario();
    setOperation(op);

    if (op === 1) {
      setTitle('Registrar Sección');
    } else if (item) {
      setTitle('Editar Sección');
      setIdsecc(item.idsecc);
      setNomsecc(item.nomsecc || '');
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    limpiarFormulario();
  };

  const validar = () => {
    if (nomsecc.trim() === '') {
      show_alert('Escribe el nombre de la sección', 'warning');
      return;
    }

    const parametros = {
      nomsecc: nomsecc.trim(),
    };

    if (operation === 1) {
      enviarSolicitud('POST', parametros);
    } else {
      // El backend actual de sección solo tiene PATCH completo en algunos casos;
      // usamos PUT si existe, si no PATCH
      enviarSolicitud('PATCH', parametros, idsecc);
    }
  };

  const enviarSolicitud = async (metodo, parametros = {}, idPath = null) => {
    try {
      if (metodo === 'POST') {
        await api.post('/seccion/', parametros);
      } else if (metodo === 'PUT') {
        await api.put(`/seccion/${idPath}`, parametros);
      } else if (metodo === 'PATCH') {
        await api.patch(`/seccion/${idPath}`, parametros);
      } else if (metodo === 'DELETE') {
        await api.delete(`/seccion/${idPath}`);
      }

      const msg =
        metodo === 'DELETE'
          ? 'Sección eliminada correctamente'
          : metodo === 'POST'
            ? 'Sección registrada correctamente'
            : 'Sección actualizada correctamente';

      show_alert(msg, 'success');
      closeModal();
      await cargarSecciones();
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === 'string' ? detail : 'Error en la operación',
        'error'
      );
    }
  };

  const deleteSeccion = (item) => {
    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: `¿Seguro de eliminar la sección "${item.nomsecc}"?`,
      text: 'No se podrá dar marcha atrás',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        enviarSolicitud('DELETE', {}, item.idsecc);
      } else {
        show_alert('La sección no fue eliminada', 'info');
      }
    });
  };

  return (
    <div className="CRUD p-6 min-h-screen bg-black text-white">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4 text-yellow-400">
          Secciones
        </h2>

        <div className="row mt-3">
          <div className="col-md-4 offset-md-4">
            <div className="d-grid mx-auto text-center">
              <button
                className="bg-yellow-400 text-black font-bold px-6 py-2 rounded-lg hover:bg-yellow-300 transition"
                onClick={() => openModal(1)}
              >
                <i className="fa-solid fa-circle-plus"></i> Añadir
              </button>
            </div>
          </div>
        </div>

        <div className="row mt-6">
          <div className="col-12 col-lg-10 offset-lg-1">
            <div className="table-responsive">
              {loading ? (
                <p className="text-center text-gray-400 p-4">Cargando secciones...</p>
              ) : (
                <table className="table table-dark table-bordered w-full text-left">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>NOMBRE SECCIÓN</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {secciones.length > 0 ? (
                      secciones.map((s, index) => (
                        <tr key={s.idsecc || index}>
                          <td>{index + 1}</td>
                          <td>{s.nomsecc}</td>
                          <td>
                            <button
                              onClick={() => openModal(2, s)}
                              className="bg-yellow-400 text-black px-3 py-1 rounded mr-2 hover:bg-yellow-300"
                            >
                              <i className="fa-solid fa-edit"></i>
                            </button>
                            <button
                              onClick={() => deleteSeccion(s)}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md p-6 text-white relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{title}</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Nombre de la sección</label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Ej. A, B, 1A..."
                  value={nomsecc}
                  onChange={(e) => setNomsecc(e.target.value)}
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

export default CrudSeccion;