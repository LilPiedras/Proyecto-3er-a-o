import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api";
import { show_alert } from "../../components/functions/Showpro_functions";

const fechaLocal = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const detalleError = (error, mensaje) => {
  const detail = error.response?.data?.detail;
  return typeof detail === "string" ? detail : mensaje;
};

export function useCrudAsistencia() {
  const [secciones, setSecciones] = useState([]);
  const [idsecc, setIdsecc] = useState("");
  const [materias, setMaterias] = useState([]);
  const [idmateria, setIdmateria] = useState("");
  const [fecha, setFecha] = useState(fechaLocal);
  const [estudiantes, setEstudiantes] = useState([]);
  const [marcas, setMarcas] = useState({});
  const [cargandoSecciones, setCargandoSecciones] = useState(true);
  const [materiasCargadasPara, setMateriasCargadasPara] = useState(null);
  const [listaCargadaPara, setListaCargadaPara] = useState(null);
  const [guardando, setGuardando] = useState("");
  const [confirmandoAsistencia, setConfirmandoAsistencia] = useState(false);
  const [errorAcceso, setErrorAcceso] = useState("");
  const [actualizacion, setActualizacion] = useState(0);
  const [searchParams] = useSearchParams();
  const seccPreferida = searchParams.get("idsecc") || "";
  const materiaPreferida = searchParams.get("idmateria") || "";
  const claveMaterias = JSON.stringify([idsecc, materiaPreferida]);
  const claveLista = JSON.stringify([idsecc, idmateria, fecha, actualizacion]);

  useEffect(() => {
    let vigente = true;
    api
      .get("/asistencias/secciones")
      .then(({ data }) => {
        if (!vigente) return;
        const lista = Array.isArray(data) ? data : [];
        setSecciones(lista);
        if (!lista.length) return;

        const match = seccPreferida
          ? lista.find((seccion) => String(seccion.idsecc) === String(seccPreferida))
          : null;
        setMaterias([]);
        setIdmateria("");
        setEstudiantes([]);
        setMarcas({});
        setMateriasCargadasPara(null);
        setListaCargadaPara(null);
        setIdsecc(String(match ? match.idsecc : lista[0].idsecc));
      })
      .catch((error) => {
        if (vigente) {
          setErrorAcceso(detalleError(error, "No se pudieron cargar las secciones"));
        }
      })
      .finally(() => {
        if (vigente) setCargandoSecciones(false);
      });
    return () => {
      vigente = false;
    };
  }, [seccPreferida]);

  useEffect(() => {
    if (!idsecc) {
      return undefined;
    }

    let vigente = true;
    api
      .get(`/asistencias/secciones/${idsecc}/materias`)
      .then(({ data }) => {
        if (!vigente) return;
        const lista = Array.isArray(data) ? data : [];
        setMaterias(lista);
        if (!lista.length) {
          return;
        }

        const match = materiaPreferida
          ? lista.find(
              (materia) => String(materia.idmateria) === String(materiaPreferida)
            )
          : null;
        setIdmateria(String(match ? match.idmateria : lista[0].idmateria));
      })
      .catch((error) => {
        if (vigente) {
          show_alert(
            detalleError(error, "No se pudieron cargar las materias de la sección"),
            "error"
          );
        }
      })
      .finally(() => {
        if (vigente) setMateriasCargadasPara(claveMaterias);
      });
    return () => {
      vigente = false;
    };
  }, [idsecc, materiaPreferida, claveMaterias]);

  useEffect(() => {
    if (!idsecc || !idmateria || !fecha) {
      return undefined;
    }

    let vigente = true;
    api
      .get("/asistencias/", { params: { idmateria, idsecc, fecha } })
      .then(({ data }) => {
        if (!vigente) return;
        const lista = Array.isArray(data) ? data : [];
        setEstudiantes(lista);
        setMarcas(
          Object.fromEntries(
            lista.map((alumno) => [alumno.asisestu, Boolean(alumno.verificar)])
          )
        );
      })
      .catch((error) => {
        if (vigente) {
          show_alert(
            detalleError(error, "No se pudo cargar la lista de asistencia"),
            "error"
          );
        }
      })
      .finally(() => {
        if (vigente) setListaCargadaPara(claveLista);
      });
    return () => {
      vigente = false;
    };
  }, [idsecc, idmateria, fecha, actualizacion, claveLista]);

  const guardar = async (alumno) => {
    const payload = {
      asisestu: alumno.asisestu,
      idmateria: Number(idmateria),
      fecha,
      verificar: Boolean(marcas[alumno.asisestu]),
    };
    setGuardando(alumno.asisestu);
    try {
      if (alumno.idasis) {
        await api.patch(`/asistencias/${alumno.idasis}`, {
          verificar: payload.verificar,
        });
      } else {
        await api.post("/asistencias/", payload);
      }
      show_alert("Asistencia guardada", "success");
      recargarLista();
    } catch (error) {
      show_alert(detalleError(error, "No se pudo guardar la asistencia"), "error");
    } finally {
      setGuardando("");
    }
  };

  const todosPresentes =
    estudiantes.length > 0 &&
    estudiantes.every((alumno) => Boolean(marcas[alumno.asisestu]));

  const cambiarSeccion = (valor) => {
    if (valor === idsecc) return;
    setIdsecc(valor);
    setMaterias([]);
    setIdmateria("");
    setEstudiantes([]);
    setMarcas({});
    setMateriasCargadasPara(null);
    setListaCargadaPara(null);
  };

  const cambiarMateria = (valor) => {
    if (valor === idmateria) return;
    setIdmateria(valor);
    setListaCargadaPara(null);
    if (!valor) {
      setEstudiantes([]);
      setMarcas({});
    }
  };

  const cambiarFecha = (valor) => {
    if (valor === fecha) return;
    setFecha(valor);
    setListaCargadaPara(null);
    if (!valor) {
      setEstudiantes([]);
      setMarcas({});
    }
  };

  const recargarLista = () => {
    setActualizacion((valor) => valor + 1);
  };

  const alternarTodosPresentes = () => {
    if (!estudiantes.length) return;
    const marcarPresente = !todosPresentes;
    setMarcas(
      Object.fromEntries(
        estudiantes.map((alumno) => [alumno.asisestu, marcarPresente])
      )
    );
  };

  const confirmarAsistencia = async () => {
    if (!estudiantes.length || !idmateria || !idsecc || !fecha) return;
    setConfirmandoAsistencia(true);
    try {
      const { data } = await api.post("/asistencias/lote", {
        idmateria: Number(idmateria),
        idsecc: Number(idsecc),
        fecha,
        asistencias: estudiantes.map((alumno) => ({
          asisestu: alumno.asisestu,
          verificar: Boolean(marcas[alumno.asisestu]),
        })),
      });
      show_alert(`${data.actualizadas} asistencias confirmadas`, "success");
      recargarLista();
    } catch (error) {
      show_alert(
        detalleError(error, "No se pudieron confirmar las asistencias"),
        "error"
      );
    } finally {
      setConfirmandoAsistencia(false);
    }
  };

  const eliminar = async (alumno) => {
    if (
      !alumno.idasis ||
      !window.confirm(
        `¿Eliminar la asistencia de ${alumno.nombreestu} ${alumno.apelliestu}?`
      )
    ) {
      return;
    }
    setGuardando(alumno.asisestu);
    try {
      await api.delete(`/asistencias/${alumno.idasis}`);
      show_alert("Registro de asistencia eliminado", "success");
      recargarLista();
    } catch (error) {
      show_alert(detalleError(error, "No se pudo eliminar la asistencia"), "error");
    } finally {
      setGuardando("");
    }
  };

  return {
    secciones,
    idsecc,
    cambiarSeccion,
    materias,
    idmateria,
    cambiarMateria,
    fecha,
    cambiarFecha,
    estudiantes,
    marcas,
    setMarcas,
    cargandoSecciones,
    cargandoMaterias: Boolean(
      idsecc && materiasCargadasPara !== claveMaterias
    ),
    cargandoLista: Boolean(
      idsecc && idmateria && fecha && listaCargadaPara !== claveLista
    ),
    guardando,
    confirmandoAsistencia,
    errorAcceso,
    todosPresentes,
    alternarTodosPresentes,
    confirmarAsistencia,
    guardar,
    eliminar,
  };
}
