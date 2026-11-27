import { QRCodeCanvas } from 'qrcode.react';
import { FaFilePdf, FaTimes, FaDownload, FaExternalLinkAlt } from 'react-icons/fa';
import { Pencil, Trash2 } from 'lucide-react';
import { useCrudModuloMateria } from '../use/useCrudModuloMateria.js';

const CrudModuloMateria = () => {
  const {
    modulos,
    materias,
    idModuloSeleccionado,
    setIdModuloSeleccionado,
    cargando,
    modalExportOpen,
    setModalExportOpen,
    urlPdfGenerado,
    crearModulo,
    editarModulo,
    eliminarModulo,
    crearMateria,
    editarMateria,
    eliminarMateria,
    asignarMateriaAModulo,
    desvincularMateria,
    abrirModalExportar,
    descargarPdfDirecto,
    relacionesDelModulo,
    idsMateriasDelModulo,
  } = useCrudModuloMateria();

  return (
    <div className="p-6 min-h-screen bg-black text-white pt-24">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">Gestor de Módulos y Materias</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">1. Selección de Módulo</h3>
              <button onClick={crearModulo} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500 cursor-pointer">
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
                  const idVal = m.idmodulo ?? m.id;
                  const nombreVal = m.nombremodulo || m.nombre;
                  return (
                    <option key={idVal} value={idVal}>
                      {nombreVal}
                    </option>
                  );
                })}
              </select>
              
              <button 
                type="button"
                onClick={editarModulo} 
                disabled={!idModuloSeleccionado} 
                className="bg-yellow-400 text-black px-3 py-1.5 rounded-lg hover:bg-yellow-300 disabled:opacity-50 cursor-pointer flex items-center justify-center" 
                title="Editar Módulo"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={eliminarModulo}
                disabled={!idModuloSeleccionado}
                className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-500 disabled:opacity-50 cursor-pointer flex items-center justify-center" 
                title="Eliminar Módulo"
              >
                <Trash2 size={16} />
              </button>

              <button
                onClick={abrirModalExportar}
                disabled={!idModuloSeleccionado || cargando}
                className="bg-yellow-400 text-black px-3.5 rounded font-bold hover:bg-yellow-300 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                title="Exportar"
              >
                <i className="fa-solid fa-file-arrow-down"></i> Exportar
              </button>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">2. Banco de Materias</h3>
              <button onClick={crearMateria} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-500 cursor-pointer">
                + Nueva
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto bg-gray-800 rounded border border-gray-700 p-2 space-y-2">
              {materias.map((mat) => {
                const idMat = mat.idmateria ?? mat.id;
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
                        className="bg-yellow-400 text-black px-2 py-1 rounded text-xs disabled:opacity-50 font-bold hover:bg-yellow-300 cursor-pointer"
                      >
                        {estaAsignada ? 'Asignada' : 'Vincular'}
                      </button>
                      <button 
                        type="button"
                        onClick={() => editarMateria(mat)} 
                        className="bg-yellow-400 text-black p-1.5 rounded-lg hover:bg-yellow-300 cursor-pointer flex items-center justify-center" 
                        title="Editar Materia"
                      >
                        <Pencil size={15} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => eliminarMateria(idMat)} 
                        className="bg-red-600 text-white p-1.5 rounded-lg hover:bg-red-500 cursor-pointer flex items-center justify-center" 
                        title="Eliminar Materia"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-lg">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">Materias dentro del Módulo</h3>

            {!idModuloSeleccionado ? (
              <p className="text-gray-500 text-center mt-10">Selecciona un módulo en la izquierda.</p>
            ) : (
              <ul className="space-y-2">
                {relacionesDelModulo.length > 0 ? (
                  relacionesDelModulo.map((rel) => {
                    const idMateriaRel = rel.idmateria ?? rel.id_materia;
                    const matInfo = materias.find(m => (m.idmateria ?? m.id)?.toString() === idMateriaRel?.toString());
                    const idRelacion = rel.idmatemo ?? rel.id;

                    return (
                      <li key={idRelacion} className="bg-gray-800 p-3 rounded border border-gray-600 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-white block text-sm">
                             {matInfo?.nombremateria || matInfo?.nombre || 'Materia'}
                          </span>
                          <span className="text-gray-400 text-xs">Docente: {matInfo?.docente || 'Sin asignar'}</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => desvincularMateria(idRelacion)}
                          className="bg-red-600 text-white px-2.5 py-1.5 rounded text-xs hover:bg-red-500 cursor-pointer flex items-center justify-center"
                          title="Quitar relación"
                        >
                          <Trash2 size={15} />
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

      {modalExportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#11141d] border border-[#2b2518] rounded-2xl p-6 max-w-sm w-full relative text-center shadow-2xl">
            <button
              onClick={() => setModalExportOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <FaTimes size={18} />
            </button>

            <h4 className="text-lg font-bold text-yellow-400 mb-1 flex items-center justify-center gap-2">
              <FaFilePdf /> Exportar Módulo #{idModuloSeleccionado}
            </h4>
            <p className="text-xs text-gray-400 mb-5">Elige una opción de descarga o escanea el código QR.</p>

            <button
              onClick={descargarPdfDirecto}
              className="w-full py-3 mb-5 bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-500 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg text-sm"
            >
              <FaDownload size={15} /> Descargar Archivo PDF
            </button>

            <div className="border-t border-[#252c3d] pt-4">
              <p className="text-xs font-semibold text-gray-300 mb-3">Escanea el Código QR del Reporte:</p>

              <div className="bg-white p-3 rounded-2xl inline-block shadow-md border border-gray-200">
                <QRCodeCanvas
                  value={urlPdfGenerado}
                  size={160}
                  bgColor={"#FFFFFF"}
                  fgColor={"#000000"}
                  level={"M"}
                  includeMargin={true}
                />
              </div>

              <div className="mt-3">
                <a
                  href={urlPdfGenerado}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-yellow-400 hover:underline flex items-center justify-center gap-1.5"
                >
                  Abrir enlace del reporte <FaExternalLinkAlt size={10} />
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CrudModuloMateria;