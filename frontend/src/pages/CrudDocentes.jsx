import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const CrudDocentes = () => {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [nacionalidad, setNacionalidad] = useState('V');
  const [ciempleadoNum, setCiempleadoNum] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [operation, setOperation] = useState(1);
  const [title, setTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ciempleadoOriginal, setCiempleadoOriginal] = useState('');

  const cargarDocentes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/empleado/');
      setDocentes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 404) {
        setDocentes([]);
      } else {
        const detail = error.response?.data?.detail;
        show_alert(
          typeof detail === 'string' ? detail : 'Error al cargar docentes',
          'error'
        );
        setDocentes([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDocentes();
  }, []);

  const limpiarFormulario = () => {
    setNacionalidad('V');
    setCiempleadoNum('');
    setNombre('');
    setApellido('');
    setTelefono('');
    setCorreo('');
    setCiempleadoOriginal('');
  };

  const openModal = (
    op,
    cedulaCompleta = '',
    nom = '',
    ape = '',
    tel = '',
    mail = ''
  ) => {
    limpiarFormulario();
    setOperation(op);

    if (op === 1) {
      setTitle('Registrar Docente');
    } else {
      setTitle('Editar Docente');
      setCiempleadoOriginal(cedulaCompleta);

      if (cedulaCompleta.includes('-')) {
        const [nac, num] = cedulaCompleta.split('-');
        setNacionalidad(nac || 'V');
        setCiempleadoNum(num || '');
      } else {
        setCiempleadoNum(cedulaCompleta);
      }

      setNombre(nom || '');
      setApellido(ape || '');
      setTelefono(tel || '');
      setCorreo(mail || '');
    }

    setIsModalOpen(true);
  };

  const validar = () => {
    const ciempleado = `${nacionalidad}-${ciempleadoNum.trim()}`;

    if (ciempleadoNum.trim() === '') {
      show_alert('Ingrese el número de cédula', 'warning');
      return;
    }
    if (nombre.trim() === '') {
      show_alert('Escribe el nombre del docente', 'warning');
      return;
    }
    if (apellido.trim() === '') {
      show_alert('Escribe el apellido del docente', 'warning');
      return;
    }
    if (telefono.trim() !== '' && isNaN(Number(telefono))) {
      show_alert('Escribe un número telefónico válido', 'warning');
      return;
    }
    if (correo.trim() === '') {
      show_alert('Escribe una dirección de correo válida', 'warning');
      return;
    }

    const parametros = {
      ciempleado,
      nombreempleado: nombre.trim(),
      apellidoempleado: apellido.trim(),
      telefempleado: telefono.trim() || null,
      correoempleado: correo.trim() || null,
    };

    if (operation === 1) {
      enviarSolicitud('POST', parametros);
    } else {
      const { ciempleado: _omit, ...bodyUpdate } = parametros;
      enviarSolicitud('PUT', bodyUpdate, ciempleadoOriginal || ciempleado);
    }
  };

  const enviarSolicitud = async (metodo, parametros, ciempleadoPath = null) => {
    try {
      if (metodo === 'POST') {
        await api.post('/empleado/', parametros);
      } else if (metodo === 'PUT') {
        await api.put(`/empleado/${ciempleadoPath}`, parametros);
      } else if (metodo === 'DELETE') {
        await api.delete(`/empleado/${parametros.ciempleado}`);
      }

      const msg =
        metodo === 'DELETE'
          ? 'Docente eliminado correctamente'
          : metodo === 'POST'
            ? 'Docente registrado correctamente'
            : 'Docente actualizado correctamente';

      show_alert(msg, 'success');
      setIsModalOpen(false);
      limpiarFormulario();
      await cargarDocentes();
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === 'string' ? detail : 'Error en la operación',
        'error'
      );
    }
  };

  const deleteDocente = (ciempleado, nom) => {
    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: `¿Seguro de eliminar al docente "${nom}"?`,
      text: 'No se podrá dar marcha atrás',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        enviarSolicitud('DELETE', { ciempleado });
      } else {
        show_alert('El docente no fue eliminado', 'info');
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
                <i className="fa-solid fa-circle-plus"></i> Añadir
              </button>
            </div>
          </div>
        </div>

        <div className="row mt-6">
          <div className="col-12 col-lg-10 offset-lg-1">
            <div className="table-responsive">
              {loading ? (
                <p className="text-center text-gray-400 p-4">Cargando docentes...</p>
              ) : (
                <table className="table table-dark table-bordered w-full text-left">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>CÉDULA</th>
                      <th>NOMBRE</th>
                      <th>APELLIDO</th>
                      <th>TELÉFONO</th>
                      <th>CORREO ELECTRÓNICO</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docentes.length > 0 ? (
                      docentes.map((d, index) => (
                        <tr key={d.ciempleado || index}>
                          <td>{index + 1}</td>
                          <td>{d.ciempleado}</td>
                          <td>{d.nombreempleado || d.nombre}</td>
                          <td>{d.apellidoempleado || d.apellido}</td>
                          <td>{d.telefempleado || d.telefono || '—'}</td>
                          <td>{d.correoempleado || d.correo || '—'}</td>
                          <td>
                            <button
                              onClick={() =>
                                openModal(
                                  2,
                                  d.ciempleado,
                                  d.nombreempleado || d.nombre,
                                  d.apellidoempleado || d.apellido,
                                  d.telefempleado || d.telefono,
                                  d.correoempleado || d.correo
                                )
                              }
                              className="bg-yellow-400 text-black px-3 py-1 rounded mr-2 hover:bg-yellow-300"
                            >
                              <i className="fa-solid fa-edit"></i>
                            </button>
                            <button
                              onClick={() => deleteDocente(d.ciempleado, d.nombreempleado || d.nombre)}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center p-4 text-gray-400">
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
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Cédula</label>
                <div className="flex gap-2">
                  <select
                    className="bg-gray-800 border border-gray-700 rounded p-2 text-white font-bold cursor-pointer disabled:opacity-50"
                    value={nacionalidad}
                    disabled={operation === 2}
                    onChange={(e) => setNacionalidad(e.target.value)}
                  >
                    <option value="V">V</option>
                    <option value="E">E</option>
                  </select>
                  <input
                    type="text"
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white disabled:opacity-50"
                    placeholder="Ej. 31124567"
                    value={ciempleadoNum}
                    disabled={operation === 2}
                    onChange={(e) => setCiempleadoNum(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Nombre</label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Apellido</label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Teléfono</label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Teléfono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Correo electrónico</label>
                <input
                  type="email"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="correo@ejemplo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
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

export default CrudDocentes;