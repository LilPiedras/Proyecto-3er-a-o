export default function Fromc() {
  return (
    <div className="bg-white px-10 py-12 rounded-3xl border border-gray-200 shadow-sm w-full max-w-md">
      {/* Encabezado */}
      <h1 className="text-5xl font-semibold text-gray-900">
        Welcome Back!
      </h1>
      <p className="font-medium text-lg text-gray-500 mt-4">
        Please enter your details to sign in.
      </p>

      {/* Formulario */}
      <div className="mt-8 flex flex-col gap-6">
        
        {/* Input Email */}
        <div>
          <label htmlFor="email" className="text-base font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full border border-gray-200 rounded-xl p-4 mt-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            placeholder="Enter your email"
            required
          />
        </div>

        {/* Input Password */}
        <div>
          <label htmlFor="password" className="text-base font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full border border-gray-200 rounded-xl p-4 mt-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            placeholder="Enter your password"
            required
          />
        </div>

        {/* Checkbox y Forgot Password */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember-me"
              className="w-4 h-4 text-violet-500 rounded focus:ring-violet-500 border-gray-300"
            />
            <label htmlFor="remember-me" className="ml-2 font-medium text-base text-gray-600 cursor-pointer">
              Remember me
            </label>
          </div>
          <button type="button" className="font-medium text-base text-violet-500 hover:text-violet-600 transition-colors">
            Forgot Password?
          </button>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col gap-4 mt-4">
          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-yellow-300 text-white text-lg font-bold 
                       transition-all duration-75 ease-in-out 
                       hover:scale-[1.02] hover:bg-yellow-400 
                       active:scale-[0.98] active:bg-yellow-500 
                       shadow-lg shadow-violet-500/30"
          >
            Sign in
          </button>
          
          <button
            type="button"
            className="w-full py-4 rounded-xl border border-gray-200 text-gray-700 text-lg font-bold 
                       hover:bg-gray-50 transition-colors"
          >
            Create Account
          </button>
        </div>

      </div>
    </div>
  )
}