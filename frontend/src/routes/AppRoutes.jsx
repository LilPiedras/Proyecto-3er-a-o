import { Routes, Route } from "react-router-dom";
import Fromc from "../components/forms/LoginForm";
import Fromt from "../components/forms/RegisterForm";
import Home from "../pages/Home";
import Program from "../pages/Program"
import Contact from "../pages/Contact";
import Testimonials from "../pages/Testimonials";
import About from "../pages/About";
const AppRoutes = () => {
  return (
    <main className="flex-1 pt-28 md:pt-24">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/program" element={<Program />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/about" element={<About />} />

        <Route path="/login" element={
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-140px)]">
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-black">
              <Fromc />
            </div>
            <div className="hidden relative lg:flex lg:w-1/2 items-center justify-center bg-linear-to-tr from-yellow-200 via-yellow-500 to-black overflow-hidden">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="w-60 h-60 bg-[url('/img/Logo.png')] bg-cover rounded-full  shadow-xl" />
              </div>
            </div>
          </div>
        } />

        <Route path="/registro" element={
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-140px)]">
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-black">
              <Fromt />
            </div>
            <div className="hidden relative lg:flex lg:w-1/2 items-center justify-center bg-linear-to-tr from-yellow-200 via-yellow-500 to-black overflow-hidden">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="w-60 h-60 bg-[url('/img/Logo.png')] bg-cover rounded-full  shadow-xl" />
              </div>
            </div>
          </div>
        } />
      </Routes>
    </main>
  );
};

export default AppRoutes;