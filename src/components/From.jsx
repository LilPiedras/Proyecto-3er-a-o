import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Fromc() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Error al iniciar sesión")
      }

      // Aquí podrías guardar el usuario en localStorage o contexto
      alert(`Bienvenido ${data.user.nombres || ""}`)
      // navigate('/dashboard') // ruta futura si la creas
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white">BIENVENIDOS</h1>
        <p className="text-gray-300 mt-2">Ingresa tus datos para iniciar sesión.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
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
          <input
            id="password"
            type="password"
            className="text-white w-full border border-gray-200 rounded-xl p-4 mt-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition-all"
            placeholder="Ingrese su contraseña"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
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
            className="w-full py-4 rounded-xl bg-yellow-300 text-white text-lg font-bold transition-all duration-75 ease-in-out hover:scale-[1.02] hover:bg-yellow-400 active:scale-[0.98] active:bg-yellow-500 shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/registro')}
            className="w-full py-4 rounded-xl border border-gray-200 text-white text-lg font-bold hover:bg-gray-800 transition-colors"
          >
            Crear Cuenta
          </button>
        </div>
      </form>
    </div>
  )
}