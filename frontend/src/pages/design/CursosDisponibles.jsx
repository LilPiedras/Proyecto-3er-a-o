import { useCursosDisponibles } from '../use/useCursosDisponibles.js';

const CursosDisponibles = () => {
  const { cursos, cargando } = useCursosDisponibles();

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-28">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-yellow-400 tracking-wide mb-3">
            Oferta Académica Disponible
          </h2>
          <p className="text-gray-400 text-lg">
            Selecciona tu camino de aprendizaje y potencia tus habilidades profesionales.
          </p>
        </div>

        {cargando ? (
          <div className="text-center text-yellow-400 text-xl py-20 animate-pulse">
            Cargando cursos disponibles...
          </div>
        ) : cursos.length === 0 ? (
          <div className="text-center bg-gray-900 border border-gray-800 p-8 rounded-xl max-w-md mx-auto shadow-lg">
            <i className="fa-solid fa-book-open text-4xl text-gray-500 mb-3"></i>
            <p className="text-gray-400">No hay cursos registrados en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cursos.map((curso) => {
              const idCurso = curso.idcurso;
              const nombre = curso.nomcurso;
              const precio = curso.preciocurso;
              const nivel = curso.nivelcur;

              return (
                <div
                  key={idCurso}
                  className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl hover:border-yellow-400 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-yellow-400/10 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full border border-yellow-400/20 uppercase tracking-wider">
                        {nivel}
                      </span>
                      <span className="text-2xl font-black text-yellow-400">
                        ${Number(precio).toFixed(2)}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-white group-hover:text-yellow-300 transition-colors mb-3">
                      {nombre}
                    </h3>

                    <p className="text-gray-400 text-sm mb-2">
                      Formación integral orientada a resultados prácticos con certificación oficial de la academia.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CursosDisponibles;