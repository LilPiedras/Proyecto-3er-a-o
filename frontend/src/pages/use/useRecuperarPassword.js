import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../api"

export function useRecuperarPassword() {
  const navigate = useNavigate()
  const [paso, setPaso] = useState(1)
  const [nationality, setNationality] = useState("V")
  const [dni, setDni] = useState("")
  const [ciuserFinal, setCiuserFinal] = useState("")
  const [preguntaTexto, setPreguntaTexto] = useState("")
  const [respuesta, setRespuesta] = useState("")
  const [nuevaPassword, setNuevaPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [mensajeExito, setMensajeExito] = useState("")

  const handleBuscarPregunta = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formattedDni = `${nationality}-${dni.trim()}`

    try {
      const { data } = await api.get(`/PreguntasSeguridad/usuario/${encodeURIComponent(formattedDni)}`)

      setCiuserFinal(formattedDni)
      setPreguntaTexto(data.preguntas)
      setPaso(2)
    } catch (err) {
      console.error(err)
      const detail = err.response?.data?.detail
      setError(typeof detail === "string" ? detail : "No se encontró el usuario o no tiene pregunta de seguridad configurada.")
    } finally {
      setLoading(false)
    }
  }

  const handleCambiarPassword = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const payload = {
        ciuser: ciuserFinal,
        respuesta: respuesta.trim(),
        nueva_password: nuevaPassword,
      }
      const { data } = await api.post("/PreguntasSeguridad/recuperar-password", payload)

      setMensajeExito(data.mensaje || "¡Contraseña restablecida exitosamente!")
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (err) {
      console.error(err)
      const detail = err.response?.data?.detail
      setError(typeof detail === "string" ? detail : "La respuesta secreta es incorrecta o hubo un error.")
    } finally {
      setLoading(false)
    }
  }

  return {
    paso,
    setPaso,
    nationality,
    setNationality,
    dni,
    setDni,
    preguntaTexto,
    respuesta,
    setRespuesta,
    nuevaPassword,
    setNuevaPassword,
    loading,
    error,
    mensajeExito,
    handleBuscarPregunta,
    handleCambiarPassword,
  }
}
