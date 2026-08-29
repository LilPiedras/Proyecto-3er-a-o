import Image from "../assets/foto6.png";
import {easeInOut, motion as Motion} from "motion/react"

const About = () => {
  return (
    <>
      <div className="main-about lg:min-h-screen h-full w-full flex flex-col justify-center py-10 bg-linear-to-tr from-yellow-300 via-yellow-400 to-black" id="About">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-10">
            
            {/* Imagen */}
            <Motion.div className="w-full md:w-1/2 flex justify-center"
            initial={{opacity:0,x:-100}}
            whileInView={{opacity:1,x:0}}
            transition={{duration:0.9,ease:easeInOut, stiffness:60}}>
              <img 
                src={Image} 
                alt="About Us" 
                className="w-96 rounded-2xl shadow-lg" 
              />
            </Motion.div>
            
            {/* Contenido de texto */}
            <div className="w-full md:w-1/2 space-y-6">
              <Motion.h1 className="text-4xl font-bold text-center md:text-left text-white"
              initial={{opacity:0,x:100}}
            whileInView={{opacity:1,x:0}}
            transition={{duration:0.9,ease:easeInOut, stiffness:60}}>
                Acerca de nuestra Academia
              </Motion.h1>
              
              <Motion.h2 className="text-2xl text-yellow-100 font-semibold"
              initial={{opacity:0,x:100}}
            whileInView={{opacity:1,x:0}}
            transition={{duration:1.1,ease:easeInOut, stiffness:60}}>
                Formando profesionales desde 2022
              </Motion.h2>
              
              <Motion.p className="text-white leading-relaxed text-xl"
              initial={{opacity:0,x:100}}
            whileInView={{opacity:1,x:0}}
            transition={{duration:1.4,ease:easeInOut, stiffness:60}}>
                Nuestra Misión y Vision
              </Motion.p>
              
              <Motion.p className="text-white leading-relaxed"
              initial={{opacity:0,x:100}}
            whileInView={{opacity:1,x:0}}
            transition={{duration:1.6,ease:easeInOut, stiffness:60}}>
               Formar profesionales integrales en Diseño de Modas, capaces de convertir su creatividad y talento en propuestas innovadoras, funcionales y con identidad propia. En la Academia Amada Fashion ofrecemos una educación teórica y práctica de excelencia, orientada al desarrollo de competencias técnicas, artísticas, empresariales y humanas, preparando a nuestros estudiantes para incorporarse con seguridad, ética y liderazgo a la industria de la moda nacional e internacional.

              </Motion.p>
              
              <Motion.p className="text-white leading-relaxed"
              initial={{opacity:0,x:100}}
            whileInView={{opacity:1,x:0}}
            transition={{duration:1.8,ease:easeInOut, stiffness:60}}>
               Consolidarnos como una academia de Diseño de Modas líder y referente en Venezuela, con proyección internacional, reconocida por la excelencia de su formación, la innovación de sus programas y el talento de sus egresados. Aspiramos a expandir nuestra presencia dentro y fuera del país, impulsando nuevas generaciones de diseñadores capaces de crear, emprender y transformar la industria de la moda con identidad, sensibilidad artística y visión de futuro.
              </Motion.p>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
};

export default About;