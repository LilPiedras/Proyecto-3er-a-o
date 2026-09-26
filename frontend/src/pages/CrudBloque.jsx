import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const CrudBloque = () => {
  const [bloques, setBloques] = useState([]);
  const [loading, setLoading] = useState(true);

  const [idbloque, setIdbloque] = useState('');
  const [horainicio, setHorainicio] = useState('');
  const [horafin, setHorafin] = useState('');

  const [operation, setOperation] = useState(1);
  const [title, setTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cargarBloques = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/bloque/');
      setBloques(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 404) {
        setBloques([]);
      } else {
        const detail = error.response?.data?.detail;
        show_alert(
          typeof detail === 'string' ? detail : 'Error al cargar bloques',
          'error'
        );
        setBloques([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarBloques();
  }, []);

  const limpiarFormulario = () => {
    setIdbloque('');
    setHorainicio('');
    setHorafin('');
  };

  const openModal = (op, item = null) => {
    limpiarFormulario();
    setOperation(op);

    if (op === 1) {
      setTitle('Registrar Bloque');
    } else if (item) {
      setTitle('Editar Bloque');
      setIdbloque(item.idbloque);
      setHorainicio(item.horainicio || '');
      setHorafin(item.horafin || '');
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    limpiarFormulario();
  };

  const validar = () => {
    if (horainicio.trim() === '') {
      show_alert('Ingrese la hora de inicio', 'warning');
      return;
    }
    if (horafin.trim() === '') {
      show_alert('Ingrese la hora de fin', 'warning');
      return;
    }

    const parametros = {
      horainicio: horainicio.trim(),
      horafin: horafin.trim(),
    };

    if (operation === 1) {
      enviarSolicitud('POST', parametros);
    } else {
      enviarSolicitud('PUT', parametros, idbloque);
    }
  };

  const enviarSolicitud = async (metodo, parametros = {}, idPath = null) => {
    try {
      if (metodo === 'POST') {
        await api.post('/bloque/', parametros);
      } else if (metodo === 'PUT') {
        await api.put(`/bloque/${idPath}`, parametros);
      } else if (metodo === 'DELETE') {
        await api.delete(`/bloque/${idPath}`);
      }

      const msg =
        metodo === 'DELETE'
          ? 'Bloque eliminado correctamente'
          : metodo === 'POST'
            ? 'Bloque registrado correctamente'
            : 'Bloque actualizado correctamente';

      show_alert(msg, 'success');
      closeModal();
      await cargarBloques();
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === 'string' ? detail : 'Error en la operación',
        'error'
      );
    }
  };

  const deleteBloque = (item) => {
    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: `¿Seguro de eliminar el bloque ${item.horainicio} - ${item.horafin}?`,
      text: 'No se podrá dar marcha atrás',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        enviarSolicitud('DELETE', {}, item.idbloque);
      } else {
        show_alert('El bloque no fue eliminado', 'info');
      }
    });
  };

  return (
    <div className="CRUD p-6 min-h-screen bg-black text-white">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4 text-yellow-400">
          Bloques Horarios
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
                <p className="text-center text-gray-400 p-4">Cargando bloques...</p>
              ) : (
                <table className="table table-dark table-bordered w-full text-left">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>HORA INICIO</th>
                      <th>HORA FIN</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bloques.length > 0 ? (
                      bloques.map((b, index) => (
                        <tr key={b.idbloque || index}>
                          <td>{index + 1}</td>
                          <td>{b.horainicio}</td>
                          <td>{b.horafin}</td>
                          <td>
                            <button
                              onClick={() => openModal(2, b)}
                              className="bg-yellow-400 text-black px-3 py-1 rounded mr-2 hover:bg-yellow-300"
                            >
                              <i className="fa-solid fa-edit"></i>
                            </button>
                            <button
                              onClick={() => deleteBloque(b)}
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
                <label className="block text-sm mb-1">Hora inicio</label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Ej. 08:00"
                  value={horainicio}
                  onChange={(e) => setHorainicio(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Hora fin</label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Ej. 10:00"
                  value={horafin}
                  onChange={(e) => setHorafin(e.target.value)}
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

export default CrudBloque;