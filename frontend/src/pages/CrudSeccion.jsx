import React, { useEffect, useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const MySwal = withReactContent(Swal);

const CrudSeccion = () => {
  const [secciones, setSecciones] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [carrerasModulos, setCarrerasModulos] = useState([]);
  const [materiasModulos, setMateriasModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [sectionStudents, setSectionStudents] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [studentForm, setStudentForm] = useState({
    estudiante: '',
    idcarremo: '',
    horario: '',
  });

  const [idsecc, setIdsecc] = useState('');
  const [nomsecc, setNomsecc] = useState('');

  const [operation, setOperation] = useState(1);
  const [title, setTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const contarEstudiantes = (idsecc) =>
    ofertas.filter((o) => Number(o.idsecc) === Number(idsecc)).length;

  const cargarSecciones = async () => {
    try {
      setLoading(true);
      const [
        seccionesRes,
        ofertasRes,
        estudiantesRes,
        carrerasModulosRes,
        materiasModulosRes,
      ] = await Promise.all([
        api.get('/seccion/'),
        api.get('/Oferta/'),
        api.get('/estudiantes/'),
        api.get('/Carrera_Modulo/'),
        api.get('/modulo_materia/'),
      ]);

      setSecciones(Array.isArray(seccionesRes.data) ? seccionesRes.data : []);
      setOfertas(Array.isArray(ofertasRes.data) ? ofertasRes.data : []);
      setEstudiantes(
        Array.isArray(estudiantesRes.data) ? estudiantesRes.data : []
      );
      setCarrerasModulos(
        Array.isArray(carrerasModulosRes.data) ? carrerasModulosRes.data : []
      );
      setMateriasModulos(
        Array.isArray(materiasModulosRes.data) ? materiasModulosRes.data : []
      );
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === 'string'
          ? detail
          : 'Error al cargar secciones y estudiantes',
        'error'
      );
      setSecciones([]);
      setOfertas([]);
      setEstudiantes([]);
      setCarrerasModulos([]);
      setMateriasModulos([]);
    } finally {
      setLoading(false);
    }
  };

  const openStudentsModal = (seccion) => {
    setSelectedSection(seccion);
    const lista = ofertas
      .filter((oferta) => Number(oferta.idsecc) === Number(seccion.idsecc))
      .map((oferta) => {
        const estudiante = estudiantes.find(
          (item) => item.ciestu === oferta.estudiante
        );
        return {
          ...oferta,
          nombreCompleto: estudiante
            ? `${estudiante.nombreestu ?? ''} ${estudiante.apelliestu ?? ''}`.trim()
            : '(sin estudiante)',
          estudianteData: estudiante ?? null,
        };
      });

    setSectionStudents(lista);
    setStudentForm({
      estudiante: '',
      idcarremo: carrerasModulos[0]?.idcarremo ?? '',
      horario: '',
    });
    setIsStudentsModalOpen(true);
  };

  const closeStudentsModal = () => {
    setSelectedSection(null);
    setSectionStudents([]);
    setIsStudentsModalOpen(false);
    setStudentForm({ estudiante: '', idcarremo: '', horario: '' });
  };

  const eliminarEstudianteDeSeccion = async (oferta) => {
    try {
      await api.delete(`/Oferta/${oferta.idseccmo}`);
      show_alert('Estudiante eliminado de la sección', 'success');
      await cargarSecciones();
      if (selectedSection) {
        openStudentsModal(selectedSection);
      }
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === 'string'
          ? detail
          : 'No se pudo eliminar al estudiante de la sección',
        'error'
      );
    }
  };

  const guardarEstudianteEnSeccion = async () => {
    if (!selectedSection) {
      show_alert('Selecciona una sección primero', 'warning');
      return;
    }

    if (!studentForm.estudiante) {
      show_alert('Selecciona un estudiante', 'warning');
      return;
    }

    if (!studentForm.idcarremo) {
      show_alert('Selecciona la materia / enlace académico', 'warning');
      return;
    }

    const idcarremo = Number(studentForm.idcarremo);
    if (!Number.isInteger(idcarremo) || idcarremo <= 0) {
      show_alert(
        'La materia seleccionada no tiene un enlace académico válido',
        'warning'
      );
      return;
    }

    // Buscar la carrera a partir del idcarremo seleccionado
    const relacion = carrerasModulos.find(
      (cm) => Number(cm.idcarremo) === idcarremo
    );

    if (!relacion || !relacion.idcarrera) {
      show_alert(
        'No se pudo determinar la carrera de ese enlace académico',
        'warning'
      );
      return;
    }

    try {
      const payload = {
        idcarrera: Number(relacion.idcarrera), // ← ESTE era el que faltaba
        idcarremo,
        idsecc: Number(selectedSection.idsecc),
        estudiante: studentForm.estudiante,
        horario: studentForm.horario ? Number(studentForm.horario) : null,
      };

      await api.post('/Oferta/', payload);
      show_alert('Estudiante agregado a la sección', 'success');
      closeStudentsModal();
      await cargarSecciones();
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((d) => d.msg || JSON.stringify(d)).join(' | ')
            : 'No se pudo agregar al estudiante a la sección',
        'error'
      );
    }
  };

  useEffect(() => {
    cargarSecciones();
  }, []);

  const seccionesFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return secciones;
    return secciones.filter((s) => {
      const nombre = String(s.nomsecc || '').toLowerCase();
      const id = String(s.idsecc ?? '');
      return nombre.includes(q) || id.includes(q);
    });
  }, [secciones, busqueda]);

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

    const parametros = { nomsecc: nomsecc.trim() };

    if (operation === 1) {
      enviarSolicitud('POST', parametros);
    } else {
      enviarSolicitud('PATCH', parametros, idsecc);
    }
  };

  const enviarSolicitud = async (metodo, parametros = {}, idPath = null) => {
    try {
      if (metodo === 'POST') {
        await api.post('/seccion/', parametros);
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
    MySwal.fire({
      title: `¿Seguro de eliminar la sección "${item.nomsecc}"?`,
      text: 'No se podrá dar marcha atrás',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    }).then((result) => {
      if (result.isConfirmed) {
        enviarSolicitud('DELETE', {}, item.idsecc);
      } else {
        show_alert('La sección no fue eliminada', 'info');
      }
    });
  };

  const inicial = (s) => {
    const n = (s.nomsecc || '?').trim();
    return n.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p className="text-xl font-bold text-yellow-400">
          Cargando secciones...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-black text-white pt-24">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-yellow-400 mb-2 text-center">
          Gestión de Secciones
        </h2>
        <p className="text-center text-gray-400 text-sm mb-8">
          Grupos académicos y asignación de estudiantes
        </p>

        {/* Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
            <p className="text-xs uppercase text-gray-400 mb-1">
              Total secciones
            </p>
            <p className="text-2xl font-bold text-yellow-400">
              {secciones.length}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
            <p className="text-xs uppercase text-gray-400 mb-1">
              Resultados filtro
            </p>
            <p className="text-2xl font-bold text-white">
              {seccionesFiltradas.length}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg flex items-center">
            <button
              type="button"
              onClick={() => openModal(1)}
              className="w-full bg-yellow-400 text-black font-bold py-2.5 px-4 rounded-lg hover:bg-yellow-300 transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-circle-plus"></i>
              Añadir sección
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
              placeholder="Nombre o ID de sección..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">
            Listado de secciones
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[560px]">
              <thead className="bg-gray-800 border-b border-gray-700 text-yellow-400 text-xs uppercase">
                <tr>
                  <th className="p-3">Sección</th>
                  <th className="p-3">Estudiantes</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {seccionesFiltradas.length > 0 ? (
                  seccionesFiltradas.map((s, index) => {
                    const total = contarEstudiantes(s.idsecc);
                    return (
                      <tr
                        key={s.idsecc || index}
                        className="border-b border-gray-700 hover:bg-gray-800/80 transition"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400 font-bold shrink-0">
                              {inicial(s)}
                            </div>
                            <div>
                              <p className="font-semibold text-white leading-tight">
                                {s.nomsecc}
                              </p>
                              <p className="text-xs text-gray-500">
                                ID: {s.idsecc}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-800 border border-gray-600 text-gray-200">
                            <i className="fa-solid fa-users text-yellow-400"></i>
                            {total}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              title="Estudiantes"
                              onClick={() => openStudentsModal(s)}
                              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-500 transition"
                            >
                              <i className="fa-solid fa-users"></i>
                            </button>
                            <button
                              type="button"
                              title="Editar"
                              onClick={() => openModal(2, s)}
                              className="bg-yellow-400 text-black px-3 py-1.5 rounded-lg hover:bg-yellow-300 transition"
                            >
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            <button
                              type="button"
                              title="Eliminar"
                              onClick={() => deleteSeccion(s)}
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
                    <td colSpan="3" className="text-center p-10 text-gray-500">
                      {busqueda
                        ? 'No hay secciones que coincidan con la búsqueda.'
                        : 'No hay secciones registradas.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal sección */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg p-6 text-white shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-yellow-400">{title}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Datos de la sección
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
                  Nombre de la sección
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                  placeholder="Ej. A, B, 1A..."
                  value={nomsecc}
                  onChange={(e) => setNomsecc(e.target.value)}
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

      {/* Modal estudiantes */}
      {isStudentsModalOpen && selectedSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-5xl p-6 text-white max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-yellow-400">
                  Estudiantes de la sección
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedSection.nomsecc} · ID {selectedSection.idsecc}
                </p>
              </div>
              <button
                type="button"
                onClick={closeStudentsModal}
                className="text-gray-400 hover:text-white font-bold text-xl w-8 h-8 flex items-center justify-center rounded hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Agregar */}
              <div className="bg-gray-800/80 rounded-lg p-5 border border-gray-700">
                <h4 className="text-lg font-semibold mb-4 text-yellow-400">
                  Agregar estudiante
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-yellow-400">
                      Materia / carrera-módulo
                    </label>
                    <select
                      className="w-full p-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                      value={studentForm.idcarremo}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          idcarremo: e.target.value,
                        })
                      }
                    >
                      <option value="">Seleccione una materia</option>
                      {carrerasModulos.map((item) => {
                        const relacion = materiasModulos.find(
                          (materiaModulo) =>
                            Number(materiaModulo.idmatemo) ===
                            Number(item.idmatemo)
                        );
                        const nombreModulo =
                          relacion?.nombremodulo || `Módulo ${item.idmatemo}`;
                        const nombreMateria =
                          relacion?.nombremateria || `Materia ${item.idmatemo}`;

                        return (
                          <option key={item.idcarremo} value={item.idcarremo}>
                            {nombreMateria} · {nombreModulo}
                          </option>
                        );
                      })}
                    </select>
                    {carrerasModulos.length === 0 && (
                      <p className="text-xs text-red-400 mt-1">
                        No hay enlaces Carrera-Módulo. Créalos primero.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-yellow-400">
                      Estudiante
                    </label>
                    <select
                      className="w-full p-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                      value={studentForm.estudiante}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          estudiante: e.target.value,
                        })
                      }
                    >
                      <option value="">Seleccione estudiante</option>
                      {estudiantes
                        .filter(
                          (est) =>
                            !sectionStudents.some(
                              (inscrito) => inscrito.estudiante === est.ciestu
                            )
                        )
                        .map((est) => (
                          <option key={est.ciestu} value={est.ciestu}>
                            {est.ciestu} · {est.nombreestu} {est.apelliestu}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-yellow-400">
                      Horario{' '}
                      <span className="text-gray-500 font-normal">
                        (opcional)
                      </span>
                    </label>
                    <input
                      type="number"
                      className="w-full p-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                      value={studentForm.horario}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          horario: e.target.value,
                        })
                      }
                      placeholder="Id del horario"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={guardarEstudianteEnSeccion}
                    className="w-full bg-yellow-400 text-black font-bold py-2.5 rounded-lg hover:bg-yellow-300 transition"
                  >
                    Guardar estudiante
                  </button>
                </div>
              </div>

              {/* Lista */}
              <div className="bg-gray-800/80 rounded-lg p-5 border border-gray-700">
                <h4 className="text-lg font-semibold mb-4 text-yellow-400">
                  Lista de estudiantes
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    ({sectionStudents.length})
                  </span>
                </h4>
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {sectionStudents.length > 0 ? (
                    sectionStudents.map((inscrito) => (
                      <div
                        key={inscrito.idseccmo}
                        className="flex items-center justify-between gap-3 bg-gray-900 border border-gray-700 rounded-lg p-3 hover:border-gray-600 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400 font-bold text-sm shrink-0">
                            {(inscrito.nombreCompleto || '?')
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate">
                              {inscrito.nombreCompleto}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">
                              CI: {inscrito.estudiante}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          title="Quitar"
                          onClick={() => eliminarEstudianteDeSeccion(inscrito)}
                          className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-500 transition shrink-0"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No hay estudiantes inscritos en esta sección.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrudSeccion;