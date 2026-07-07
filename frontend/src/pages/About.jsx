import Image from "../assets/foto1.jpg";
import {easeInOut, motion as Motion} from "motion/react"

const About = () => {
  return (
    <>
      <div className="main-about lg:min-h-screen h-full w-full flex flex-col justify-center bg-white py-10" id="About">
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
              <Motion.h1 className="text-4xl font-bold text-center md:text-left"
              initial={{opacity:0,x:100}}
            whileInView={{opacity:1,x:0}}
            transition={{duration:0.9,ease:easeInOut, stiffness:60}}>
                Acerca de nuestra Academia
              </Motion.h1>
              
              <Motion.h2 className="text-2xl text-blue-600 font-semibold"
              initial={{opacity:0,x:100}}
            whileInView={{opacity:1,x:0}}
            transition={{duration:1.1,ease:easeInOut, stiffness:60}}>
                Nurturing Tomorrows Leaders Today
              </Motion.h2>
              
              <Motion.p className="text-gray-700 leading-relaxed"
              initial={{opacity:0,x:100}}
            whileInView={{opacity:1,x:0}}
            transition={{duration:1.4,ease:easeInOut, stiffness:60}}>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo debitis minus enim ea consequuntur neque iste ipsam eum similique, delectus error expedita reiciendis et illo ab provident quis, deserunt modi?
              </Motion.p>
              
              <Motion.p className="text-gray-700 leading-relaxed"
              initial={{opacity:0,x:100}}
            whileInView={{opacity:1,x:0}}
            transition={{duration:1.6,ease:easeInOut, stiffness:60}}>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo debitis minus enim ea consequuntur neque iste ipsam eum similique, delectus error expedita reiciendis et illo ab provident quis, deserunt modi?
              </Motion.p>
              
              <Motion.p className="text-gray-700 leading-relaxed"
              initial={{opacity:0,x:100}}
            whileInView={{opacity:1,x:0}}
            transition={{duration:1.8,ease:easeInOut, stiffness:60}}>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo debitis minus enim ea consequuntur neque iste ipsam eum similique, delectus error expedita reiciendis et illo ab provident quis, deserunt modi?
              </Motion.p>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
};

export default About;