import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { TiPencil, TiTrash } from "react-icons/ti";
import api from '../api';
import { show_alert } from '../components/functions/Showpro_functions';

const CrudCursos = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [idcurso, setIdcurso] = useState(null);
  const [nomcurso, setNomcurso] = useState('');
  const [preciocurso, setPreciocurso] = useState('');
  const [nivelcur, setNivelcur] = useState('');
  const [docenasig, setDocenasig] = useState('');
  const [operation, setOperation] = useState(1);
  const [title, setTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/curso/');
      
      if (Array.isArray(data) && data.length > 0) {
        console.log("CLAVES DEL PRIMER ELEMENTO:", Object.keys(data[0]));
        console.log("VALOR DE idcurso:", data[0].idcurso);
      }

      setCursos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 404) {
        setCursos([]);
      } else {
        const detail = error.response?.data?.detail;
        show_alert(
          typeof detail === 'string' ? detail : 'Error al cargar los cursos',
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
    setIdcurso(null);
    setNomcurso('');
    setPreciocurso('');
    setNivelcur('');
    setDocenasig('');
  };

  const openModal = (
    op,
    id = null,
    nombre = '',
    precio = '',
    nivel = '',
    docente = ''
  ) => {
    limpiarFormulario();
    setOperation(op);
    setIdcurso(id);

    if (op === 1) {
      setTitle('Registrar Curso');
    } else {
      setTitle('Editar Curso');
      setNomcurso(nombre || '');
      setPreciocurso(precio || '');
      setNivelcur(nivel || '');
      setDocenasig(docente || '');
    }

    setIsModalOpen(true);
  };

  const validar = () => {
    if (nomcurso.trim() === '') {
      show_alert('Escribe el nombre del curso', 'warning');
      return;
    }
    if (preciocurso === '' || isNaN(Number(preciocurso))) {
      show_alert('Ingrese un precio válido', 'warning');
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
      docenasig: docenasig && docenasig.trim() !== '' ? docenasig.trim() : null,
    };

    if (operation === 1) {
      enviarSolicitud('POST', parametros);
    } else {
      if (!idcurso) {
        show_alert('No se detectó el ID del curso a actualizar', 'error');
        return;
      }
      enviarSolicitud('PUT', parametros, idcurso);
    }
  };

  const enviarSolicitud = async (metodo, parametros = null, idPath = null) => {
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
      setIsModalOpen(false);
      limpiarFormulario();
      await cargarCursos();
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === 'string' ? detail : 'Error en la operación',
        'error'
      );
    }
  };

  const deleteCurso = (id, nombre) => {
    if (!id) {
      show_alert('Error: El ID del curso no existe', 'error');
      return;
    }

    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: `¿Seguro de eliminar el curso "${nombre}"?`,
      text: 'No se podrá dar marcha atrás',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        enviarSolicitud('DELETE', null, id);
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
                className="bg-yellow-400 text-black font-bold px-6 py-2 rounded-lg hover:bg-yellow-300 transition"
                onClick={() => openModal(1)}
              >
                <i className="fa-solid fa-circle-plus"></i> Añadir Curso
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
                      <th>#</th>
                      <th>NOMBRE DEL CURSO</th>
                      <th>PRECIO ($)</th>
                      <th>NIVEL</th>
                      <th>DOCENTE ASIGNADO</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cursos.length > 0 ? (
                      cursos.map((c, index) => {
                        const idValido = c.idcurso ?? c.id ?? c.id_curso;

                        return (
                          <tr key={idValido || index}>
                            <td>{index + 1}</td>
                            <td>{c.nomcurso}</td>
                            <td>{c.preciocurso}</td>
                            <td>{c.nivelcur}</td>
                            <td>
                              {c.docenasig ? (
                                c.docenasig
                              ) : (
                                <span className="italic text-gray-400">Docente no asignado</span>
                              )}
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    openModal(
                                      2,
                                      idValido,
                                      c.nomcurso,
                                      c.preciocurso,
                                      c.nivelcur,
                                      c.docenasig
                                    )
                                  }
                                  className="bg-yellow-400 text-black p-1.5 rounded hover:bg-yellow-300 transition flex items-center justify-center"
                                  title="Editar"
                                >
                                  <TiPencil className="text-xl" />
                                </button>
                                <button
                                  onClick={() => deleteCurso(idValido, c.nomcurso)}
                                  className="bg-red-600 text-white p-1.5 rounded hover:bg-red-500 transition flex items-center justify-center"
                                  title="Eliminar"
                                >
                                  <TiTrash className="text-xl" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center p-4 text-gray-400">
                          No hay cursos registrados
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
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Nombre del Curso</label>
                <input
                  type="text"
                  maxLength={20}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Ej. Diseño de Moda"
                  value={nomcurso}
                  onChange={(e) => setNomcurso(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Precio ($)</label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Ej. 50"
                  value={preciocurso}
                  onChange={(e) => setPreciocurso(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Nivel</label>
                <input
                  type="text"
                  maxLength={100}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Ej. Básico / Intermedio / Avanzado"
                  value={nivelcur}
                  onChange={(e) => setNivelcur(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Docente Asignado (Opcional)</label>
                <input
                  type="text"
                  maxLength={30}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Dejar en blanco si no hay docente"
                  value={docenasig}
                  onChange={(e) => setDocenasig(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
=======
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { show_alert } from '../components/functions/Showpro_functions';

const url = 'http://localhost:5000/Asignar-Curso'; 

const initialProducts = [
    { id: 1, name: "Celular Y", description: "Color blanco de 128GB", price: 25899.99 },
    { id: 2, name: "iphone XS", description: "Bonito y caro", price: 25000 },
    { id: 3, name: "iPAD Air", description: "9na generación", price: 6000 },
    { id: 4, name: "Xiaomi Redmi 30", description: "Celular de 32Gb de RAM muy bbonito", price: 35000 },
    { id: 5, name: "Monitor", description: "80 pulgadas", price: 22499.99 },
    { id: 6, name: "iWatch", description: "reloj muy inteligente", price: 24500 }
];

const CrudCursos = () => {
    const [products, setProducts] = useState(initialProducts);
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [docen, setDocen] = useState('');
    const [operation, setOperation] = useState(1);
    const [title, setTitle] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        getProducts();
    }, []);

    const getProducts = async () => {
        try {
            const respuesta = await axios.get(url);
            if (Array.isArray(respuesta.data)) {
                setProducts(respuesta.data);
            } else if (respuesta.data && Array.isArray(respuesta.data.products)) {
                setProducts(respuesta.data.products);
            }
        } catch (error) {
            console.warn("Backend no conectado. Usando datos locales de prueba.");
        }
    };

    const openModal = (op, id = '', name = '', description = '', price = '', docen = '') => {
        setId('');
        setName('');
        setDescription('');
        setPrice('');
        setDocen('');
        setOperation(op);
        
        if (op === 1) {
            setTitle('Registrar Producto');
        } else if (op === 2) {
            setTitle('Editar Producto');
            setId(id);
            setName(name);
            setDescription(description);
            setPrice(price);
            setDocen(docen);
        }
        setIsModalOpen(true);
    };

    const validar = () => {
        if (name.trim() === '') {
            show_alert('Escribe el nombre del curso', 'warning');
        } else if (description.trim() === '') {
            show_alert('Escribe la descripción del curso', 'warning');
        } else if (price === '' || isNaN(price)) {
            show_alert('Escribe un precio válido para el curso (precio en pesos)', 'warning');
        }
        else {

            const docenteFinal = docen.trim() === '' ? 'Docente no asignado' : docen;

            const parametros = { 
                id: id, 
                name: name.trim(), 
                description: description.trim(), 
                price: parseFloat(price) ,
                docen: docenteFinal
            };
            const metodo = operation === 1 ? 'POST' : 'PUT';
            enviarSolicitud(metodo, parametros);
        }
    };

    const enviarSolicitud = async (metodo, parametros) => {
        try {
            const respuesta = await axios({ method: metodo, url: url, data: parametros });
            const tipo = respuesta.data[0] || 'success';
            const msj = respuesta.data[1] || 'Operación realizada con éxito';
            
            show_alert(msj, tipo);
            setIsModalOpen(false);
            getProducts();
        } catch (error) {
            if (metodo === 'POST') {
                const newProduct = { ...parametros, id: Date.now() };
                setProducts([...products, newProduct]);
                show_alert('Curso guardado localmente', 'success');
            } else if (metodo === 'PUT') {
                setProducts(products.map(p => p.id === parametros.id ? parametros : p));
                show_alert('Curso actualizado localmente', 'success');
            } else if (metodo === 'DELETE') {
                setProducts(products.filter(p => p.id !== parametros.id));
                show_alert('Curso eliminado localmente', 'success');
            }
            setIsModalOpen(false);
        }
    };

    const deleteProduct = (id, name) => {
        const MySwal = withReactContent(Swal);
        MySwal.fire({
            title: `¿Seguro de eliminar el curso "${name}"?`,
            text: 'No se podrá dar marcha atrás',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                enviarSolicitud('DELETE', { id: id });
            } else {
                show_alert('El curso no puede ser eliminado', 'info');
            }
        });
    };

    return (
        <div className='CRUD p-6 min-h-screen bg-black text-white'>
            <div className='container mx-auto'>
                <div className='row mt-3'>
                    <div className='col-md-4 offset-md-4'>
                        <div className='d-grid mx-auto text-center'>
                            <button 
                                className='bg-yellow-400 text-black font-bold px-6 py-2 rounded-lg hover:bg-yellow-300 transition' 
                                onClick={() => openModal(1)}
                            >
                                <i className='fa-solid fa-circle-plus'></i> Añadir
                            </button>
                        </div>
                    </div>
                </div>

                <div className='row mt-6'>
                    <div className='col-12 col-lg-10 offset-lg-1'>
                        <div className='table-responsive'>
                            <table className='table table-dark table-bordered w-full text-left'>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>CURSO</th>
                                        <th>DESCRIPCIÓN</th>
                                        <th>DOCENTE</th>
                                        <th>PRECIO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(products) && products.length > 0 ? (
                                        products.map((product, index) => (
                                            <tr key={product.id || index}>
                                                <td>{index + 1}</td>
                                                <td>{product.name}</td>
                                                <td>{product.description}</td>
                                                <td>{product.docen}</td>
                                                <td>
                                                    {`$${new Intl.NumberFormat('es-MX').format(product.price)}`}
                                                </td>
                                                <td>
                                                    <button 
                                                        onClick={() => openModal(2, product.id, product.name, product.description, product.price, product.docen)} 
                                                        className='bg-yellow-400 text-black px-3 py-1 rounded mr-2 hover:bg-yellow-300'
                                                    >
                                                        <i className='fa-solid fa-edit'></i>
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteProduct(product.id, product.name)}
                                                        className='bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500'
                                                    >
                                                        <i className='fa-solid fa-trash'></i>
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
                                onClick={() => setIsModalOpen(false)} 
                                className="text-gray-400 hover:text-white font-bold text-xl"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1">Nombre</label>
                                <input 
                                    type='text' 
                                    className='w-full p-2 bg-gray-800 border border-gray-700 rounded text-white' 
                                    placeholder='Nombre' 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Descripción</label>
                                <input 
                                    type='text' 
                                    className='w-full p-2 bg-gray-800 border border-gray-700 rounded text-white' 
                                    placeholder='Descripción' 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Precio</label>
                                <input 
                                    type='text' 
                                    className='w-full p-2 bg-gray-800 border border-gray-700 rounded text-white' 
                                    placeholder='Precio' 
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Docente Asignado</label>
                                <input 
                                    type='text' 
                                    className='w-full p-2 bg-gray-800 border border-gray-700 rounded text-white' 
                                    placeholder='Docente Asignado' 
                                    value={docen}
                                    onChange={(e) => setDocen(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={validar} 
                                className="px-4 py-2 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-300"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
>>>>>>> 2306ea622727522274ae7a431c6d3ef18695715c
};

export default CrudCursos;