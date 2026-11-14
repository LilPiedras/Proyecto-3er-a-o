import React, { useEffect, useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const obtenerMensajeError = (error, accion) => {
  const estado = error.response?.status;
  const detail = error.response?.data?.detail;

  if (estado === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.';
  if (estado === 403) return 'No tienes permiso para gestionar cursos. Esta acción está reservada al rol 1.';
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const campo = item?.loc?.filter((parte) => parte !== 'body').join(' → ');
        return `${campo || 'Datos'}: ${item?.msg || 'Dato no válido'}`;
      })
      .join('\n');
  }
  if (typeof detail === 'string' && detail !== 'Internal Server Error') return detail;

  const serverMessage = error.response?.data?.error_detalle
    || error.response?.data?.message
    || error.response?.data?.error;
  if (typeof serverMessage === 'string') return serverMessage;
  if (!error.response) return 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.';
  if (estado >= 500) return `El servidor no pudo ${accion}. Inténtalo de nuevo; si continúa, comparte el código HTTP ${estado}.`;
  return `No se pudo ${accion} (HTTP ${estado}).`;
};

const solicitarCursos = async () => {
  const { data } = await api.get('/curso/');
  return Array.isArray(data) ? data : [];
};

const solicitarProfesores = async () => {
  const { data } = await api.get('/empleado/');
  const lista = Array.isArray(data) ? data : [];
  return lista.filter((empleado) => /docente|profesor/i.test(empleado.cargo || ''));
};

