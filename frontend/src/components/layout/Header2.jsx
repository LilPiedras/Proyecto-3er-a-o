import { useState, useEffect, useRef } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import Logo from "../../assets/Logo.png";
import { CiMenuFries } from "react-icons/ci";
import { FaChevronDown } from "react-icons/fa";

const Header = () => {
  const [scrolling, setScrolling] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Estados para controlar los menús desplegables en desktop
  const [dropdownPersonal, setDropdownPersonal] = useState(false);
  const [dropdownAcademica, setDropdownAcademica] = useState(false);

  // Estados para acordeones en mobile
  const [mobilePersonal, setMobilePersonal] = useState(false);
  const [mobileAcademica, setMobileAcademica] = useState(false);

  const dropdownPersonalRef = useRef(null);
  const dropdownAcademicaRef = useRef(null);
  
  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.getItem("dark-mode") === "true" ||
      (!("dark-mode" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("dark-mode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("dark-mode", "false");
    }
  }, [isDark]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("idrol");
    
    setIsAuthenticated(!!token);
    setUserRole(role ? Number(role) : null);
    // Cerrar dropdowns al cambiar de ruta
    setDropdownPersonal(false);
    setDropdownAcademica(false);
    setToggle(false);
  }, [location]);

  // Cerrar menús al hacer click fuera en desktop
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownPersonalRef.current && !dropdownPersonalRef.current.contains(event.target)) {
        setDropdownPersonal(false);
      }
      if (dropdownAcademicaRef.current && !dropdownAcademicaRef.current.contains(event.target)) {
        setDropdownAcademica(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolling(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const esEstudiante = userRole === 5;
  const esDocentePuro = userRole === 4;
  const esAdministrativo = [1, 2, 3].includes(userRole);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("idrol");
    localStorage.removeItem("user_cargo");
    setIsAuthenticated(false);
    setUserRole(null);
    setToggle(false);
    navigate("/login");
  };

  return (
    <header className="fixed w-full top-0 z-50 transition-all duration-500 bg-black border-b-5 border-white">
      <div className="p-4 flex justify-between md:justify-around items-center text-white">
        <img
          src={Logo}
          alt="Logo"
          className="w-22 cursor-pointer"
          onClick={() => navigate(isAuthenticated ? "/crudcursos" : "/")}
        />

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-6 text-[16px] items-center">
          {isAuthenticated ? (
            <>
              {/* VISTA ESTUDIANTE (Rol 5) */}
              {esEstudiante && (
                <>
                  <li>
                    <RouterLink to="/mi-modulo" className="cursor-pointer hover:text-yellow-400">
                      Mi módulo
                    </RouterLink>
                  </li>
                  <li>
                    <RouterLink to="/crudnotas" className="cursor-pointer hover:text-yellow-400">
                      Mis notas
                    </RouterLink>
                  </li>
                  <li>
                    <RouterLink to="/cursosdisponibles" className="cursor-pointer hover:text-yellow-400">
                      Cursos
                    </RouterLink>
                  </li>
                  <li>
                    <RouterLink to="/crudoferta" className="cursor-pointer hover:text-yellow-400">
                      Oferta Academica
                    </RouterLink>
                  </li>
                  <li>
                      <RouterLink to="/estado-inscripcion" className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition">
                          Mi Inscripcion
                    </RouterLink>
                  </li>
                </>
              )}

              {/* VISTA DOCENTE (Rol 4) */}
              {esDocentePuro && (
                <>
                  <li>
                    <RouterLink to="/crudcursos" className="cursor-pointer hover:text-yellow-400">
                      Cursos
                    </RouterLink>
                  </li>
                  <li>
                    <RouterLink to="/crudoferta" className="cursor-pointer hover:text-yellow-400">
                      Oferta Academica
                    </RouterLink>
                  </li>
                  <li>
                    <RouterLink to="/crudhorarios" className="cursor-pointer hover:text-yellow-400">
                      Horarios
                    </RouterLink>
                  </li>
                  <li>
                    <RouterLink to="/crudnotas" className="cursor-pointer hover:text-yellow-400">
                      Notas
                    </RouterLink>
                  </li>
                </>
              )}

              {/* VISTA ADMINISTRATIVA / DIRECTIVA (Roles 1, 2, 3) - Con Dropdowns */}
              {esAdministrativo && (
                <>
                  {/* DROPDOWN ACADÉMICA */}
                  <div className="relative" ref={dropdownAcademicaRef}>
                    <button
                      onClick={() => {
                        setDropdownAcademica(!dropdownAcademica);
                        setDropdownPersonal(false);
                      }}
                      className="flex items-center gap-1.5 cursor-pointer hover:text-yellow-400 transition"
                    >
                      Académica <FaChevronDown className={`text-xs transition-transform ${dropdownAcademica ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownAcademica && (
                      <div className="absolute left-0 mt-3 w-48 bg-[#11141d] border border-[#232936] rounded-xl shadow-2xl py-2 flex flex-col z-50">
                        <RouterLink to="/crudcursos" className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition">
                          Cursos
                        </RouterLink>
                        <RouterLink to="/crudoferta" className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition">
                          Oferta Académica
                        </RouterLink>
                        <RouterLink to="/crudcarrera" className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition">
                          Carreras
                        </RouterLink>
                        <RouterLink to="/crudmodulomateria" className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition">
                          Módulo Materia
                        </RouterLink>
                        <RouterLink to="/crudhorarios" className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition">
                          Horarios
                        </RouterLink>
                        <RouterLink to="/crudseccion" className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition">
                          Secciones
                        </RouterLink>
                        <RouterLink to="/crudnotas" className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition">
                          Notas
                        </RouterLink>
                        <RouterLink to="/crudplanevaluacion" className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition">
                          Plan de Evaluación
                        </RouterLink>
                        <RouterLink to="/crudinscripciones" className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition">
                          Inscripciones
                        </RouterLink>
                      </div>
                    )}
                  </div>

                  {/* DROPDOWN PERSONAL */}
                  <div className="relative" ref={dropdownPersonalRef}>
                    <button
                      onClick={() => {
                        setDropdownPersonal(!dropdownPersonal);
                        setDropdownAcademica(false);
                      }}
                      className="flex items-center gap-1.5 cursor-pointer hover:text-yellow-400 transition"
                    >
                      Personal <FaChevronDown className={`text-xs transition-transform ${dropdownPersonal ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownPersonal && (
                      <div className="absolute left-0 mt-3 w-44 bg-[#11141d] border border-[#232936] rounded-xl shadow-2xl py-2 flex flex-col z-50">
                        <RouterLink to="/cruddocentes" className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition">
                          Docentes
                        </RouterLink>
                        <RouterLink to="/crudestudiantes" className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition">
                          Estudiantes
                        </RouterLink>
                      </div>
                    )}
                  </div>

                  {/* MENSUALIDADES (Directo o se puede incluir) */}
                  <RouterLink to="/crudmensualidad" className="cursor-pointer hover:text-yellow-400">
                    Mensualidades
                  </RouterLink>
                </>
              )}

              {/* PERFIL */}
              <RouterLink to="/perfil" className="cursor-pointer hover:text-yellow-400">
                Perfil
              </RouterLink>

              {/* BOTÓN CERRAR SESIÓN */}
              <li>
                <button
                  onClick={handleLogout}
                  className="bg-yellow-400 text-black px-4 py-1 rounded-md font-semibold hover:bg-yellow-500 transition cursor-pointer"
                >
                  Cerrar Sesión
                </button>
              </li>
            </>
          ) : (
            /* Opciones NO LOGEADOS (Públicas) */
            <>
              <li><RouterLink to="/" className="cursor-pointer hover:text-yellow-400">Inicio</RouterLink></li>
              <li><RouterLink to="/program" className="cursor-pointer hover:text-yellow-400 transition">Programas</RouterLink></li>
              <li><RouterLink to="/about" className="cursor-pointer hover:text-yellow-400">Sobre Nosotros</RouterLink></li>
              <li><RouterLink to="/testimonials" className="cursor-pointer hover:text-yellow-400">Testimonios</RouterLink></li>
              <li><RouterLink to="/contact" className="cursor-pointer hover:text-yellow-400">Soporte</RouterLink></li>
              <li><RouterLink to="/login" className="cursor-pointer hover:text-yellow-400">Inicio de Sesión</RouterLink></li>
            </>
          )}

          {/* Botón Switch Dark Mode Desktop */}
          <li className="flex flex-col justify-center ml-2">
            <input
              type="checkbox"
              id="light-switch-desktop"
              name="light-switch"
              className="light-switch sr-only"
              checked={isDark}
              onChange={(e) => setIsDark(e.target.checked)}
            />
            <label className="relative cursor-pointer p-2" htmlFor="light-switch-desktop">
              <svg className="dark:hidden" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <path className="fill-slate-300" d="M7 0h2v2H7zM12.88 1.637l1.414 1.415-1.415 1.413-1.413-1.414zM14 7h2v2h-2zM12.95 14.433l-1.414-1.413 1.413-1.415 1.415 1.414zM7 14h2v2H7zM2.98 14.364l-1.413-1.415 1.414-1.414 1.414 1.415zM0 7h2v2H0zM3.05 1.706 4.463 3.12 3.05 4.535 1.636 3.12z"/>
                <path className="fill-slate-400" d="M8 4C5.8 4 4 5.8 4 8s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4Z"/>
              </svg>
              <svg className="hidden dark:block" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <path className="fill-slate-400" d="M6.2 1C3.2 1.8 1 4.6 1 7.9 1 11.8 4.2 15 8.1 15c3.3 0 6-2.2 6.9-5.2C9.7 11.2 4.8 6.3 6.2 1Z"/>
                <path className="fill-slate-500" d="M12.5 5a.625.625 0 0 1-.625-.625 1.252 1.252 0 0 0-1.25-1.25.625.625 0 1 1 0-1.25 1.252 1.252 0 0 0 1.25-1.25.625.625 0 1 1 1.25 0c.001.69.56 1.249 1.25 1.25a.625.625 0 1 1 0 1.25c-.69.001-1.249.56-1.25 1.25A.625.625 0 0 1 12.5 5Z"/>
              </svg>
            </label>
          </li>
        </ul>

        {/* Mobile Hamburger & Toggle */}
        <div className="md:hidden z-50 flex items-center gap-3">
          <div className="flex flex-col justify-center">
            <input
              type="checkbox"
              id="light-switch-mobile"
              name="light-switch"
              className="light-switch sr-only"
              checked={isDark}
              onChange={(e) => setIsDark(e.target.checked)}
            />
            <label className="relative cursor-pointer p-2" htmlFor="light-switch-mobile">
              <svg className="dark:hidden" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <path className="fill-slate-300" d="M7 0h2v2H7zM12.88 1.637l1.414 1.415-1.415 1.413-1.413-1.414zM14 7h2v2h-2zM12.95 14.433l-1.414-1.413 1.413-1.415 1.415 1.414zM7 14h2v2H7zM2.98 14.364l-1.413-1.415 1.414-1.414 1.414 1.415zM0 7h2v2H0zM3.05 1.706 4.463 3.12 3.05 4.535 1.636 3.12z"/>
                <path className="fill-slate-400" d="M8 4C5.8 4 4 5.8 4 8s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4Z"/>
              </svg>
              <svg className="hidden dark:block" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <path className="fill-slate-400" d="M6.2 1C3.2 1.8 1 4.6 1 7.9 1 11.8 4.2 15 8.1 15c3.3 0 6-2.2 6.9-5.2C9.7 11.2 4.8 6.3 6.2 1Z"/>
                <path className="fill-slate-500" d="M12.5 5a.625.625 0 0 1-.625-.625 1.252 1.252 0 0 0-1.25-1.25.625.625 0 1 1 0-1.25 1.252 1.252 0 0 0 1.25-1.25.625.625 0 1 1 1.25 0c.001.69.56 1.249 1.25 1.25a.625.625 0 1 1 0 1.25c-.69.001-1.249.56-1.25 1.25A.625.625 0 0 1 12.5 5Z"/>
              </svg>
            </label>
          </div>

          <CiMenuFries
            className="text-3xl cursor-pointer"
            onClick={() => setToggle(!toggle)}
          />
        </div>
      </div>

      {/* Mobile Menu */}
      {toggle && (
        <div className="fixed inset-0 bg-black/95 z-40 md:hidden overflow-y-auto pt-20 pb-10">
          <div className="flex flex-col items-center gap-5 text-xl text-white px-6">
            {isAuthenticated ? (
              <>
                {esEstudiante && (
                  <>
                    <RouterLink to="/crudcursos" onClick={() => setToggle(false)}>Cursos</RouterLink>
                    <RouterLink to="/crudoferta" onClick={() => setToggle(false)}>Oferta Academica</RouterLink>
                  </>
                )}

                {esDocentePuro && (
                  <>
                    <RouterLink to="/crudcursos" onClick={() => setToggle(false)}>Cursos</RouterLink>
                    <RouterLink to="/crudoferta" onClick={() => setToggle(false)}>Oferta Academica</RouterLink>
                    <RouterLink to="/crudhorarios" onClick={() => setToggle(false)}>Horarios</RouterLink>
                  </>
                )}

                {esAdministrativo && (
                  <>
                    {/* ACADÉMICA MOBILE */}
                    <div className="w-full flex flex-col items-center">
                      <button 
                        onClick={() => setMobileAcademica(!mobileAcademica)}
                        className="flex items-center gap-2 text-yellow-400 font-semibold py-2"
                      >
                        Académica <FaChevronDown className={`text-sm transition-transform ${mobileAcademica ? 'rotate-180' : ''}`} />
                      </button>
                      {mobileAcademica && (
                        <div className="flex flex-col items-center gap-3 bg-[#11141d] w-full py-3 rounded-xl border border-[#232936] text-base text-gray-300">
                          <RouterLink to="/crudcursos" onClick={() => setToggle(false)}>Cursos</RouterLink>
                          <RouterLink to="/crudoferta" onClick={() => setToggle(false)}>Oferta Académica</RouterLink>
                          <RouterLink to="/crudcarrera" onClick={() => setToggle(false)}>Carreras</RouterLink>
                          <RouterLink to="/crudmodulomateria" onClick={() => setToggle(false)}>Módulo Materia</RouterLink>
                          <RouterLink to="/crudhorarios" onClick={() => setToggle(false)}>Horarios</RouterLink>
                          <RouterLink to="/crudseccion" onClick={() => setToggle(false)}>Secciones</RouterLink>
                        </div>
                      )}
                    </div>

                    {/* PERSONAL MOBILE */}
                    <div className="w-full flex flex-col items-center">
                      <button 
                        onClick={() => setMobilePersonal(!mobilePersonal)}
                        className="flex items-center gap-2 text-yellow-400 font-semibold py-2"
                      >
                        Personal <FaChevronDown className={`text-sm transition-transform ${mobilePersonal ? 'rotate-180' : ''}`} />
                      </button>
                      {mobilePersonal && (
                        <div className="flex flex-col items-center gap-3 bg-[#11141d] w-full py-3 rounded-xl border border-[#232936] text-base text-gray-300">
                          <RouterLink to="/cruddocentes" onClick={() => setToggle(false)}>Docentes</RouterLink>
                          <RouterLink to="/crudestudiantes" onClick={() => setToggle(false)}>Estudiantes</RouterLink>
                        </div>
                      )}
                    </div>

                    <RouterLink to="/crudmensualidad" onClick={() => setToggle(false)}>Mensualidades</RouterLink>
                  </>
                )}

                <RouterLink to="/perfil" onClick={() => setToggle(false)}>Perfil</RouterLink>

                <button
                  onClick={handleLogout}
                  className="text-yellow-400 font-bold border border-yellow-400 px-6 py-2 rounded-lg mt-2 cursor-pointer"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <RouterLink to="/" onClick={() => setToggle(false)}>Inicio</RouterLink>
                <RouterLink to="/program" onClick={() => setToggle(false)}>Programas</RouterLink>
                <RouterLink to="/about" onClick={() => setToggle(false)}>Sobre Nosotros</RouterLink>
                <RouterLink to="/testimonials" onClick={() => setToggle(false)}>Testimonios</RouterLink>
                <RouterLink to="/contact" onClick={() => setToggle(false)}>Soporte</RouterLink>
                <RouterLink to="/login" onClick={() => setToggle(false)}>Inicio de Sesión</RouterLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;