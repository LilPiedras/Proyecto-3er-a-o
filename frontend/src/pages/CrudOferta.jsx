import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const MySwal = withReactContent(Swal);

const CrudOferta = () => {
  // ==========================================
  // ESTADOS GENERALES Y DE ROL
  // ==========================================
  const [rolUsuario, setRolUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Estados para Directores / Sub Directores / Coordinadores
  const [carreras, setCarreras] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [horarios, setHorarios] = useState([]); 
  const [ofertas, setOfertas] = useState([]); 
  
  const [modulosFiltrados, setModulosFiltrados] = useState([]);
  const [seccionesFiltradas, setSeccionesFiltradas] = useState([]);
  const [ofertasFiltradas, setOfertasFiltradas] = useState([]);

  // Selecciones del formulario de administración
  const [idCarrera, setIdCarrera] = useState('');
  const [idModulo, setIdModulo] = useState('');
  const [idSeccion, setIdSeccion] = useState('');
  const [idHorario, setIdHorario] = useState('');

  // Estados para Vista Estudiante
  const [miHorario, setMiHorario] = useState([]);

  // ==========================================
  // DETECCIÓN DE ROL
  // 1: Director, 2: Sub Director, 3: Coordinador, 4: Docente, 5: Estudiante, 6: Conserje
  // ==========================================
  useEffect(() => {
    const obtenerRol = () => {
      const savedRole = 
        localStorage.getItem("idrol") || 
        localStorage.getItem("user_role") || 
        localStorage.getItem("role") || 
        localStorage.getItem("rol");
        
      if (savedRole !== null && savedRole !== undefined && savedRole !== "") {
        return !isNaN(savedRole) ? parseInt(savedRole, 10) : savedRole;
      }

      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const jwtRol = payload.idrol ?? payload.rol ?? payload.role_id ?? payload.role;
          if (jwtRol !== undefined) {
            return !isNaN(jwtRol) ? parseInt(jwtRol, 10) : jwtRol;
          }
        } catch (e) {
          console.error("Error al decodificar token:", e);
        }
      }
      return 5; // Por defecto Estudiante
    };

    setRolUsuario(obtenerRol());
  }, []);

  const esGestion = [1, 2, 3, "1", "2", "3", "Director", "Sub Director", "Coordinador"].includes(rolUsuario);

  // ==========================================
  // PETICIONES RESILIENTES
  // ==========================================
  const fetchResiliente = async (rutas) => {
    for (const ruta of rutas) {
      try {
        const res = await api.get(ruta);
        if (res && res.data) {
          if (Array.isArray(res.data)) return res.data;
          if (Array.isArray(res.data.data)) return res.data.data;
          if (typeof res.data === 'object') {
            const arregloEncontrado = Object.values(res.data).find(val => Array.isArray(val));
            if (arregloEncontrado) return arregloEncontrado;
          }
        }
      } catch (err) {
        continue;
      }
    }
    return [];
  };

  const cargarDatos = async () => {
    setCargando(true);
    try {
      if (esGestion) {
        const [dataCarreras, dataModulos, dataSecciones, dataHorarios, dataOfertas] = await Promise.all([
          fetchResiliente(['/carrera/', '/carreras/', '/carrera']),
          fetchResiliente(['/modulo/', '/modulos/', '/modulo']),
          fetchResiliente(['/seccion/', '/secciones/', '/seccion']),
          fetchResiliente(['/horario/', '/horarios/', '/horario']),
          fetchResiliente(['/Oferta/', '/oferta/', '/ofertas/', '/Ofertas/'])
        ]);

        const soloActivos = (lista) => 
          Array.isArray(lista) ? lista.filter(item => item && typeof item === 'object' && item.activo !== false) : [];

        setCarreras(soloActivos(dataCarreras));
        setModulos(soloActivos(dataModulos));
        setSecciones(soloActivos(dataSecciones));
        setHorarios(soloActivos(dataHorarios));

        const ofertasActivas = soloActivos(dataOfertas);
        setOfertas(ofertasActivas);
        setOfertasFiltradas(ofertasActivas);
      } else {
        const dataMiHorario = await fetchResiliente(['/Oferta/mi-horario', '/oferta/mi-horario']);
        setMiHorario(dataMiHorario);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (rolUsuario !== null) {
      cargarDatos();
    }
  }, [rolUsuario]);

  // ==========================================
  // FILTROS EN CASCADA CON VALIDACIÓN SEGURA DE PROPIEDADES
  // ==========================================
  useEffect(() => {
    if (idCarrera) {
      setModulosFiltrados(
        modulos.filter(m => {
          const carId = m?.idcarrera ?? m?.id_carrera ?? m?.idCarrera;
          return carId !== undefined && carId !== null && carId.toString() === idCarrera.toString();
        })
      );
      setOfertasFiltradas(
        ofertas.filter(o => {
          const carId = o?.idcarrera ?? o?.id_carrera ?? o?.idCarrera;
          return carId !== undefined && carId !== null && carId.toString() === idCarrera.toString();
        })
      );
    } else {
      setModulosFiltrados([]);
      setOfertasFiltradas(ofertas);
    }
    setIdModulo('');
    setIdSeccion('');
  }, [idCarrera, modulos, ofertas]);

  useEffect(() => {
    if (idModulo) {
      setSeccionesFiltradas(
        secciones.filter(s => {
          const modId = s?.idmodulo ?? s?.id_modulo ?? s?.idmatemo ?? s?.idModulo;
          return modId !== undefined && modId !== null && modId.toString() === idModulo.toString();
        })
      );
    } else {
      setSeccionesFiltradas([]);
    }
    setIdSeccion('');
  }, [idModulo, secciones]);

  useEffect(() => {
    if (idSeccion) {
      setOfertasFiltradas(
        ofertas.filter(o => {
          const secId = o?.idsecc ?? o?.id_seccion ?? o?.idSeccion;
          return secId !== undefined && secId !== null && secId.toString() === idSeccion.toString();
        })
      );
    }
  }, [idSeccion, ofertas]);

  // ==========================================
  // ACCIONES HTTP RESILIENTES
  // ==========================================
  const postResiliente = async (rutas, payload) => {
    let ultimoError = null;
    for (const ruta of rutas) {
      try {
        return await api.post(ruta, payload);
      } catch (err) {
        ultimoError = err;
      }
    }
    throw ultimoError;
  };

  const quickAddCarrera = async () => {
    const { value: formValues } = await MySwal.fire({
      title: 'Añadir Nueva Carrera',
      html:
        '<input id="swal-car1" class="swal2-input" placeholder="Nombre de la Carrera">' +
        '<input id="swal-car2" class="swal2-input" placeholder="Descripción">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      confirmButtonColor: '#facc15',
      preConfirm: () => [document.getElementById('swal-car1').value, document.getElementById('swal-car2').value]
    });

    if (formValues && formValues[0]) {
      try {
        const payload = { nombrecarrera: formValues[0], descripcion: formValues[1], activo: true };
        const res = await postResiliente(['/carrera/', '/carreras/'], payload);
        await cargarDatos();
        const newId = res?.data?.idcarrera ?? res?.data?.id;
        if (newId) setIdCarrera(newId);
        show_alert('Carrera creada con éxito', 'success');
      } catch (error) {
        show_alert('No se pudo crear la carrera', 'error');
      }
    }
  };

  const quickAddModulo = async () => {
    if (!idCarrera) return show_alert('Selecciona una carrera primero', 'warning');
    const { value: formValues } = await MySwal.fire({
      title: 'Añadir Módulo / Materia',
      html:
        '<input id="swal-mod1" class="swal2-input" placeholder="Nombre del Módulo">' +
        '<input id="swal-mod2" class="swal2-input" placeholder="Descripción">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      confirmButtonColor: '#facc15',
      preConfirm: () => [document.getElementById('swal-mod1').value, document.getElementById('swal-mod2').value]
    });

    if (formValues && formValues[0]) {
      try {
        const payload = { nombremodulo: formValues[0], descripcion: formValues[1], idcarrera: parseInt(idCarrera), activo: true };
        const res = await postResiliente(['/modulo/', '/modulos/'], payload);
        await cargarDatos();
        const newId = res?.data?.idmodulo ?? res?.data?.id;
        if (newId) setIdModulo(newId);
        show_alert('Módulo creado con éxito', 'success');
      } catch (error) {
        show_alert('No se pudo crear el módulo', 'error');
      }
    }
  };

  const quickAddSeccion = async () => {
    if (!idModulo) return show_alert('Selecciona un módulo primero', 'warning');
    const { value: nombre } = await MySwal.fire({
      title: 'Añadir Sección',
      input: 'text',
      inputPlaceholder: 'Ej. Sección A',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      confirmButtonColor: '#facc15',
    });

    if (nombre) {
      try {
        const payload = { nomsecc: nombre, idmodulo: parseInt(idModulo), activo: true }; 
        const res = await postResiliente(['/seccion/', '/secciones/'], payload);
        await cargarDatos();
        const newId = res?.data?.idsecc ?? res?.data?.id;
        if (newId) setIdSeccion(newId);
        show_alert('Sección creada con éxito', 'success');
      } catch (error) {
        show_alert('No se pudo crear la sección', 'error');
      }
    }
  };

  const crearOferta = async (e) => {
    e.preventDefault();
    if (!idCarrera || !idSeccion) {
      return show_alert('Debes seleccionar Carrera y Sección', 'warning');
    }

    try {
      const payload = {
        idcarrera: parseInt(idCarrera),
        idsecc: parseInt(idSeccion),
        horario: idHorario ? parseInt(idHorario) : null
      };
      
      await postResiliente(['/Oferta/', '/oferta/', '/ofertas/'], payload);
      show_alert('Oferta Académica Registrada', 'success');
      setIdHorario('');
      cargarDatos();
    } catch (error) {
      show_alert('Error al consolidar la oferta', 'error');
    }
  };

  const eliminarOferta = async (idseccmo) => {
    const confirm = await MySwal.fire({
      title: '¿Eliminar Oferta?',
      text: 'Esta acción desactivará la oferta académica.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444'
    });

    if (confirm.isConfirmed) {
      try {
        try {
          await api.delete(`/Oferta/${idseccmo}`);
        } catch (e) {
          await api.delete(`/oferta/${idseccmo}`);
        }
        show_alert('Oferta eliminada', 'success');
        cargarDatos();
      } catch (error) {
        show_alert('Error al eliminar la oferta', 'error');
      }
    }
  };

  // ==========================================
  // RENDERIZADO
  // ==========================================
  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p className="text-xl font-bold text-yellow-400">Cargando datos de la academia...</p>
      </div>
    );
  }

  return (
    <div className="CRUD p-6 min-h-screen bg-black text-white pt-24">
      <div className="container mx-auto max-w-6xl">
        
        <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
          {esGestion ? "Gestión de Oferta Académica" : "Mi Oferta y Horario Académico"}
        </h2>

        {/* VISTA DE ADMINISTRACIÓN */}
        {esGestion ? (
          <>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                
                {/* 1. CARRERA */}
                <div>
                  <label className="block text-sm font-bold mb-2 text-yellow-400">1. Carrera Base</label>
                  <div className="flex gap-2">
                    <select 
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white outline-none"
                      value={idCarrera}
                      onChange={(e) => setIdCarrera(e.target.value)}
                    >
                      <option value="">-- Seleccionar --</option>
                      {carreras.map(c => (
                        <option key={c?.idcarrera ?? c?.id ?? Math.random()} value={c?.idcarrera ?? c?.id ?? ''}>
                          {c?.nombrecarrera ?? c?.nombre ?? "Carrera sin nombre"}
                        </option>
                      ))}
                    </select>
                    <button onClick={quickAddCarrera} className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-500" title="Añadir Carrera">
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </div>
                </div>

                {/* 2. MÓDULO */}
                <div>
                  <label className="block text-sm font-bold mb-2 text-yellow-400">2. Módulo (Materia)</label>
                  <div className="flex gap-2">
                    <select 
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white outline-none disabled:opacity-50"
                      value={idModulo}
                      onChange={(e) => setIdModulo(e.target.value)}
                      disabled={!idCarrera}
                    >
                      <option value="">-- Seleccionar --</option>
                      {modulosFiltrados.map(m => (
                        <option key={m?.idmodulo ?? m?.id ?? Math.random()} value={m?.idmodulo ?? m?.id ?? ''}>
                          {m?.nombremodulo ?? m?.nombre ?? "Módulo sin nombre"}
                        </option>
                      ))}
                    </select>
                    <button onClick={quickAddModulo} disabled={!idCarrera} className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-500 disabled:opacity-50" title="Añadir Módulo">
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </div>
                </div>

                {/* 3. SECCIÓN */}
                <div>
                  <label className="block text-sm font-bold mb-2 text-yellow-400">3. Sección (Grupo)</label>
                  <div className="flex gap-2">
                    <select 
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white outline-none disabled:opacity-50"
                      value={idSeccion}
                      onChange={(e) => setIdSeccion(e.target.value)}
                      disabled={!idModulo}
                    >
                      <option value="">-- Seleccionar --</option>
                      {seccionesFiltradas.map(s => (
                        <option key={s?.idsecc ?? s?.id ?? Math.random()} value={s?.idsecc ?? s?.id ?? ''}>
                          {s?.nomsecc ?? s?.nombreseccion ?? s?.nombre ?? "Sección sin nombre"}
                        </option>
                      ))}
                    </select>
                    <button onClick={quickAddSeccion} disabled={!idModulo} className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-500 disabled:opacity-50" title="Añadir Sección">
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>

              <hr className="border-gray-700 my-6" />

              <form onSubmit={crearOferta} className="flex flex-col md:flex-row items-end gap-4">
                <div className="w-full md:w-2/3">
                  <label className="block text-sm font-bold mb-2 text-gray-300">
                    4. Asignar Horario (Opcional)
                  </label>
                  <select 
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                    value={idHorario}
                    onChange={(e) => setIdHorario(e.target.value)}
                  >
                    <option value="">-- Sin horario asignado --</option>
                    {horarios.map(h => (
                      <option key={h?.idhorario ?? h?.id ?? Math.random()} value={h?.idhorario ?? h?.id ?? ''}>
                        ID: {h?.idhorario ?? h?.id} | {h?.dia} | Bloque: {h?.bloque} | Salón: {h?.salon}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full md:w-1/3 bg-yellow-400 text-black font-bold py-2 px-4 rounded hover:bg-yellow-300 transition h-[42px]"
                  disabled={!idSeccion}
                >
                  <i className="fa-solid fa-link mr-2"></i> Consolidar Oferta
                </button>
              </form>
            </div>

            {/* TABLA DE OFERTAS */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">
                Ofertas Registradas {idCarrera ? "(Filtradas)" : ""}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-800 border-b border-gray-700">
                    <tr>
                      <th className="p-3">ID Oferta</th>
                      <th className="p-3">Carrera ID</th>
                      <th className="p-3">Sección ID</th>
                      <th className="p-3">Horario</th>
                      <th className="p-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ofertasFiltradas.length > 0 ? (
                      ofertasFiltradas.map((o, i) => (
                        <tr key={o?.idseccmo ?? i} className="border-b border-gray-700 hover:bg-gray-800">
                          <td className="p-3">{o?.idseccmo}</td>
                          <td className="p-3">{o?.idcarrera}</td>
                          <td className="p-3">{o?.idsecc}</td>
                          <td className="p-3">
                            {o?.horario ? (
                              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">Asignado: {o.horario}</span>
                            ) : (
                              <span className="text-gray-500 italic">No asignado</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <button 
                              onClick={() => eliminarOferta(o?.idseccmo)}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500 transition"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center p-6 text-gray-500">
                          No hay ofertas registradas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (

        /* VISTA ESTUDIANTE */
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-bold text-yellow-400 mb-4 border-b border-gray-700 pb-2">
              <i className="fa-solid fa-calendar-days mr-2"></i> Mis Horarios y Sección Asignada
            </h3>

            {miHorario.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {miHorario.map((item, index) => (
                  <div key={item?.idseccmo ?? index} className="bg-gray-800 border border-gray-700 rounded-lg p-5 shadow">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded font-bold uppercase">
                        {item?.carrera_rel?.nombrecarrera || "Carrera"}
                      </span>
                      <span className="text-sm font-semibold text-gray-400">
                        Inscripción #{item?.idseccmo}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-lg font-bold text-white">
                        <i className="fa-solid fa-users mr-2 text-yellow-400"></i>
                        Sección: <span className="text-yellow-400">{item?.seccion_rel?.nomsecc || "Sin Asignar"}</span>
                      </p>

                      <div className="bg-gray-900 p-3 rounded border border-gray-700 space-y-1">
                        <p className="text-sm text-gray-300">
                          <i className="fa-solid fa-calendar text-blue-400 mr-2"></i>
                          Día: <strong className="text-white">{item?.horario_rel?.dia || "Por definir"}</strong>
                        </p>
                        <p className="text-sm text-gray-300">
                          <i className="fa-solid fa-clock text-green-400 mr-2"></i>
                          Bloque: <strong className="text-white">{item?.horario_rel?.bloque ? `Bloque ${item.horario_rel.bloque}` : "N/A"}</strong>
                        </p>
                        <p className="text-sm text-gray-300">
                          <i className="fa-solid fa-door-open text-purple-400 mr-2"></i>
                          Salón: <strong className="text-white">{item?.horario_rel?.salon || "Por asignar"}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 bg-gray-800/50 rounded-lg border border-gray-700">
                <i className="fa-solid fa-folder-open text-5xl text-gray-500 mb-4"></i>
                <h4 className="text-xl font-bold text-gray-300 mb-2">No tienes secciones ni horarios registrados</h4>
                <p className="text-gray-400 text-sm">
                  Consulta con la coordinación de tu carrera o espera el proceso de inscripción.
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default CrudOferta;