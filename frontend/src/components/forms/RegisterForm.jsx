import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function RegisterForm() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [lastname, setLastName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [nationality, setNationality] = useState("V")
  const [dni, setDni] = useState("")
  const [idrol, setIdrol] = useState(5) // Cambiado por defecto a 5 (Estudiante)
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formattedDni = `${nationality}-${dni.trim()}`

    try {
      const res = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ciuser: formattedDni,
          nombreusuario: name.trim(),
          apellusuario: lastname.trim(),
          contrase: password,
          correousuario: email.trim(),
          teleusuario: phoneNumber.trim() || null,
          idrol: Number(idrol), // Se asegura de enviar el ID numérico
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        const msg =
          typeof data.detail === "string"
            ? data.detail
            : Array.isArray(data.detail)
              ? data.detail.map((d) => d.msg).join(", ")
              : data.message || "Error al registrarse"
        throw new Error(msg)
      }

      alert("Registro exitoso, ahora inicia sesión.")
      navigate("/login")
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
          <label htmlFor="phoneNumber" className="text-base font-medium text-white">Número de Teléfono</label>
          <input
            id="phoneNumber"
            type="text"
            className="text-white w-full border border-gray-200 rounded-xl p-4 mt-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition-all"
            placeholder="Ingresa tu número de teléfono"
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="email" className="text-base font-medium text-white">Correo Electrónico</label>
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
          <label htmlFor="dni" className="text-base font-medium text-white">Número de Cédula</label>
          <div className="flex gap-2 mt-2">
            <select
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              className="text-white border border-gray-200 rounded-xl p-4 bg-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition-all font-semibold"
            >
              <option value="V">V-</option>
              <option value="E">E-</option>
            </select>
            <input
              id="dni"
              type="text"
              className="text-white w-full border border-gray-200 rounded-xl p-4 bg-transparent focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition-all"
              placeholder="12345678"
              required
              value={dni}
              onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </div>

        <div>
          <label htmlFor="idrol" className="text-base font-medium text-white">Rol de Usuario</label>
          <select
            id="idrol"
            className="text-white w-full border border-gray-200 rounded-xl p-4 mt-2 bg-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition-all"
            value={idrol}
            onChange={(e) => setIdrol(Number(e.target.value))}
          >
            <option value={5}>Estudiante</option>
            <option value={1}>Director</option>
            <option value={2}>SubDirector</option>
            <option value={3}>Coordinador</option>
            <option value={4}>Docente</option>
          </select>
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
            className="w-full py-4 rounded-xl bg-yellow-300 text-gray-900 text-lg font-bold transition-all duration-75 ease-in-out hover:scale-[1.02] hover:bg-yellow-400 active:scale-[0.98] active:bg-yellow-500 shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-4 rounded-xl border border-gray-200 text-white text-lg font-bold hover:bg-gray-800 transition-colors"
          >
            ¿Ya tienes cuenta? Iniciar Sesión
          </button>
        </div>
      </form>
    </div>
  )
}