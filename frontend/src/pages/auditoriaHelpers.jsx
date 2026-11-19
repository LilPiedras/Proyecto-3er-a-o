export const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const formatFecha = (fecha) => {
  if (!fecha) return "—";
  return new Date(`${fecha}T12:00:00`).toLocaleDateString("es-VE");
};

export const humanizarTexto = (texto) =>
  String(texto || "")
    .replace(/[_:.@/-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\p{L}/u, (letra) => letra.toLocaleUpperCase("es"));

export const traducirAccion = (accion) => {
  const texto = String(accion || "").trim();
  const normalizada = texto.toLocaleLowerCase("es");
  const acciones = [
    [/^(crear|create|insertar|insert|registrar|alta)(?:[\s._:/-]+(.+))?$/, "Se creó"],
    [/^(actualizar|update|modificar|editar|edit)(?:[\s._:/-]+(.+))?$/, "Se actualizaron los datos"],
    [/^(eliminar|delete|borrar|remove|dar de baja)(?:[\s._:/-]+(.+))?$/, "Se eliminó"],
    [/^(iniciar sesión|iniciar_sesion|login|acceso)$/, "Inicio de sesión"],
    [/^(cerrar sesión|cerrar_sesion|logout)$/, "Cierre de sesión"],
    [/^(inscribir|inscripción|inscripcion|enroll)$/, "Inscripción realizada"],
    [/^(pagar|pago|payment)$/, "Pago registrado"],
  ];

  for (const [patron, descripcion] of acciones) {
    const coincidencia = normalizada.match(patron);
    if (coincidencia) {
      const entidad = coincidencia[2]
        ?.replace(/^(into|from|table)\s+/i, "")
        .split(/\s+(?:set|where|values)\b/i)[0];
      return entidad ? `${descripcion}: ${humanizarTexto(entidad)}` : descripcion;
    }
  }

  return humanizarTexto(texto) || "Acción registrada";
};

export const traducirCampo = (campo) => {
  const nombres = {
    ciuser: "Cédula",
    nombreusuario: "Nombre",
    apellusuario: "Apellido",
    correousuario: "Correo electrónico",
    teleusuario: "Teléfono",
    activo: "Estado",
    fecha: "Fecha",
    hora: "Hora",
    monto: "Monto",
    estado: "Estado",
    descripcion: "Descripción",
    nombre: "Nombre",
  };
  return nombres[campo.toLocaleLowerCase("es")] || humanizarTexto(campo);
};

const esCampoSensible = (campo) => {
  const normalizado = campo
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_\-\s]/g, "");
  return /^(contrase|contrasena|password|passwd|clave|secret|token)$/.test(normalizado);
};

const ocultarDatosSensibles = (datos) => {
  if (Array.isArray(datos)) return datos.map(ocultarDatosSensibles);
  if (!datos || typeof datos !== "object") return datos;
  return Object.fromEntries(
    Object.entries(datos)
      .filter(([campo]) => !esCampoSensible(campo))
      .map(([campo, valor]) => [campo, ocultarDatosSensibles(valor)])
  );
};

export const leerDatos = (texto) => {
  if (!texto) return null;
  try {
    const datos = JSON.parse(texto);
    if (datos && typeof datos === "object") return ocultarDatosSensibles(datos);
    return { detalle: datos };
  } catch {
    return { detalle: texto };
  }
};

export const mostrarValor = (valor) => {
  if (valor === null || valor === undefined || valor === "") return "Sin dato";
  if (typeof valor === "boolean") return valor ? "Sí" : "No";
  if (typeof valor === "object") return JSON.stringify(valor, null, 2);
  return String(valor);
};