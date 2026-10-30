import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const CrudEstudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [nacionalidad, setNacionalidad] = useState('V');
  const [ciestuNum, setCiestuNum] = useState('');
  const [nombreestu, setNombreestu] = useState('');
  const [apelliestu, setApelliestu] = useState('');
  const [teleestu, setTeleestu] = useState('');
  const [correoestu, setCorreoestu] = useState('');
  const [operation, setOperation] = useState(1);
  const [title, setTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ciestuOriginal, setCiestuOriginal] = useState('');

  const cargarEstudiantes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/estudiantes/');
      setEstudiantes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      // 404 = lista vacía en tu backend
      if (error.response?.status === 404) {
        setEstudiantes([]);
      } else {
        const detail = error.response?.data?.detail;
        show_alert(
          typeof detail === 'string' ? detail : 'Error al cargar estudiantes',
          'error'
        );
        setEstudiantes([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstudiantes();
  }, []);

  const limpiarFormulario = () => {
    setNacionalidad('V');
    setCiestuNum('');
    setNombreestu('');
    setApelliestu('');
    setTeleestu('');
    setCorreoestu('');
    setCiestuOriginal('');
  };

  const openModal = (
    op,
    cedulaCompleta = '',
    nombre = '',
    apellido = '',
    telefono = '',
    correo = ''
  ) => {
    limpiarFormulario();
    setOperation(op);

    if (op === 1) {
      setTitle('Registrar Estudiante');
    } else {
      setTitle('Editar Estudiante');
      setCiestuOriginal(cedulaCompleta);

      if (cedulaCompleta.includes('-')) {
        const [nac, num] = cedulaCompleta.split('-');
        setNacionalidad(nac || 'V');
        setCiestuNum(num || '');
      } else {
        setCiestuNum(cedulaCompleta);
      }

      setNombreestu(nombre || '');
      setApelliestu(apellido || '');
      setTeleestu(telefono || '');
      setCorreoestu(correo || '');
    }

    setIsModalOpen(true);
  };

  const validar = () => {
    const ciestu = `${nacionalidad}-${ciestuNum.trim()}`;

    if (ciestuNum.trim() === '') {
      show_alert('Ingrese el número de cédula', 'warning');
      return;
    }
    if (nombreestu.trim() === '') {
      show_alert('Escribe el nombre del estudiante', 'warning');
      return;
    }
    if (apelliestu.trim() === '') {
      show_alert('Escribe el apellido del estudiante', 'warning');
      return;
    }
    if (teleestu.trim() !== '' && isNaN(Number(teleestu))) {
      show_alert('Escribe un número telefónico válido', 'warning');
      return;
    }
    if (correoestu.trim() === '') {
      show_alert('Escribe una dirección de correo válida', 'warning');
      return;
    }

    const parametros = {
      ciestu,
      nombreestu: nombreestu.trim(),
      apelliestu: apelliestu.trim(),
      teleestu: teleestu.trim() || null,
      correoestu: correoestu.trim() || null,
    };

    if (operation === 1) {
      enviarSolicitud('POST', parametros);
    } else {
      const { ciestu: _omit, ...bodyUpdate } = parametros;
      enviarSolicitud('PUT', bodyUpdate, ciestuOriginal || ciestu);
    }
  };

  const enviarSolicitud = async (metodo, parametros, ciestuPath = null) => {
    try {
      let respuesta;

      if (metodo === 'POST') {
        respuesta = await api.post('/estudiantes/', parametros);
      } else if (metodo === 'PUT') {
        respuesta = await api.put(`/estudiantes/${ciestuPath}`, parametros);
      } else if (metodo === 'DELETE') {
        respuesta = await api.delete(`/estudiantes/${parametros.ciestu}`);
      }

      const msg =
        metodo === 'DELETE'
          ? 'Estudiante eliminado correctamente'
          : metodo === 'POST'
            ? 'Estudiante registrado correctamente'
            : 'Estudiante actualizado correctamente';

      show_alert(msg, 'success');
      setIsModalOpen(false);
      limpiarFormulario();
      await cargarEstudiantes();
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === 'string' ? detail : 'Error en la operación',
        'error'
      );
    }
  };

  const deleteEstudiante = (ciestu, nombre) => {
    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: `¿Seguro de eliminar al estudiante "${nombre}"?`,
      text: 'No se podrá dar marcha atrás',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        enviarSolicitud('DELETE', { ciestu });
      } else {
        show_alert('El estudiante no fue eliminado', 'info');
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
                <p className="text-center text-gray-400 p-4">Cargando estudiantes...</p>
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
                    {estudiantes.length > 0 ? (
                      estudiantes.map((e, index) => (
                        <tr key={e.ciestu || index}>
                          <td>{index + 1}</td>
                          <td>{e.ciestu}</td>
                          <td>{e.nombreestu}</td>
                          <td>{e.apelliestu}</td>
                          <td>{e.teleestu || '—'}</td>
                          <td>{e.correoestu || '—'}</td>
                          <td>
                            <button
                              onClick={() =>
                                openModal(
                                  2,
                                  e.ciestu,
                                  e.nombreestu,
                                  e.apelliestu,
                                  e.teleestu,
                                  e.correoestu
                                )
                              }
                              className="bg-yellow-400 text-black px-3 py-1 rounded mr-2 hover:bg-yellow-300"
                            >
                              <i className="fa-solid fa-edit"></i>
                            </button>
                            <button
                              onClick={() => deleteEstudiante(e.ciestu, e.nombreestu)}
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
                    value={ciestuNum}
                    disabled={operation === 2}
                    onChange={(e) => setCiestuNum(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Nombre</label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Nombre"
                  value={nombreestu}
                  onChange={(e) => setNombreestu(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Apellido</label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Apellido"
                  value={apelliestu}
                  onChange={(e) => setApelliestu(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Teléfono</label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Teléfono"
                  value={teleestu}
                  onChange={(e) => setTeleestu(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Correo electrónico</label>
                <input
                  type="email"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="correo@ejemplo.com"
                  value={correoestu}
                  onChange={(e) => setCorreoestu(e.target.value)}
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

export default CrudEstudiantes;