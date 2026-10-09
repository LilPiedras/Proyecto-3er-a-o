import React, { useEffect, useState } from 'react';
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
  const [sectionStudents, setSectionStudents] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [studentForm, setStudentForm] = useState({
    estudiante: '',
    idcarremo: '',
    horario: ''
  });

  const [idsecc, setIdsecc] = useState('');
  const [nomsecc, setNomsecc] = useState('');

  const [operation, setOperation] = useState(1);
  const [title, setTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cargarSecciones = async () => {
    try {
      setLoading(true);
      const [seccionesRes, ofertasRes, estudiantesRes, carrerasModulosRes, materiasModulosRes] = await Promise.all([
        api.get('/seccion/'),
        api.get('/Oferta/'),
        api.get('/estudiantes/'),
        api.get('/Carrera_Modulo/'),
        api.get('/modulo_materia/')
      ]);

      setSecciones(Array.isArray(seccionesRes.data) ? seccionesRes.data : []);
      setOfertas(Array.isArray(ofertasRes.data) ? ofertasRes.data : []);
      setEstudiantes(Array.isArray(estudiantesRes.data) ? estudiantesRes.data : []);
      setCarrerasModulos(Array.isArray(carrerasModulosRes.data) ? carrerasModulosRes.data : []);
      setMateriasModulos(Array.isArray(materiasModulosRes.data) ? materiasModulosRes.data : []);
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === 'string' ? detail : 'Error al cargar secciones y estudiantes',
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
        const estudiante = estudiantes.find((item) => item.ciestu === oferta.estudiante);
        return {
          ...oferta,
          nombreCompleto: estudiante
            ? `${estudiante.nombreestu ?? ''} ${estudiante.apelliestu ?? ''}`.trim()
            : '(sin estudiante)',
          estudianteData: estudiante ?? null
        };
      });

    setSectionStudents(lista);
    setStudentForm({
      estudiante: '',
      idcarremo: carrerasModulos[0]?.idcarremo ?? '',
      horario: ''
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
        typeof detail === 'string' ? detail : 'No se pudo eliminar al estudiante de la sección',
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
      show_alert('La materia seleccionada no tiene un enlace académico válido', 'warning');
      return;
    }

    try {
      const payload = {
        idcarremo,
        idsecc: Number(selectedSection.idsecc),
        estudiante: studentForm.estudiante,
        horario: studentForm.horario ? Number(studentForm.horario) : null
      };

      await api.post('/Oferta/', payload);
      show_alert('Estudiante agregado a la sección', 'success');
      closeStudentsModal();
      await cargarSecciones();
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === 'string' ? detail : 'No se pudo agregar al estudiante a la sección',
        'error'
      );
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

        <div className="text-center mb-4">
          <button
            type="button"
            className="bg-yellow-400 text-black font-bold px-6 py-2 rounded-lg hover:bg-yellow-300 transition"
            onClick={() => openModal(1)}
          >
            <i className="fa-solid fa-circle-plus"></i> Añadir
          </button>
        </div>

        <div className="table-responsive max-w-3xl mx-auto">
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
                          type="button"
                          onClick={() => openStudentsModal(s)}
                          className="bg-blue-600 text-white px-3 py-1 rounded mr-2 hover:bg-blue-500"
                        >
                          <i className="fa-solid fa-users"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => openModal(2, s)}
                          className="bg-yellow-400 text-black px-3 py-1 rounded mr-2 hover:bg-yellow-300"
                        >
                          <i className="fa-solid fa-edit"></i>
                        </button>
                        <button
                          type="button"
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md p-6 text-white">
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

      {isStudentsModalOpen && selectedSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-5xl p-6 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Estudiantes de la sección: {selectedSection.nomsecc}
              </h3>
              <button
                type="button"
                onClick={closeStudentsModal}
                className="text-gray-400 hover:text-white font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-semibold mb-3 text-yellow-400">Agregar estudiante</h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Materia / carrera-modulo</label>
                    <select
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                      value={studentForm.idcarremo}
                      onChange={(e) => setStudentForm({ ...studentForm, idcarremo: e.target.value })}
                    >
                      <option value="">Seleccione una materia</option>
                      {carrerasModulos.map((item) => (
                        (() => {
                          const relacion = materiasModulos.find(
                            (materiaModulo) => Number(materiaModulo.idmatemo) === Number(item.idmatemo)
                          );
                          const nombreModulo = relacion?.nombremodulo || `Módulo ${item.idmatemo}`;
                          const nombreMateria = relacion?.nombremateria || `Materia ${item.idmatemo}`;

                          return (
                            <option key={item.idcarremo} value={item.idcarremo}>
                              {nombreMateria} · {nombreModulo}
                            </option>
                          );
                        })()
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Estudiante</label>
                    <select
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                      value={studentForm.estudiante}
                      onChange={(e) => setStudentForm({ ...studentForm, estudiante: e.target.value })}
                    >
                      <option value="">Seleccione estudiante</option>
                      {estudiantes
                        .filter((est) => !sectionStudents.some((inscrito) => inscrito.estudiante === est.ciestu))
                        .map((est) => (
                          <option key={est.ciestu} value={est.ciestu}>
                            {est.ciestu} · {est.nombreestu} {est.apelliestu}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Horario (opcional)</label>
                    <input
                      type="number"
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                      value={studentForm.horario}
                      onChange={(e) => setStudentForm({ ...studentForm, horario: e.target.value })}
                      placeholder="Id del horario"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={guardarEstudianteEnSeccion}
                    className="w-full bg-yellow-400 text-black font-bold py-2 rounded hover:bg-yellow-300"
                  >
                    Guardar estudiante
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-semibold mb-3 text-yellow-400">Lista de estudiantes</h4>
                <div className="space-y-2">
                  {sectionStudents.length > 0 ? (
                    sectionStudents.map((inscrito) => (
                      <div
                        key={inscrito.idseccmo}
                        className="flex items-center justify-between gap-3 bg-gray-700 rounded p-3"
                      >
                        <div>
                          <div className="font-semibold">{inscrito.nombreCompleto}</div>
                          <div className="text-xs text-gray-300">CI: {inscrito.estudiante}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => eliminarEstudianteDeSeccion(inscrito)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No hay estudiantes inscritos en esta sección.</p>
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