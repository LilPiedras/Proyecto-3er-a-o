import { useState } from "react"
import { easeInOut, motion as Motion, AnimatePresence } from "motion/react"

import image2 from "../assets/foto2.jpg"
import image3 from "../assets/foto3.jpg"
import image4 from "../assets/foto4.jpg"

const Program = () => {
  const [selectedCard, setSelectedCard] = useState(null)
  const programsData = [
    { id: 1, img: image3, title: "Pregrado", text: "Carreras de postgrado disponibles: Diseño de modas y Modelaje. " },
    { id: 2, img: image2, title: "Educación continua", text: "Cursos con certificados y titulos que se imparten dentro de la Academia" },
    { id: 3, img: image4, title: "Requisito de grado", text: "Nuestros estudiantes deben demostrar sus conocimientos a la hora de graduarse, deben presentar una tesis y una pasarela" },
  ]

  return (
    <>
      <div 
        className="main-program-div w-full lg:min-h-screen h-full flex flex-col justify-center items-center md:p-0 p-4
         lg:mb-0 mb-8 bg-linear-to-tr from-yellow-300 via-yellow-400 to-black" 
        id="Program"
      >
        <div className="headings mb-3 lg:pt-0 pt-3">
          <Motion.h1 
            className="font-Jost text-3xl xl:text-4xl mb-3 text-center text-white"
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeInOut, stiffness: 60 }}
          >
            Nuestros programas
          </Motion.h1>
          <Motion.h1 
            className="font-semibold text-2xl mb-3 text-center text-white"
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeInOut, stiffness: 60 }}
          >
            ¿Qué ofrecemos?
          </Motion.h1>
        </div>

        <div className="grid-container grid lg:grid-cols-3 place-items-center gap-5">
          {programsData.map((item) => (
            <Motion.div 
              key={item.id}
              className="overflow-hidden cursor-pointer" 
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: easeInOut, stiffness: 60 }}
              onClick={() => setSelectedCard(item)}
            >
              <img 
                src={item.img} 
                alt={item.title} 
                className="w-80 rounded-lg hover:scale-125 duration-300 ease-out"
              />
            </Motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedCard && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4"
            onClick={() => setSelectedCard(null)} 
          >
            <Motion.div 
              className="bg-white p-6 rounded-xl max-w-md w-full shadow-2xl relative text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => e.stopPropagation()} 
            >
              <h3 className="text-2xl font-bold mb-2 text-gray-800">{selectedCard.title}</h3>
              <p className="text-gray-600 mb-4">{selectedCard.text}</p>
              
              <button 
                className="bg-yellow-300 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition"
                onClick={() => setSelectedCard(null)}
              >
                Cerrar
              </button>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Program