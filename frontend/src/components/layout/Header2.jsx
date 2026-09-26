import { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import Logo from "../../assets/Logo.png";
import { CiMenuFries } from "react-icons/ci";

const Header = () => {
  const [scrolling, setScrolling] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
    setIsAuthenticated(!!token);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolling(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsAuthenticated(false);
    setToggle(false);
    navigate("/login");
  };

  return (
    <header className="fixed w-full top-0 z-50 transition-all duration-500 bg-black border-b-5 border-white">
      <div className="p-4 flex justify-between md:justify-around items-center text-white">
        <img
          src={Logo}
          alt="Logo"
          className="w-16 cursor-pointer"
          onClick={() => navigate(isAuthenticated ? "/crudcursos" : "/")}
        />

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-8 text-[18px] items-center">
          {isAuthenticated ? (
            /* Opciones EXCLUSIVAS para usuarios LOGEADOS (Solo CRUDs y Logout) */
            <>
              <li>
                <RouterLink to="/crudcursos" className="cursor-pointer hover:text-yellow-400">
                  Cursos
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/cruddocentes" className="cursor-pointer hover:text-yellow-400">
                  Docentes
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/crudestudiantes" className="cursor-pointer hover:text-yellow-400">
                  Estudiantes
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/crudcarrera" className="cursor-pointer hover:text-yellow-400">
                  Carrera
                </RouterLink>
              </li>
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
            /* Opciones EXCLUSIVAS para usuarios NO LOGEADOS (Públicas) */
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

          {/* Botón Switch Dark Mode */}
          <li className="flex flex-col justify-center ml-3">
            <input
              type="checkbox"
              id="light-switch-desktop"
              name="light-switch"
              className="light-switch sr-only"
              checked={isDark}
              onChange={(e) => setIsDark(e.target.checked)}
            />
            <label
              className="relative cursor-pointer p-2"
              htmlFor="light-switch-desktop"
            >
              <svg
                className="dark:hidden"
                width="16"
                height="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  className="fill-slate-300"
                  d="M7 0h2v2H7zM12.88 1.637l1.414 1.415-1.415 1.413-1.413-1.414zM14 7h2v2h-2zM12.95 14.433l-1.414-1.413 1.413-1.415 1.415 1.414zM7 14h2v2H7zM2.98 14.364l-1.413-1.415 1.414-1.414 1.414 1.415zM0 7h2v2H0zM3.05 1.706 4.463 3.12 3.05 4.535 1.636 3.12z"
                />
                <path
                  className="fill-slate-400"
                  d="M8 4C5.8 4 4 5.8 4 8s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4Z"
                />
              </svg>
              <svg
                className="hidden dark:block"
                width="16"
                height="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  className="fill-slate-400"
                  d="M6.2 1C3.2 1.8 1 4.6 1 7.9 1 11.8 4.2 15 8.1 15c3.3 0 6-2.2 6.9-5.2C9.7 11.2 4.8 6.3 6.2 1Z"
                />
                <path
                  className="fill-slate-500"
                  d="M12.5 5a.625.625 0 0 1-.625-.625 1.252 1.252 0 0 0-1.25-1.25.625.625 0 1 1 0-1.25 1.252 1.252 0 0 0 1.25-1.25.625.625 0 1 1 1.25 0c.001.69.56 1.249 1.25 1.25a.625.625 0 1 1 0 1.25c-.69.001-1.249.56-1.25 1.25A.625.625 0 0 1 12.5 5Z"
                />
              </svg>
              <span className="sr-only">Switch to light / dark version</span>
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
            <label
              className="relative cursor-pointer p-2"
              htmlFor="light-switch-mobile"
            >
              <svg
                className="dark:hidden"
                width="16"
                height="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  className="fill-slate-300"
                  d="M7 0h2v2H7zM12.88 1.637l1.414 1.415-1.415 1.413-1.413-1.414zM14 7h2v2h-2zM12.95 14.433l-1.414-1.413 1.413-1.415 1.415 1.414zM7 14h2v2H7zM2.98 14.364l-1.413-1.415 1.414-1.414 1.414 1.415zM0 7h2v2H0zM3.05 1.706 4.463 3.12 3.05 4.535 1.636 3.12z"
                />
                <path
                  className="fill-slate-400"
                  d="M8 4C5.8 4 4 5.8 4 8s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4Z"
                />
              </svg>
              <svg
                className="hidden dark:block"
                width="16"
                height="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  className="fill-slate-400"
                  d="M6.2 1C3.2 1.8 1 4.6 1 7.9 1 11.8 4.2 15 8.1 15c3.3 0 6-2.2 6.9-5.2C9.7 11.2 4.8 6.3 6.2 1Z"
                />
                <path
                  className="fill-slate-500"
                  d="M12.5 5a.625.625 0 0 1-.625-.625 1.252 1.252 0 0 0-1.25-1.25.625.625 0 1 1 0-1.25 1.252 1.252 0 0 0 1.25-1.25.625.625 0 1 1 1.25 0c.001.69.56 1.249 1.25 1.25a.625.625 0 1 1 0 1.25c-.69.001-1.249.56-1.25 1.25A.625.625 0 0 1 12.5 5Z"
                />
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
        <div className="fixed inset-0 bg-black/90 z-40 md:hidden">
          <div className="flex flex-col items-center justify-center h-full gap-8 text-2xl text-white">
            {isAuthenticated ? (
              /* Menú móvil EXCLUSIVO para logeados */
              <>
                <RouterLink to="/crudcursos" onClick={() => setToggle(false)}>
                  Cursos
                </RouterLink>
                <RouterLink to="/cruddocentes" onClick={() => setToggle(false)}>
                  Docentes
                </RouterLink>
                <RouterLink to="/crudestudiantes" onClick={() => setToggle(false)}>
                  Estudiantes
                </RouterLink>
                <RouterLink to="/crudcarrera" onClick={() => setToggle(false)}>
                  Carrera
                </RouterLink>
                <button
                  onClick={handleLogout}
                  className="text-yellow-400 font-bold border border-yellow-400 px-6 py-2 rounded-lg mt-4 cursor-pointer"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              /* Menú móvil EXCLUSIVO para NO logeados */
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