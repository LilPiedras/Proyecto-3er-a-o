import Fromc from "./components/From"
import Fromt from "./components/Fromr"; 
import Footers from "./components/Footer"
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App2() {
  return (
    <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            {/* Area de contenido principal */}
            <div className="flex-1 flex flex-col lg:flex-row">
              <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
                {/* Usar Routes para definir qué se muestra según la URL */}
                <Routes>
                  <Route path="/" element={<Fromc />} />
                  <Route path="/registro" element={<Fromt />} />
                </Routes>
              </div>
        <div className="hidden relative lg:flex lg:w-1/2 items-center justify-center bg-linear-to-tr from-gold-light via-gold-dark to-black-rich overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="w-60 h-60 bg-[url('/img/Logo.png')] bg-cover rounded-full animate-bounce duration-10 shadow-xl"  />  
            <div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Footer */}
      <Footers /> 
    </div>
    </BrowserRouter>
  )
}

export default App2