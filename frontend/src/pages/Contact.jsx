import Gift1 from "../assets/foto1.jpg"

const Contact = () => {
  return (
    <>
      <div 
        className="main-contact min-h-screen bg-gradient-to-tr from-yellow-300 via-yellow-400 to-black py-12 px-4 flex flex-col justify-center items-center" 
        id="Contact Us"
      >
        <h1 className="text-center text-4xl font-bold mb-8 text-black drop-shadow-md">
          Contáctanos
        </h1>
    
        <div className="w-full max-w-5xl bg-black/90 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-2xl border border-yellow-500/20">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
            
            <div className="w-full md:w-1/2 flex justify-center">
              <img 
                src={Gift1} 
                alt="Contacto" 
                className="w-full max-w-md h-[350px] md:h-[450px] object-cover rounded-2xl shadow-lg border border-yellow-400/30" 
              />
            </div>
            
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-2 text-white">¿Tienes un problema?</h2>
              <h3 className="text-xl mb-6 text-gray-300">
                Estamos <span className="text-yellow-400 font-semibold">Felices</span> de <span className="text-yellow-400 font-semibold">Ayudarte</span>
              </h3>
              
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                {/* Name y Email */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="text" 
                    placeholder="Nombre Completo"
                    className="w-full p-3.5 rounded-xl bg-gray-900/80 text-white border border-gray-700 placeholder-gray-500 focus:border-yellow-400 focus:outline-none transition"
                  />
                  <input 
                    type="email" 
                    placeholder="Email"
                    className="w-full p-3.5 rounded-xl bg-gray-900/80 text-white border border-gray-700 placeholder-gray-500 focus:border-yellow-400 focus:outline-none transition"
                  />
                </div>
                
                {/* Country y Phone */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="text" 
                    placeholder="Carrera"
                    className="w-full p-3.5 rounded-xl bg-gray-900/80 text-white border border-gray-700 placeholder-gray-500 focus:border-yellow-400 focus:outline-none transition"
                  />
                  <input 
                    type="tel" 
                    placeholder="Telefono"
                    className="w-full p-3.5 rounded-xl bg-gray-900/80 text-white border border-gray-700 placeholder-gray-500 focus:border-yellow-400 focus:outline-none transition"
                  />
                </div>
                
                {/* Textarea */}
                <textarea 
                  rows={4} 
                  placeholder="Escribenos"
                  className="w-full p-3.5 rounded-xl bg-gray-900/80 text-white border border-gray-700 placeholder-gray-500 font-Jost focus:border-yellow-400 focus:outline-none transition resize-none"
                ></textarea>
                
                {/* Button */}
                <button 
                  type="submit"
                  className="w-full sm:w-auto bg-yellow-400 text-black font-bold px-10 py-3.5 rounded-xl hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-400/20 active:scale-95 transition-all duration-200"
                >
                  Send
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default Contact;