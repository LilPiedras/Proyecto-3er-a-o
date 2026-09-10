import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { show_alert } from '../components/functions/Showpro_functions';

const url = 'http://localhost:5000/Registrar-Docente'; 

const initialProducts = [
    { cidocen: "V-31124567", name: "María", apellido: "Pérez", telefono: "04141234567", email: "maria@gmail.com" },
    { cidocen: "E-84512399", name: "Carlos", apellido: "Gómez", telefono: "04247654321", email: "carlos@gmail.com" }
];

const CrudEstudiantes = () => {
    const [products, setProducts] = useState(initialProducts);
    const [nacionalidad, setNacionalidad] = useState('V');
    const [cidocen, setCidocen] = useState('');
    const [name, setName] = useState('');
    const [apellido, setApellido] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
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

    const openModal = (op, cedulaCompleta = '', name = '', apellido = '', telefono = '', email = '') => {
        setNacionalidad('V');
        setCidocen('');
        setName('');
        setApellido('');
        setTelefono('');
        setEmail('');
        setOperation(op);
        
        if (op === 1) {
            setTitle('Registrar Docente');
        } else if (op === 2) {
            setTitle('Editar Docente');
            if (cedulaCompleta.includes('-')) {
                const [nac, num] = cedulaCompleta.split('-');
                setNacionalidad(nac);
                setCidocen(num);
            } else {
                setCidocen(cedulaCompleta);
            }
            setName(name);
            setApellido(apellido);
            setTelefono(telefono);
            setEmail(email);
        }
        setIsModalOpen(true);
    };

    const validar = () => {
        const cedulaCompleta = `${nacionalidad}-${cidocen.trim()}`;

        if (cidocen.trim() === '') {
            show_alert('Ingrese el número de cédula', 'warning');
        } else if (name.trim() === '') {
            show_alert('Escribe el nombre del docente', 'warning');
        } else if (apellido.trim() === '') {
            show_alert('Escribe el apellido del docente', 'warning');
        } else if (telefono.trim() === '' || isNaN(telefono)) {
            show_alert('Escribe un número telefónico válido', 'warning');
        } else if (email.trim() === '') {
            show_alert('Escribe una dirección de correo válida', 'warning');
        } else {
            const parametros = { 
                cidocen: cedulaCompleta, 
                name: name.trim(), 
                apellido: apellido.trim(), 
                telefono: telefono.trim(),
                email: email.trim()
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
                const newProduct = { ...parametros };
                setProducts([...products, newProduct]);
                show_alert('Docente guardado localmente', 'success');
            } else if (metodo === 'PUT') {
                setProducts(products.map(p => p.cidocen === parametros.cidocen ? parametros : p));
                show_alert('Docente actualizado localmente', 'success');
            } else if (metodo === 'DELETE') {
                setProducts(products.filter(p => p.cidocen !== parametros.cidocen));
                show_alert('Docente eliminado localmente', 'success');
            }
            setIsModalOpen(false);
        }
    };

    const deleteProduct = (cidocen, name) => {
        const MySwal = withReactContent(Swal);
        MySwal.fire({
            title: `¿Seguro de eliminar al docente "${name}"?`,
            text: 'No se podrá dar marcha atrás',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                enviarSolicitud('DELETE', { cidocen: cidocen });
            } else {
                show_alert('El docente no pudo ser eliminado', 'info');
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
                                        <th>CÉDULA</th>
                                        <th>NOMBRE</th>
                                        <th>APELLIDO</th>
                                        <th>TELÉFONO</th>
                                        <th>CORREO ELECTRÓNICO</th>
                                        <th>ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(products) && products.length > 0 ? (
                                        products.map((product, index) => (
                                            <tr key={product.cidocen || index}>
                                                <td>{index + 1}</td>
                                                <td>{product.cidocen}</td>
                                                <td>{product.name}</td>
                                                <td>{product.apellido}</td>
                                                <td>{product.telefono}</td>
                                                <td>{product.email}</td>
                                                <td>
                                                    <button 
                                                        onClick={() => openModal(2, product.cidocen, product.name, product.apellido, product.telefono, product.email)} 
                                                        className='bg-yellow-400 text-black px-3 py-1 rounded mr-2 hover:bg-yellow-300'
                                                    >
                                                        <i className='fa-solid fa-edit'></i>
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteProduct(product.cidocen, product.name)}
                                                        className='bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500'
                                                    >
                                                        <i className='fa-solid fa-trash'></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center p-4 text-gray-400">
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
                                <label className="block text-sm mb-1">Cédula</label>
                                <div className="flex gap-2">
                                    <select 
                                        className='bg-gray-800 border border-gray-700 rounded p-2 text-white font-bold cursor-pointer disabled:opacity-50'
                                        value={nacionalidad}
                                        disabled={operation === 2}
                                        onChange={(e) => setNacionalidad(e.target.value)}
                                    >
                                        <option value="V">V</option>
                                        <option value="E">E</option>
                                    </select>
                                    <input 
                                        type='text' 
                                        className='w-full p-2 bg-gray-800 border border-gray-700 rounded text-white disabled:opacity-50' 
                                        placeholder='Ej. 31124567' 
                                        value={cidocen}
                                        disabled={operation === 2}
                                        onChange={(e) => setCidocen(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>
                            </div>
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
                                <label className="block text-sm mb-1">Apellido</label>
                                <input 
                                    type='text' 
                                    className='w-full p-2 bg-gray-800 border border-gray-700 rounded text-white' 
                                    placeholder='Apellido' 
                                    value={apellido}
                                    onChange={(e) => setApellido(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Teléfono</label>
                                <input 
                                    type='text' 
                                    className='w-full p-2 bg-gray-800 border border-gray-700 rounded text-white' 
                                    placeholder='Teléfono' 
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Correo Electrónico</label>
                                <input 
                                    type='email' 
                                    className='w-full p-2 bg-gray-800 border border-gray-700 rounded text-white' 
                                    placeholder='Correo electrónico' 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
};

export default CrudEstudiantes;