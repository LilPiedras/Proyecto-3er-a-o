import { useEffect, useState } from "react";
import axios from "axios";

const obtenerToken = () => {
  const tokenData =
    localStorage.getItem("usuario") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  if (!tokenData) return "";
  try {
    const parsed = JSON.parse(tokenData);
    return (
      parsed.access_token ||
      parsed.token ||
      (typeof parsed === "string" ? parsed : tokenData)
    );
  } catch {
    return tokenData;
  }
};

const obtenerIniciales = (nombre, apellido) => {
  const inicialNombre = nombre ? nombre.charAt(0) : "";
  const inicialApellido = apellido ? apellido.charAt(0) : "";
  return (inicialNombre + inicialApellido).toUpperCase() || "U";
};

const obtenerNombreRol = (idrol) => {
  switch (Number(idrol)) {
    case 1:
      return "Director";
    case 2:
      return "Sub Director";
    case 3:
      return "Coordinador";
    case 4:
      return "Docente";
    case 5:
      return "Estudiante";
    default:
      return "Sin rol";
  }
};

export function usePerfil() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editandoCorreo, setEditandoCorreo] = useState(false);
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [mensajeCorreo, setMensajeCorreo] = useState({ tipo: "", texto: "" });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let active = true;
    axios
      .get("/api/api/perfil/", {
        headers: { Authorization: `Bearer ${obtenerToken()}` },
      })
      .then(({ data }) => {
        if (!active) return;
        setPerfil(data);
        setNuevoCorreo(data.correo || data.correousuario || "");
      })
      .catch((requestError) => {
        if (!active) return;
        console.error("Error al cargar el perfil:", requestError);
        setError("No se pudieron cargar los datos del perfil.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const actualizarCorreo = async (event) => {
    event.preventDefault();
    setMensajeCorreo({ tipo: "", texto: "" });
    setGuardando(true);

    try {
      await axios.patch(
        `/api/usuario/${encodeURIComponent(perfil.ciuser)}`,
        { correousuario: nuevoCorreo.trim() },
        { headers: { Authorization: `Bearer ${obtenerToken()}` } }
      );

      setPerfil((actual) => ({
        ...actual,
        correo: nuevoCorreo.trim(),
        correousuario: nuevoCorreo.trim(),
      }));
      setEditandoCorreo(false);
      setMensajeCorreo({ tipo: "exito", texto: "¡Correo actualizado con éxito!" });
      setTimeout(() => setMensajeCorreo({ tipo: "", texto: "" }), 4000);
    } catch (requestError) {
      console.error("Error al actualizar correo:", requestError);
      const detail = requestError.response?.data?.detail;
      setMensajeCorreo({
        tipo: "error",
        texto:
          typeof detail === "string"
            ? detail
            : "Error al actualizar el correo electrónico.",
      });
    } finally {
      setGuardando(false);
    }
  };

  const cancelarEdicionCorreo = () => {
    setEditandoCorreo(false);
    setNuevoCorreo(perfil?.correo || perfil?.correousuario || "");
  };

  return {
    perfil,
    loading,
    error,
    editandoCorreo,
    setEditandoCorreo,
    nuevoCorreo,
    setNuevoCorreo,
    mensajeCorreo,
    guardando,
    actualizarCorreo,
    cancelarEdicionCorreo,
    obtenerIniciales,
    obtenerNombreRol,
  };
}
