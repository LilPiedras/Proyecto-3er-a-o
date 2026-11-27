import { useState } from "react"
import { useNavigate } from "react-router-dom"

export function useLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const emailNormalizado = email.trim().toLowerCase()
      const body = new URLSearchParams()
      body.append("username", emailNormalizado)
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
        localStorage.setItem("ciuser", data.usuario.ciuser)
      }

      const rolesUsuario = data.usuario?.roles || [data.usuario?.idrol || 5]
      const requierePuente = data.usuario?.requiere_puente ?? (rolesUsuario.length > 1)
      localStorage.setItem("user_roles", JSON.stringify(rolesUsuario))

      if (requierePuente) {
        navigate("/seleccionar-rol")
      } else {
        const rolUnico = rolesUsuario[0] || data.usuario?.idrol
        localStorage.setItem("idrol", rolUnico)

        if (rolUnico === 4) {
          navigate("/crudcursos")
        } else if (rolUnico === 5) {
          navigate("/cursosdisponibles")
        } else {
          navigate("/crudestudiantes")
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    error,
    handleSubmit,
    irARecuperacion: () => navigate("/recuperar-password"),
  }
}
