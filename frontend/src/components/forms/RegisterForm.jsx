import { FaUserEdit, FaUserTimes } from "react-icons/fa"
import { useUsuarioGestion } from "./useUsarioGestion.js"
import ModalesUsuario from "./ModalesUsuario.jsx"

export default function RegisterForm() {
  const gestion = useUsuarioGestion()

  const {
    name, setName,
    lastname, setLastName,
    phoneNumber, setPhoneNumber,
    email, setEmail,
    nationality, setNationality,
    dni, setDni,
    password, setPassword,
    showPassword, setShowPassword,
    loading, error, successMsg,
    handleSubmit,
    abrirModalGestion
  } = gestion

  return (
    <div className="min-h-[80vh] w-full bg-[#1c180e] flex justify-center items-center py-12 px-4 relative">
      <div className="w-full max-w-xl bg-[#11141d] border border-[#2b2518] rounded-3xl shadow-2xl overflow-hidden p-8">
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-100">REGISTRO DE USUARIOS</h1>
          <p className="text-gray-400 mt-2 text-sm">Panel administrativo para dar de alta cuentas en el sistema.</p>
        </div>

        {/* Botones de gestión */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => abrirModalGestion("modificar")}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#181d28] border border-[#232936] text-[#fbbf24] hover:bg-[#202736] transition-all text-xs font-semibold cursor-pointer shadow-md"
          >
            <FaUserEdit size={14} /> Modificar / Roles
          </button>
          <button
            type="button"
            onClick={() => abrirModalGestion("eliminar")}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#181d28] border border-[#232936] text-red-400 hover:bg-red-950/30 hover:border-red-900/50 transition-all text-xs font-semibold cursor-pointer shadow-md"
          >
            <FaUserTimes size={14} /> Eliminar Usuario
          </button>
        </div>

        {/* Formulario de Registro Principal */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="name" className="text-sm font-semibold uppercase tracking-wider text-gray-400">Nombres</label>
            <input
              id="name"
              type="text"
              className="text-gray-200 w-full border border-[#252c3d] rounded-xl p-3 mt-1.5 bg-[#161a25] focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              placeholder="Ingresa el nombre"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="lastname" className="text-sm font-semibold uppercase tracking-wider text-gray-400">Apellidos</label>
            <input
              id="lastname"
              type="text"
              className="text-gray-200 w-full border border-[#252c3d] rounded-xl p-3 mt-1.5 bg-[#161a25] focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              placeholder="Ingresa el apellido"
              required
              value={lastname}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="text-sm font-semibold uppercase tracking-wider text-gray-400">Número de Teléfono</label>
            <input
              id="phoneNumber"
              type="text"
              className="text-gray-200 w-full border border-[#252c3d] rounded-xl p-3 mt-1.5 bg-[#161a25] focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              placeholder="Ingresa el teléfono"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-semibold uppercase tracking-wider text-gray-400">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              className="text-gray-200 w-full border border-[#252c3d] rounded-xl p-3 mt-1.5 bg-[#161a25] focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              placeholder="Ingresa el correo"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="dni" className="text-sm font-semibold uppercase tracking-wider text-gray-400">Número de Cédula</label>
            <div className="flex gap-2 mt-1.5">
              <select
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="text-gray-200 border border-[#252c3d] rounded-xl p-3 bg-[#161a25] focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all font-semibold"
              >
                <option value="V">V-</option>
                <option value="E">E-</option>
              </select>
              <input
                id="dni"
                type="text"
                className="text-gray-200 w-full border border-[#252c3d] rounded-xl p-3 bg-[#161a25] focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                placeholder="12345678"
                required
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-semibold uppercase tracking-wider text-gray-400">Contraseña</label>
            <div className="relative mt-1.5">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="text-gray-200 w-full border border-[#252c3d] rounded-xl p-3 pr-20 bg-[#161a25] focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                placeholder="Crea una contraseña"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute inset-y-0 right-4 font-semibold text-yellow-400 hover:text-yellow-300 text-sm"
              >
                {showPassword ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm font-medium bg-red-950/30 p-3 rounded-xl border border-red-900/50">{error}</p>
          )}

          {successMsg && (
            <p className="text-emerald-400 text-sm font-medium bg-emerald-950/30 p-3 rounded-xl border border-emerald-900/50">{successMsg}</p>
          )}

          <div className="flex flex-col gap-4 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-yellow-400 text-gray-900 text-base font-bold hover:bg-yellow-500 transition-all shadow-lg cursor-pointer disabled:opacity-50"
            >
              {loading ? "Verificando y Registrando..." : "Registrar Usuario"}
            </button>
          </div>
        </form>
      </div>

      {/* Modales separados */}
      <ModalesUsuario gestion={gestion} />
    </div>
  )
}