import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const NOMBRES_ROL = {
  1: "Administrador",
  2: "Docente",
  3: "Director",
  4: "Empleado",
  5: "Estudiante",
};

const RUTAS_POR_ROL = {
  1: "/crudestudiantes",
  2: "/crudestudiantes",
  3: "/crudestudiantes",
  4: "/crudcursos",
  5: "/cursosdisponibles",
};

export default function SeleccionarRol() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const guardados = localStorage.getItem("user_roles");
    if (!guardados) {
      navigate("/login");
      return;
    }

    try {
      const lista = JSON.parse(guardados);
      if (!Array.isArray(lista) || lista.length === 0) {
        navigate("/login");
        return;
      }
      setRoles(lista);
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  const elegirRol = (rol) => {
    localStorage.setItem("idrol", rol);
    const ruta = RUTAS_POR_ROL[rol] || "/";
    navigate(ruta);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md bg-zinc-900 border border-yellow-500/30 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Selecciona un rol
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Tu cuenta tiene varios roles. Elige con cuál quieres entrar.
        </p>

        <div className="flex flex-col gap-3">
          {roles.map((rol) => (
            <button
              key={rol}
              type="button"
              onClick={() => elegirRol(Number(rol))}
              className="w-full py-4 rounded-xl bg-yellow-300 text-black font-bold text-lg
                         hover:bg-yellow-400 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {NOMBRES_ROL[rol] || `Rol ${rol}`}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="w-full mt-6 py-3 rounded-xl border border-gray-600 text-gray-300
                     hover:bg-zinc-800 transition-colors"
        >
          Volver al login
        </button>
      </div>
    </div>
  );
}