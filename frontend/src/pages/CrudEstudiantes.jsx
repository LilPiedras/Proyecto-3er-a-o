import React, { useEffect, useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const CrudEstudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

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

  const estudiantesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return estudiantes;
    return estudiantes.filter((e) => {
      const nombre = `${e.nombreestu || ''} ${e.apelliestu || ''}`.toLowerCase();
      const ci = String(e.ciestu || '').toLowerCase();
      const mail = String(e.correoestu || '').toLowerCase();
      const tel = String(e.teleestu || '').toLowerCase();
      return (
        nombre.includes(q) ||
        ci.includes(q) ||
        mail.includes(q) ||
        tel.includes(q)
      );
    });
  }, [estudiantes, busqueda]);

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
      if (metodo === 'POST') {
        await api.post('/estudiantes/', parametros);
      } else if (metodo === 'PUT') {
        await api.put(`/estudiantes/${ciestuPath}`, parametros);
      } else if (metodo === 'DELETE') {
        await api.delete(`/estudiantes/${parametros.ciestu}`);
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
      confirmButtonColor: '#ef4444',
    }).then((result) => {
      if (result.isConfirmed) {
        enviarSolicitud('DELETE', { ciestu });
      } else {
        show_alert('El estudiante no fue eliminado', 'info');
      }
    });
  };

  const inicial = (e) => {
    const n = (e.nombreestu || '?').trim();
    return n.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p className="text-xl font-bold text-yellow-400">
          Cargando estudiantes...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-black text-white pt-24">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-yellow-400 mb-2 text-center">
          Gestión de Estudiantes
        </h2>
        <p className="text-center text-gray-400 text-sm mb-8">
          Alumnos registrados en el sistema
        </p>

        {/* Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
            <p className="text-xs uppercase text-gray-400 mb-1">
              Total estudiantes
            </p>
            <p className="text-2xl font-bold text-yellow-400">
              {estudiantes.length}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
            <p className="text-xs uppercase text-gray-400 mb-1">
              Resultados filtro
            </p>
            <p className="text-2xl font-bold text-white">
              {estudiantesFiltrados.length}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg flex items-center justify-center">
            <button
              type="button"
              onClick={() => openModal(1)}
              className="w-full bg-yellow-400 text-black font-bold py-2.5 px-4 rounded-lg hover:bg-yellow-300 transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-circle-plus"></i>
              Añadir estudiante
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
              placeholder="Nombre, cédula, correo o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">
            Listado de estudiantes
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead className="bg-gray-800 border-b border-gray-700 text-yellow-400 text-xs uppercase">
                <tr>
                  <th className="p-3">Estudiante</th>
                  <th className="p-3">Cédula</th>
                  <th className="p-3">Contacto</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estudiantesFiltrados.length > 0 ? (
                  estudiantesFiltrados.map((e) => (
                    <tr
                      key={e.ciestu}
                      className="border-b border-gray-700 hover:bg-gray-800/80 transition"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400 font-bold shrink-0">
                            {inicial(e)}
                          </div>
                          <div>
                            <p className="font-semibold text-white leading-tight">
                              {e.nombreestu} {e.apelliestu}
                            </p>
                            <p className="text-xs text-gray-500">Estudiante</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-sm text-gray-300">
                        {e.ciestu}
                      </td>
                      <td className="p-3">
                        <p className="text-sm text-gray-200">
                          {e.correoestu || '—'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {e.teleestu || '—'}
                        </p>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            title="Editar"
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
                            className="bg-yellow-400 text-black px-3 py-1.5 rounded-lg hover:bg-yellow-300 transition"
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button
                            type="button"
                            title="Eliminar"
                            onClick={() =>
                              deleteEstudiante(e.ciestu, e.nombreestu)
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
                    <td colSpan="4" className="text-center p-10 text-gray-500">
                      {busqueda
                        ? 'No hay estudiantes que coincidan con la búsqueda.'
                        : 'No hay estudiantes registrados.'}
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
                  Completa los datos del estudiante
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white font-bold text-xl w-8 h-8 flex items-center justify-center rounded hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Cédula
                </label>
                <div className="flex gap-2">
                  <select
                    className="bg-gray-800 border border-gray-600 rounded-lg p-2.5 text-white font-bold cursor-pointer disabled:opacity-50 outline-none"
                    value={nacionalidad}
                    disabled={operation === 2}
                    onChange={(e) => setNacionalidad(e.target.value)}
                  >
                    <option value="V">V</option>
                    <option value="E">E</option>
                  </select>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white disabled:opacity-50 outline-none focus:border-yellow-400"
                    placeholder="Ej. 31124567"
                    value={ciestuNum}
                    disabled={operation === 2}
                    onChange={(e) =>
                      setCiestuNum(e.target.value.replace(/\D/g, ''))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-yellow-400">
                    Nombre
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                    placeholder="Nombre"
                    value={nombreestu}
                    onChange={(e) => setNombreestu(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-yellow-400">
                    Apellido
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                    placeholder="Apellido"
                    value={apelliestu}
                    onChange={(e) => setApelliestu(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Teléfono
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                  placeholder="Teléfono"
                  value={teleestu}
                  onChange={(e) =>
                    setTeleestu(e.target.value.replace(/\D/g, ''))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                  placeholder="correo@ejemplo.com"
                  value={correoestu}
                  onChange={(e) => setCorreoestu(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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

export default CrudEstudiantes;