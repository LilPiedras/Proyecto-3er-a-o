import { useState } from "react";
import { easeInOut, motion as Motion } from "motion/react";
import Program from "./Program";
import { FaTimes, FaGraduationCap, FaCut, FaGem, FaAward } from "react-icons/fa";

const Home = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);

  return (
    <div className="main-home-div min-h-screen w-full flex justify-center items-center md:p-0 p-4 relative" id="Home">
      <div className="main-child w-full flex flex-col justify-center items-center">
        
        <Motion.h1 
          className="home-hero-copy md:text-4xl text-3xl font-Jost text-white mb-3 text-center"
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeInOut }}
        >
          Ofrecemos la mejor educación a nuestros estudiantes <br />
          Para crear profesionales hechos y derechos[cite: 5]
        </Motion.h1>

        <Motion.p 
          className="home-hero-copy text-white text-xl font-Jost text-center mb-5 max-w-5xl"
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeInOut, delay: 0.3 }}
        >
          Academia Amada Fashion es una institución especializada en la formación integral dentro del diseño de modas y el modelaje. 
          La organización tiene como objetivo fundamental capacitar a nuevas generaciones de talentos, 
          brindando las herramientas técnicas, creativas y conceptuales necesarias para desarrollar profesionales altamente competitivos en la industria textil y de la moda.[cite: 5]
        </Motion.p>

        <Motion.button 
          onClick={() => setIsOpenModal(true)}
          className="w-36 h-9 rounded-full bg-yellow-300 text-black font-Jost transition-all duration-500 ease-out hover:bg-black hover:text-white active:scale-90 cursor-pointer shadow-lg hover:shadow-yellow-400/20"
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeInOut, delay: 0.2 }}
        >
          Explora mas
        </Motion.button>

      </div>

      {/* MODAL / CUADRO FLOTANTE INTERACTIVO */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#11141d] border border-[#232936] rounded-3xl shadow-2xl p-6 md:p-8 text-white overflow-hidden">
            
            {/* Botón de cerrar */}
            <button 
              onClick={() => setIsOpenModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-yellow-400 transition-colors p-2 cursor-pointer"
            >
              <FaTimes className="text-xl" />
            </button>

            {/* Cabecera del Modal */}
            <div className="text-center mb-6">
              <span className="px-3 py-1 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-semibold rounded-full">
                Academia Amada Fashion
              </span>
              <h3 className="text-2xl md:text-3xl font-bold font-Jost mt-2 text-yellow-400">
                Descubre Nuestra Pasión
              </h3>
            </div>

            {/* Contenido Informativo */}
            <div className="space-y-4 text-gray-300 text-sm md:text-base font-Jost mb-8">
              <div className="flex items-start gap-3 bg-[#161a25] p-3.5 rounded-2xl border border-[#222938]">
                <FaCut className="text-yellow-400 text-xl mt-1 shrink-0" />
                <p><strong>Diseño y Confección:</strong> Aprende desde cero las técnicas de patronaje, alta costura y diseño textil con herramientas modernas.</p>
              </div>

              <div className="flex items-start gap-3 bg-[#161a25] p-3.5 rounded-2xl border border-[#222938]">
                <FaGem className="text-yellow-400 text-xl mt-1 shrink-0" />
                <p><strong>Modelaje Profesional:</strong> Desarrolla postura, expresión corporal, pasarela y confianza para destacar en las grandes pasarelas.</p>
              </div>

              <div className="flex items-start gap-3 bg-[#161a25] p-3.5 rounded-2xl border border-[#222938]">
                <FaAward className="text-yellow-400 text-xl mt-1 shrink-0" />
                <p><strong>Certificación Garantizada:</strong> Formación estructurada por módulos y carreras orientadas al éxito en la industria de la moda.</p>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="flex justify-center">
              <button
                onClick={() => setIsOpenModal(false)}
                className="bg-yellow-400 text-black font-semibold px-6 py-2.5 rounded-xl hover:bg-yellow-500 transition shadow-lg cursor-pointer"
              >
                ¡Entendido, a explorar!
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Home;