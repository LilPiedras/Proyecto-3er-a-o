import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const MySwal = withReactContent(Swal);

const CrudOferta = () => {
  const [rolUsuario, setRolUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Estados para listas de los Selects
  const [materias, setMaterias] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [horarios, setHorarios] = useState([]); 
  
  const [asignaciones, setAsignaciones] = useState([]); 

  // Selecciones del formulario
  const [idMateria, setIdMateria] = useState('');
  const [ciEmpleado, setCiEmpleado] = useState('');
  const [idModulo, setIdModulo] = useState('');
  const [idHorario, setIdHorario] = useState('');

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
      return 5;
    };

    setRolUsuario(obtenerRol());
  }, []);

  const esGestion = [1, 2, 3, "1", "2", "3", "Director", "Sub Director", "Coordinador"].includes(rolUsuario);

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
        const [dataMaterias, dataDocentes, dataModulos, dataHorarios, dataAsignaciones] = await Promise.all([
          fetchResiliente(['/materia/', '/materias/']),
          fetchResiliente(['/empleado/', '/empleados/']),
          fetchResiliente(['/modulo/', '/modulos/']),
          fetchResiliente(['/horarios/', '/horario/']),
          fetchResiliente(['/api/horarios-materias'])
        ]);

        const soloActivos = (lista) => 
          Array.isArray(lista) ? lista.filter(item => item && typeof item === 'object' && item.activo !== false) : [];

        setMaterias(soloActivos(dataMaterias));
        setDocentes(soloActivos(dataDocentes));
        setModulos(soloActivos(dataModulos));
        setHorarios(soloActivos(dataHorarios));
        setAsignaciones(dataAsignaciones || []);
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

  const crearAsignacion = async (e) => {
    e.preventDefault();
    if (!idMateria || !ciEmpleado || !idModulo || !idHorario) {
      return show_alert('Debes completar todos los campos', 'warning');
    }

    try {
      // Se envía objeto JSON formateado para empatar con Pydantic en FastAPI
      const payload = {
        idmateria: parseInt(idMateria, 10),
        ciempleado: String(ciEmpleado),
        idmodulo: parseInt(idModulo, 10),
        idhorario: parseInt(idHorario, 10)
      };

      await api.post('/api/asignar-horario', payload);
      
      show_alert('Asignación Académica Registrada', 'success');
      
      setIdMateria('');
      setCiEmpleado('');
      setIdModulo('');
      setIdHorario('');
      cargarDatos();
    } catch (error) {
      console.error("Error en POST:", error);
      show_alert('Error al consolidar la asignación', 'error');
    }
  };

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
          {esGestion ? "Asignación de Horarios y Docentes" : "Mis Horarios Asignados"}
        </h2>

        {esGestion && (
          <>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8 shadow-lg">
              <form onSubmit={crearAsignacion}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  
                  {/* 1. MATERIA */}
                  <div>
                    <label className="block text-sm font-bold mb-2 text-yellow-400">1. Materia</label>
                    <select 
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white outline-none"
                      value={idMateria}
                      onChange={(e) => setIdMateria(e.target.value)}
                      required
                    >
                      <option value="">-- Seleccionar --</option>
                      {materias.map(m => (
                        <option key={m.idmateria} value={m.idmateria}>
                          {m.nombremateria}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. DOCENTE */}
                  <div>
                    <label className="block text-sm font-bold mb-2 text-yellow-400">2. Docente</label>
                    <select 
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white outline-none"
                      value={ciEmpleado}
                      onChange={(e) => setCiEmpleado(e.target.value)}
                      required
                    >
                      <option value="">-- Seleccionar --</option>
                      {docentes.map(d => (
                        <option key={d.ciempleado} value={d.ciempleado}>
                          {d.nombreempleado} {d.apellidoempleado}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. MÓDULO */}
                  <div>
                    <label className="block text-sm font-bold mb-2 text-yellow-400">3. Módulo</label>
                    <select 
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white outline-none"
                      value={idModulo}
                      onChange={(e) => setIdModulo(e.target.value)}
                      required
                    >
                      <option value="">-- Seleccionar --</option>
                      {modulos.map(mo => (
                        <option key={mo.idmodulo} value={mo.idmodulo}>
                          {mo.nombremodulo}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 4. HORARIO */}
                  <div>
                    <label className="block text-sm font-bold mb-2 text-yellow-400">4. Horario</label>
                    <select 
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white outline-none"
                      value={idHorario}
                      onChange={(e) => setIdHorario(e.target.value)}
                      required
                    >
                      <option value="">-- Seleccionar --</option>
                      {horarios.map(h => (
                        <option key={h.idhorario} value={h.idhorario}>
                          {h.dia ? `${h.dia} | Bloque: ${h.bloque || h.idbloque || ''} | Salón: ${h.salon || 'S/N'}` : `Horario #${h.idhorario}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <hr className="border-gray-700 my-4" />

                <div className="flex justify-end mt-4">
                  <button 
                    type="submit" 
                    className="w-full md:w-1/3 bg-yellow-400 text-black font-bold py-2 px-4 rounded hover:bg-yellow-300 transition"
                  >
                    <i className="fa-solid fa-save mr-2"></i> Guardar Asignación
                  </button>
                </div>
              </form>
            </div>

            {/* TABLA DE ASIGNACIONES */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">
                Horarios y Materias Asignadas
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-800 border-b border-gray-700 text-yellow-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-3">ID Materia</th>
                      <th className="p-3">Materia</th>
                      <th className="p-3">Módulo</th>
                      <th className="p-3">Docente</th>
                      <th className="p-3">Día</th>
                      <th className="p-3">Horario</th>
                      <th className="p-3">Salón</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asignaciones.length > 0 ? (
                      asignaciones.map((a, i) => (
                        <tr key={i} className="border-b border-gray-700 hover:bg-gray-800">
                          <td className="p-3 font-mono text-gray-400">#{a.idmateria}</td>
                          <td className="p-3 text-yellow-400 font-semibold">{a.materia}</td>
                          <td className="p-3 text-white font-medium">{a.modulo}</td>
                          <td className="p-3 text-gray-300">{a.docente}</td>
                          <td className="p-3">{a.dia}</td>
                          <td className="p-3">
                            <span className="bg-green-600/30 text-green-300 border border-green-500/30 text-xs px-2 py-1 rounded">
                              {a.horainicio} - {a.horafin}
                            </span>
                          </td>
                          <td className="p-3 text-gray-300">{a.salon}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center p-6 text-gray-500">
                          No hay asignaciones registradas o no se pudo cargar la vista.
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