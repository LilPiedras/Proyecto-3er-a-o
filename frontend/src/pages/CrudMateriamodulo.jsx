import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const MySwal = withReactContent(Swal);

const CrudModuloMateria = () => {
  const [modulos, setModulos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [relaciones, setRelaciones] = useState([]); 

  const [idModuloSeleccionado, setIdModuloSeleccionado] = useState('');
  const [cargando, setCargando] = useState(false);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const resModulos = await api.get('/modulo/');
      const resMaterias = await api.get('/materia/');
      
      let resRelaciones = { data: [] };
      const rutasRelaciones = ['/Materias Modulo/', '/api/Materias Modulo/', '/materias-modulo/'];
      for (const ruta of rutasRelaciones) {
        try {
          resRelaciones = await api.get(ruta);
          if (resRelaciones && resRelaciones.data) break;
        } catch (e) {
          // Intenta con la siguiente ruta
        }
      }

      setModulos(Array.isArray(resModulos.data) ? resModulos.data : []);
      setMaterias(Array.isArray(resMaterias.data) ? resMaterias.data : []);
      setRelaciones(Array.isArray(resRelaciones.data) ? resRelaciones.data : []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const crearModulo = async () => {
    const { value: nombre } = await MySwal.fire({
      title: 'Nuevo Módulo',
      input: 'text',
      inputPlaceholder: 'Ej. Módulo 1...',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      confirmButtonColor: '#facc15'
    });

    if (nombre) {
      try {
        await api.post('/modulo/', { nombremodulo: nombre, activo: true });
        show_alert('Módulo creado', 'success');
        cargarDatos();
      } catch (error) {
        show_alert('Error al crear módulo', 'error');
      }
    }
  };

  const editarModulo = async () => {
    const moduloActual = modulos.find(m => (m.idmodulo || m.id)?.toString() === idModuloSeleccionado?.toString());
    if (!moduloActual) return show_alert('Selecciona un módulo válido', 'error');

    const { value: nuevoNombre } = await MySwal.fire({
      title: 'Editar Módulo',
      input: 'text',
      inputValue: moduloActual.nombremodulo || moduloActual.nombre,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      confirmButtonColor: '#3b82f6'
    });

    if (nuevoNombre) {
      try {
        const idTarget = moduloActual.idmodulo || moduloActual.id;
        await api.put(`/modulo/${idTarget}`, { nombremodulo: nuevoNombre });
        show_alert('Módulo actualizado', 'success');
        cargarDatos();
      } catch (error) {
        show_alert('Error al actualizar módulo', 'error');
      }
    }
  };

  const eliminarModulo = async () => {
    if (!idModuloSeleccionado) return;
    const confirm = await MySwal.fire({
      title: '¿Eliminar Módulo?',
      text: 'Se eliminará el módulo seleccionado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#ef4444'
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/modulo/${idModuloSeleccionado}`);
        show_alert('Módulo eliminado', 'success');
        setIdModuloSeleccionado('');
        cargarDatos();
      } catch (error) {
        show_alert('Error al eliminar', 'error');
      }
    }
  };

  const crearMateria = async () => {
    const { value: formValues } = await MySwal.fire({
      title: 'Nueva Materia',
      html:
        '<input id="swal-mat1" class="swal2-input" placeholder="Nombre de la Materia">' +
        '<input id="swal-mat2" class="swal2-input" placeholder="Docente (Opcional)">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      confirmButtonColor: '#facc15',
      preConfirm: () => [
        document.getElementById('swal-mat1').value, 
        document.getElementById('swal-mat2').value
      ]
    });

    if (formValues && formValues[0]) {
      try {
        await api.post('/materia/', { 
          nombremateria: formValues[0], 
          docente: formValues[1] ? formValues[1] : null, 
          activo: true 
        });
        show_alert('Materia creada', 'success');
        cargarDatos();
      } catch (error) {
        show_alert('Error al crear materia', 'error');
      }
    }
  };

  const editarMateria = async (mat) => {
    const idMat = mat?.idmateria || mat?.id;
    if (!idMat) return;
    
    const { value: formValues } = await MySwal.fire({
      title: 'Editar Materia',
      html:
        `<input id="swal-mat1" class="swal2-input" placeholder="Nombre" value="${mat.nombremateria || mat.nombre || ''}">` +
        `<input id="swal-mat2" class="swal2-input" placeholder="Docente" value="${mat.docente || ''}">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      confirmButtonColor: '#3b82f6',
      preConfirm: () => [
        document.getElementById('swal-mat1').value, 
        document.getElementById('swal-mat2').value
      ]
    });

    if (formValues && formValues[0]) {
      try {
        await api.put(`/materia/${idMat}`, { 
          nombremateria: formValues[0], 
          docente: formValues[1] ? formValues[1] : null 
        });
        show_alert('Materia actualizada', 'success');
        cargarDatos();
      } catch (error) {
        show_alert('Error al actualizar materia', 'error');
      }
    }
  };

  const eliminarMateria = async (idmateria) => {
    if (!idmateria) return;
    const confirm = await MySwal.fire({
      title: '¿Eliminar Materia?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#ef4444'
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/materia/${idmateria}`);
        show_alert('Materia eliminada', 'success');
        cargarDatos();
      } catch (error) {
        show_alert('Error al eliminar', 'error');
      }
    }
  };

  const asignarMateriaAModulo = async (idmateria) => {
    if (!idModuloSeleccionado) return show_alert('Selecciona un módulo', 'warning');
    
    const datosAEnviar = {
      idmatemo: 0,
      idmodulo: parseInt(idModuloSeleccionado),
      idmateria: parseInt(idmateria)
    };

    const rutasPosibles = ['/Materias Modulo/', '/api/Materias Modulo/'];
    let exito = false;

    for (const ruta of rutasPosibles) {
      try {
        await api.post(ruta, datosAEnviar);
        exito = true;
        break;
      } catch (error) {
        console.warn(`Falló con la ruta ${ruta}:`, error.response?.data);
      }
    }

    if (exito) {
      show_alert('Materia vinculada', 'success');
      cargarDatos();
    } else {
      show_alert('Error al vincular materia', 'error');
    }
  };

  const desvincularMateria = async (idmatemo) => {
    const rutasPosibles = [`/Materias Modulo/${idmatemo}`, `/api/Materias Modulo/${idmatemo}`];
    let exito = false;

    for (const ruta of rutasPosibles) {
      try {
        await api.delete(ruta);
        exito = true;
        break;
      } catch (error) {
        // Intenta la siguiente
      }
    }

    if (exito) {
      show_alert('Materia removida', 'success');
      cargarDatos();
    } else {
      show_alert('Error al remover', 'error');
    }
  };

  const relacionesDelModulo = relaciones.filter(r => 
    (r?.idmodulo || r?.id_modulo)?.toString() === idModuloSeleccionado?.toString()
  );
  
  const idsMateriasDelModulo = relacionesDelModulo.map(r => 
    (r?.idmateria || r?.id_materia)?.toString()
  );

  return (
    <div className="p-6 min-h-screen bg-black text-white pt-24">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">Gestor de Módulos y Materias</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* COLUMNA IZQUIERDA */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">1. Selección de Módulo</h3>
              <button onClick={crearModulo} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500">
                + Nuevo
              </button>
            </div>
            
            <div className="flex gap-2 mb-6">
              <select 
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                value={idModuloSeleccionado}
                onChange={(e) => setIdModuloSeleccionado(e.target.value)}
              >
                <option value="">-- Selecciona un Módulo --</option>
                {modulos.map((m) => {
                  const idVal = m.idmodulo || m.id;
                  const nombreVal = m.nombremodulo || m.nombre;
                  return (
                    <option key={idVal} value={idVal}>
                      {nombreVal}
                    </option>
                  );
                })}
              </select>
              
              <button onClick={editarModulo} disabled={!idModuloSeleccionado} className="bg-gray-700 text-white px-3 rounded hover:bg-gray-600 disabled:opacity-50">
                <i className="fa-solid fa-pen"></i>
              </button>
              <button onClick={eliminarModulo} disabled={!idModuloSeleccionado} className="bg-red-600 text-white px-3 rounded hover:bg-red-500 disabled:opacity-50">
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">2. Banco de Materias</h3>
              <button onClick={crearMateria} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-500">
                + Nueva
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto bg-gray-800 rounded border border-gray-700 p-2 space-y-2">
              {materias.map((mat) => {
                const idMat = mat.idmateria || mat.id;
                const estaAsignada = idsMateriasDelModulo.includes(idMat?.toString());

                return (
                  <div key={idMat} className="flex justify-between items-center p-2 bg-gray-900 rounded border border-gray-700">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{mat.nombremateria || mat.nombre}</span>
                      <span className="text-xs text-gray-400">Docente: {mat.docente || 'N/A'}</span>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <button 
                        onClick={() => asignarMateriaAModulo(idMat)}
                        disabled={!idModuloSeleccionado || estaAsignada}
                        className="bg-yellow-400 text-black px-2 py-1 rounded text-xs disabled:opacity-50 font-bold hover:bg-yellow-300"
                      >
                        {estaAsignada ? 'Asignada' : 'Vincular'}
                      </button>
                      <button onClick={() => editarMateria(mat)} className="text-blue-400 hover:text-blue-300 px-1 text-sm"><i className="fa-solid fa-pen"></i></button>
                      <button onClick={() => eliminarMateria(idMat)} className="text-red-400 hover:text-red-300 px-1 text-sm"><i className="fa-solid fa-trash"></i></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-lg">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">Materias dentro del Módulo</h3>
            
            {!idModuloSeleccionado ? (
              <p className="text-gray-500 text-center mt-10">Selecciona un módulo en la izquierda.</p>
            ) : (
              <ul className="space-y-2">
                {relacionesDelModulo.length > 0 ? (
                  relacionesDelModulo.map((rel) => {
                    const idMateriaRel = rel.idmateria || rel.id_materia;
                    const matInfo = materias.find(m => (m.idmateria || m.id)?.toString() === idMateriaRel?.toString());
                    const idRelacion = rel.idmatemo || rel.id;
                    
                    return (
                      <li key={idRelacion} className="bg-gray-800 p-3 rounded border border-gray-600 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-white block text-sm">
                             {matInfo?.nombremateria || matInfo?.nombre || 'Materia'}
                          </span>
                          <span className="text-gray-400 text-xs">Docente: {matInfo?.docente || 'Sin asignar'}</span>
                        </div>
                        <button 
                          onClick={() => desvincularMateria(idRelacion)}
                          className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-500"
                        >
                          <i className="fa-solid fa-xmark"></i> Quitar
                        </button>
                      </li>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center mt-4">Este módulo está vacío.</p>
                )}
              </ul>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CrudModuloMateria;