import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const CrudCursos = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados del formulario
  const [idcurso, setIdcurso] = useState('');
  const [nomcurso, setNomcurso] = useState('');
  const [preciocurso, setPreciocurso] = useState('');
  const [nivelcur, setNivelcur] = useState('');
  const [docenasig, setDocenasig] = useState('');

  const [operation, setOperation] = useState(1);
  const [title, setTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Función robusta para obtener dinámicamente el ID
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

  const cargarCursos = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/curso/');
      setCursos(Array.isArray(data) ? data : []);
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
    cargarCursos();
  }, []);

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
      
      console.log("Objeto curso completo recibido:", curso);
      const idEncontrado = obtenerIdCurso(curso);
      console.log("ID resuelto por la función:", idEncontrado);

      if (!idEncontrado) {
        show_alert('Error interno: No se pudo identificar el ID del curso.', 'error');
        return; 
      }

      setIdcurso(idEncontrado);
      setNomcurso(curso.nomcurso || curso.nombrecurso || '');
      setPreciocurso(curso.preciocurso !== undefined ? String(curso.preciocurso) : '');
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
      await cargarCursos();
    } catch (error) {
      console.error('Error HTTP:', error);
      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        const primerError = detail[0];
        const campo = primerError?.loc?.join(' -> ') || 'Campo';
        const msgError = primerError?.msg || 'Error de validación';
        show_alert(`${campo}: ${msgError}`, 'error');
      } else if (typeof detail === 'string') {
        show_alert(detail, 'error');
      } else {
        show_alert('Error al realizar la operación', 'error');
      }
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
    }).then((result) => {
      if (result.isConfirmed) {
        enviarSolicitud('DELETE', {}, idParaEliminar);
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
                type="button"
                className="bg-yellow-400 text-black font-bold px-6 py-2 rounded-lg hover:bg-yellow-300 transition"
                onClick={() => openModal(1)}
              >
                <i className="fa-solid fa-circle-plus mr-2"></i> Añadir
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
                      <th>CURSO</th>
                      <th>NIVEL</th>
                      <th>PRECIO</th>
                      <th>CÉDULA DOCENTE</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cursos.length > 0 ? (
                      cursos.map((c, index) => (
                        <tr key={obtenerIdCurso(c) || index}>
                          <td>{c.nomcurso}</td>
                          <td>{c.nivelcur}</td>
                          <td>{`$${new Intl.NumberFormat('es-MX').format(c.preciocurso || 0)}`}</td>
                          <td>{c.docenasig || '—'}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => openModal(2, c)}
                              className="bg-yellow-400 text-black px-3 py-1 rounded mr-2 hover:bg-yellow-300"
                            >
                              <i className="fa-solid fa-edit"></i>
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteCurso(c)}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center p-4 text-gray-400">
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
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-white font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={validar} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Nombre del Curso</label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Ej. Corte y Confección"
                  value={nomcurso}
                  onChange={(e) => setNomcurso(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Nivel del Curso</label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Ej. Básico / Intermedio / Avanzado"
                  value={nivelcur}
                  onChange={(e) => setNivelcur(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Precio</label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Ej. 50"
                  value={preciocurso}
                  onChange={(e) => setPreciocurso(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Cédula del Docente (Opcional)</label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Ej. V-12345678"
                  value={docenasig}
                  onChange={(e) => setDocenasig(e.target.value)}
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
                  type="submit"
                  className="px-4 py-2 rounded bg-yellow-400 text-black font-bold hover:bg-yellow-300"
                >
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