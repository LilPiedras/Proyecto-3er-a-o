import React, { useEffect, useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const CrudDocentes = () => {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const [nacionalidad, setNacionalidad] = useState('V');
  const [ciempleadoNum, setCiempleadoNum] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [cargo, setCargo] = useState('');
  const [fechacontra, setFechacontra] = useState('');
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
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === 'string' ? detail : 'Error al cargar docentes',
        'error'
      );
      setDocentes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDocentes();
  }, []);

  const docentesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return docentes;
    return docentes.filter((d) => {
      const nombre = `${d.nombreempleado || d.nombre || ''} ${d.apellidoempleado || d.apellido || ''}`.toLowerCase();
      const ci = String(d.ciempleado || '').toLowerCase();
      const mail = String(d.correoempleado || d.correo || '').toLowerCase();
      const car = String(d.cargo || '').toLowerCase();
      return (
        nombre.includes(q) ||
        ci.includes(q) ||
        mail.includes(q) ||
        car.includes(q)
      );
    });
  }, [docentes, busqueda]);

  const limpiarFormulario = () => {
    setNacionalidad('V');
    setCiempleadoNum('');
    setNombre('');
    setApellido('');
    setTelefono('');
    setCorreo('');
    setCargo('');
    setFechacontra('');
    setCiempleadoOriginal('');
  };

  const openModal = (
    op,
    cedulaCompleta = '',
    nom = '',
    ape = '',
    tel = '',
    mail = '',
    car = '',
    fecha = ''
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
      setCargo(car || '');
      setFechacontra(fecha ? String(fecha).split('T')[0] : '');
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
    if (cargo.trim() === '') {
      show_alert('Escribe el cargo del docente', 'warning');
      return;
    }
    if (!fechacontra) {
      show_alert('Selecciona la fecha de contratación', 'warning');
      return;
    }

    const parametros = {
      ciempleado,
      nombreempleado: nombre.trim(),
      apellidoempleado: apellido.trim(),
      telefempleado: telefono.trim() || null,
      correoempleado: correo.trim() || null,
      cargo: cargo.trim(),
      fechacontra: fechacontra,
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
      console.error('Error detallado del backend:', error.response?.data);

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

  const deleteDocente = (ciempleado, nom) => {
    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: `¿Seguro de eliminar al docente "${nom}"?`,
      text: 'No se podrá dar marcha atrás',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    }).then((result) => {
      if (result.isConfirmed) {
        enviarSolicitud('DELETE', { ciempleado });
      } else {
        show_alert('El docente no fue eliminado', 'info');
      }
    });
  };

  const inicial = (d) => {
    const n = (d.nombreempleado || d.nombre || '?').trim();
    return n.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p className="text-xl font-bold text-yellow-400">Cargando docentes...</p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-black text-white pt-24">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-yellow-400 mb-2 text-center">
          Gestión de Docentes
        </h2>
        <p className="text-center text-gray-400 text-sm mb-8">
          Personal académico registrado en el sistema
        </p>

        {/* Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
            <p className="text-xs uppercase text-gray-400 mb-1">Total docentes</p>
            <p className="text-2xl font-bold text-yellow-400">{docentes.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
            <p className="text-xs uppercase text-gray-400 mb-1">Resultados filtro</p>
            <p className="text-2xl font-bold text-white">{docentesFiltrados.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg flex items-center justify-center">
            <button
              type="button"
              onClick={() => openModal(1)}
              className="w-full bg-yellow-400 text-black font-bold py-2.5 px-4 rounded-lg hover:bg-yellow-300 transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-circle-plus"></i>
              Añadir docente
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
              placeholder="Nombre, cédula, correo o cargo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Tabla / lista */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">Listado de docentes</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead className="bg-gray-800 border-b border-gray-700 text-yellow-400 text-xs uppercase">
                <tr>
                  <th className="p-3">Docente</th>
                  <th className="p-3">Cédula</th>
                  <th className="p-3">Contacto</th>
                  <th className="p-3">Cargo</th>
                  <th className="p-3">Contratación</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {docentesFiltrados.length > 0 ? (
                  docentesFiltrados.map((d) => {
                    const nom = d.nombreempleado || d.nombre || '';
                    const ape = d.apellidoempleado || d.apellido || '';
                    const tel = d.telefempleado || d.telefono || '—';
                    const mail = d.correoempleado || d.correo || '—';
                    const fecha = d.fechacontra
                      ? String(d.fechacontra).split('T')[0]
                      : '—';

                    return (
                      <tr
                        key={d.ciempleado}
                        className="border-b border-gray-700 hover:bg-gray-800/80 transition"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400 font-bold shrink-0">
                              {inicial(d)}
                            </div>
                            <div>
                              <p className="font-semibold text-white leading-tight">
                                {nom} {ape}
                              </p>
                              <p className="text-xs text-gray-500">Personal</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-sm text-gray-300">
                          {d.ciempleado}
                        </td>
                        <td className="p-3">
                          <p className="text-sm text-gray-200">{mail}</p>
                          <p className="text-xs text-gray-500">{tel}</p>
                        </td>
                        <td className="p-3">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-800 border border-gray-600 text-yellow-300">
                            {d.cargo || '—'}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-300">{fecha}</td>
                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              title="Editar"
                              onClick={() =>
                                openModal(
                                  2,
                                  d.ciempleado,
                                  nom,
                                  ape,
                                  d.telefempleado || d.telefono,
                                  d.correoempleado || d.correo,
                                  d.cargo,
                                  d.fechacontra
                                )
                              }
                              className="bg-yellow-400 text-black px-3 py-1.5 rounded-lg hover:bg-yellow-300 transition"
                            >
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            <button
                              type="button"
                              title="Eliminar"
                              onClick={() => deleteDocente(d.ciempleado, nom)}
                              className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-500 transition"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center p-10 text-gray-500">
                      {busqueda
                        ? 'No hay docentes que coincidan con la búsqueda.'
                        : 'No hay docentes registrados.'}
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
                  Completa los datos del personal
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
                    value={ciempleadoNum}
                    disabled={operation === 2}
                    onChange={(e) =>
                      setCiempleadoNum(e.target.value.replace(/\D/g, ''))
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
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
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
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-yellow-400">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                    placeholder="Teléfono"
                    value={telefono}
                    onChange={(e) =>
                      setTelefono(e.target.value.replace(/\D/g, ''))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-yellow-400">
                    Cargo
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                    placeholder="Ej. Docente"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                  placeholder="correo@ejemplo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Fecha de contratación
                </label>
                <input
                  type="date"
                  className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                  value={fechacontra}
                  onChange={(e) => setFechacontra(e.target.value)}
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

export default CrudDocentes;