const CrudCursos = () => {
  const [cursos, setCursos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [cargandoProfesores, setCargandoProfesores] = useState(
    () => Number(localStorage.getItem('idrol')) === 1,
  );
  const [errorProfesores, setErrorProfesores] = useState('');
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const esAdministrador = Number(localStorage.getItem('idrol')) === 1;

  const [idcurso, setIdcurso] = useState('');
  const [nomcurso, setNomcurso] = useState('');
  const [preciocurso, setPreciocurso] = useState('');
  const [nivelcur, setNivelcur] = useState('');
  const [docenasig, setDocenasig] = useState('');

  const [operation, setOperation] = useState(1);
  const [title, setTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const obtenerIdCurso = (curso) => {
    if (!curso) return null;

    if (curso.idcurso !== undefined) return curso.idcurso;
    if (curso.id !== undefined) return curso.id;
    if (curso.id_curso !== undefined) return curso.id_curso;
    if (curso.curso_id !== undefined) return curso.curso_id;

    for (const key in curso) {
      if (key.toLowerCase().includes('id') && curso[key] !== null) {
        return curso[key];
      }
    }

    return null;
  };

  const formatearPrecio = (valor) =>
    `$${new Intl.NumberFormat('es-MX').format(valor || 0)}`;

  const cargarCursos = async () => {
    try {
      setCursos(await solicitarCursos());
    } catch (error) {
      console.error('Error al cargar cursos:', error);
      if (error.response?.status === 404) {
        setCursos([]);
      } else {
        const detail = error.response?.data?.detail;
        show_alert(
          typeof detail === 'string' ? detail : 'Error al cargar cursos',
          'error'
        );
        setCursos([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    solicitarCursos()
      .then((data) => {
        if (active) setCursos(data);
      })
      .catch((error) => {
        if (!active) return;
        console.error('Error al cargar cursos:', error);
        if (error.response?.status === 404) {
          setCursos([]);
        } else {
          show_alert(obtenerMensajeError(error, 'cargar los cursos'), 'error');
          setCursos([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    if (esAdministrador) {
      solicitarProfesores()
        .then((data) => {
          if (active) setProfesores(data);
        })
        .catch((error) => {
          if (!active) return;
          if (error.response?.status === 404) {
            setProfesores([]);
            return;
          }
          const mensaje = obtenerMensajeError(error, 'cargar la lista de profesores');
          setErrorProfesores(mensaje);
          show_alert(mensaje, 'error');
        })
        .finally(() => {
          if (active) setCargandoProfesores(false);
        });
    }

    return () => {
      active = false;
    };
  }, [esAdministrador]);

  const cursosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return cursos;
    return cursos.filter((c) => {
      const nombre = String(c.nomcurso || c.nombrecurso || '').toLowerCase();
      const nivel = String(c.nivelcur || '').toLowerCase();
      const doc = String(c.docenasig || '').toLowerCase();
      const precio = String(c.preciocurso ?? '');
      return (
        nombre.includes(q) ||
        nivel.includes(q) ||
        doc.includes(q) ||
        precio.includes(q)
      );
    });
  }, [cursos, busqueda]);

  const limpiarFormulario = () => {
    setIdcurso('');
    setNomcurso('');
    setPreciocurso('');
    setNivelcur('');
    setDocenasig('');
  };

  const openModal = (op, curso = null) => {
    limpiarFormulario();
    setOperation(op);

    if (op === 1) {
      setTitle('Registrar Curso');
      setIsModalOpen(true);
    } else if (curso) {
      setTitle('Editar Curso');

      const idEncontrado = obtenerIdCurso(curso);
      if (!idEncontrado) {
        show_alert(
          'Error interno: No se pudo identificar el ID del curso.',
          'error'
        );
        return;
      }

      setIdcurso(idEncontrado);
      setNomcurso(curso.nomcurso || curso.nombrecurso || '');
      setPreciocurso(
        curso.preciocurso !== undefined ? String(curso.preciocurso) : ''
      );
      setNivelcur(curso.nivelcur || '');
      setDocenasig(curso.docenasig || '');
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    limpiarFormulario();
  };

  const validar = (e) => {
    if (e) e.preventDefault();

    if (nomcurso.trim() === '') {
      show_alert('Escribe el nombre del curso', 'warning');
      return;
    }
    if (preciocurso === '' || isNaN(Number(preciocurso))) {
      show_alert('Escribe un precio válido para el curso', 'warning');
      return;
    }
    if (nivelcur.trim() === '') {
      show_alert('Escribe el nivel del curso', 'warning');
      return;
    }

    const parametros = {
      nomcurso: nomcurso.trim(),
      preciocurso: parseInt(preciocurso, 10),
      nivelcur: nivelcur.trim(),
      docenasig: docenasig.trim() || null,
    };

    if (operation === 1) {
      enviarSolicitud('POST', parametros);
    } else {
      enviarSolicitud('PUT', parametros, idcurso);
    }
  };

  const enviarSolicitud = async (metodo, parametros = {}, idPath = null) => {
    if (!esAdministrador) {
      show_alert('No tienes permiso para gestionar cursos. Esta acción está reservada al rol 1.', 'warning');
      return;
    }

    try {
      if (metodo === 'POST') {
        await api.post('/curso/', parametros);
      } else if (metodo === 'PUT') {
        await api.put(`/curso/${idPath}`, parametros);
      } else if (metodo === 'DELETE') {
        await api.delete(`/curso/${idPath}`);
      }

      const msg =
        metodo === 'DELETE'
          ? 'Curso eliminado correctamente'
          : metodo === 'POST'
            ? 'Curso registrado correctamente'
            : 'Curso actualizado correctamente';

      show_alert(msg, 'success');
      closeModal();
      setLoading(true);
      await cargarCursos();
    } catch (error) {
      console.error('Error HTTP:', error);
      const accion = metodo === 'POST' ? 'registrar el curso' : metodo === 'PUT' ? 'actualizar el curso' : 'eliminar el curso';
      show_alert(obtenerMensajeError(error, accion), 'error');
    }
  };

  const deleteCurso = (curso) => {
    const idParaEliminar = obtenerIdCurso(curso);
    const MySwal = withReactContent(Swal);

    MySwal.fire({
      title: `¿Seguro de eliminar el curso "${curso.nomcurso}"?`,
      text: 'No se podrá dar marcha atrás',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    }).then((result) => {
      if (result.isConfirmed) {
        enviarSolicitud('DELETE', {}, idParaEliminar);
      } else {
        show_alert('El curso no fue eliminado', 'info');
      }
    });
  };

  const inicial = (c) => {
    const n = (c.nomcurso || c.nombrecurso || '?').trim();
    return n.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p className="text-xl font-bold text-yellow-400">Cargando cursos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-black text-white pt-24">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-yellow-400 mb-2 text-center">
          Gestión de Cursos
        </h2>
        <p className="text-center text-gray-400 text-sm mb-8">
          Catálogo académico de cursos disponibles
        </p>

        {/* Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
            <p className="text-xs uppercase text-gray-400 mb-1">Total cursos</p>
            <p className="text-2xl font-bold text-yellow-400">{cursos.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
            <p className="text-xs uppercase text-gray-400 mb-1">
              Resultados filtro
            </p>
            <p className="text-2xl font-bold text-white">
              {cursosFiltrados.length}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg flex items-center justify-center">
            {esAdministrador ? (
              <button
                type="button"
                onClick={() => openModal(1)}
                className="w-full bg-yellow-400 text-black font-bold py-2.5 px-4 rounded-lg hover:bg-yellow-300 transition flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-circle-plus"></i>
                Añadir curso
              </button>
            ) : (
              <p className="text-center text-sm text-gray-400">
                Solo el rol 1 puede registrar o modificar cursos.
              </p>
            )}
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
              placeholder="Nombre, nivel, precio o cédula docente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">Listado de cursos</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead className="bg-gray-800 border-b border-gray-700 text-yellow-400 text-xs uppercase">
                <tr>
                  <th className="p-3">Curso</th>
                  <th className="p-3">Nivel</th>
                  <th className="p-3">Precio</th>
                  <th className="p-3">Docente</th>
                  {esAdministrador && <th className="p-3 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {cursosFiltrados.length > 0 ? (
                  cursosFiltrados.map((c, index) => {
                    const id = obtenerIdCurso(c) || index;
                    const nombre = c.nomcurso || c.nombrecurso || '—';

                    return (
                      <tr
                        key={id}
                        className="border-b border-gray-700 hover:bg-gray-800/80 transition"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400 font-bold shrink-0">
                              {inicial(c)}
                            </div>
                            <div>
                              <p className="font-semibold text-white leading-tight">
                                {nombre}
                              </p>
                              <p className="text-xs text-gray-500">
                                ID: {obtenerIdCurso(c) ?? '—'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-800 border border-gray-600 text-yellow-300">
                            {c.nivelcur || '—'}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-green-400">
                          {formatearPrecio(c.preciocurso)}
                        </td>
                        <td className="p-3 font-mono text-sm text-gray-300">
                          {c.docenasig || '—'}
                        </td>
                        {esAdministrador && <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              title="Editar"
                              onClick={() => openModal(2, c)}
                              className="bg-yellow-400 text-black px-3 py-1.5 rounded-lg hover:bg-yellow-300 transition"
                            >
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            <button
                              type="button"
                              title="Eliminar"
                              onClick={() => deleteCurso(c)}
                              className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-500 transition"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </td>}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={esAdministrador ? 5 : 4} className="text-center p-10 text-gray-500">
                      {busqueda
                        ? 'No hay cursos que coincidan con la búsqueda.'
                        : 'No hay cursos registrados.'}
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
                  Completa los datos del curso
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

            <form onSubmit={validar} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Nombre del curso
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                  placeholder="Ej. Corte y Confección"
                  value={nomcurso}
                  onChange={(e) => setNomcurso(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-yellow-400">
                    Nivel
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                    placeholder="Básico / Intermedio / Avanzado"
                    value={nivelcur}
                    onChange={(e) => setNivelcur(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-yellow-400">
                    Precio
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                    placeholder="Ej. 50"
                    value={preciocurso}
                    onChange={(e) =>
                      setPreciocurso(e.target.value.replace(/\D/g, ''))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Profesor del curso{' '}
                  <span className="text-gray-500 font-normal">(opcional)</span>
                </label>
                <select
                  className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                  value={docenasig}
                  onChange={(e) => setDocenasig(e.target.value)}
                  disabled={cargandoProfesores}
                >
                  <option value="">
                    {cargandoProfesores ? 'Cargando profesores…' : 'Sin profesor asignado'}
                  </option>
                  {docenasig && !profesores.some((profesor) => profesor.ciempleado === docenasig) && (
                    <option value={docenasig}>Profesor actual ({docenasig})</option>
                  )}
                  {profesores.map((profesor) => (
                    <option key={profesor.ciempleado} value={profesor.ciempleado}>
                      {profesor.nombreempleado} {profesor.apellidoempleado} — {profesor.ciempleado}
                    </option>
                  ))}
                </select>
                {errorProfesores && (
                  <p role="alert" className="mt-2 text-sm text-red-300">
                    No se pudo cargar la lista: {errorProfesores}
                  </p>
                )}
                {!cargandoProfesores && !errorProfesores && profesores.length === 0 && (
                  <p className="mt-2 text-sm text-gray-400">
                    No hay profesores activos. Puedes registrar el curso sin asignarlo.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition flex items-center gap-2"
                >
                  <i className="fa-solid fa-xmark"></i> Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition flex items-center gap-2"
                >
                  <i className="fa-solid fa-save"></i>
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

export default CrudCursos;