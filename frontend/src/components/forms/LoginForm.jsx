import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import promotionalVideo from "../../assets/assets en video/promocion.mp4"

export default function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPromotionalVideo, setShowPromotionalVideo] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [videoPlaybackError, setVideoPlaybackError] = useState("")
  const videoRef = useRef(null)

  const cerrarVideo = () => {
    videoRef.current?.pause()
    setShowPromotionalVideo(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (email === "rick" && password === "roll") {
      setVideoError(false)
      setVideoPlaybackError("")
      setShowPromotionalVideo(true)
      if (videoRef.current) {
        videoRef.current.muted = false
        videoRef.current.volume = 1
        videoRef.current.currentTime = 0
        videoRef.current.play().catch(() => {
          setVideoPlaybackError("El navegador bloqueó la reproducción automática con audio.")
        })
      }
      return
    }

    const emailInput = e.currentTarget.elements.email
    if (!email.trim() || emailInput.validity.typeMismatch) {
      setError("Ingresa un correo electrónico válido")
      return
    }
    if (!password) {
      setError("Ingresa tu contraseña")
      return
    }

    setLoading(true)
    try {
      const body = new URLSearchParams()
      body.append("username", email)
      body.append("password", password)
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || "Error al iniciar sesión")
      }

      localStorage.setItem("access_token", data.access_token)
      localStorage.setItem("refresh_token", data.refresh_token)

      if (data.usuario?.ciuser) {
        localStorage.setItem("ciuser", data.usuario.ciuser);
      }

      const rolesUsuario = data.usuario?.roles || [data.usuario?.idrol || 5];
      const requierePuente = data.usuario?.requiere_puente ?? (rolesUsuario.length > 1);
      localStorage.setItem("user_roles", JSON.stringify(rolesUsuario));

      if (requierePuente) {
        navigate("/seleccionar-rol");
      } else {
        // Si tiene un solo rol, lo guardamos y redirigimos de inmediato
        const rolUnico = rolesUsuario[0] || data.usuario?.idrol;
        localStorage.setItem("idrol", rolUnico);
        
        if (rolUnico === 4) {
          navigate("/crudcursos");
        } else if (rolUnico === 5) {
          navigate("/cursosdisponibles");
        } else {
          navigate("/crudestudiantes");
        }
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white">BIENVENIDOS</h1>
        <p className="text-gray-300 mt-2">Ingresa tus datos para iniciar sesión.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-6">
        <div>
          <label htmlFor="email" className="text-base font-medium text-white">Correo Electronico</label>
          <input
            id="email"
            type="email"
            className="text-white w-full border border-gray-200 rounded-xl p-4 mt-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition-all"
            placeholder="Ingresa tu correo"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className="text-base font-medium text-white">Contraseña</label>
          <div className="relative mt-2">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="text-white w-full border border-gray-200 rounded-xl p-4 pr-20 bg-transparent focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition-all"
              placeholder="Ingrese su contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-4 font-semibold text-yellow-300 hover:text-yellow-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
            >
              {showPassword ? "Ocultar" : "Ver"}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <input type="checkbox" id="remember-me" className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500 border-gray-300" />
            <label htmlFor="remember-me" className="ml-2 font-medium text-base text-gray-200 cursor-pointer">Recuerdame</label>
          </div>
          <button type="button" className="font-medium text-base text-yellow-300 hover:text-yellow-400 transition-colors">
            Olvido de Contraseña?
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <div className="flex flex-col gap-4 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-yellow-300 text-black text-lg font-bold transition-all duration-75 ease-in-out hover:scale-[1.02] hover:bg-yellow-400 active:scale-[0.98] active:bg-yellow-500 shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

          <button
            type="button"
            onClick={() => navigate('/registro')}
            className="w-full py-4 rounded-xl border border-gray-200 text-white text-lg font-bold hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Crear Cuenta
          </button>
        </div>
      </form>
    </div>
    <div
        className={`fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 p-4 transition-opacity ${
          showPromotionalVideo ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Video promocional"
        aria-hidden={!showPromotionalVideo}
      >
        <div className="relative flex h-full max-h-[90vh] w-full max-w-5xl items-center justify-center">
            <button
            type="button"
            onClick={cerrarVideo}
            className="absolute right-0 top-0 z-10 rounded bg-gray-800 px-4 py-2 font-semibold text-white hover:bg-gray-700"
          >
            Cerrar
          </button>
          {videoError ? (
            <p className="rounded-lg border border-red-500/50 bg-gray-900 p-6 text-center text-red-300">
              No se pudo cargar el video promocional. Comprueba el archivo del video y vuelve a intentarlo.
            </p>
          ) : (
            <video
              ref={videoRef}
              src={promotionalVideo}
              playsInline
              preload="none"
              onError={() => setVideoError(true)}
              onEnded={cerrarVideo}
              className="max-h-full max-w-full object-contain"
            />
          )}
          {videoPlaybackError && (
            <p role="alert" className="absolute bottom-4 rounded bg-gray-900/95 px-4 py-2 text-center text-red-300">
              {videoPlaybackError}
            </p>
          )}
        </div>
    </div>
    </>
  )
}