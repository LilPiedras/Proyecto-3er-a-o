import { useNavigate } from "react-router-dom"

export default function Fromt() {
  const navigate = useNavigate()
  
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white">REGÍSTRATE</h1>
        <p className="text-gray-300 mt-2">Ingresa tus datos para registrarte.</p>
      </div>

      <div className="mt-8 flex flex-col gap-6">
        <div>
          <label htmlFor="name" className="text-base font-medium text-white">Nombre Completo</label>
          <input
            id="name"
            type="text"
            className="text-white w-full border border-gray-200 rounded-xl p-4 mt-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition-all"
            placeholder="Ingresa tu nombre"
            required
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
          />
        </div>

        <div className="flex flex-col gap-4 mt-4">
          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-yellow-300 text-white text-lg font-bold transition-all duration-75 ease-in-out hover:scale-[1.02] hover:bg-yellow-400 active:scale-[0.98] active:bg-yellow-500 shadow-lg shadow-yellow-500/20"
          >
            Registrarse
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-4 rounded-xl border border-gray-200 text-white text-lg font-bold hover:bg-gray-800 transition-colors"
          >
            ¿Ya tienes cuenta? Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}