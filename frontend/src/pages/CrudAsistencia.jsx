import { useEffect, useState } from 'react';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const fechaLocal = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const detalleError = (error, mensaje) => {
  const detail = error.response?.data?.detail;
  return typeof detail === 'string' ? detail : mensaje;
};

const CrudAsistencia = () => {
  const [secciones, setSecciones] = useState([]);
  const [idsecc, setIdsecc] = useState('');
  const [materias, setMaterias] = useState([]);
  const [idmateria, setIdmateria] = useState('');
  const [fecha, setFecha] = useState(fechaLocal);
  const [estudiantes, setEstudiantes] = useState([]);
  const [marcas, setMarcas] = useState({});
  const [cargandoSecciones, setCargandoSecciones] = useState(true);
  const [cargandoMaterias, setCargandoMaterias] = useState(true);
  const [cargandoLista, setCargandoLista] = useState(false);
  const [guardando, setGuardando] = useState('');
  const [errorAcceso, setErrorAcceso] = useState('');
  const [actualizacion, setActualizacion] = useState(0);

  useEffect(() => {
    let vigente = true;
    api.get('/asistencias/secciones')
      .then(({ data }) => {
        if (!vigente) return;
        const lista = Array.isArray(data) ? data : [];
        setSecciones(lista);
        if (lista.length) setIdsecc(String(lista[0].idsecc));
      })
      .catch((error) => {
        if (vigente) setErrorAcceso(detalleError(error, 'No se pudieron cargar las secciones'));
      })
      .finally(() => {
        if (vigente) setCargandoSecciones(false);
      });
    return () => { vigente = false; };
  }, []);

  useEffect(() => {
    if (!idsecc) {
      setMaterias([]);
      setIdmateria('');
      setEstudiantes([]);
      setMarcas({});
      setCargandoMaterias(false);
      return undefined;
    }

    let vigente = true;
    setCargandoMaterias(true);
    setMaterias([]);
    setIdmateria('');
    api.get(`/asistencias/secciones/${idsecc}/materias`)
      .then(({ data }) => {
        if (!vigente) return;
        const lista = Array.isArray(data) ? data : [];
        setMaterias(lista);
        if (lista.length) setIdmateria(String(lista[0].idmateria));
      })
      .catch((error) => {
        if (vigente) show_alert(detalleError(error, 'No se pudieron cargar las materias de la sección'), 'error');
      })
      .finally(() => {
        if (vigente) setCargandoMaterias(false);
      });
    return () => { vigente = false; };
  }, [idsecc]);

  useEffect(() => {
    if (!idsecc || !idmateria || !fecha) {
      setEstudiantes([]);
      setMarcas({});
      return undefined;
    }

    let vigente = true;
    setCargandoLista(true);
    api.get('/asistencias/', { params: { idmateria, idsecc, fecha } })
      .then(({ data }) => {
        if (!vigente) return;
        const lista = Array.isArray(data) ? data : [];
        setEstudiantes(lista);
        setMarcas(Object.fromEntries(lista.map((alumno) => [alumno.asisestu, Boolean(alumno.verificar)])));
      })
      .catch((error) => {
        if (vigente) show_alert(detalleError(error, 'No se pudo cargar la lista de asistencia'), 'error');
      })
      .finally(() => {
        if (vigente) setCargandoLista(false);
      });
    return () => { vigente = false; };
  }, [idsecc, idmateria, fecha, actualizacion]);

  const guardar = async (alumno) => {
    const payload = {
      asisestu: alumno.asisestu,
      idmateria: Number(idmateria),
      fecha,
      verificar: Boolean(marcas[alumno.asisestu]),
    };
    setGuardando(alumno.asisestu);
    try {
      if (alumno.idasis) {
        await api.patch(`/asistencias/${alumno.idasis}`, { verificar: payload.verificar });
      } else {
        await api.post('/asistencias/', payload);
      }
      show_alert('Asistencia guardada', 'success');
      setActualizacion((valor) => valor + 1);
    } catch (error) {
      show_alert(detalleError(error, 'No se pudo guardar la asistencia'), 'error');
    } finally {
      setGuardando('');
    }
  };

  const eliminar = async (alumno) => {
    if (!alumno.idasis || !window.confirm(`¿Eliminar la asistencia de ${alumno.nombreestu} ${alumno.apelliestu}?`)) return;
    setGuardando(alumno.asisestu);
    try {
      await api.delete(`/asistencias/${alumno.idasis}`);
      show_alert('Registro de asistencia eliminado', 'success');
      setActualizacion((valor) => valor + 1);
    } catch (error) {
      show_alert(detalleError(error, 'No se pudo eliminar la asistencia'), 'error');
    } finally {
      setGuardando('');
    }
  };

  return (
    <section className="min-h-screen bg-black p-6 pt-28 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-yellow-400">Control de asistencia</h1>
          <p className="mt-2 text-sm text-gray-400">Registra y actualiza la asistencia de estudiantes inscritos por sección y materia.</p>
        </div>

        {errorAcceso ? (
          <p role="alert" className="rounded border border-red-800 bg-red-950/50 p-4 text-red-200">{errorAcceso}</p>
        ) : (
          <>
            <div className="mb-6 grid gap-4 rounded-lg border border-gray-800 bg-gray-950 p-4 sm:grid-cols-[1fr_1fr_220px]">
              <label className="text-sm font-medium text-gray-200">
                Sección
                <select
                  value={idsecc}
                  onChange={(event) => setIdsecc(event.target.value)}
                  disabled={cargandoSecciones || !secciones.length}
                  className="mt-2 w-full rounded border border-gray-700 bg-gray-900 p-3 text-white focus:border-yellow-400 focus:outline-none"
                >
                  {!secciones.length && <option value="">{cargandoSecciones ? 'Cargando secciones...' : 'No tienes secciones con estudiantes inscritos'}</option>}
                  {secciones.map((seccion) => (
                    <option key={seccion.idsecc} value={seccion.idsecc}>{seccion.nomsecc}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-gray-200">
                Materia
                <select
                  value={idmateria}
                  onChange={(event) => setIdmateria(event.target.value)}
                  disabled={!idsecc || cargandoMaterias || !materias.length}
                  className="mt-2 w-full rounded border border-gray-700 bg-gray-900 p-3 text-white focus:border-yellow-400 focus:outline-none"
                >
                  {!materias.length && <option value="">{cargandoMaterias ? 'Cargando materias...' : 'Esta sección no tiene materias inscritas'}</option>}
                  {materias.map((materia) => (
                    <option key={materia.idmateria} value={materia.idmateria}>{materia.nombremateria}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-gray-200">
                Fecha
                <input
                  type="date"
                  value={fecha}
                  onChange={(event) => setFecha(event.target.value)}
                  className="mt-2 w-full rounded border border-gray-700 bg-gray-900 p-3 text-white focus:border-yellow-400 focus:outline-none"
                />
              </label>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-800">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead className="bg-gray-900 text-sm text-yellow-300">
                  <tr>
                    <th className="p-3">ESTUDIANTE</th>
                    <th className="p-3">CÉDULA</th>
                    <th className="p-3">ASISTENCIA</th>
                    <th className="p-3">ESTADO</th>
                    <th className="p-3">ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {cargandoLista ? (
                    <tr><td colSpan="5" className="p-6 text-center text-gray-400">Cargando estudiantes...</td></tr>
                  ) : estudiantes.length ? estudiantes.map((alumno) => (
                    <tr key={alumno.asisestu} className="border-t border-gray-800 hover:bg-gray-900/60">
                      <td className="p-3 font-medium">{alumno.nombreestu} {alumno.apelliestu}</td>
                      <td className="p-3 text-gray-300">{alumno.asisestu}</td>
                      <td className="p-3">
                        <label className="inline-flex cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={Boolean(marcas[alumno.asisestu])}
                            onChange={(event) => setMarcas((actual) => ({ ...actual, [alumno.asisestu]: event.target.checked }))}
                            className="h-5 w-5 accent-emerald-400"
                            aria-label={`Asistencia de ${alumno.nombreestu} ${alumno.apelliestu}`}
                          />
                          <span>{marcas[alumno.asisestu] ? 'Presente' : 'Ausente'}</span>
                        </label>
                      </td>
                      <td className="p-3">
                        {alumno.idasis ? <span className="text-emerald-300">Registrada</span> : <span className="text-gray-400">Sin registrar</span>}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => guardar(alumno)}
                            disabled={guardando === alumno.asisestu}
                            className="rounded bg-yellow-400 px-3 py-2 font-semibold text-black hover:bg-yellow-300 disabled:opacity-50"
                          >
                            {guardando === alumno.asisestu ? 'Guardando...' : alumno.idasis ? 'Actualizar' : 'Registrar'}
                          </button>
                          {alumno.idasis && (
                            <button
                              type="button"
                              onClick={() => eliminar(alumno)}
                              disabled={guardando === alumno.asisestu}
                              className="rounded bg-red-700 px-3 py-2 hover:bg-red-600 disabled:opacity-50"
                              aria-label={`Eliminar asistencia de ${alumno.nombreestu} ${alumno.apelliestu}`}
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" className="p-6 text-center text-gray-400">No hay estudiantes inscritos en esta sección y materia.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default CrudAsistencia;