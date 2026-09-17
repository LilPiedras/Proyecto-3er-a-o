import { useState, useEffect } from "react";
<<<<<<< HEAD
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
=======
import { Link as RouterLink } from "react-router-dom";
>>>>>>> 2306ea622727522274ae7a431c6d3ef18695715c
import Logo from "../../assets/Logo.png";
import { CiMenuFries } from "react-icons/ci";

const Header = () => {
  const [scrolling, setScrolling] = useState(false);
  const [toggle, setToggle] = useState(false);
<<<<<<< HEAD
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
   
  //funcion para validar los tokensitos
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(!!token);
  }, [location]);
=======
>>>>>>> 2306ea622727522274ae7a431c6d3ef18695715c

  useEffect(() => {
    const handleScroll = () => {
      setScrolling(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

<<<<<<< HEAD
  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsAuthenticated(false);
    setToggle(false);
    navigate("/login");
  };

=======
>>>>>>> 2306ea622727522274ae7a431c6d3ef18695715c
  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-500 bg-black border-b-5 border-white`}>
      <div className="p-4 flex justify-between md:justify-around items-center text-white">

<<<<<<< HEAD
        <img src={Logo} alt="Logo" className="w-16 cursor-pointer" onClick={() => navigate('/')} />

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-8 text-[18px] items-center">
=======
        <img src={Logo} alt="Logo" className="w-16 cursor-pointer" />

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-8 text-[18px]">
>>>>>>> 2306ea622727522274ae7a431c6d3ef18695715c
          <li><RouterLink to="/" className="cursor-pointer hover:text-yellow-400">Inicio</RouterLink></li>
          <li><RouterLink to="/program" className="cursor-pointer hover:text-yellow-400 transition">Programas</RouterLink></li>
          <li><RouterLink to="/about" className="cursor-pointer hover:text-yellow-400">Sobre Nosotros</RouterLink></li>
          <li><RouterLink to="/testimonials" className="cursor-pointer hover:text-yellow-400">Testimonios</RouterLink></li>
          <li><RouterLink to="/contact" className="cursor-pointer hover:text-yellow-400">Soporte</RouterLink></li>
<<<<<<< HEAD
          
          {/* Rutas Privadas / Condicionales */}
          {isAuthenticated ? (
            <>
              <li><RouterLink to="/crudcursos" className="cursor-pointer hover:text-yellow-400">Cursos</RouterLink></li>
              <li><RouterLink to="/cruddocentes" className="cursor-pointer hover:text-yellow-400">Docentes</RouterLink></li>
              <li><RouterLink to="/crudestudiantes" className="cursor-pointer hover:text-yellow-400">Estudiantes</RouterLink></li>
              <li>
                <button 
                  onClick={handleLogout} 
                  className="bg-yellow-400 text-black px-4 py-1 rounded-md font-semibold hover:bg-yellow-500 transition"
                >
                  Cerrar Sesión
                </button>
              </li>
            </>
          ) : (
            <li><RouterLink to="/login" className="cursor-pointer hover:text-yellow-400">Inicio de Sesión</RouterLink></li>
          )}
=======
          <li><RouterLink to="/login" className="cursor-pointer hover:text-yellow-400">Inicio de Sesión</RouterLink></li>
          <li><RouterLink to="/crudcursos" className="cursor-pointer hover:text-yellow-400">Cursos</RouterLink></li>
          <li><RouterLink to="/cruddocentes" className="cursor-pointer hover:text-yellow-400">Docentes</RouterLink></li>
          <li><RouterLink to="/crudestudiantes" className="cursor-pointer hover:text-yellow-400">Estudiantes</RouterLink></li>
>>>>>>> 2306ea622727522274ae7a431c6d3ef18695715c
        </ul>

        {/* Mobile Hamburger */}
        <div className="md:hidden z-50">
          <CiMenuFries 
            className="text-3xl cursor-pointer" 
            onClick={() => setToggle(!toggle)} 
          />
        </div>
      </div>

      {/* Mobile Menu */}
      {toggle && (
        <div className="fixed inset-0 bg-black/90 z-40 md:hidden">
          <div className="flex flex-col items-center justify-center h-full gap-8 text-2xl text-white">
<<<<<<< HEAD
            <RouterLink to="/" onClick={() => setToggle(false)}>Inicio</RouterLink>
            <RouterLink to="/about" onClick={() => setToggle(false)}>Sobre Nosotros</RouterLink>
            <RouterLink to="/contact" onClick={() => setToggle(false)}>Soporte</RouterLink>

            {isAuthenticated ? (
              <>
                <RouterLink to="/crudcursos" onClick={() => setToggle(false)}>Cursos</RouterLink> 
                <RouterLink to="/cruddocentes" onClick={() => setToggle(false)}>Docentes</RouterLink> 
                <RouterLink to="/crudestudiantes" onClick={() => setToggle(false)}>Estudiantes</RouterLink> 
                <button 
                  onClick={handleLogout} 
                  className="text-yellow-400 font-bold border border-yellow-400 px-6 py-2 rounded-lg mt-4"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <RouterLink to="/login" onClick={() => setToggle(false)}>Inicio de Sesión</RouterLink>
                <RouterLink to="/registro" onClick={() => setToggle(false)}>Registro</RouterLink>
              </>
            )}
=======
            <RouterLink to="/" onClick={() => setToggle(false)}>Home</RouterLink>
            <RouterLink to="/login" onClick={() => setToggle(false)}>Login</RouterLink>
            <RouterLink to="/registro" onClick={() => setToggle(false)}>Registro</RouterLink>
            <RouterLink to="/about" onClick={() => setToggle(false)}>About</RouterLink>
            <RouterLink to="/contact" onClick={() => setToggle(false)}>Contact</RouterLink>
            <RouterLink to="/crudcursos" onClick={() => setToggle(false)}>Asignar Cursos</RouterLink> 
            <RouterLink to="/cruddocentes" onClick={() => setToggle(false)}>Aisgnar Docentes Cursos</RouterLink> 
>>>>>>> 2306ea622727522274ae7a431c6d3ef18695715c
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;