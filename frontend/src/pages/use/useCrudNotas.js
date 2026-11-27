import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api";
import { show_alert } from "../../components/functions/Showpro_functions";

const obtenerRol = () => {
  const saved =
    localStorage.getItem("idrol") ||
    localStorage.getItem("user_role") ||
    localStorage.getItem("role");
  if (saved !== null && saved !== undefined && saved !== "") {
    return !isNaN(saved) ? parseInt(saved, 10) : saved;
  }
  return 5;
};

const normalizar = (texto) =>
  String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export function useCrudNotas() {
  const rolUsuario = obtenerRol();
  const ciuser = localStorage.getItem("ciuser") || "";
  const esDocenteOAdmin = [1, 2, 4, "1", "2", "4"].includes(rolUsuario);
  const esEstudiante = [5, "5"].includes(rolUsuario);
  const esRolAdministrador = [1, "1"].includes(rolUsuario);
  const [cargando, setCargando] = useState(true);
  const [estudiantes, setEstudiantes] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [notasLista, setNotasLista] = useState([]);
  const [oferta, setOferta] = useState("");
  const [idevaluacion, setIdevaluacion] = useState("");
  const [notaValor, setNotaValor] = useState("");
  const [fechanota, setFechanota] = useState(new Date().toISOString().slice(0, 10));
  const [busquedaOferta, setBusquedaOferta] = useState("");
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [ofertaSeleccionadaLabel, setOfertaSeleccionadaLabel] = useState("");

  const cargarNotasEstudiante = useCallback(async (ci) => {
    try {
      const { data } = await api.get(`/Notas/estudiante/${ci}`);
      setNotasLista(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.response?.status === 404) {
        setNotasLista([]);
      } else {
        const detail = error.response?.data?.detail;
        show_alert(
          typeof detail === "string" ? detail : "Error al cargar tus notas",
          "error"
        );
        setNotasLista([]);
      }
    }
  }, []);

  const cargarDatosDocente = useCallback(async () => {
    try {
      const ci = localStorage.getItem("ciuser") || "";
      const promesas = [
        esRolAdministrador
          ? api.get("/plan-evaluacion/").catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] }),
      ];

      if (esRolAdministrador) {
        promesas.push(api.get("/Oferta/").catch(() => ({ data: [] })));
        promesas.push(api.get("/Notas/").catch(() => ({ data: [] })));
        promesas.push(
          ci
            ? api.get(`/Notas/docente/${ci}/estudiantes`).catch(() => ({ data: [] }))
            : Promise.resolve({ data: [] })
        );
      } else {
        promesas.push(
          ci
            ? api.get(`/Oferta/docente/${ci}`).catch(() => ({ data: [] }))
            : Promise.resolve({ data: [] })
        );
        promesas.push(
          ci
            ? api.get(`/Notas/docente/${ci}/notas`).catch(() => ({ data: [] }))
            : Promise.resolve({ data: [] })
        );
        promesas.push(
          ci
            ? api.get(`/Notas/docente/${ci}/estudiantes`).catch(() => ({ data: [] }))
            : Promise.resolve({ data: [] })
        );
      }

      const resultados = await Promise.all(promesas);
      const [resPlanes, resOfertas, resNotas, resEstu] = resultados;
      const ofertasData = Array.isArray(resOfertas.data) ? resOfertas.data : [];
      const estudiantesData = Array.isArray(resEstu.data) ? resEstu.data : [];

      setEvaluaciones(Array.isArray(resPlanes.data) ? resPlanes.data : []);
      setOfertas(ofertasData);
      setNotasLista(Array.isArray(resNotas.data) ? resNotas.data : []);
      setEstudiantes(estudiantesData);

      if (
        !esRolAdministrador &&
        ofertasData.length === 0 &&
        estudiantesData.length === 0
      ) {
        show_alert(
          "No tienes materias/ofertas asignadas. Revisa Oferta / asignación de horario.",
          "warning"
        );
      }
    } catch (error) {
      console.error(error);
      show_alert("Error al cargar datos de notas", "error");
    }
  }, [esRolAdministrador]);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        if (esEstudiante && ciuser) {
          await cargarNotasEstudiante(ciuser);
        } else if (esDocenteOAdmin) {
          await cargarDatosDocente();
        }
      } finally {
        if (active) setCargando(false);
      }
    };

    init();
    return () => {
      active = false;
    };
  }, [cargarDatosDocente, cargarNotasEstudiante, ciuser, esDocenteOAdmin, esEstudiante]);

  const manejarCambioOferta = async (idSeccMo) => {
    setOferta(idSeccMo);
    setIdevaluacion("");
    if (!idSeccMo) {
      setEvaluaciones([]);
      return;
    }
    const estudiante =
      estudiantes.find((item) => String(item.idseccmo) === String(idSeccMo)) ||
      ofertas.find((item) => String(item.idseccmo) === String(idSeccMo));
    const idmateria = estudiante?.idmateria;
    if (!idmateria) {
      setEvaluaciones([]);
      return;
    }
    try {
      const { data } = await api.get(`/plan-evaluacion/materia/${idmateria}`);
      setEvaluaciones(Array.isArray(data) ? data : []);
    } catch {
      setEvaluaciones([]);
    }
  };

  const listaOfertasDisponibles = useMemo(
    () => (estudiantes.length > 0 ? estudiantes : ofertas.filter((item) => item.estudiante)),
    [estudiantes, ofertas]
  );

  const etiquetaOferta = (item) => {
    const nombre = `${item.nombreestu || item.estudiante || ""} ${item.apelliestu || ""}`.trim();
    const ci = item.ciestu || item.ci || item.estudiante || "";
    const materia = item.nombremateria || "";
    const seccion = item.nomsecc || item.seccion || item.idsecc || "";
    const horario =
      item.horario_texto ||
      (item.dia ? `${item.dia} ${item.horainicio || ""}-${item.horafin || ""}` : "");
    return [
      ci && `CI ${ci}`,
      nombre,
      materia,
      seccion && `Secc. ${seccion}`,
      horario,
    ]
      .filter(Boolean)
      .join(" — ");
  };

  const sugerenciasOferta = useMemo(() => {
    const query = normalizar(busquedaOferta);
    if (!query || query.length < 2) return [];
    return listaOfertasDisponibles
      .filter((item) => {
        const ci = normalizar(item.ciestu || item.ci || item.estudiante);
        const nombre = normalizar(
          `${item.nombreestu || ""} ${item.apelliestu || ""} ${item.estudiante || ""}`
        );
        const materia = normalizar(item.nombremateria);
        const seccion = normalizar(item.nomsecc || item.seccion || item.idsecc);
        return (
          ci.includes(query) ||
          nombre.includes(query) ||
          materia.includes(query) ||
          seccion.includes(query) ||
          String(item.idseccmo).includes(query)
        );
      })
      .slice(0, 12);
  }, [busquedaOferta, listaOfertasDisponibles]);

  const seleccionarOferta = (item) => {
    const id = String(item.idseccmo);
    const etiqueta = etiquetaOferta(item);
    setOferta(id);
    setOfertaSeleccionadaLabel(etiqueta);
    setBusquedaOferta(etiqueta);
    setMostrarSugerencias(false);
    manejarCambioOferta(id);
  };

  const limpiarOferta = () => {
    setOferta("");
    setOfertaSeleccionadaLabel("");
    setBusquedaOferta("");
    setIdevaluacion("");
    setEvaluaciones([]);
    setMostrarSugerencias(false);
  };

  const publicarNota = async (event) => {
    event.preventDefault();
    const ci = localStorage.getItem("ciuser");

    if (!ci) {
      return show_alert(
        "No se encontró tu cédula en sesión. Vuelve a iniciar sesión.",
        "warning"
      );
    }
    if (!oferta) {
      return show_alert(
        "Debes buscar y seleccionar un estudiante de la lista (por cédula o nombre). No se acepta texto escrito a mano.",
        "warning"
      );
    }

    const ofertaValida = listaOfertasDisponibles.find(
      (item) => String(item.idseccmo) === String(oferta)
    );
    if (!ofertaValida) {
      return show_alert(
        "La oferta seleccionada no es válida o no pertenece a tus materias.",
        "error"
      );
    }
    if (
      busquedaOferta.trim() &&
      ofertaSeleccionadaLabel &&
      normalizar(busquedaOferta) !== normalizar(ofertaSeleccionadaLabel)
    ) {
      return show_alert(
        "Modificaste el texto después de seleccionar. Vuelve a elegir un estudiante de la lista.",
        "warning"
      );
    }
    if (!idevaluacion) {
      return show_alert("Selecciona una evaluación del plan.", "warning");
    }
    if (notaValor === "" || notaValor === null) {
      return show_alert("Ingresa la calificación.", "warning");
    }

    const valor = parseFloat(notaValor);
    if (isNaN(valor) || valor < 0 || valor > 20) {
      return show_alert("La nota debe ser un número entre 0 y 20.", "warning");
    }
    if (!fechanota) {
      return show_alert("Indica la fecha de la nota.", "warning");
    }

    const hoy = new Date().toISOString().slice(0, 10);
    if (fechanota > hoy) {
      return show_alert("La fecha no puede ser futura.", "warning");
    }

    try {
      await api.post(`/Notas/docente/${ci}`, {
        notas: valor,
        oferta: parseInt(oferta, 10),
        fechanota,
        idevaluacion: parseInt(idevaluacion, 10),
      });
      show_alert("Nota publicada correctamente", "success");
      limpiarOferta();
      setNotaValor("");
      setFechanota(new Date().toISOString().slice(0, 10));
      await cargarDatosDocente();
    } catch (error) {
      const detail = error.response?.data?.detail;
      show_alert(
        typeof detail === "string" ? detail : "Error al publicar la nota",
        "error"
      );
    }
  };

  return {
    cargando,
    esDocenteOAdmin,
    esEstudiante,
    misNotas: notasLista,
    estudiantes,
    ofertas,
    evaluaciones,
    notasLista,
    oferta,
    setOferta,
    idevaluacion,
    setIdevaluacion,
    notaValor,
    setNotaValor,
    fechanota,
    setFechanota,
    busquedaOferta,
    setBusquedaOferta,
    mostrarSugerencias,
    setMostrarSugerencias,
    ofertaSeleccionadaLabel,
    setOfertaSeleccionadaLabel,
    listaOfertasDisponibles,
    sugerenciasOferta,
    normalizar,
    etiquetaOferta,
    seleccionarOferta,
    limpiarOferta,
    publicarNota,
  };
}
