import { useState, useEffect, useRef } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import Logo from "../../assets/Logo.png";
import { CiMenuFries } from "react-icons/ci";
import { FaChevronDown } from "react-icons/fa";
import api from "../../api";

const Header = () => {
  const [scrolling, setScrolling] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [estadoMensualidad, setEstadoMensualidad] = useState(null);
  const [cargandoMensualidad, setCargandoMensualidad] = useState(false);
  const [errorMensualidad, setErrorMensualidad] = useState(false);

  const [dropdownPersonal, setDropdownPersonal] = useState(false);
  const [dropdownAcademica, setDropdownAcademica] = useState(false);
  const [dropdownGerencia, setDropdownGerencia] = useState(false);

  const [mobilePersonal, setMobilePersonal] = useState(false);
  const [mobileAcademica, setMobileAcademica] = useState(false);
  const [mobileGerencia, setMobileGerencia] = useState(false);

  const dropdownPersonalRef = useRef(null);
  const dropdownAcademicaRef = useRef(null);
  const dropdownGerenciaRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("idrol");

    setIsAuthenticated(!!token);
    setUserRole(role ? Number(role) : null);

    setDropdownPersonal(false);
    setDropdownAcademica(false);
    setDropdownGerencia(false);
    setToggle(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownPersonalRef.current && !dropdownPersonalRef.current.contains(event.target)) {
        setDropdownPersonal(false);
      }
      if (dropdownAcademicaRef.current && !dropdownAcademicaRef.current.contains(event.target)) {
        setDropdownAcademica(false);
      }
      if (dropdownGerenciaRef.current && !dropdownGerenciaRef.current.contains(event.target)) {
        setDropdownGerencia(false);
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
  const puedeVerAuditorias = [1, 2].includes(userRole);

  useEffect(() => {
    let active = true;

    if (!isAuthenticated || !esEstudiante) {
      setEstadoMensualidad(null);
      setCargandoMensualidad(false);
      setErrorMensualidad(false);
      return () => {
        active = false;
      };
    }

    setCargandoMensualidad(true);
    setErrorMensualidad(false);
    api
      .get("/mensualidad/mi-estado")
      .then(({ data }) => {
        if (active) setEstadoMensualidad(data);
      })
      .catch((error) => {
        if (!active) return;
        if (error.response?.status === 404) {
          setEstadoMensualidad(null);
          return;
        }
        setErrorMensualidad(true);
      })
      .finally(() => {
        if (active) setCargandoMensualidad(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, esEstudiante, location.pathname]);

  const clasesEstadoMensualidad = {
    pagado: "border-green-500 text-green-300",
    vencido: "border-red-500 text-red-300",
    pendiente: "border-yellow-500 text-yellow-300",
    completado: "border-blue-500 text-blue-300",
  };
  const textoEstadoMensualidad = cargandoMensualidad
    ? "Consultando mensualidad..."
    : errorMensualidad
      ? "No se pudo consultar la mensualidad"
      : estadoMensualidad
        ? `Mensualidad: ${estadoMensualidad.estado}`
        : "Sin mensualidad registrada";
  const ayudaEstadoMensualidad = {
    pagado: "Tu mensualidad está pagada. Gracias por mantener tus pagos al día.",
    vencido: "Tu mensualidad está vencida. Acércate a la sede para regularizar el pago.",
    pendiente: "Tu mensualidad está pendiente. Acércate a la sede para realizar el pago.",
    completado: "Tu mensualidad está completada. No tienes pagos pendientes para este período.",
  };
  const mensajeAyudaMensualidad = cargandoMensualidad
    ? "Estamos consultando el estado de tu mensualidad."
    : errorMensualidad
      ? "No se pudo consultar tu mensualidad. Inténtalo de nuevo más tarde."
      : estadoMensualidad
        ? ayudaEstadoMensualidad[estadoMensualidad.estado] ||
          "Consulta en la sede el estado de tu mensualidad."
        : "No tienes una mensualidad registrada. Acércate a la sede para recibir información.";
  const indicadorEstadoMensualidad = (
    <span
      title={mensajeAyudaMensualidad}
      className={`rounded-full border px-3 py-1 text-sm ${
        clasesEstadoMensualidad[estadoMensualidad?.estado] || "border-gray-500 text-gray-300"
      }`}
    >
      {textoEstadoMensualidad}
    </span>
  );

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

  const rutaLogo = isAuthenticated
    ? esAdministrativo
      ? "/dashboard"
      : "/crudcursos"
    : "/";

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-500 bg-black border-b-5 border-white ${
        scrolling ? "shadow-lg" : ""
      }`}
    >
      <div className="p-4 flex justify-between md:justify-around items-center text-white">
        <img
          src={Logo}
          alt="Logo"
          className="w-22 cursor-pointer"
          onClick={() => navigate(rutaLogo)}
        />

        <ul className="hidden md:flex gap-6 text-[16px] items-center">
          {isAuthenticated ? (
            <>
              {/* VISTA ESTUDIANTE (Rol 5) */}
              {esEstudiante && (
                <>
                  <li>{indicadorEstadoMensualidad}</li>
                  <li>
                    <RouterLink to="/mi-modulo" className="cursor-pointer hover:text-yellow-400">
                      Mi módulo
                    </RouterLink>
                  </li>
                  <li>
                    <RouterLink
                      to="/resumen-calificaciones"
                      className="cursor-pointer hover:text-yellow-400"
                    >
                      Resumen de Calificaciones
                    </RouterLink>
                  </li>
                  <li>
                    <RouterLink
                      to="/resumenasistencias"
                      className="cursor-pointer hover:text-yellow-400"
                    >
                      Resumen de Asistencias
                    </RouterLink>
                  </li>
                  <li>
                    <RouterLink
                      to="/cursosdisponibles"
                      className="cursor-pointer hover:text-yellow-400"
                    >
                      Cursos
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
                    <RouterLink
                      to="/crudplanevaluacion"
                      className="cursor-pointer hover:text-yellow-400"
                    >
                      Plan Evaluacion
                    </RouterLink>
                  </li>
                  <li>
                    <RouterLink
                      to="/crudasistencia"
                      className="cursor-pointer hover:text-yellow-400"
                    >
                      Asistencias
                    </RouterLink>
                  </li>
                  <li>
                    <RouterLink to="/crudnotas" className="cursor-pointer hover:text-yellow-400">
                      Notas
                    </RouterLink>
                  </li>
                  <li>
                    <RouterLink
                      to="/dashboard-docente"
                      className="cursor-pointer hover:text-yellow-400"
                    >
                      Dashboard Docente
                    </RouterLink>
                  </li>
                </>
              )}

              {/* VISTA ADMINISTRATIVA / DIRECTIVA (Roles 1, 2, 3) */}
              {esAdministrativo && (
                <>

                  <div className="relative" ref={dropdownAcademicaRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownAcademica(!dropdownAcademica);
                        setDropdownPersonal(false);
                        setDropdownGerencia(false);
                      }}
                      className="flex items-center gap-1.5 cursor-pointer hover:text-yellow-400 transition"
                      aria-expanded={dropdownAcademica}
                    >
                      Académica{" "}
                      <FaChevronDown
                        className={`text-xs transition-transform ${
                          dropdownAcademica ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {dropdownAcademica && (
                      <div className="absolute left-0 mt-3 w-48 bg-[#11141d] border border-[#232936] rounded-xl shadow-2xl py-2 flex flex-col z-50">
                        <RouterLink
                          to="/crudcursos"
                          className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition"
                        >
                          Cursos
                        </RouterLink>
                        <RouterLink
                          to="/crudoferta"
                          className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition"
                        >
                          Oferta Académica
                        </RouterLink>
                        <RouterLink
                          to="/crudcarrera"
                          className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition"
                        >
                          Carreras
                        </RouterLink>
                        <RouterLink
                          to="/crudcarreramodulo"
                          className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition"
                        >
                          Carrera-Módulo
                        </RouterLink>
                        <RouterLink
                          to="/crudmodulomateria"
                          className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition"
                        >
                          Módulo Materia
                        </RouterLink>
                        <RouterLink
                          to="/crudhorarios"
                          className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition"
                        >
                          Horarios
                        </RouterLink>
                        <RouterLink
                          to="/crudseccion"
                          className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition"
                        >
                          Secciones
                        </RouterLink>
                        <RouterLink
                          to="/crudnotas"
                          className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition"
                        >
                          Notas
                        </RouterLink>
                        <RouterLink
                          to="/crudplanevaluacion"
                          className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition"
                        >
                          Plan de Evaluación
                        </RouterLink>
                        <RouterLink
                          to="/crudinscripciones"
                          className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition"
                        >
                          Inscripciones
                        </RouterLink>
                        <RouterLink
                          to="/periodos"
                          className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition"
                        >
                          Periodos Academicos
                        </RouterLink>
                      </div>
                    )}
                  </div>

                  <div className="relative" ref={dropdownPersonalRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownPersonal(!dropdownPersonal);
                        setDropdownAcademica(false);
                        setDropdownGerencia(false);
                      }}
                      className="flex items-center gap-1.5 cursor-pointer hover:text-yellow-400 transition"
                      aria-expanded={dropdownPersonal}
                    >
                      Personal{" "}
                      <FaChevronDown
                        className={`text-xs transition-transform ${
                          dropdownPersonal ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {dropdownPersonal && (
                      <div className="absolute left-0 mt-3 w-48 bg-[#11141d] border border-[#232936] rounded-xl shadow-2xl py-2 flex flex-col z-50">
                        <RouterLink
                          to="/cruddocentes"
                          className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition"
                        >
                          Docentes
                        </RouterLink>
                        <RouterLink
                          to="/crudestudiantes"
                          className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition"
                        >
                          Estudiantes
                        </RouterLink>
                        <RouterLink
                          to="/registro"
                          className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition"
                        >
                          Registrar Usuarios
                        </RouterLink>
                      </div>
                    )}
                  </div>

                  <div className="relative" ref={dropdownGerenciaRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownGerencia(!dropdownGerencia);
                        setDropdownAcademica(false);
                        setDropdownPersonal(false);
                      }}
                      className="flex items-center gap-1.5 cursor-pointer hover:text-yellow-400 transition"
                      aria-expanded={dropdownGerencia}
                    >
                      Gerencia{" "}
                      <FaChevronDown
                        className={`text-xs transition-transform ${
                          dropdownGerencia ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {dropdownGerencia && (
                      <div className="absolute left-0 mt-3 w-48 bg-[#11141d] border border-[#232936] rounded-xl shadow-2xl py-2 flex flex-col z-50">
                        <RouterLink
                          to="/crudmensualidad"
                          className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition"
                        >
                          Mensualidades
                        </RouterLink>
                        {puedeVerAuditorias && (
                          <RouterLink
                            to="/auditorias"
                            className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition"
                          >
                            Auditorías
                          </RouterLink>
                        )}
                        <RouterLink
                          to="/dashboardgerencia"
                          className="px-4 py-2 text-sm text-gray-300 hover:bg-[#1c2230] hover:text-yellow-400 transition"
                        >
                          Dashboard Gerencia
                        </RouterLink>
                      </div>
                    )}
                  </div>
                </>
              )}

              <li>
                <RouterLink to="/perfil" className="cursor-pointer hover:text-yellow-400">
                  Perfil
                </RouterLink>
              </li>

              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-yellow-400 text-black px-4 py-1 rounded-md font-semibold hover:bg-yellow-500 transition cursor-pointer"
                >
                  Cerrar Sesión
                </button>
              </li>
            </>
          ) : (
            /* Opciones (Públicas) */
            <>
              <li>
                <RouterLink to="/" className="cursor-pointer hover:text-yellow-400">
                  Inicio
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/program" className="cursor-pointer hover:text-yellow-400 transition">
                  Programas
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/about" className="cursor-pointer hover:text-yellow-400">
                  Sobre Nosotros
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/testimonials" className="cursor-pointer hover:text-yellow-400">
                  Testimonios
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/contact" className="cursor-pointer hover:text-yellow-400">
                  Soporte
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/login" className="cursor-pointer hover:text-yellow-400">
                  Inicio de Sesión
                </RouterLink>
              </li>
            </>
          )}

        </ul>

        {/* Mobile Hamburger*/}
        <div className="md:hidden z-50 flex items-center">
          <CiMenuFries
            className="text-3xl cursor-pointer"
            onClick={() => setToggle(!toggle)}
          />
        </div>
      </div>

      {toggle && (
        <div className="fixed inset-0 bg-black/95 z-40 md:hidden overflow-y-auto pt-20 pb-10">
          <div className="flex flex-col items-center gap-5 text-xl text-white px-6">
            {isAuthenticated ? (
              <>
                {esEstudiante && (
                  <>
                    {indicadorEstadoMensualidad}
                    <RouterLink to="/mi-modulo" onClick={() => setToggle(false)}>
                      Mi módulo
                    </RouterLink>
                    <RouterLink to="/resumen-calificaciones" onClick={() => setToggle(false)}>
                      Resumen de Calificaciones
                    </RouterLink>
                    <RouterLink to="/resumenasistencias" onClick={() => setToggle(false)}>
                      Resumen de Asistencias
                    </RouterLink>
                    <RouterLink to="/cursosdisponibles" onClick={() => setToggle(false)}>
                      Cursos
                    </RouterLink>
                  </>
                )}

                {esDocentePuro && (
                  <>
                    <RouterLink to="/crudcursos" onClick={() => setToggle(false)}>
                      Cursos
                    </RouterLink>
                    <RouterLink to="/crudplanevaluacion" onClick={() => setToggle(false)}>
                      Plan Evaluacion
                    </RouterLink>
                    <RouterLink to="/crudasistencia" onClick={() => setToggle(false)}>
                      Asistencias
                    </RouterLink>
                    <RouterLink to="/crudnotas" onClick={() => setToggle(false)}>
                      Notas
                    </RouterLink>
                    <RouterLink to="/dashboard-docente" onClick={() => setToggle(false)}>
                      Dashboard Docente
                    </RouterLink>
                  </>
                )}

                {esAdministrativo && (
                  <>
                    <RouterLink
                      to="/dashboard"
                      className="text-yellow-400 font-semibold"
                      onClick={() => setToggle(false)}
                    >
                      Dashboard
                    </RouterLink>

                    <div className="w-full flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => setMobileAcademica(!mobileAcademica)}
                        className="flex items-center gap-2 text-yellow-400 font-semibold py-2"
                        aria-expanded={mobileAcademica}
                      >
                        Académica{" "}
                        <FaChevronDown
                          className={`text-sm transition-transform ${
                            mobileAcademica ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {mobileAcademica && (
                        <div className="flex flex-col items-center gap-3 bg-[#11141d] w-full py-3 rounded-xl border border-[#232936] text-base text-gray-300">
                          <RouterLink to="/crudcursos" onClick={() => setToggle(false)}>
                            Cursos
                          </RouterLink>
                          <RouterLink to="/crudoferta" onClick={() => setToggle(false)}>
                            Oferta Académica
                          </RouterLink>
                          <RouterLink to="/crudcarrera" onClick={() => setToggle(false)}>
                            Carreras
                          </RouterLink>
                          <RouterLink to="/crudcarreramodulo" onClick={() => setToggle(false)}>
                            Carrera-Módulo
                          </RouterLink>
                          <RouterLink to="/crudmodulomateria" onClick={() => setToggle(false)}>
                            Módulo Materia
                          </RouterLink>
                          <RouterLink to="/crudhorarios" onClick={() => setToggle(false)}>
                            Horarios
                          </RouterLink>
                          <RouterLink to="/crudseccion" onClick={() => setToggle(false)}>
                            Secciones
                          </RouterLink>
                          <RouterLink to="/crudnotas" onClick={() => setToggle(false)}>
                            Notas
                          </RouterLink>
                          <RouterLink to="/crudplanevaluacion" onClick={() => setToggle(false)}>
                            Plan de Evaluación
                          </RouterLink>
                          <RouterLink to="/crudinscripciones" onClick={() => setToggle(false)}>
                            Inscripciones
                          </RouterLink>
                          <RouterLink to="/periodos" onClick={() => setToggle(false)}>
                            Periodos Academicos
                          </RouterLink>
                        </div>
                      )}
                    </div>

                    <div className="w-full flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => setMobilePersonal(!mobilePersonal)}
                        className="flex items-center gap-2 text-yellow-400 font-semibold py-2"
                        aria-expanded={mobilePersonal}
                      >
                        Personal{" "}
                        <FaChevronDown
                          className={`text-sm transition-transform ${
                            mobilePersonal ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {mobilePersonal && (
                        <div className="flex flex-col items-center gap-3 bg-[#11141d] w-full py-3 rounded-xl border border-[#232936] text-base text-gray-300">
                          <RouterLink to="/cruddocentes" onClick={() => setToggle(false)}>
                            Docentes
                          </RouterLink>
                          <RouterLink to="/crudestudiantes" onClick={() => setToggle(false)}>
                            Estudiantes
                          </RouterLink>
                          <RouterLink to="/registro" onClick={() => setToggle(false)}>
                            Registrar Usuarios
                          </RouterLink>
                        </div>
                      )}
                    </div>

                    <div className="w-full flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => setMobileGerencia(!mobileGerencia)}
                        className="flex items-center gap-2 text-yellow-400 font-semibold py-2"
                        aria-expanded={mobileGerencia}
                      >
                        Gerencia{" "}
                        <FaChevronDown
                          className={`text-sm transition-transform ${
                            mobileGerencia ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {mobileGerencia && (
                        <div className="flex flex-col items-center gap-3 bg-[#11141d] w-full py-3 rounded-xl border border-[#232936] text-base text-gray-300">
                          <RouterLink to="/crudmensualidad" onClick={() => setToggle(false)}>
                            Mensualidades
                          </RouterLink>
                          {puedeVerAuditorias && (
                            <RouterLink to="/auditorias" onClick={() => setToggle(false)}>
                              Auditorías
                            </RouterLink>
                          )}
                          <RouterLink to="/dashboardgerencia" onClick={() => setToggle(false)}>
                            Dashboard Gerencia
                          </RouterLink>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <RouterLink to="/perfil" onClick={() => setToggle(false)}>
                  Perfil
                </RouterLink>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-yellow-400 font-bold border border-yellow-400 px-6 py-2 rounded-lg mt-2 cursor-pointer"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <RouterLink to="/" onClick={() => setToggle(false)}>
                  Inicio
                </RouterLink>
                <RouterLink to="/program" onClick={() => setToggle(false)}>
                  Programas
                </RouterLink>
                <RouterLink to="/about" onClick={() => setToggle(false)}>
                  Sobre Nosotros
                </RouterLink>
                <RouterLink to="/testimonials" onClick={() => setToggle(false)}>
                  Testimonios
                </RouterLink>
                <RouterLink to="/contact" onClick={() => setToggle(false)}>
                  Soporte
                </RouterLink>
                <RouterLink to="/login" onClick={() => setToggle(false)}>
                  Inicio de Sesión
                </RouterLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;