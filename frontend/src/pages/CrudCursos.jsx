import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { TiPencil, TiTrash } from "react-icons/ti";
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const CrudCursos = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [idcurso, setIdcurso] = useState(null);
  const [nomcurso, setNomcurso] = useState('');
  const [preciocurso, setPreciocurso] = useState('');
  const [nivelcur, setNivelcur] = useState('');
  const [docenasig, setDocenasig] = useState('');
  const [operation, setOperation] = useState(1);
  const [title, setTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/curso/');
      
      if (Array.isArray(data) && data.length > 0) {
        console.log("CLAVES DEL PRIMER ELEMENTO:", Object.keys(data[0]));
        console.log("VALOR DE idcurso:", data[0].idcurso);
      }

      setCursos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 404) {
        setCursos([]);
      } else {
        const detail = error.response?.data?.detail;
        show_alert(
          typeof detail === 'string' ? detail : 'Error al cargar los cursos',
          'error'
        );
        setCursos([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCursos();
  }, []);

  const limpiarFormulario = () => {
    setIdcurso(null);
    setNomcurso('');
    setPreciocurso('');
    setNivelcur('');
    setDocenasig('');
  };

  const openModal = (
    op,
    id = null,
    nombre = '',
    precio = '',
    nivel = '',
    docente = ''
  ) => {
    limpiarFormulario();
    setOperation(op);
    setIdcurso(id);

    if (op === 1) {
      setTitle('Registrar Curso');
    } else {
      setTitle('Editar Curso');
      setNomcurso(nombre || '');
      setPreciocurso(precio || '');
      setNivelcur(nivel || '');
      setDocenasig(docente || '');
    }

    setIsModalOpen(true);
  };

  const validar = () => {
    if (nomcurso.trim() === '') {
      show_alert('Escribe el nombre del curso', 'warning');
      return;
    }
    if (preciocurso === '' || isNaN(Number(preciocurso))) {
      show_alert('Ingrese un precio válido', 'warning');
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
      docenasig: docenasig && docenasig.trim() !== '' ? docenasig.trim() : null,
    };

    if (operation === 1) {
      enviarSolicitud('POST', parametros);
    } else {
      if (!idcurso) {
        show_alert('No se detectó el ID del curso a actualizar', 'error');
        return;
      }
      enviarSolicitud('PUT', parametros, idcurso);
    }
  };

  const enviarSolicitud = async (metodo, parametros = null, idPath = null) => {
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
      setIsModalOpen(false);
      limpiarFormulario();
      await cargarCursos();
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === 'string' ? detail : 'Error en la operación',
        'error'
      );
    }
  };

  const deleteCurso = (id, nombre) => {
    if (!id) {
      show_alert('Error: El ID del curso no existe', 'error');
      return;
    }

    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: `¿Seguro de eliminar el curso "${nombre}"?`,
      text: 'No se podrá dar marcha atrás',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        enviarSolicitud('DELETE', null, id);
      } else {
        show_alert('El curso no fue eliminado', 'info');
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
                <i className="fa-solid fa-circle-plus"></i> Añadir Curso
              </button>
            </div>
          </div>
        </div>

        <div className="row mt-6">
          <div className="col-12 col-lg-10 offset-lg-1">
            <div className="table-responsive">
              {loading ? (
                <p className="text-center text-gray-400 p-4">Cargando cursos...</p>
              ) : (
                <table className="table table-dark table-bordered w-full text-left">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>NOMBRE DEL CURSO</th>
                      <th>PRECIO ($)</th>
                      <th>NIVEL</th>
                      <th>DOCENTE ASIGNADO</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cursos.length > 0 ? (
                      cursos.map((c, index) => {
                        const idValido = c.idcurso ?? c.id ?? c.id_curso;

                        return (
                          <tr key={idValido || index}>
                            <td>{index + 1}</td>
                            <td>{c.nomcurso}</td>
                            <td>{c.preciocurso}</td>
                            <td>{c.nivelcur}</td>
                            <td>
                              {c.docenasig ? (
                                c.docenasig
                              ) : (
                                <span className="italic text-gray-400">Docente no asignado</span>
                              )}
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    openModal(
                                      2,
                                      idValido,
                                      c.nomcurso,
                                      c.preciocurso,
                                      c.nivelcur,
                                      c.docenasig
                                    )
                                  }
                                  className="bg-yellow-400 text-black p-1.5 rounded hover:bg-yellow-300 transition flex items-center justify-center"
                                  title="Editar"
                                >
                                  <TiPencil className="text-xl" />
                                </button>
                                <button
                                  onClick={() => deleteCurso(idValido, c.nomcurso)}
                                  className="bg-red-600 text-white p-1.5 rounded hover:bg-red-500 transition flex items-center justify-center"
                                  title="Eliminar"
                                >
                                  <TiTrash className="text-xl" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center p-4 text-gray-400">
                          No hay cursos registrados
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
                <label className="block text-sm mb-1">Nombre del Curso</label>
                <input
                  type="text"
                  maxLength={20}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Ej. Diseño de Moda"
                  value={nomcurso}
                  onChange={(e) => setNomcurso(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Precio ($)</label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Ej. 50"
                  value={preciocurso}
                  onChange={(e) => setPreciocurso(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Nivel</label>
                <input
                  type="text"
                  maxLength={100}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Ej. Básico / Intermedio / Avanzado"
                  value={nivelcur}
                  onChange={(e) => setNivelcur(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Docente Asignado (Opcional)</label>
                <input
                  type="text"
                  maxLength={30}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Dejar en blanco si no hay docente"
                  value={docenasig}
                  onChange={(e) => setDocenasig(e.target.value)}
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

export default CrudCursos;