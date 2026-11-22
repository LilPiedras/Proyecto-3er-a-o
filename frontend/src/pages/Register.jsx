import Fromc from "./components/froms/LoginForm";
import Fromt from "./components/RegisterForm";
import Footers from "./components/layout/Footer";
import { Routes, Route } from "react-router-dom";


function register() {
  return (
    <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <div className="flex-1 flex flex-col lg:flex-row">
              <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
                <Routes>
                  <Route path="/" element={<Fromc />} />
                  <Route path="/registro" element={<Fromt />} />
                </Routes>
              </div>
        <div className="hidden relative lg:flex lg:w-1/2 items-center justify-center bg-linear-to-tr from-gold-light via-gold-dark to-black-rich overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="w-60 h-60 bg-[url('/img/Logo.png')] bg-cover rounded-full animate-spin duration-10 shadow-xl"  />  
            <div>
            </div>
          </div>

        </div>
      </div>

      <Footers />
    </div>
    </BrowserRouter>
  )
}

export default register