import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Fromt() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [lastname, setLastName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [dni, setDni] = useState("")
  const [address, setAddress] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, lastname, phoneNumber, email, dni, address, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Error al registrarse")
      }

      alert("Registro exitoso, ahora inicia sesión.")
      navigate("/")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white">REGÍSTRATE</h1>
        <p className="text-gray-300 mt-2">Ingresa tus datos para registrarte.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <div>
          <label htmlFor="name" className="text-base font-medium text-white">Nombres</label>
          <input
            id="name"
            type="text"
            className="text-white w-full border border-gray-200 rounded-xl p-4 mt-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition-all"
            placeholder="Ingresa tu nombre"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="lastname" className="text-base font-medium text-white">Apellidos</label>
          <input
            id="lastname"
            type="text"
            className="text-white w-full border border-gray-200 rounded-xl p-4 mt-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition-all"
            placeholder="Ingresa tu apellido"
            required
            value={lastname}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="phoneNumber" className="text-base font-medium text-white">Numero de Telefono</label>
          <input
            id="phoneNumber"
            type="number"
            className="text-white w-full border border-gray-200 rounded-xl p-4 mt-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition-all"
            placeholder="Ingresa tu numero de telefono"
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

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
          <label htmlFor="dni" className="text-base font-medium text-white">Numero de Cedula</label>
          <input
            id="number"
            type="number"
            className="text-white w-full border border-gray-200 rounded-xl p-4 mt-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition-all"
            placeholder="Ingresa tu cedula"
            required
            value={dni}
            onChange={(e) => setDni(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="address" className="text-base font-medium text-white">Direccion exacta</label>
          <input
            id="address"
            type="text"
            className="text-white w-full border border-gray-200 rounded-xl p-4 mt-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition-all"
            placeholder="Ingresa tu direccion exacta"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className="text-base font-medium text-white">Contraseña</label>
          <input
            id="password"
            type="password"
            className="text-white w-full border border-gray-200 rounded-xl p-4 mt-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition-all"
            placeholder="Crea una contraseña"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
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
            {loading ? "Registrando..." : "Registrarse"}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-4 rounded-xl border border-gray-200 text-white text-lg font-bold hover:bg-gray-800 transition-colors"
          >
            ¿Ya tienes cuenta? Iniciar Sesión
          </button>
        </div>
      </form>
    </div>
  )
}