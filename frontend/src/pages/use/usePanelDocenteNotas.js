import { useEffect, useState } from "react";
import api from "../../api";

export function usePanelDocenteNotas() {
  const ciDocente =
    localStorage.getItem("ciuser") || localStorage.getItem("ciempleado") || "";
  const [materiasDocente, setMateriasDocente] = useState([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [estudiantes, setEstudiantes] = useState([]);
  const [todosEstudiantes, setTodosEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMaterias, setLoadingMaterias] = useState(Boolean(ciDocente));
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(
    ciDocente ? "" : "No se encontró la cédula del docente en sesión."
  );

  useEffect(() => {
    if (!ciDocente) return undefined;
    let active = true;

    api
      .get(`/Notas/docente/${ciDocente}/estudiantes`)
      .then(({ data }) => {
        if (!active) return;
        const lista = Array.isArray(data) ? data : [];
        setTodosEstudiantes(lista);

        const materiasMap = new Map();
        lista.forEach((estudiante) => {
          if (estudiante.idmateria && !materiasMap.has(estudiante.idmateria)) {
            materiasMap.set(estudiante.idmateria, {
              idmateria: estudiante.idmateria,
              nombremateria:
                estudiante.nombremateria || `Materia #${estudiante.idmateria}`,
            });
          }
        });
        setMateriasDocente(Array.from(materiasMap.values()));
      })
      .catch((requestError) => {
        if (!active) return;
        console.error(requestError);
        setError("No se pudieron cargar tus materias asignadas.");
        setMateriasDocente([]);
        setTodosEstudiantes([]);
      })
      .finally(() => {
        if (active) setLoadingMaterias(false);
      });

    return () => {
      active = false;
    };
  }, [ciDocente]);

  const seleccionarMateria = (idMateria) => {
    setMateriaSeleccionada(idMateria);
    setMensaje("");
    setError("");
    setEstudiantes([]);

    if (!idMateria) return;

    setLoading(true);
    const filtrados = todosEstudiantes
      .filter((estudiante) => String(estudiante.idmateria) === String(idMateria))
      .map((estudiante) => ({
        ...estudiante,
        ciuser: estudiante.ciestu,
        nombre: `${estudiante.nombreestu || ""} ${estudiante.apelliestu || ""}`.trim(),
        nuevaNota: "",
        idseccmo: estudiante.idseccmo,
      }));
    setEstudiantes(filtrados);
    setLoading(false);
  };

  const cambiarNota = (ciuser, valor) => {
    setEstudiantes((actuales) =>
      actuales.map((estudiante) =>
        estudiante.ciuser === ciuser
          ? { ...estudiante, nuevaNota: valor }
          : estudiante
      )
    );
  };

  const publicarNotas = async () => {
    setError("");
    setMensaje("");

    const conNota = estudiantes.filter(
      (estudiante) => estudiante.nuevaNota !== "" && estudiante.nuevaNota != null
    );
    if (conNota.length === 0) {
      setError("Ingresa al menos una calificación.");
      return;
    }

    try {
      for (const estudiante of conNota) {
        const valor = parseFloat(estudiante.nuevaNota);
        if (isNaN(valor) || valor < 0 || valor > 20) {
          setError(`Nota inválida para ${estudiante.nombre} (debe ser 0–20).`);
          return;
        }
        await api.post(`/Notas/docente/${ciDocente}`, {
          notas: valor,
          oferta: estudiante.idseccmo,
          fechanota: new Date().toISOString().slice(0, 10),
          idevaluacion: null,
        });
      }
      setMensaje("¡Notas publicadas correctamente!");
    } catch (requestError) {
      console.error(requestError);
      const detail = requestError.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Error al guardar las calificaciones."
      );
    }
  };

  return {
    materiasDocente,
    materiaSeleccionada,
    estudiantes,
    loading,
    loadingMaterias,
    mensaje,
    error,
    seleccionarMateria,
    cambiarNota,
    publicarNotas,
  };
}
