import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const DIAS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

const CrudHorario = () => {
  const [horarios, setHorarios] = useState([]);
  const [bloques, setBloques] = useState([]);
  const [loading, setLoading] = useState(true);

  const [idhorario, setIdhorario] = useState('');
  const [bloque, setBloque] = useState('');
  const [dia, setDia] = useState('');
  const [salon, setSalon] = useState('');

  const [operation, setOperation] = useState(1);
  const [title, setTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cargarHorarios = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/horarios/');
      setHorarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 404) {
        setHorarios([]);
      } else {
        const detail = error.response?.data?.detail;
        show_alert(
          typeof detail === 'string' ? detail : 'Error al cargar horarios',
          'error'
        );
        setHorarios([]);
      }
    } finally {
      setLoading(false);
    }
  };

const cargarBloques = async () => {
  try {
    const { data } = await api.get('/bloque/');
    console.log('Bloques recibidos:', data);
    setBloques(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error(error);
    setBloques([]);
  }
};

  useEffect(() => {
    cargarHorarios();
    cargarBloques();
  }, []);

  const getTextoBloque = (id) => {
    const b = bloques.find((x) => x.idbloque === id);
    return b ? `${b.horainicio} - ${b.horafin}` : id;
  };

  const getBloqueId = (b) => {
    if (!b) return '';
    return b.idbloque ?? b.id ?? b.bloque_id ?? '';
    };

  const getBloqueLabel = (b) => {
    const inicio = b.horainicio ?? b.hora_inicio ?? '';
    const fin = b.horafin ?? b.hora_fin ?? '';
    return `${inicio} - ${fin}`;
    };

  const limpiarFormulario = () => {
    setIdhorario('');
    setBloque('');
    setDia('');
    setSalon('');
  };

  const openModal = (op, item = null) => {
    limpiarFormulario();
    setOperation(op);

    if (op === 1) {
      setTitle('Registrar Horario');
    } else if (item) {
      setTitle('Editar Horario');
      setIdhorario(item.idhorario);
      setBloque(item.bloque ?? '');
      setDia(item.dia || '');
      setSalon(item.salon || '');
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    limpiarFormulario();
  };

    const validar = () => {
    console.log('Estado bloque al validar:', bloque, typeof bloque);
    console.log('Lista bloques:', bloques);

    const diaOk = String(dia || '').trim();
    const salonOk = String(salon || '').trim();
    const bloqueOk = parseInt(String(bloque), 10);

    if (!diaOk) {
        show_alert('Seleccione un día', 'warning');
        return;
    }
    if (!salonOk) {
        show_alert('Ingrese el salón', 'warning');
        return;
    }
    if (!bloque || Number.isNaN(bloqueOk) || bloqueOk <= 0) {
        show_alert(
        'Seleccione un bloque válido. Si no hay opciones con id, revisa GET /bloque/',
        'warning'
        );
        return;
    }

    const parametros = {
        dia: diaOk,
        bloque: bloqueOk,
        salon: salonOk,
    };

    console.log('Body final:', parametros);

    if (operation === 1) {
        enviarSolicitud('POST', parametros);
    } else {
        enviarSolicitud('PUT', parametros, idhorario);
    }
    };

  const enviarSolicitud = async (metodo, parametros = {}, idPath = null) => {
    try {
      if (metodo === 'POST') {
        await api.post('/horarios/', parametros);
      } else if (metodo === 'PUT') {
        await api.put(`/horarios/${idPath}`, parametros);
      } else if (metodo === 'DELETE') {
        await api.delete(`/horarios/${idPath}`);
      }

      const msg =
        metodo === 'DELETE'
          ? 'Horario eliminado correctamente'
          : metodo === 'POST'
            ? 'Horario registrado correctamente'
            : 'Horario actualizado correctamente';

      show_alert(msg, 'success');
      closeModal();
      await cargarHorarios();
    } catch (error) {
  console.error('Error completo:', error);
  console.error('Response data:', error.response?.data);

  const detail = error.response?.data?.detail;

  if (Array.isArray(detail)) {
    // Error de validación Pydantic (422)
    const msgs = detail.map((e) => {
      const campo = e.loc ? e.loc.join(' → ') : 'campo';
      return `${campo}: ${e.msg}`;
    });
    show_alert(msgs.join('\n'), 'error');
  } else if (typeof detail === 'string') {
    show_alert(detail, 'error');
  } else {
    show_alert('Error en la operación (mira la consola)', 'error');
  }
}
  };

  const deleteHorario = (item) => {
    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: `¿Seguro de eliminar el horario del ${item.dia}?`,
      text: 'No se podrá dar marcha atrás',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        enviarSolicitud('DELETE', {}, item.idhorario);
      } else {
        show_alert('El horario no fue eliminado', 'info');
      }
    });
  };

  return (
    <div className="CRUD p-6 min-h-screen bg-black text-white">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4 text-yellow-400">
          Horarios
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
                <p className="text-center text-gray-400 p-4">Cargando horarios...</p>
              ) : (
                <table className="table table-dark table-bordered w-full text-left">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>DÍA</th>
                      <th>BLOQUE</th>
                      <th>SALÓN</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horarios.length > 0 ? (
                      horarios.map((h, index) => (
                        <tr key={h.idhorario || index}>
                          <td>{index + 1}</td>
                          <td>{h.dia}</td>
                          <td>{getTextoBloque(h.bloque)}</td>
                          <td>{h.salon}</td>
                          <td>
                            <button
                              onClick={() => openModal(2, h)}
                              className="bg-yellow-400 text-black px-3 py-1 rounded mr-2 hover:bg-yellow-300"
                            >
                              <i className="fa-solid fa-edit"></i>
                            </button>
                            <button
                              onClick={() => deleteHorario(h)}
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

            <div className="space-y-4">
                {/* DÍA */}
                <div>
                <label className="block text-sm mb-1">Día</label>
                <select
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    value={dia}
                    onChange={(e) => setDia(e.target.value)}
                >
                    <option value="">Seleccione un día</option>
                    <option value="Lunes">Lunes</option>
                    <option value="Martes">Martes</option>
                    <option value="Miércoles">Miércoles</option>
                    <option value="Jueves">Jueves</option>
                    <option value="Viernes">Viernes</option>
                    <option value="Sábado">Sábado</option>
                    <option value="Domingo">Domingo</option>
                </select>
                </div>

                {/* BLOQUE */}
                <div>
                <label className="block text-sm mb-1">Bloque</label>
                <select
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    value={bloque}
                    onChange={(e) => {
                        console.log('Seleccionado:', e.target.value);
                        setBloque(e.target.value);
                    }}
                    >
                    <option value="">Seleccione un bloque</option>
                    {bloques.map((b, index) => {
                        const id = getBloqueId(b);
                        return (
                        <option key={id || index} value={String(id)}>
                            {getBloqueLabel(b)}
                        </option>
                        );
                    })}
                </select>
                {bloques.length === 0 && (
                    <p className="text-xs text-red-400 mt-1">
                    Primero crea un bloque
                    </p>
                )}
                </div>

                {/* SALÓN */}
                <div>
                <label className="block text-sm mb-1">Salón</label>
                <input
                    type="text"
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                    placeholder="Ej. Aula 101"
                    value={salon}
                    onChange={(e) => setSalon(e.target.value)}
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

export default CrudHorario;