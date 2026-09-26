import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const MySwal = withReactContent(Swal);

const CrudOferta = () => {
  
  const [carreras, setCarreras] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [horarios, setHorarios] = useState([]); 
  const [ofertas, setOfertas] = useState([]); 
  
  const [modulosFiltrados, setModulosFiltrados] = useState([]);
  const [seccionesFiltradas, setSeccionesFiltradas] = useState([]);
  const [ofertasFiltradas, setOfertasFiltradas] = useState([]);

  // 3. Selecciones del usuario
  const [idCarrera, setIdCarrera] = useState('');
  const [idModulo, setIdModulo] = useState('');
  const [idSeccion, setIdSeccion] = useState('');
  const [idHorario, setIdHorario] = useState(''); // Opcional

  // ==========================================
  // CARGA INICIAL DE DATOS
  // ==========================================
  const cargarDatos = async () => {
    try {
      // Ajusta las rutas según los endpoints reales de tu FastAPI
      const [resCarreras, resModulos, resSecciones, resHorarios, resOfertas] = await Promise.all([
        api.get('/carrera/'),
        api.get('/modulo/'), // o /materia/ según lo tengas
        api.get('/seccion/'),
        api.get('/horario/'),
        api.get('/oferta_seccion/') // El endpoint de la tabla oferta_seccion
      ]);
      
      setCarreras(Array.isArray(resCarreras.data) ? resCarreras.data : []);
      setModulos(Array.isArray(resModulos.data) ? resModulos.data : []);
      setSecciones(Array.isArray(resSecciones.data) ? resSecciones.data : []);
      setHorarios(Array.isArray(resHorarios.data) ? resHorarios.data : []);
      setOfertas(Array.isArray(resOfertas.data) ? resOfertas.data : []);
      setOfertasFiltradas(Array.isArray(resOfertas.data) ? resOfertas.data : []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (idCarrera) {
      setModulosFiltrados(modulos.filter(m => (m.idcarrera || m.id_carrera).toString() === idCarrera.toString()));
      // Filtrar la tabla
      setOfertasFiltradas(ofertas.filter(o => (o.idcarrera || o.id_carrera).toString() === idCarrera.toString()));
    } else {
      setModulosFiltrados([]);
      setOfertasFiltradas(ofertas); 
    }
    setIdModulo('');
    setIdSeccion('');
  }, [idCarrera, modulos, ofertas]);

  // Nivel 2: Al cambiar Módulo
  useEffect(() => {
    if (idModulo) {
      setSeccionesFiltradas(secciones.filter(s => (s.id_modulo || s.idmodulo || s.idmatemo).toString() === idModulo.toString()));
    } else {
      setSeccionesFiltradas([]);
    }
    setIdSeccion('');
  }, [idModulo, secciones]);

  // Nivel 3: Al cambiar Sección
  useEffect(() => {
    if (idSeccion) {
      setOfertasFiltradas(ofertas.filter(o => (o.idsecc || o.id_seccion).toString() === idSeccion.toString()));
    }
  }, [idSeccion, ofertas]);


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
        const payload = { nombrecarrera: formValues[0], descripcion: formValues[1] };
        const res = await api.post('/carrera/', payload);
        await cargarDatos();
        setIdCarrera(res.data.idcarrera || res.data.id);
        show_alert('Carrera creada', 'success');
      } catch (error) {
        show_alert('Error al crear carrera', 'error');
      }
    }
  };

  const quickAddModulo = async () => {
    if (!idCarrera) return show_alert('Primero selecciona una carrera', 'warning');
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
        const payload = { nombremodulo: formValues[0], descripcion: formValues[1], idcarrera: idCarrera };
        const res = await api.post('/modulo/', payload);
        await cargarDatos();
        setIdModulo(res.data.idmodulo || res.data.id);
        show_alert('Módulo creado', 'success');
      } catch (error) {
        show_alert('Error al crear módulo', 'error');
      }
    }
  };

  const quickAddSeccion = async () => {
    if (!idModulo) return show_alert('Primero selecciona un módulo', 'warning');
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
        const payload = { nomsecc: nombre, idmodulo: idModulo }; 
        const res = await api.post('/seccion/', payload);
        await cargarDatos();
        setIdSeccion(res.data.idsecc || res.data.id);
        show_alert('Sección creada', 'success');
      } catch (error) {
        show_alert('Error al crear sección', 'error');
      }
    }
  };


  const crearOferta = async (e) => {
    e.preventDefault();
    if (!idCarrera || !idSeccion) {
      return show_alert('Debes seleccionar al menos Carrera y Sección', 'warning');
    }

    try {
      const payload = {
        idcarrera: idCarrera,
        idsecc: idSeccion,
        horario: idHorario ? idHorario : null // Opcional
      };
      
      await api.post('/oferta_seccion/', payload);
      show_alert('Oferta Académica Registrada', 'success');
      setIdHorario(''); // Limpiamos solo el horario para seguir agregando rápido
      cargarDatos();
    } catch (error) {
      show_alert('Error al registrar la oferta', 'error');
    }
  };

  return (
    <div className="CRUD p-6 min-h-screen bg-black text-white">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">Gestión de Oferta Académica</h2>
        
        {/* PANEL SUPERIOR: CONFIGURACIÓN EN CASCADA */}
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
                    <option key={c.idcarrera || c.id} value={c.idcarrera || c.id}>{c.nombrecarrera}</option>
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
                    <option key={m.idmodulo || m.id} value={m.idmodulo || m.id}>{m.nombremodulo}</option>
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
                    <option key={s.idsecc || s.id} value={s.idsecc || s.id}>{s.nomsecc || s.nombreseccion}</option>
                  ))}
                </select>
                <button onClick={quickAddSeccion} disabled={!idModulo} className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-500 disabled:opacity-50" title="Añadir Sección">
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>
          </div>

          <hr className="border-gray-700 my-6" />

          {/* FORMULARIO FINAL DE CONSOLIDACIÓN */}
          <form onSubmit={crearOferta} className="flex flex-col md:flex-row items-end gap-4">
            <div className="w-full md:w-2/3">
              <label className="block text-sm font-bold mb-2 text-gray-300">
                4. Asignar Horario (Opcional - Se crean en el CRUD de Horarios)
              </label>
              <select 
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                value={idHorario}
                onChange={(e) => setIdHorario(e.target.value)}
              >
                <option value="">-- Sin horario asignado --</option>
                {horarios.map(h => (
                  <option key={h.idhorario || h.id} value={h.idhorario || h.id}>
                    {/* Ajusta cómo muestras la info del horario dependiendo de tu backend */}
                    ID: {h.idhorario || h.id} | {h.dia} | {h.docente}
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

        {/* TABLA DE OFERTAS CON FILTROS APLICADOS */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">
            Ofertas Registradas {idCarrera ? "(Filtradas)" : ""}
          </h3>
          <div className="overflow-x-auto">
            <table className="table table-dark table-bordered w-full text-left">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-3">ID Oferta</th>
                  <th className="p-3">Carrera ID</th>
                  <th className="p-3">Sección ID</th>
                  <th className="p-3">Horario ID</th>
                  <th className="p-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {ofertasFiltradas.length > 0 ? (
                  ofertasFiltradas.map((o, i) => (
                    <tr key={o.idseccmo || i} className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="p-3">{o.idseccmo}</td>
                      <td className="p-3">{o.idcarrera}</td>
                      <td className="p-3">{o.idsecc}</td>
                      <td className="p-3">
                        {o.horario ? (
                          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">Asignado: {o.horario}</span>
                        ) : (
                          <span className="text-gray-500 italic">No asignado</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500">
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-6 text-gray-500">
                      No hay ofertas configuradas con estos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CrudOferta;