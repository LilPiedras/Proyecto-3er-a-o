import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaKey, FaArrowLeft } from "react-icons/fa";
import api from "../api"; // Asegúrate de que esta sea la ruta correcta a tu instancia de Axios

export default function RecuperarPassword() {
  const navigate = useNavigate();
  
  const [paso, setPaso] = useState(1); // Paso 1: Ingresar Cédula | Paso 2: Responder y cambiar contraseña
  const [nationality, setNationality] = useState("V");
  const [dni, setDni] = useState("");
  const [ciuserFinal, setCiuserFinal] = useState("");
  const [preguntaTexto, setPreguntaTexto] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  // PASO 1: Buscar la pregunta de seguridad por la cédula del usuario
  const handleBuscarPregunta = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formattedDni = `${nationality}-${dni.trim()}`;

    try {
      // Petición al endpoint que configuramos en el backend
      const { data } = await api.get(`/PreguntasSeguridad/usuario/${encodeURIComponent(formattedDni)}`);
      
      setCiuserFinal(formattedDni);
      setPreguntaTexto(data.preguntas); // Guardamos la pregunta para mostrarla
      setPaso(2); // Avanzamos al siguiente paso del formulario
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "No se encontró el usuario o no tiene pregunta de seguridad configurada.");
    } finally {
      setLoading(false);
    }
  };

  // PASO 2: Enviar la respuesta secreta y la nueva contraseña
  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ciuser: ciuserFinal,
        respuesta: respuesta.trim(),
        nueva_password: nuevaPassword
      };

      // Petición al endpoint de validación y restablecimiento
      const { data } = await api.post("/PreguntasSeguridad/recuperar-password", payload);
      
      setMensajeExito(data.mensaje || "¡Contraseña restablecida exitosamente!");
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "La respuesta secreta es incorrecta o hubo un error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1c180e] flex justify-center items-center p-4">
      <div className="w-full max-w-md bg-[#11141d] border border-[#2b2518] rounded-3xl p-8 shadow-2xl text-gray-200 relative">
        
        {/* Enlace para regresar al login */}
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-yellow-400 mb-6 transition">
          <FaArrowLeft size={12} /> Volver al Inicio de Sesión
        </Link>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-400/10 text-yellow-400 mb-2 border border-yellow-400/20">
            <FaKey size={22} />
          </div>
          <h2 className="text-2xl font-bold text-gray-100">Recuperar Contraseña</h2>
          <p className="text-xs text-gray-400 mt-1">
            {paso === 1 ? "Ingresa tu número de cédula para verificar tu cuenta." : "Responde tu pregunta secreta y define tu nueva clave."}
          </p>
        </div>

        {error && <p className="bg-red-950/40 border border-red-900 text-red-400 p-3 rounded-xl text-xs mb-4 font-medium">{error}</p>}
        {mensajeExito && <p className="bg-emerald-950/40 border border-emerald-900 text-emerald-400 p-3 rounded-xl text-xs mb-4 font-medium">{mensajeExito}</p>}

        {paso === 1 ? (
          /* FORMULARIO PASO 1: INGRESAR CÉDULA */
          <form onSubmit={handleBuscarPregunta} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Número de Cédula</label>
              <div className="flex gap-2 mt-1.5">
                <select
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="text-gray-200 border border-[#252c3d] rounded-xl p-3 bg-[#161a25] focus:outline-none focus:ring-2 focus:ring-yellow-400 font-semibold text-sm"
                >
                  <option value="V" className="bg-[#161a25] text-gray-200">V-</option>
                  <option value="E" className="bg-[#161a25] text-gray-200">E-</option>
                </select>
                <input
                  type="text"
                  placeholder="12345678"
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                  className="w-full border border-[#252c3d] rounded-xl p-3 bg-[#161a25] text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-200"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500 transition text-sm cursor-pointer disabled:opacity-50 mt-2 shadow-lg"
            >
              {loading ? "Buscando..." : "Siguiente"}
            </button>
          </form>
        ) : (
          /* FORMULARIO PASO 2: PREGUNTA Y NUEVA CONTRASEÑA */
          <form onSubmit={handleCambiarPassword} className="flex flex-col gap-4">
            <div className="bg-[#161a25] border border-[#252c3d] p-3.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-yellow-400 tracking-wider">Pregunta de Seguridad Asignada:</span>
              <p className="text-sm font-medium mt-1 text-gray-200">{preguntaTexto}</p>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Respuesta Secreta</label>
              <input
                type="text"
                placeholder="Escribe tu respuesta"
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                className="w-full border border-[#252c3d] rounded-xl p-3 mt-1.5 bg-[#161a25] text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-200"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Nueva Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                className="w-full border border-[#252c3d] rounded-xl p-3 mt-1.5 bg-[#161a25] text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-200"
                required
              />
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setPaso(1)}
                className="w-1/2 py-3 rounded-xl border border-gray-600 text-gray-300 font-semibold hover:bg-gray-800 transition text-sm cursor-pointer"
              >
                Atrás
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 py-3 rounded-xl bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500 transition text-sm cursor-pointer disabled:opacity-50 shadow-lg"
              >
                {loading ? "Procesando..." : "Restablecer"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}