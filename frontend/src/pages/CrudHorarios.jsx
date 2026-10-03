import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const CrudHorarios = () => {
  const [tab, setTab] = useState('horarios');

  const [bloques, setBloques] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loadingBloques, setLoadingBloques] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(true);

  // --- Formulario BLOQUE ---
  const [idbloque, setIdbloque] = useState('');
  const [horainicio, setHorainicio] = useState('');
  const [horafin, setHorafin] = useState('');
  const [opBloque, setOpBloque] = useState(1);
  const [titleBloque, setTitleBloque] = useState('');
  const [modalBloque, setModalBloque] = useState(false);

  // --- Formulario HORARIO ---
  const [idhorario, setIdhorario] = useState('');
  const [bloque, setBloque] = useState('');
  const [dia, setDia] = useState('');
  const [salon, setSalon] = useState('');
  const [opHorario, setOpHorario] = useState(1);
  const [titleHorario, setTitleHorario] = useState('');
  const [modalHorario, setModalHorario] = useState(false);

  const cargarBloques = async () => {
    try {
      setLoadingBloques(true);
      const { data } = await api.get('/bloque/');
      setBloques(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.response?.status === 404) {
        setBloques([]);
      } else {
        const detail = error.response?.data?.detail;
        show_alert(typeof detail === 'string' ? detail : 'Error al cargar bloques', 'error');
        setBloques([]);
      }
    } finally {
      setLoadingBloques(false);
    }
  };

  const cargarHorarios = async () => {
    try {
      setLoadingHorarios(true);
      const { data } = await api.get('/horarios/');
      setHorarios(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.response?.status === 404) {
        setHorarios([]);
      } else {
        const detail = error.response?.data?.detail;
        show_alert(typeof detail === 'string' ? detail : 'Error al cargar horarios', 'error');
        setHorarios([]);
      }
    } finally {
      setLoadingHorarios(false);
    }
  };

  useEffect(() => {
    cargarBloques();
    cargarHorarios();
  }, []);

  const getTextoBloque = (id) => {
    const b = bloques.find((x) => Number(x.idbloque) === Number(id));
    return b ? `${b.horainicio} - ${b.horafin}` : id;
  };

  // ========== BLOQUES ==========
  const limpiarBloque = () => {
    setIdbloque('');
    setHorainicio('');
    setHorafin('');
  };

  const openModalBloque = (op, item = null) => {
    limpiarBloque();
    setOpBloque(op);
    if (op === 1) {
      setTitleBloque('Registrar Bloque');
    } else if (item) {
      setTitleBloque('Editar Bloque');
      setIdbloque(item.idbloque);
      setHorainicio(item.horainicio || '');
      setHorafin(item.horafin || '');
    }
    setModalBloque(true);
  };

  const validarBloque = () => {
    if (!horainicio.trim()) {
      show_alert('Ingrese la hora de inicio', 'warning');
      return;
    }
    if (!horafin.trim()) {
      show_alert('Ingrese la hora de fin', 'warning');
      return;
    }
    const body = { horainicio: horainicio.trim(), horafin: horafin.trim() };
    enviarBloque(opBloque === 1 ? 'POST' : 'PUT', body, idbloque);
  };

  const enviarBloque = async (metodo, body = {}, idPath = null) => {
    try {
      if (metodo === 'POST') await api.post('/bloque/', body);
      else if (metodo === 'PUT') await api.put(`/bloque/${idPath}`, body);
      else if (metodo === 'DELETE') await api.delete(`/bloque/${idPath}`);

      show_alert(
        metodo === 'DELETE'
          ? 'Bloque eliminado correctamente'
          : metodo === 'POST'
            ? 'Bloque registrado correctamente'
            : 'Bloque actualizado correctamente',
        'success'
      );
      setModalBloque(false);
      limpiarBloque();
      await cargarBloques();
      await cargarHorarios();
    } catch (error) {
      const detail = error.response?.data?.detail;
      show_alert(typeof detail === 'string' ? detail : 'Error en la operación', 'error');
    }
  };

  const deleteBloque = (item) => {
    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: `¿Eliminar bloque ${item.horainicio} - ${item.horafin}?`,
      text: 'No se podrá dar marcha atrás',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((r) => {
      if (r.isConfirmed) enviarBloque('DELETE', {}, item.idbloque);
      else show_alert('El bloque no fue eliminado', 'info');
    });
  };

  // ========== HORARIOS ==========
  const limpiarHorario = () => {
    setIdhorario('');
    setBloque('');
    setDia('');
    setSalon('');
  };

  const openModalHorario = (op, item = null) => {
    limpiarHorario();
    setOpHorario(op);
    if (op === 1) {
      setTitleHorario('Registrar Horario');
    } else if (item) {
      setTitleHorario('Editar Horario');
      setIdhorario(item.idhorario);
      setBloque(item.bloque != null ? String(item.bloque) : '');
      setDia(item.dia || '');
      setSalon(item.salon || '');
    }
    setModalHorario(true);
  };

  const validarHorario = () => {
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
      show_alert('Seleccione un bloque válido', 'warning');
      return;
    }

    const body = { dia: diaOk, bloque: bloqueOk, salon: salonOk };
    enviarHorario(opHorario === 1 ? 'POST' : 'PUT', body, idhorario);
  };

  const enviarHorario = async (metodo, body = {}, idPath = null) => {
    try {
      if (metodo === 'POST') await api.post('/horarios/', body);
      else if (metodo === 'PUT') await api.put(`/horarios/${idPath}`, body);
      else if (metodo === 'DELETE') await api.delete(`/horarios/${idPath}`);

      show_alert(
        metodo === 'DELETE'
          ? 'Horario eliminado correctamente'
          : metodo === 'POST'
            ? 'Horario registrado correctamente'
            : 'Horario actualizado correctamente',
        'success'
      );
      setModalHorario(false);
      limpiarHorario();
      await cargarHorarios();
    } catch (error) {
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        show_alert(detail.map((e) => e.msg).join('\n'), 'error');
      } else {
        show_alert(typeof detail === 'string' ? detail : 'Error en la operación', 'error');
      }
    }
  };

  const deleteHorario = (item) => {
    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: `¿Eliminar horario del ${item.dia}?`,
      text: 'No se podrá dar marcha atrás',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((r) => {
      if (r.isConfirmed) enviarHorario('DELETE', {}, item.idhorario);
      else show_alert('El horario no fue eliminado', 'info');
    });
  };

  // ========== UI ==========
  return (
    <div className="CRUD p-6 min-h-screen bg-black text-white">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4 text-yellow-400">
          Gestión de Horarios
        </h2>

        {/* Pestañas */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setTab('horarios')}
            className={`px-6 py-2 rounded-lg font-bold transition ${
              tab === 'horarios'
                ? 'bg-yellow-400 text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Horarios
          </button>
          <button
            type="button"
            onClick={() => setTab('bloques')}
            className={`px-6 py-2 rounded-lg font-bold transition ${
              tab === 'bloques'
                ? 'bg-yellow-400 text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Bloques
          </button>
        </div>

        {/* ===== TAB HORARIOS ===== */}
        {tab === 'horarios' && (
          <>
            <div className="text-center mb-4">
              <button
                type="button"
                className="bg-yellow-400 text-black font-bold px-6 py-2 rounded-lg hover:bg-yellow-300 transition"
                onClick={() => openModalHorario(1)}
              >
                <i className="fa-solid fa-circle-plus"></i> Añadir horario
              </button>
            </div>

            <div className="table-responsive max-w-5xl mx-auto">
              {loadingHorarios ? (
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
                      horarios.map((h, i) => (
                        <tr key={h.idhorario || i}>
                          <td>{i + 1}</td>
                          <td>{h.dia}</td>
                          <td>{getTextoBloque(h.bloque)}</td>
                          <td>{h.salon}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => openModalHorario(2, h)}
                              className="bg-yellow-400 text-black px-3 py-1 rounded mr-2 hover:bg-yellow-300"
                            >
                              <i className="fa-solid fa-edit"></i>
                            </button>
                            <button
                              type="button"
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
                          No hay horarios. Crea bloques primero si aún no tienes.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ===== TAB BLOQUES ===== */}
        {tab === 'bloques' && (
          <>
            <div className="text-center mb-4">
              <button
                type="button"
                className="bg-yellow-400 text-black font-bold px-6 py-2 rounded-lg hover:bg-yellow-300 transition"
                onClick={() => openModalBloque(1)}
              >
                <i className="fa-solid fa-circle-plus"></i> Añadir bloque
              </button>
            </div>

            <div className="table-responsive max-w-4xl mx-auto">
              {loadingBloques ? (
                <p className="text-center text-gray-400 p-4">Cargando bloques...</p>
              ) : (
                <table className="table table-dark table-bordered w-full text-left">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>HORA INICIO</th>
                      <th>HORA FIN</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bloques.length > 0 ? (
                      bloques.map((b, i) => (
                        <tr key={b.idbloque || i}>
                          <td>{i + 1}</td>
                          <td>{b.horainicio}</td>
                          <td>{b.horafin}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => openModalBloque(2, b)}
                              className="bg-yellow-400 text-black px-3 py-1 rounded mr-2 hover:bg-yellow-300"
                            >
                              <i className="fa-solid fa-edit"></i>
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteBloque(b)}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center p-4 text-gray-400">
                          No hay bloques. Crea al menos uno para asignar horarios.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal BLOQUE */}
      {modalBloque && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md p-6 text-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{titleBloque}</h3>
              <button type="button" onClick={() => setModalBloque(false)} className="text-gray-400 hover:text-white text-xl">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Hora inicio</label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Ej. 08:00"
                  value={horainicio}
                  onChange={(e) => setHorainicio(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Hora fin</label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Ej. 10:00"
                  value={horafin}
                  onChange={(e) => setHorafin(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalBloque(false)} className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600">
                  Cancelar
                </button>
                <button type="button" onClick={validarBloque} className="px-4 py-2 rounded bg-yellow-400 text-black font-bold hover:bg-yellow-300">
                  {opBloque === 1 ? 'Guardar' : 'Actualizar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal HORARIO */}
      {modalHorario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md p-6 text-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{titleHorario}</h3>
              <button type="button" onClick={() => setModalHorario(false)} className="text-gray-400 hover:text-white text-xl">
                ✕
              </button>
            </div>
            <div className="space-y-4">
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
              <div>
                <label className="block text-sm mb-1">Bloque</label>
                <select
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  value={bloque}
                  onChange={(e) => setBloque(e.target.value)}
                >
                  <option value="">Seleccione un bloque</option>
                  {bloques.map((b) => (
                    <option key={b.idbloque} value={String(b.idbloque)}>
                      {b.horainicio} - {b.horafin}
                    </option>
                  ))}
                </select>
                {bloques.length === 0 && (
                  <p className="text-xs text-red-400 mt-1">
                    No hay bloques. Ve a la pestaña Bloques y crea uno.
                  </p>
                )}
              </div>
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
                <button type="button" onClick={() => setModalHorario(false)} className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600">
                  Cancelar
                </button>
                <button type="button" onClick={validarHorario} className="px-4 py-2 rounded bg-yellow-400 text-black font-bold hover:bg-yellow-300">
                  {opHorario === 1 ? 'Guardar' : 'Actualizar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrudHorarios;