import React, { useEffect, useState, useMemo } from 'react';
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

  const [busquedaHorario, setBusquedaHorario] = useState('');
  const [busquedaBloque, setBusquedaBloque] = useState('');

  const [idbloque, setIdbloque] = useState('');
  const [horainicio, setHorainicio] = useState('');
  const [horafin, setHorafin] = useState('');
  const [opBloque, setOpBloque] = useState(1);
  const [titleBloque, setTitleBloque] = useState('');
  const [modalBloque, setModalBloque] = useState(false);

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
        show_alert(
          typeof detail === 'string' ? detail : 'Error al cargar bloques',
          'error'
        );
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
        show_alert(
          typeof detail === 'string' ? detail : 'Error al cargar horarios',
          'error'
        );
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

  const horariosFiltrados = useMemo(() => {
    const q = busquedaHorario.trim().toLowerCase();
    if (!q) return horarios;
    return horarios.filter((h) => {
      const diaTxt = String(h.dia || '').toLowerCase();
      const salonTxt = String(h.salon || '').toLowerCase();
      const bloqueTxt = String(getTextoBloque(h.bloque) || '').toLowerCase();
      return (
        diaTxt.includes(q) || salonTxt.includes(q) || bloqueTxt.includes(q)
      );
    });
  }, [horarios, busquedaHorario, bloques]);

  const bloquesFiltrados = useMemo(() => {
    const q = busquedaBloque.trim().toLowerCase();
    if (!q) return bloques;
    return bloques.filter((b) => {
      const ini = String(b.horainicio || '').toLowerCase();
      const fin = String(b.horafin || '').toLowerCase();
      const id = String(b.idbloque ?? '');
      return ini.includes(q) || fin.includes(q) || id.includes(q);
    });
  }, [bloques, busquedaBloque]);

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
      show_alert(
        typeof detail === 'string' ? detail : 'Error en la operación',
        'error'
      );
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
      confirmButtonColor: '#ef4444',
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
        show_alert(
          typeof detail === 'string' ? detail : 'Error en la operación',
          'error'
        );
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
      confirmButtonColor: '#ef4444',
    }).then((r) => {
      if (r.isConfirmed) enviarHorario('DELETE', {}, item.idhorario);
      else show_alert('El horario no fue eliminado', 'info');
    });
  };

  return (
    <div className="p-6 min-h-screen bg-black text-white pt-24">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-yellow-400 mb-2 text-center">
          Gestión de Horarios
        </h2>
        <p className="text-center text-gray-400 text-sm mb-6">
          Bloques de tiempo y asignación de días / salones
        </p>

        {/* Pestañas */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setTab('horarios')}
            className={`px-6 py-2.5 rounded-lg font-bold transition ${
              tab === 'horarios'
                ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20'
                : 'bg-gray-900 border border-gray-700 text-gray-300 hover:bg-gray-800'
            }`}
          >
            <i className="fa-solid fa-calendar-days mr-2"></i>
            Horarios
          </button>
          <button
            type="button"
            onClick={() => setTab('bloques')}
            className={`px-6 py-2.5 rounded-lg font-bold transition ${
              tab === 'bloques'
                ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20'
                : 'bg-gray-900 border border-gray-700 text-gray-300 hover:bg-gray-800'
            }`}
          >
            <i className="fa-solid fa-clock mr-2"></i>
            Bloques
          </button>
        </div>

        {/* ===== TAB HORARIOS ===== */}
        {tab === 'horarios' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
                <p className="text-xs uppercase text-gray-400 mb-1">
                  Total horarios
                </p>
                <p className="text-2xl font-bold text-yellow-400">
                  {horarios.length}
                </p>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
                <p className="text-xs uppercase text-gray-400 mb-1">
                  Resultados filtro
                </p>
                <p className="text-2xl font-bold text-white">
                  {horariosFiltrados.length}
                </p>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg flex items-center">
                <button
                  type="button"
                  onClick={() => openModalHorario(1)}
                  className="w-full bg-yellow-400 text-black font-bold py-2.5 px-4 rounded-lg hover:bg-yellow-300 transition flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-circle-plus"></i>
                  Añadir horario
                </button>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6 shadow-lg">
              <label className="block text-sm font-bold mb-2 text-yellow-400">
                Buscar horario
              </label>
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400 transition"
                  placeholder="Día, salón o bloque..."
                  value={busquedaHorario}
                  onChange={(e) => setBusquedaHorario(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">
                Listado de horarios
              </h3>
              {loadingHorarios ? (
                <p className="text-center text-gray-400 p-6">
                  Cargando horarios...
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[640px]">
                    <thead className="bg-gray-800 border-b border-gray-700 text-yellow-400 text-xs uppercase">
                      <tr>
                        <th className="p-3">Día</th>
                        <th className="p-3">Bloque</th>
                        <th className="p-3">Salón</th>
                        <th className="p-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {horariosFiltrados.length > 0 ? (
                        horariosFiltrados.map((h, i) => (
                          <tr
                            key={h.idhorario || i}
                            className="border-b border-gray-700 hover:bg-gray-800/80 transition"
                          >
                            <td className="p-3">
                              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-800 border border-gray-600 text-yellow-300">
                                {h.dia}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-sm text-gray-200">
                              <i className="fa-regular fa-clock mr-2 text-yellow-400"></i>
                              {getTextoBloque(h.bloque)}
                            </td>
                            <td className="p-3 text-gray-200">{h.salon}</td>
                            <td className="p-3">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  title="Editar"
                                  onClick={() => openModalHorario(2, h)}
                                  className="bg-yellow-400 text-black px-3 py-1.5 rounded-lg hover:bg-yellow-300 transition"
                                >
                                  <i className="fa-solid fa-pen"></i>
                                </button>
                                <button
                                  type="button"
                                  title="Eliminar"
                                  onClick={() => deleteHorario(h)}
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
                          <td
                            colSpan="4"
                            className="text-center p-10 text-gray-500"
                          >
                            {busquedaHorario
                              ? 'No hay horarios que coincidan.'
                              : 'No hay horarios. Crea bloques primero si aún no tienes.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ===== TAB BLOQUES ===== */}
        {tab === 'bloques' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
                <p className="text-xs uppercase text-gray-400 mb-1">
                  Total bloques
                </p>
                <p className="text-2xl font-bold text-yellow-400">
                  {bloques.length}
                </p>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
                <p className="text-xs uppercase text-gray-400 mb-1">
                  Resultados filtro
                </p>
                <p className="text-2xl font-bold text-white">
                  {bloquesFiltrados.length}
                </p>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg flex items-center">
                <button
                  type="button"
                  onClick={() => openModalBloque(1)}
                  className="w-full bg-yellow-400 text-black font-bold py-2.5 px-4 rounded-lg hover:bg-yellow-300 transition flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-circle-plus"></i>
                  Añadir bloque
                </button>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6 shadow-lg">
              <label className="block text-sm font-bold mb-2 text-yellow-400">
                Buscar bloque
              </label>
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400 transition"
                  placeholder="Hora inicio, fin o ID..."
                  value={busquedaBloque}
                  onChange={(e) => setBusquedaBloque(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">
                Listado de bloques
              </h3>
              {loadingBloques ? (
                <p className="text-center text-gray-400 p-6">
                  Cargando bloques...
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[520px]">
                    <thead className="bg-gray-800 border-b border-gray-700 text-yellow-400 text-xs uppercase">
                      <tr>
                        <th className="p-3">Bloque</th>
                        <th className="p-3">Inicio</th>
                        <th className="p-3">Fin</th>
                        <th className="p-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bloquesFiltrados.length > 0 ? (
                        bloquesFiltrados.map((b, i) => (
                          <tr
                            key={b.idbloque || i}
                            className="border-b border-gray-700 hover:bg-gray-800/80 transition"
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400 shrink-0">
                                  <i className="fa-solid fa-clock"></i>
                                </div>
                                <div>
                                  <p className="font-semibold text-white">
                                    {b.horainicio} – {b.horafin}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    ID: {b.idbloque}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 font-mono text-sm text-gray-200">
                              {b.horainicio}
                            </td>
                            <td className="p-3 font-mono text-sm text-gray-200">
                              {b.horafin}
                            </td>
                            <td className="p-3">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  title="Editar"
                                  onClick={() => openModalBloque(2, b)}
                                  className="bg-yellow-400 text-black px-3 py-1.5 rounded-lg hover:bg-yellow-300 transition"
                                >
                                  <i className="fa-solid fa-pen"></i>
                                </button>
                                <button
                                  type="button"
                                  title="Eliminar"
                                  onClick={() => deleteBloque(b)}
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
                          <td
                            colSpan="4"
                            className="text-center p-10 text-gray-500"
                          >
                            {busquedaBloque
                              ? 'No hay bloques que coincidan.'
                              : 'No hay bloques. Crea al menos uno para asignar horarios.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal BLOQUE */}
      {modalBloque && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg p-6 text-white shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-yellow-400">
                  {titleBloque}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Define el rango horario del bloque
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalBloque(false)}
                className="text-gray-400 hover:text-white font-bold text-xl w-8 h-8 flex items-center justify-center rounded hover:bg-gray-800"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-yellow-400">
                    Hora inicio
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                    placeholder="Ej. 08:00"
                    value={horainicio}
                    onChange={(e) => setHorainicio(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-yellow-400">
                    Hora fin
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                    placeholder="Ej. 10:00"
                    value={horafin}
                    onChange={(e) => setHorafin(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setModalBloque(false)}
                  className="px-4 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={validarBloque}
                  className="px-5 py-2.5 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition"
                >
                  {opBloque === 1 ? 'Guardar' : 'Actualizar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal HORARIO */}
      {modalHorario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg p-6 text-white shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-yellow-400">
                  {titleHorario}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Asigna día, bloque y salón
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalHorario(false)}
                className="text-gray-400 hover:text-white font-bold text-xl w-8 h-8 flex items-center justify-center rounded hover:bg-gray-800"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Día
                </label>
                <select
                  className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
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
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Bloque
                </label>
                <select
                  className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
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
                <label className="block text-sm font-bold mb-2 text-yellow-400">
                  Salón
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white outline-none focus:border-yellow-400"
                  placeholder="Ej. Aula 101"
                  value={salon}
                  onChange={(e) => setSalon(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setModalHorario(false)}
                  className="px-4 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={validarHorario}
                  className="px-5 py-2.5 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition"
                >
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