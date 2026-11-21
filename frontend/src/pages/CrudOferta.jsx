import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Trash2, FileSpreadsheet } from 'lucide-react';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const MySwal = withReactContent(Swal);

const CrudOferta = () => {
  const [rolUsuario, setRolUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [materias, setMaterias] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);

  const [idMateria, setIdMateria] = useState('');
  const [ciEmpleado, setCiEmpleado] = useState('');
  const [idModulo, setIdModulo] = useState('');
  const [idHorario, setIdHorario] = useState('');
  const [idCarrera, setIdCarrera] = useState('');
  const [idSecc, setIdSecc] = useState('');

  const [estudiantes, setEstudiantes] = useState([]);
  const [idOfertaAsignar, setIdOfertaAsignar] = useState('');
  const [ciEstudiante, setCiEstudiante] = useState('');
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  useEffect(() => {
    const saved =
      localStorage.getItem('idrol') ||
      localStorage.getItem('user_role') ||
      localStorage.getItem('role') ||
      localStorage.getItem('rol');

    let rol = 5;
    if (saved !== null && saved !== undefined && saved !== '') {
      rol = !isNaN(saved) ? parseInt(saved, 10) : saved;
    }
    setRolUsuario(rol);
  }, []);

  const esGestion = [1, 2, 3, '1', '2', '3'].includes(rolUsuario);

  const fetchResiliente = async (rutas) => {
    for (const ruta of rutas) {
      try {
        const res = await api.get(ruta, { timeout: 8000 });
        if (!res?.data) continue;
        if (Array.isArray(res.data)) return res.data;
        if (Array.isArray(res.data.data)) return res.data.data;
        const arr = Object.values(res.data).find((v) => Array.isArray(v));
        if (arr) return arr;
      } catch (err) {
        console.warn('Fallo ruta', ruta, err?.response?.status || err.message);
      }
    }
    return [];
  };

  const cargarDatos = async () => {
    setCargando(true);
    try {
      if (!esGestion) {
        setAsignaciones([]);
        return;
      }

      const [
        dataMaterias,
        dataDocentes,
        dataModulos,
        dataHorarios,
        dataCarreras,
        dataSecciones,
        dataAsignaciones,
        dataEstudiantes,
      ] = await Promise.all([
        fetchResiliente(['/materia/', '/materias/']),
        fetchResiliente(['/empleado/', '/empleados/']),
        fetchResiliente(['/modulo/', '/modulos/']),
        fetchResiliente(['/horarios/', '/horario/']),
        fetchResiliente(['/carrera/', '/carreras/']),
        fetchResiliente(['/seccion/', '/secciones/']),
        fetchResiliente(['/api/horarios-materias']),
        fetchResiliente(['/estudiantes/', '/estudiante/']),
      ]);

      const activos = (lista) =>
        Array.isArray(lista)
          ? lista.filter((i) => i && typeof i === 'object' && i.activo !== false)
          : [];

      setMaterias(activos(dataMaterias));
      setDocentes(activos(dataDocentes));
      setModulos(activos(dataModulos));
      setHorarios(activos(dataHorarios));
      setCarreras(activos(dataCarreras));
      setSecciones(activos(dataSecciones));
      setAsignaciones(Array.isArray(dataAsignaciones) ? dataAsignaciones : []);
      setEstudiantes(activos(dataEstudiantes));
    } catch (e) {
      console.error('Error cargarDatos Oferta:', e);
      show_alert('Error al cargar datos de oferta. Revisa el backend.', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (rolUsuario === null) return;
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolUsuario]);

  const crearAsignacion = async (e) => {
    e.preventDefault();
    if (!idMateria || !ciEmpleado || !idModulo || !idHorario || !idCarrera || !idSecc) {
      return show_alert('Completa todos los campos (incluye carrera y sección)', 'warning');
    }

    try {
      const payload = {
        idmateria: parseInt(idMateria, 10),
        ciempleado: String(ciEmpleado),
        idmodulo: parseInt(idModulo, 10),
        idhorario: parseInt(idHorario, 10),
        idcarrera: parseInt(idCarrera, 10),
        idsecc: parseInt(idSecc, 10),
      };

      const { data } = await api.post('/api/asignar-horario', payload);
      show_alert(data?.mensaje || 'Asignación registrada', 'success');

      setIdMateria('');
      setCiEmpleado('');
      setIdModulo('');
      setIdHorario('');
      setIdCarrera('');
      setIdSecc('');
      cargarDatos();
    } catch (error) {
      console.error(error);
      const detail =
        error.response?.data?.error_detalle ||
        error.response?.data?.detail;
      show_alert(
        typeof detail === 'string' ? detail : 'Error al guardar la asignación',
        'error'
      );
    }
  };

  const eliminarAsignacion = async (item) => {
    if (Number(rolUsuario) !== 1) {
      return show_alert('Solo el rol 1 puede eliminar ofertas', 'warning');
    }
    if (!item.idseccmo) {
      return show_alert('Falta idseccmo. Recarga la lista.', 'error');
    }
    const result = await MySwal.fire({
      title: '¿Eliminar esta oferta?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;

    try {
      await api.delete(`/Oferta/${item.idseccmo}`);
      show_alert('Eliminada', 'success');
      cargarDatos();
    } catch (error) {
      const detail = error.response?.data?.detail ?? error.response?.data?.error_detalle;
      show_alert(typeof detail === 'string' ? detail : 'No se pudo eliminar', 'error');
    }
  };

  const asignarEstudiante = async (e) => {
    e.preventDefault();
    if (!idOfertaAsignar || !ciEstudiante) {
      return show_alert('Elige oferta y estudiante', 'warning');
    }
    try {
      await api.patch(`/Oferta/${idOfertaAsignar}/asignar-estudiante`, {
        ciestu: String(ciEstudiante),
      });
      show_alert('Estudiante asignado a la oferta', 'success');
      setIdOfertaAsignar('');
      setCiEstudiante('');
      cargarDatos();
    } catch (error) {
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === 'string' ? detail : 'No se pudo asignar el estudiante',
        'error'
      );
    }
  };

  const descargarExcelOferta = async () => {
    setDownloadingExcel(true);
    try {
      const { data } = await api.get('/Oferta/excel', { responseType: 'blob' });
      const blob =
        data instanceof Blob
          ? data
          : new Blob([data], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = 'oferta_academica.xlsx';
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === 'string' ? detail : 'No se pudo generar el Excel de oferta académica',
        'error'
      );
    } finally {
      setDownloadingExcel(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p className="text-xl font-bold text-yellow-400">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="CRUD p-6 min-h-screen bg-black text-white pt-24">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
          {esGestion ? 'Asignación de Horarios y Docentes' : 'Mis Horarios'}
        </h2>

        {esGestion && (
          <>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8 shadow-lg">
              <form onSubmit={crearAsignacion}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-yellow-400">1. Materia</label>
                    <select className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white" value={idMateria} onChange={(e) => setIdMateria(e.target.value)} required>
                      <option value="">-- Seleccionar --</option>
                      {materias.map((m) => (
                        <option key={m.idmateria} value={m.idmateria}>{m.nombremateria}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-yellow-400">2. Docente</label>
                    <select className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white" value={ciEmpleado} onChange={(e) => setCiEmpleado(e.target.value)} required>
                      <option value="">-- Seleccionar --</option>
                      {docentes.map((d) => (
                        <option key={d.ciempleado} value={d.ciempleado}>
                          {d.nombreempleado} {d.apellidoempleado}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-yellow-400">3. Módulo</label>
                    <select className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white" value={idModulo} onChange={(e) => setIdModulo(e.target.value)} required>
                      <option value="">-- Seleccionar --</option>
                      {modulos.map((mo) => (
                        <option key={mo.idmodulo} value={mo.idmodulo}>{mo.nombremodulo}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-yellow-400">4. Carrera</label>
                    <select className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white" value={idCarrera} onChange={(e) => setIdCarrera(e.target.value)} required>
                      <option value="">-- Seleccionar --</option>
                      {carreras.map((c) => (
                        <option key={c.idcarrera} value={c.idcarrera}>
                          {c.nombrecarrera || c.nombre || `Carrera ${c.idcarrera}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-yellow-400">5. Sección</label>
                    <select className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white" value={idSecc} onChange={(e) => setIdSecc(e.target.value)} required>
                      <option value="">-- Seleccionar --</option>
                      {secciones.map((s) => (
                        <option key={s.idsecc} value={s.idsecc}>
                          {s.nomsecc || s.nombreseccion || `Sección ${s.idsecc}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-yellow-400">6. Horario</label>
                    <select className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white" value={idHorario} onChange={(e) => setIdHorario(e.target.value)} required>
                      <option value="">-- Seleccionar --</option>
                      {horarios.map((h) => (
                        <option key={h.idhorario} value={h.idhorario}>
                          {h.dia
                            ? `${h.dia} | Bloque: ${h.bloque || h.idbloque || ''} | Salón: ${h.salon || 'S/N'}`
                            : `Horario #${h.idhorario}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button type="submit" className="w-full md:w-1/3 bg-yellow-400 text-black font-bold py-2 px-4 rounded hover:bg-yellow-300 transition">
                    Guardar Asignación
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">Asignar estudiante a una oferta</h3>
              <p className="text-xs text-gray-400 mb-4">
                Elige una oferta ya creada (materia/sección/horario) y un estudiante. Sin esto,
                asistencia, notas y “Mi módulo” no tendrán datos del alumno.
              </p>
              <form onSubmit={asignarEstudiante} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-yellow-400">Oferta</label>
                  <select
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                    value={idOfertaAsignar}
                    onChange={(e) => setIdOfertaAsignar(e.target.value)}
                    required
                  >
                    <option value="">-- Seleccionar oferta --</option>
                    {asignaciones.map((a) => (
                      <option key={a.idseccmo} value={a.idseccmo}>
                        #{a.idseccmo} — {a.materia} | {a.seccion || 'Secc'} | {a.dia} {a.horainicio}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-yellow-400">Estudiante</label>
                  <select
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                    value={ciEstudiante}
                    onChange={(e) => setCiEstudiante(e.target.value)}
                    required
                  >
                    <option value="">-- Seleccionar --</option>
                    {estudiantes.map((est) => {
                      const ci = est.ciestu || est.cedula || est.ci;
                      return (
                        <option key={ci} value={ci}>
                          {est.nombreestu || est.nombre} {est.apelliestu || est.apellido} ({ci})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-emerald-500 text-black font-bold py-2 px-4 rounded hover:bg-emerald-400 transition"
                  >
                    Asignar estudiante
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">Horarios y Materias Asignadas</h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                {esGestion && (
                  <button
                    type="button"
                    onClick={descargarExcelOferta}
                    disabled={downloadingExcel}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500 px-4 py-2 font-semibold text-emerald-300 transition hover:bg-emerald-950 disabled:cursor-wait disabled:opacity-50"
                  >
                    <FileSpreadsheet size={18} />
                    {downloadingExcel ? 'Generando Excel...' : 'Exportar Excel'}
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-gray-800 border-b border-gray-700 text-yellow-400 text-xs uppercase">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Materia</th>
                      <th className="p-3">Módulo</th>
                      <th className="p-3">Carrera</th>
                      <th className="p-3">Sección</th>
                      <th className="p-3">Docente</th>
                      <th className="p-3">Día</th>
                      <th className="p-3">Horario</th>
                      <th className="p-3">Salón</th>
                      <th className="p-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asignaciones.length > 0 ? (
                      asignaciones.map((a, i) => (
                        <tr key={a.idseccmo || i} className="border-b border-gray-700 hover:bg-gray-800">
                          <td className="p-3 font-mono text-gray-400">#{a.idseccmo}</td>
                          <td className="p-3 text-yellow-400 font-semibold">{a.materia}</td>
                          <td className="p-3">{a.modulo}</td>
                          <td className="p-3">{a.carrera || '—'}</td>
                          <td className="p-3">{a.seccion || '—'}</td>
                          <td className="p-3 text-gray-300">{a.docente}</td>
                          <td className="p-3">{a.dia}</td>
                          <td className="p-3">
                            <span className="bg-green-600/30 text-green-300 border border-green-500/30 text-xs px-2 py-1 rounded">
                              {a.horainicio} - {a.horafin}
                            </span>
                          </td>
                          <td className="p-3">{a.salon}</td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              title="Eliminar"
                              onClick={() => eliminarAsignacion(a)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition flex items-center justify-center mx-auto"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="text-center p-6 text-gray-500">
                          No hay asignaciones registradas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CrudOferta;