import { easeInOut, motion as Motion } from "motion/react";
import Program from "./Program";

const Home = () => {
  return (
    <div className="main-home-div min-h-screen w-full flex justify-center items-center md:p-0 p-4" id="Home">
      <div className="main-child w-full flex flex-col justify-center items-center">
        
        <Motion.h1 
          className="md:text-3xl text-2xl font-Jost text-white mb-3 text-center"
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeInOut }}
        >
          Ofrecemos la mejor educación a nuestros estudiantes <br />
          Para crear profesionales hechos y derechos
        </Motion.h1>

        <Motion.p 
          className="text-white font-Jost text-center mb-5 max-w-5xl"
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeInOut, delay: 0.3 }}
        >
         Academia Amada Fashion es una institución especializada en la formación integral dentro del diseño de modas y el modelaje. 
         La organización tiene como objetivo fundamental capacitar a nuevas generaciones de talentos, 
         brindando las herramientas técnicas, creativas y conceptuales necesarias para desarrollar profesionales altamente competitivos en la industria textil y de la moda.
        </Motion.p>

        <Motion.button 
          className="w-36 h-9 rounded-full bg-yellow-300 text-black font-Jost transition-all duration-500 ease-out hover:bg-black hover:text-white active:scale-90 cursor-pointer"
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeInOut, delay: 0.2 }}
        >
          Explore More
        </Motion.button>

      </div>
    </div>
  );
};

export default Home;