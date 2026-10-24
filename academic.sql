--
-- PostgreSQL database dump
--



-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-10-21 15:01:47 -04

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 319 (class 1255 OID 16953)
-- Name: tf_registrar_auditoria_empleado(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tf_registrar_auditoria_empleado() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_viejo TEXT := NULL;
    v_nuevo TEXT := NULL;
    v_admin_id VARCHAR := current_setting('app.current_admin_id', true);
BEGIN
    IF v_admin_id IS NULL OR v_admin_id = '' THEN v_admin_id := 'SISTEMA'; END IF;

    IF TG_OP = 'INSERT' THEN
        v_nuevo := row_to_json(NEW)::text;
        INSERT INTO public.auditoria (usuario_escritor_id, usuario_objeto_id, accion, datos_anteriores, datos_nuevos, fecha)
        VALUES (v_admin_id, NEW.ciempleado, 'INSERT_EMPLEADO', NULL, v_nuevo, CURRENT_DATE);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        v_viejo := row_to_json(OLD)::text;
        v_nuevo := row_to_json(NEW)::text;
        INSERT INTO public.auditoria (usuario_escritor_id, usuario_objeto_id, accion, datos_anteriores, datos_nuevos, fecha)
        VALUES (v_admin_id, NEW.ciempleado, 'UPDATE_EMPLEADO', v_viejo, v_nuevo, CURRENT_DATE);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        v_viejo := row_to_json(OLD)::text;
        INSERT INTO public.auditoria (usuario_escritor_id, usuario_objeto_id, accion, datos_anteriores, datos_nuevos, fecha)
        VALUES (v_admin_id, OLD.ciempleado, 'DELETE_EMPLEADO', v_viejo, NULL, CURRENT_DATE);
        RETURN OLD;
    END IF;
END;
$$;


ALTER FUNCTION public.tf_registrar_auditoria_empleado() OWNER TO postgres;

--
-- TOC entry 317 (class 1255 OID 16955)
-- Name: tf_registrar_auditoria_estudiante(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tf_registrar_auditoria_estudiante() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_viejo TEXT := NULL;
    v_nuevo TEXT := NULL;
    v_admin_id VARCHAR := current_setting('app.current_admin_id', true);
BEGIN
    IF v_admin_id IS NULL OR v_admin_id = '' THEN v_admin_id := 'SISTEMA'; END IF;

    IF TG_OP = 'INSERT' THEN
        v_nuevo := row_to_json(NEW)::text;
        INSERT INTO public.auditoria (usuario_escritor_id, usuario_objeto_id, accion, datos_anteriores, datos_nuevos, fecha)
        VALUES (v_admin_id, NEW.ciestu, 'INSERT_ESTUDIANTE', NULL, v_nuevo, CURRENT_DATE);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        v_viejo := row_to_json(OLD)::text;
        v_nuevo := row_to_json(NEW)::text;
        INSERT INTO public.auditoria (usuario_escritor_id, usuario_objeto_id, accion, datos_anteriores, datos_nuevos, fecha)
        VALUES (v_admin_id, NEW.ciestu, 'UPDATE_ESTUDIANTE', v_viejo, v_nuevo, CURRENT_DATE);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        v_viejo := row_to_json(OLD)::text;
        INSERT INTO public.auditoria (usuario_escritor_id, usuario_objeto_id, accion, datos_anteriores, datos_nuevos, fecha)
        VALUES (v_admin_id, OLD.ciestu, 'DELETE_ESTUDIANTE', v_viejo, NULL, CURRENT_DATE);
        RETURN OLD;
    END IF;
END;
$$;


ALTER FUNCTION public.tf_registrar_auditoria_estudiante() OWNER TO postgres;

--
-- TOC entry 318 (class 1255 OID 16951)
-- Name: tf_registrar_auditoria_usuario(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tf_registrar_auditoria_usuario() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_viejo TEXT := NULL;
    v_nuevo TEXT := NULL;
    -- Capturamos el ID del administrador que hace la acción. Si no existe, usamos 'SISTEMA'
    v_admin_id VARCHAR := current_setting('app.current_admin_id', true);
BEGIN
    IF v_admin_id IS NULL OR v_admin_id = '' THEN
        v_admin_id := 'SISTEMA';
    END IF;

    IF TG_OP = 'INSERT' THEN
        -- row_to_json convierte la fila a JSON, y ::text lo vuelve formato texto plano
        v_nuevo := row_to_json(NEW)::text;
        
        INSERT INTO public.auditoria (usuario_escritor_id, usuario_objeto_id, accion, datos_anteriores, datos_nuevos, fecha)
        VALUES (v_admin_id, NEW.ciuser, 'INSERT', NULL, v_nuevo, CURRENT_DATE);
        
        RETURN NEW;
        
    ELSIF TG_OP = 'UPDATE' THEN
        v_viejo := row_to_json(OLD)::text;
        v_nuevo := row_to_json(NEW)::text;
        
        -- Tu código actual maneja el borrado lógico actualizando activo a False. 
        -- El trigger registrará esto como un UPDATE convencional con los cambios de estado.
        INSERT INTO public.auditoria (usuario_escritor_id, usuario_objeto_id, accion, datos_anteriores, datos_nuevos, fecha)
        VALUES (v_admin_id, NEW.ciuser, 'UPDATE', v_viejo, v_nuevo, CURRENT_DATE);
        
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN
        v_viejo := row_to_json(OLD)::text;
        
        INSERT INTO public.auditoria (usuario_escritor_id, usuario_objeto_id, accion, datos_anteriores, datos_nuevos, fecha)
        VALUES (v_admin_id, OLD.ciuser, 'DELETE', v_viejo, NULL, CURRENT_DATE);
        
        RETURN OLD;
    END IF;
END;
$$;


ALTER FUNCTION public.tf_registrar_auditoria_usuario() OWNER TO postgres;

--
-- TOC entry 305 (class 1255 OID 16389)
-- Name: validar_porcentaje_plan(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validar_porcentaje_plan() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    total_porcentaje NUMERIC(5,2);
BEGIN
    SELECT COALESCE(SUM(porcentaje), 0) INTO total_porcentaje
    FROM public.plan_evaluacion
    WHERE idmateria = NEW.idmateria 
      AND idsecc = NEW.idsecc 
      AND idevaluacion != COALESCE(NEW.idevaluacion, 0);

    IF (total_porcentaje + NEW.porcentaje) > 100.00 THEN
        RAISE EXCEPTION 'Error Académico: La suma de evaluaciones excede el 100 por ciento. Acumulado actual: %, Intentando sumar: %', 
                        total_porcentaje, NEW.porcentaje;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.validar_porcentaje_plan() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 16390)
-- Name: asignacion_docente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asignacion_docente (
    id_asignacion_docente integer NOT NULL,
    empleado_id character varying NOT NULL,
    materia_id integer NOT NULL,
    seccion_id integer NOT NULL,
    fecha_asignacion character varying(30) NOT NULL
);


ALTER TABLE public.asignacion_docente OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16400)
-- Name: asignacion_docente_id_asignacion_docente_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asignacion_docente_id_asignacion_docente_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asignacion_docente_id_asignacion_docente_seq OWNER TO postgres;

--
-- TOC entry 4890 (class 0 OID 0)
-- Dependencies: 220
-- Name: asignacion_docente_id_asignacion_docente_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asignacion_docente_id_asignacion_docente_seq OWNED BY public.asignacion_docente.id_asignacion_docente;


--
-- TOC entry 221 (class 1259 OID 16401)
-- Name: asignacion_docente_id_asignacion_docente_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.asignacion_docente ALTER COLUMN id_asignacion_docente ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.asignacion_docente_id_asignacion_docente_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 222 (class 1259 OID 16402)
-- Name: asistencias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asistencias (
    idasis integer NOT NULL,
    asisestu character varying(30) NOT NULL,
    fecha date NOT NULL,
    verificar boolean NOT NULL,
    idmateria integer
);


ALTER TABLE public.asistencias OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16409)
-- Name: asistencias_idasis_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asistencias_idasis_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asistencias_idasis_seq OWNER TO postgres;

--
-- TOC entry 4891 (class 0 OID 0)
-- Dependencies: 223
-- Name: asistencias_idasis_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asistencias_idasis_seq OWNED BY public.asistencias.idasis;


--
-- TOC entry 224 (class 1259 OID 16410)
-- Name: asistencias_idasis_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.asistencias ALTER COLUMN idasis ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.asistencias_idasis_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 225 (class 1259 OID 16411)
-- Name: auditoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditoria (
    idseria integer NOT NULL,
    usuario_escritor_id character varying(20) NOT NULL,
    usuario_objeto_id character varying(20) NOT NULL,
    accion character varying(100) NOT NULL,
    datos_anteriores text,
    datos_nuevos text,
    fecha date NOT NULL
);


ALTER TABLE public.auditoria OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16421)
-- Name: auditoria_idseria_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auditoria_idseria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auditoria_idseria_seq OWNER TO postgres;

--
-- TOC entry 4892 (class 0 OID 0)
-- Dependencies: 226
-- Name: auditoria_idseria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auditoria_idseria_seq OWNED BY public.auditoria.idseria;


--
-- TOC entry 227 (class 1259 OID 16422)
-- Name: auditoria_idseria_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auditoria ALTER COLUMN idseria ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auditoria_idseria_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 228 (class 1259 OID 16423)
-- Name: bloque; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bloque (
    idbloque integer NOT NULL,
    horainicio character varying(100) NOT NULL,
    horafin character varying(100) NOT NULL,
    activo boolean
);


ALTER TABLE public.bloque OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16429)
-- Name: bloque_idbloque_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bloque_idbloque_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bloque_idbloque_seq OWNER TO postgres;

--
-- TOC entry 4893 (class 0 OID 0)
-- Dependencies: 229
-- Name: bloque_idbloque_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bloque_idbloque_seq OWNED BY public.bloque.idbloque;


--
-- TOC entry 230 (class 1259 OID 16430)
-- Name: bloque_idbloque_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.bloque ALTER COLUMN idbloque ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.bloque_idbloque_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 231 (class 1259 OID 16431)
-- Name: carrera; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carrera (
    idcarrera integer NOT NULL,
    nombrecarrera character varying(100) NOT NULL,
    descripcion character varying(100) NOT NULL,
    activo boolean NOT NULL
);


ALTER TABLE public.carrera OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16438)
-- Name: carrera_idcarrera_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carrera_idcarrera_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carrera_idcarrera_seq OWNER TO postgres;

--
-- TOC entry 4894 (class 0 OID 0)
-- Dependencies: 232
-- Name: carrera_idcarrera_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carrera_idcarrera_seq OWNED BY public.carrera.idcarrera;


--
-- TOC entry 233 (class 1259 OID 16439)
-- Name: carrera_idcarrera_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.carrera ALTER COLUMN idcarrera ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.carrera_idcarrera_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 234 (class 1259 OID 16440)
-- Name: carrera_modulo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carrera_modulo (
    idcarremo integer NOT NULL,
    idmatemo integer NOT NULL,
    idcarrera integer NOT NULL,
    activo boolean NOT NULL
);


ALTER TABLE public.carrera_modulo OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16447)
-- Name: carrera_modulo_idcarremo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carrera_modulo_idcarremo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carrera_modulo_idcarremo_seq OWNER TO postgres;

--
-- TOC entry 4895 (class 0 OID 0)
-- Dependencies: 235
-- Name: carrera_modulo_idcarremo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carrera_modulo_idcarremo_seq OWNED BY public.carrera_modulo.idcarremo;


--
-- TOC entry 236 (class 1259 OID 16448)
-- Name: carrera_modulo_idcarremo_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.carrera_modulo ALTER COLUMN idcarremo ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.carrera_modulo_idcarremo_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 237 (class 1259 OID 16449)
-- Name: curso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.curso (
    idcurso integer NOT NULL,
    nomcurso character varying(20) NOT NULL,
    preciocurso numeric(12,2) NOT NULL,
    nivelcur character varying(100) NOT NULL,
    docenasig character varying(30),
    activo boolean
);


ALTER TABLE public.curso OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16456)
-- Name: curso_idcurso_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.curso_idcurso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.curso_idcurso_seq OWNER TO postgres;

--
-- TOC entry 4896 (class 0 OID 0)
-- Dependencies: 238
-- Name: curso_idcurso_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.curso_idcurso_seq OWNED BY public.curso.idcurso;


--
-- TOC entry 239 (class 1259 OID 16457)
-- Name: curso_idcurso_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.curso ALTER COLUMN idcurso ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.curso_idcurso_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 240 (class 1259 OID 16458)
-- Name: curso_modulo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.curso_modulo (
    idcurso_modulo integer NOT NULL,
    curso integer NOT NULL,
    modulo integer,
    horario integer
);


ALTER TABLE public.curso_modulo OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16463)
-- Name: curso_modulo_idcurso_modulo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.curso_modulo_idcurso_modulo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.curso_modulo_idcurso_modulo_seq OWNER TO postgres;

--
-- TOC entry 4897 (class 0 OID 0)
-- Dependencies: 241
-- Name: curso_modulo_idcurso_modulo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.curso_modulo_idcurso_modulo_seq OWNED BY public.curso_modulo.idcurso_modulo;


--
-- TOC entry 242 (class 1259 OID 16464)
-- Name: curso_modulo_idcurso_modulo_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.curso_modulo ALTER COLUMN idcurso_modulo ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.curso_modulo_idcurso_modulo_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 304 (class 1259 OID 17651)
-- Name: detalle_inscripcion_seccion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_inscripcion_seccion (
    id integer NOT NULL,
    inscripcion_periodo_id integer,
    seccion_id integer,
    activo boolean
);


ALTER TABLE public.detalle_inscripcion_seccion OWNER TO postgres;

--
-- TOC entry 303 (class 1259 OID 17650)
-- Name: detalle_inscripcion_seccion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalle_inscripcion_seccion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalle_inscripcion_seccion_id_seq OWNER TO postgres;

--
-- TOC entry 4898 (class 0 OID 0)
-- Dependencies: 303
-- Name: detalle_inscripcion_seccion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_inscripcion_seccion_id_seq OWNED BY public.detalle_inscripcion_seccion.id;


--
-- TOC entry 243 (class 1259 OID 16465)
-- Name: empleado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empleado (
    ciempleado character varying NOT NULL,
    nombreempleado character varying(100) NOT NULL,
    apellidoempleado character varying(20) NOT NULL,
    fechacontra date NOT NULL,
    telefempleado character varying(200),
    correoempleado character varying(200),
    activo boolean NOT NULL,
    cargo character varying(40)
);


ALTER TABLE public.empleado OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 16475)
-- Name: estudiante; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estudiante (
    ciestu character varying(30) NOT NULL,
    nombreestu character varying(100) NOT NULL,
    apelliestu character varying(20) NOT NULL,
    teleestu character varying(200),
    correoestu character varying(200),
    activo boolean NOT NULL
);


ALTER TABLE public.estudiante OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 16484)
-- Name: horario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.horario (
    idhorario integer NOT NULL,
    bloque integer NOT NULL,
    dia character varying(30) NOT NULL,
    salon character varying(30) NOT NULL,
    activo boolean
);


ALTER TABLE public.horario OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 16491)
-- Name: horario_idhorario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.horario_idhorario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.horario_idhorario_seq OWNER TO postgres;

--
-- TOC entry 4899 (class 0 OID 0)
-- Dependencies: 246
-- Name: horario_idhorario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.horario_idhorario_seq OWNED BY public.horario.idhorario;


--
-- TOC entry 247 (class 1259 OID 16492)
-- Name: horario_idhorario_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.horario ALTER COLUMN idhorario ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.horario_idhorario_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 302 (class 1259 OID 17631)
-- Name: inscripcion_periodo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inscripcion_periodo (
    id integer NOT NULL,
    ciestu character varying(20),
    periodo_id integer,
    fecha_inscripcion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estado character varying(20) DEFAULT 'PENDIENTE'::character varying,
    activo boolean
);


ALTER TABLE public.inscripcion_periodo OWNER TO postgres;

--
-- TOC entry 301 (class 1259 OID 17630)
-- Name: inscripcion_periodo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inscripcion_periodo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inscripcion_periodo_id_seq OWNER TO postgres;

--
-- TOC entry 4900 (class 0 OID 0)
-- Dependencies: 301
-- Name: inscripcion_periodo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inscripcion_periodo_id_seq OWNED BY public.inscripcion_periodo.id;


--
-- TOC entry 248 (class 1259 OID 16493)
-- Name: materia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materia (
    idmateria integer NOT NULL,
    nombremateria character varying(20) NOT NULL,
    docente character varying(30),
    activo boolean NOT NULL
);


ALTER TABLE public.materia OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 16500)
-- Name: materia_idmateria_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.materia_idmateria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.materia_idmateria_seq OWNER TO postgres;

--
-- TOC entry 4901 (class 0 OID 0)
-- Dependencies: 249
-- Name: materia_idmateria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.materia_idmateria_seq OWNED BY public.materia.idmateria;


--
-- TOC entry 250 (class 1259 OID 16501)
-- Name: materia_idmateria_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.materia ALTER COLUMN idmateria ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.materia_idmateria_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 251 (class 1259 OID 16502)
-- Name: materias_modulo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materias_modulo (
    idmatemo integer NOT NULL,
    idmateria integer NOT NULL,
    idmodulo integer NOT NULL
);


ALTER TABLE public.materias_modulo OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 16508)
-- Name: materias_modulo_idmatemo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.materias_modulo_idmatemo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.materias_modulo_idmatemo_seq OWNER TO postgres;

--
-- TOC entry 4902 (class 0 OID 0)
-- Dependencies: 252
-- Name: materias_modulo_idmatemo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.materias_modulo_idmatemo_seq OWNED BY public.materias_modulo.idmatemo;


--
-- TOC entry 253 (class 1259 OID 16509)
-- Name: materias_modulo_idmatemo_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.materias_modulo ALTER COLUMN idmatemo ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.materias_modulo_idmatemo_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 254 (class 1259 OID 16510)
-- Name: mensualidad; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mensualidad (
    idmensualidad integer NOT NULL,
    metodopago integer NOT NULL,
    monedapago integer NOT NULL,
    monto integer NOT NULL,
    verificacion boolean NOT NULL,
    encargado character varying(30) NOT NULL,
    periodo character varying(20) NOT NULL,
    fecha_corte date NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    estado character varying(20) DEFAULT 'pendiente'::character varying NOT NULL,
    activo boolean,
    CONSTRAINT chk_mensualidad_estado CHECK (((estado)::text = ANY (ARRAY[('pendiente'::character varying)::text, ('pagado'::character varying)::text, ('vencido'::character varying)::text, ('completado'::character varying)::text])))
);


ALTER TABLE public.mensualidad OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 16526)
-- Name: mensualidad_estu; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mensualidad_estu (
    idmensualidad_estu integer NOT NULL,
    estudiante character varying(20) NOT NULL,
    fechapago date,
    factura character varying(100),
    idmensualidad integer,
    monto_pagado numeric(12,2),
    fecha_vencimiento date DEFAULT CURRENT_DATE NOT NULL,
    estado character varying(20) DEFAULT 'pendiente'::character varying NOT NULL,
    periodo character varying(20) DEFAULT ''::character varying NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


ALTER TABLE public.mensualidad_estu OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 16533)
-- Name: mensualidad_estu_idmensualidad_estu_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mensualidad_estu_idmensualidad_estu_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mensualidad_estu_idmensualidad_estu_seq OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 16534)
-- Name: mensualidad_estu_idmensualidad_estu_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mensualidad_estu_idmensualidad_estu_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mensualidad_estu_idmensualidad_estu_seq1 OWNER TO postgres;

--
-- TOC entry 4903 (class 0 OID 0)
-- Dependencies: 257
-- Name: mensualidad_estu_idmensualidad_estu_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mensualidad_estu_idmensualidad_estu_seq1 OWNED BY public.mensualidad_estu.idmensualidad_estu;


--
-- TOC entry 258 (class 1259 OID 16535)
-- Name: mensualidad_idmensualidad_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mensualidad_idmensualidad_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mensualidad_idmensualidad_seq OWNER TO postgres;

--
-- TOC entry 4904 (class 0 OID 0)
-- Dependencies: 258
-- Name: mensualidad_idmensualidad_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mensualidad_idmensualidad_seq OWNED BY public.mensualidad.idmensualidad;


--
-- TOC entry 259 (class 1259 OID 16536)
-- Name: mensualidad_idmensualidad_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.mensualidad ALTER COLUMN idmensualidad ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mensualidad_idmensualidad_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 260 (class 1259 OID 16537)
-- Name: metodopago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.metodopago (
    idmetodopago integer NOT NULL,
    metodousado character varying(20) NOT NULL,
    registro character varying(20) NOT NULL
);


ALTER TABLE public.metodopago OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 16543)
-- Name: metodopago_idmetodopago_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.metodopago_idmetodopago_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.metodopago_idmetodopago_seq OWNER TO postgres;

--
-- TOC entry 4905 (class 0 OID 0)
-- Dependencies: 261
-- Name: metodopago_idmetodopago_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.metodopago_idmetodopago_seq OWNED BY public.metodopago.idmetodopago;


--
-- TOC entry 262 (class 1259 OID 16544)
-- Name: metodopago_idmetodopago_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.metodopago ALTER COLUMN idmetodopago ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.metodopago_idmetodopago_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 263 (class 1259 OID 16545)
-- Name: modulo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modulo (
    idmodulo integer NOT NULL,
    nombremodulo character varying(10) NOT NULL,
    activo boolean NOT NULL
);


ALTER TABLE public.modulo OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 16551)
-- Name: modulo_idmodulo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.modulo_idmodulo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.modulo_idmodulo_seq OWNER TO postgres;

--
-- TOC entry 4906 (class 0 OID 0)
-- Dependencies: 264
-- Name: modulo_idmodulo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.modulo_idmodulo_seq OWNED BY public.modulo.idmodulo;


--
-- TOC entry 265 (class 1259 OID 16552)
-- Name: modulo_idmodulo_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.modulo ALTER COLUMN idmodulo ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.modulo_idmodulo_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 266 (class 1259 OID 16553)
-- Name: monedapago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.monedapago (
    idmoneda integer NOT NULL,
    tipomoneda character varying(40) NOT NULL,
    montototal integer NOT NULL,
    registro character varying(100) NOT NULL
);


ALTER TABLE public.monedapago OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 16560)
-- Name: monedapago_idmoneda_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.monedapago_idmoneda_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.monedapago_idmoneda_seq OWNER TO postgres;

--
-- TOC entry 4907 (class 0 OID 0)
-- Dependencies: 267
-- Name: monedapago_idmoneda_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.monedapago_idmoneda_seq OWNED BY public.monedapago.idmoneda;


--
-- TOC entry 268 (class 1259 OID 16561)
-- Name: monedapago_idmoneda_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.monedapago ALTER COLUMN idmoneda ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.monedapago_idmoneda_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 269 (class 1259 OID 16562)
-- Name: nota; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nota (
    idnota integer NOT NULL,
    oferta integer NOT NULL,
    notas integer NOT NULL,
    fechanota date NOT NULL,
    activo boolean NOT NULL,
    idevaluacion integer,
    CONSTRAINT chk_nota_rango CHECK (((notas >= 0) AND (notas <= 20)))
);


ALTER TABLE public.nota OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 16571)
-- Name: nota_idnota_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nota_idnota_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nota_idnota_seq OWNER TO postgres;

--
-- TOC entry 4908 (class 0 OID 0)
-- Dependencies: 270
-- Name: nota_idnota_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nota_idnota_seq OWNED BY public.nota.idnota;


--
-- TOC entry 271 (class 1259 OID 16572)
-- Name: nota_idnota_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.nota ALTER COLUMN idnota ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.nota_idnota_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 272 (class 1259 OID 16573)
-- Name: oferta_seccion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.oferta_seccion (
    idseccmo integer NOT NULL,
    idcarrera integer NOT NULL,
    idsecc integer NOT NULL,
    estudiante character varying(25),
    horario integer,
    idcarremo integer
);


ALTER TABLE public.oferta_seccion OWNER TO postgres;

--
-- TOC entry 273 (class 1259 OID 16579)
-- Name: oferta_seccion_idseccmo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.oferta_seccion_idseccmo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.oferta_seccion_idseccmo_seq OWNER TO postgres;

--
-- TOC entry 4909 (class 0 OID 0)
-- Dependencies: 273
-- Name: oferta_seccion_idseccmo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.oferta_seccion_idseccmo_seq OWNED BY public.oferta_seccion.idseccmo;


--
-- TOC entry 274 (class 1259 OID 16580)
-- Name: oferta_seccion_idseccmo_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.oferta_seccion ALTER COLUMN idseccmo ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.oferta_seccion_idseccmo_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 300 (class 1259 OID 17619)
-- Name: periodo_academico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.periodo_academico (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    activo boolean DEFAULT false
);


ALTER TABLE public.periodo_academico OWNER TO postgres;

--
-- TOC entry 299 (class 1259 OID 17618)
-- Name: periodo_academico_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.periodo_academico_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.periodo_academico_id_seq OWNER TO postgres;

--
-- TOC entry 4910 (class 0 OID 0)
-- Dependencies: 299
-- Name: periodo_academico_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.periodo_academico_id_seq OWNED BY public.periodo_academico.id;


--
-- TOC entry 275 (class 1259 OID 16581)
-- Name: plan_evaluacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plan_evaluacion (
    idevaluacion integer NOT NULL,
    idmateria integer NOT NULL,
    idsecc integer NOT NULL,
    titulo character varying(100) NOT NULL,
    porcentaje numeric(5,2) NOT NULL
);


ALTER TABLE public.plan_evaluacion OWNER TO postgres;

--
-- TOC entry 276 (class 1259 OID 16589)
-- Name: plan_evaluacion_idevaluacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.plan_evaluacion ALTER COLUMN idevaluacion ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.plan_evaluacion_idevaluacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 277 (class 1259 OID 16590)
-- Name: preguntas_seguridad; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.preguntas_seguridad (
    idpregunta integer NOT NULL,
    preguntas character varying(40) NOT NULL,
    activo boolean NOT NULL
);


ALTER TABLE public.preguntas_seguridad OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 16596)
-- Name: preguntas_seguridad_idpregunta_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.preguntas_seguridad_idpregunta_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.preguntas_seguridad_idpregunta_seq OWNER TO postgres;

--
-- TOC entry 4911 (class 0 OID 0)
-- Dependencies: 278
-- Name: preguntas_seguridad_idpregunta_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.preguntas_seguridad_idpregunta_seq OWNED BY public.preguntas_seguridad.idpregunta;


--
-- TOC entry 279 (class 1259 OID 16597)
-- Name: preguntas_seguridad_idpregunta_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.preguntas_seguridad ALTER COLUMN idpregunta ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.preguntas_seguridad_idpregunta_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 280 (class 1259 OID 16598)
-- Name: preguntas_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.preguntas_usuario (
    idpreuser integer NOT NULL,
    ciuser character varying(20) NOT NULL,
    idpregunta integer NOT NULL,
    respuesta character varying(20) NOT NULL
);


ALTER TABLE public.preguntas_usuario OWNER TO postgres;

--
-- TOC entry 281 (class 1259 OID 16605)
-- Name: preguntas_usuario_idpreuser_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.preguntas_usuario_idpreuser_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.preguntas_usuario_idpreuser_seq OWNER TO postgres;

--
-- TOC entry 4912 (class 0 OID 0)
-- Dependencies: 281
-- Name: preguntas_usuario_idpreuser_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.preguntas_usuario_idpreuser_seq OWNED BY public.preguntas_usuario.idpreuser;


--
-- TOC entry 282 (class 1259 OID 16606)
-- Name: preguntas_usuario_idpreuser_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.preguntas_usuario ALTER COLUMN idpreuser ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.preguntas_usuario_idpreuser_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 283 (class 1259 OID 16607)
-- Name: refresh_token; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_token (
    id integer NOT NULL,
    token character varying(500) NOT NULL,
    usuario_log integer NOT NULL,
    expira timestamp without time zone NOT NULL,
    activo boolean NOT NULL
);


ALTER TABLE public.refresh_token OWNER TO postgres;

--
-- TOC entry 284 (class 1259 OID 16617)
-- Name: refresh_token_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.refresh_token_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refresh_token_id_seq OWNER TO postgres;

--
-- TOC entry 4913 (class 0 OID 0)
-- Dependencies: 284
-- Name: refresh_token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refresh_token_id_seq OWNED BY public.refresh_token.id;


--
-- TOC entry 285 (class 1259 OID 16618)
-- Name: refresh_token_id_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.refresh_token ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.refresh_token_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 286 (class 1259 OID 16619)
-- Name: rol; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rol (
    idrol integer NOT NULL,
    nombrerol character varying(40) NOT NULL,
    descripcion character varying(300) NOT NULL,
    activo boolean NOT NULL
);


ALTER TABLE public.rol OWNER TO postgres;

--
-- TOC entry 287 (class 1259 OID 16626)
-- Name: rol_idrol_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rol_idrol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rol_idrol_seq OWNER TO postgres;

--
-- TOC entry 4914 (class 0 OID 0)
-- Dependencies: 287
-- Name: rol_idrol_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rol_idrol_seq OWNED BY public.rol.idrol;


--
-- TOC entry 288 (class 1259 OID 16627)
-- Name: rol_idrol_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.rol ALTER COLUMN idrol ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.rol_idrol_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 289 (class 1259 OID 16628)
-- Name: seccion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seccion (
    idsecc integer NOT NULL,
    nomsecc character varying(10) NOT NULL,
    cupo_maximo integer DEFAULT 30
);


ALTER TABLE public.seccion OWNER TO postgres;

--
-- TOC entry 290 (class 1259 OID 16633)
-- Name: seccion_idsecc_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.seccion_idsecc_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.seccion_idsecc_seq OWNER TO postgres;

--
-- TOC entry 4915 (class 0 OID 0)
-- Dependencies: 290
-- Name: seccion_idsecc_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.seccion_idsecc_seq OWNED BY public.seccion.idsecc;


--
-- TOC entry 291 (class 1259 OID 16634)
-- Name: seccion_idsecc_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.seccion ALTER COLUMN idsecc ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.seccion_idsecc_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 292 (class 1259 OID 16635)
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    ciuser character varying(20) NOT NULL,
    nombreusuario character varying(20) NOT NULL,
    apellusuario character varying(100) NOT NULL,
    estudiante character varying(30),
    empleado character varying(30),
    teleusuario character varying(200),
    correousuario character varying(200),
    contrase character varying(100) NOT NULL,
    activo boolean NOT NULL
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- TOC entry 293 (class 1259 OID 16645)
-- Name: usuario_login; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario_login (
    ciuser_log integer NOT NULL,
    ciuser character varying(20) NOT NULL,
    idrol integer NOT NULL,
    activo boolean NOT NULL
);


ALTER TABLE public.usuario_login OWNER TO postgres;

--
-- TOC entry 294 (class 1259 OID 16652)
-- Name: usuario_login_ciuser_log_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuario_login_ciuser_log_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_login_ciuser_log_seq OWNER TO postgres;

--
-- TOC entry 4916 (class 0 OID 0)
-- Dependencies: 294
-- Name: usuario_login_ciuser_log_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuario_login_ciuser_log_seq OWNED BY public.usuario_login.ciuser_log;


--
-- TOC entry 295 (class 1259 OID 16653)
-- Name: usuario_login_ciuser_log_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.usuario_login ALTER COLUMN ciuser_log ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.usuario_login_ciuser_log_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 298 (class 1259 OID 16946)
-- Name: v_boleta_estudiante; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_boleta_estudiante AS
 SELECT e.ciestu AS cedula,
    (((e.nombreestu)::text || ' '::text) || (e.apelliestu)::text) AS nombre_completo,
    m.nombremateria AS materia,
    pe.titulo AS evaluacion,
    pe.porcentaje AS peso_porcentual,
    n.notas AS calificacion_base_20,
    ((n.notas)::numeric * (pe.porcentaje / 100.0)) AS nota_obtenida
   FROM ((((public.nota n
     JOIN public.plan_evaluacion pe ON ((n.idevaluacion = pe.idevaluacion)))
     JOIN public.materia m ON ((pe.idmateria = m.idmateria)))
     JOIN public.oferta_seccion os ON ((n.oferta = os.idseccmo)))
     JOIN public.estudiante e ON (((os.estudiante)::text = (e.ciestu)::text)));


ALTER VIEW public.v_boleta_estudiante OWNER TO postgres;

--
-- TOC entry 296 (class 1259 OID 16654)
-- Name: v_choques_horario_estudiante; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_choques_horario_estudiante AS
 SELECT os1.estudiante AS ciestu,
    os1.idsecc AS seccion_1,
    os2.idsecc AS seccion_2,
    h1.dia,
    h1.bloque
   FROM (((public.oferta_seccion os1
     JOIN public.horario h1 ON ((os1.horario = h1.idhorario)))
     JOIN public.oferta_seccion os2 ON ((((os1.estudiante)::text = (os2.estudiante)::text) AND (os1.idseccmo <> os2.idseccmo))))
     JOIN public.horario h2 ON ((os2.horario = h2.idhorario)))
  WHERE (((h1.dia)::text = (h2.dia)::text) AND (h1.bloque = h2.bloque));


ALTER VIEW public.v_choques_horario_estudiante OWNER TO postgres;

--
-- TOC entry 297 (class 1259 OID 16659)
-- Name: v_estudiantes_morosos; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_estudiantes_morosos AS
 SELECT e.ciestu,
    e.nombreestu,
    e.apelliestu,
    e.teleestu,
    e.correoestu,
    m.periodo,
    m.fecha_corte AS fecha_vencimiento,
    m.monto AS monto_deuda
   FROM ((public.estudiante e
     JOIN public.mensualidad_estu me ON (((e.ciestu)::text = (me.estudiante)::text)))
     JOIN public.mensualidad m ON ((me.idmensualidad = m.idmensualidad)))
  WHERE (((m.estado)::text = 'pendiente'::text) AND (m.fecha_corte < CURRENT_DATE) AND (e.activo = true));


ALTER VIEW public.v_estudiantes_morosos OWNER TO postgres;

--
-- TOC entry 4528 (class 2604 OID 17654)
-- Name: detalle_inscripcion_seccion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_inscripcion_seccion ALTER COLUMN id SET DEFAULT nextval('public.detalle_inscripcion_seccion_id_seq'::regclass);


--
-- TOC entry 4525 (class 2604 OID 17634)
-- Name: inscripcion_periodo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripcion_periodo ALTER COLUMN id SET DEFAULT nextval('public.inscripcion_periodo_id_seq'::regclass);


--
-- TOC entry 4517 (class 2604 OID 16664)
-- Name: mensualidad_estu idmensualidad_estu; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensualidad_estu ALTER COLUMN idmensualidad_estu SET DEFAULT nextval('public.mensualidad_estu_idmensualidad_estu_seq1'::regclass);


--
-- TOC entry 4523 (class 2604 OID 17622)
-- Name: periodo_academico id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.periodo_academico ALTER COLUMN id SET DEFAULT nextval('public.periodo_academico_id_seq'::regclass);


--
-- TOC entry 4802 (class 0 OID 16390)
-- Dependencies: 219
-- Data for Name: asignacion_docente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asignacion_docente (id_asignacion_docente, empleado_id, materia_id, seccion_id, fecha_asignacion) FROM stdin;
\.


--
-- TOC entry 4805 (class 0 OID 16402)
-- Dependencies: 222
-- Data for Name: asistencias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asistencias (idasis, asisestu, fecha, verificar, idmateria) FROM stdin;
\.


--
-- TOC entry 4808 (class 0 OID 16411)
-- Dependencies: 225
-- Data for Name: auditoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditoria (idseria, usuario_escritor_id, usuario_objeto_id, accion, datos_anteriores, datos_nuevos, fecha) FROM stdin;
14	V-1112233	V-30123456	INSERT_ESTUDIANTE	\N	{"ciestu":"V-30123456","nombreestu":"Smick","apelliestu":"Herrera","teleestu":"04124321122","correoestu":"RealMadrid@gmail.com","activo":true}	2026-10-01
15	V-1112233	V-12345	INSERT_EMPLEADO	\N	{"ciempleado":"V-12345","nombreempleado":"Victor","apellidoempleado":"Aguilar","fechacontra":"2022-12-01","telefempleado":"0412345677","correoempleado":"Mother3@gmail.com","activo":true,"cargo":"Docente"}	2026-10-01
16	V-1112233	V-30123456	UPDATE_ESTUDIANTE	{"ciestu":"V-30123456","nombreestu":"Smick","apelliestu":"Herrera","teleestu":"04124321122","correoestu":"RealMadrid@gmail.com","activo":true}	{"ciestu":"V-30123456","nombreestu":"Juan Smick","apelliestu":"Herrera","teleestu":"04124321122","correoestu":"RealMadrid@gmail.com","activo":true}	2026-10-01
17	V-1112233	V-12345	UPDATE_EMPLEADO	{"ciempleado":"V-12345","nombreempleado":"Victor","apellidoempleado":"Aguilar","fechacontra":"2022-12-01","telefempleado":"0412345677","correoempleado":"Mother3@gmail.com","activo":true,"cargo":"Docente"}	{"ciempleado":"V-12345","nombreempleado":"Alejandro","apellidoempleado":"Aguilar","fechacontra":"2022-12-01","telefempleado":"0412345677","correoempleado":"Mother3@gmail.com","activo":true,"cargo":"Docente"}	2026-10-01
18	V-1112233	V-12345678	UPDATE_EMPLEADO	{"ciempleado":"V-12345678","nombreempleado":"Smick","apellidoempleado":"Medina","fechacontra":"2026-09-26","telefempleado":"+57 333-3456","correoempleado":"realMadrid4ever@gmail.com","activo":true,"cargo":null}	{"ciempleado":"V-12345678","nombreempleado":"Smick","apellidoempleado":"Medina","fechacontra":"2026-09-26","telefempleado":"04124104411","correoempleado":"realMadrid4ever@gmail.com","activo":true,"cargo":"Conserje"}	2026-10-01
19	V-1112233	31122456	UPDATE	{"ciuser":"31122456","nombreusuario":"Juan","apellusuario":"Herrera","estudiante":null,"empleado":null,"teleusuario":"04123442312","correousuario":"JuanPi@gmail.com","contrase":"$2b$12$fVsQoq/xXx6Ebbs1kjEmM.upfDxmFoeHuViq1PSUNkK4vrqMIpo7S","activo":true}	{"ciuser":"31122456","nombreusuario":"Juansito","apellusuario":"Herrera","estudiante":null,"empleado":null,"teleusuario":"04123442312","correousuario":"JuanPi@gmail.com","contrase":"$2b$12$CmuHWG9crCYeSnMg1GsmyOqkmAqDKy35UCNZ7GlNRH935S/xDJfiq","activo":true}	2026-10-09
20	V-1112233	V-0234567	INSERT	\N	{"ciuser":"V-0234567","nombreusuario":"Linus","apellusuario":"Ubuntu","estudiante":null,"empleado":null,"teleusuario":"04123451211","correousuario":"Ubuntu@gmail.com","contrase":"$2b$12$o68r6Vzp0ZEaDuYXrD7qtOMNVPhkkm7ohjgTbxVfvwdlm.uTVLXza","activo":true}	2026-10-11
21	V-1112233	E-29345122	INSERT	\N	{"ciuser":"E-29345122","nombreusuario":"Smick","apellusuario":"Herrera","estudiante":"E-29345122","empleado":null,"teleusuario":"04123451122","correousuario":"Smickcito@gmail.com","contrase":"$2b$12$HtTLgyrl6WR4i4LCZGLg9eWHi9l/bi.lpUO8VHM5NZSzlzCTSF.m6","activo":true}	2026-10-21
\.


--
-- TOC entry 4811 (class 0 OID 16423)
-- Dependencies: 228
-- Data for Name: bloque; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bloque (idbloque, horainicio, horafin, activo) FROM stdin;
1	7:45 AM	9:30 AM	t
2	9:15 AM	11:45 AM	t
\.


--
-- TOC entry 4814 (class 0 OID 16431)
-- Dependencies: 231
-- Data for Name: carrera; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carrera (idcarrera, nombrecarrera, descripcion, activo) FROM stdin;
1	Diseño de Modas	Creamos profesionales en cuanto al diseño de modas	f
2	Diseño de Modas	Carrera la cual se centra en sacar diseñadores profesionales en modas.	t
3	Diseño de diseñadores	Hola	f
4	Diseño de Modas	Carrera dedidica al diseño de modas	t
5	Diseño de modas	a	f
\.


--
-- TOC entry 4817 (class 0 OID 16440)
-- Dependencies: 234
-- Data for Name: carrera_modulo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carrera_modulo (idcarremo, idmatemo, idcarrera, activo) FROM stdin;
\.


--
-- TOC entry 4820 (class 0 OID 16449)
-- Dependencies: 237
-- Data for Name: curso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.curso (idcurso, nomcurso, preciocurso, nivelcur, docenasig, activo) FROM stdin;
5	Diseño de modas	20.00	Basico	\N	t
2	Diseño de modas	24.00	Basico	\N	f
3	Patron	10.00	Basico	\N	f
6	Patronaje	15.00	Basico	\N	f
7	Corte y Confección	38.00	Intermedio	\N	t
4	Modelaje	30.00	Intermedio	V-12345	t
8	Modelaje	60.00	Avanzado	\N	f
9	Bordado	15.00	Basico	\N	t
\.


--
-- TOC entry 4823 (class 0 OID 16458)
-- Dependencies: 240
-- Data for Name: curso_modulo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.curso_modulo (idcurso_modulo, curso, modulo, horario) FROM stdin;
\.


--
-- TOC entry 4884 (class 0 OID 17651)
-- Dependencies: 304
-- Data for Name: detalle_inscripcion_seccion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_inscripcion_seccion (id, inscripcion_periodo_id, seccion_id, activo) FROM stdin;
16	16	1	t
17	17	1	t
18	18	1	t
19	19	1	t
\.


--
-- TOC entry 4826 (class 0 OID 16465)
-- Dependencies: 243
-- Data for Name: empleado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empleado (ciempleado, nombreempleado, apellidoempleado, fechacontra, telefempleado, correoempleado, activo, cargo) FROM stdin;
V-25678901	Juan	Zerpa	2025-02-24	+58 422-4321233	Therian69@gmail.com	f	\N
V-12345	Alejandro	Aguilar	2022-12-01	0412345677	Mother3@gmail.com	t	Docente
V-12345678	Smick	Medina	2026-09-26	04124104411	realMadrid4ever@gmail.com	t	Conserje
\.


--
-- TOC entry 4827 (class 0 OID 16475)
-- Dependencies: 244
-- Data for Name: estudiante; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estudiante (ciestu, nombreestu, apelliestu, teleestu, correoestu, activo) FROM stdin;
V-32345678	Inri	Herrirea	04124562213	Porygonz@gmail.	t
V-31122642	David	Moncada	+58 414-1235411	lordriczer1105@gmail.com	f
E-29345122	Blaze	Miranda	04123456720	Biancamm01@gmail.com	t
V-30123456	Juan Smick	Herrera	04124321122	RealMadrid@gmail.com	t
\.


--
-- TOC entry 4828 (class 0 OID 16484)
-- Dependencies: 245
-- Data for Name: horario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.horario (idhorario, bloque, dia, salon, activo) FROM stdin;
1	1	Lunes	101	t
2	2	Miércoles	103	t
\.


--
-- TOC entry 4882 (class 0 OID 17631)
-- Dependencies: 302
-- Data for Name: inscripcion_periodo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inscripcion_periodo (id, ciestu, periodo_id, fecha_inscripcion, estado, activo) FROM stdin;
18	E-29345122	1	2026-10-21 00:00:00	ACTIVO	t
17	V-32345678	1	2026-10-20 00:00:00	PENDIENTE	f
16	V-30123456	1	2026-10-20 00:00:00	ACTIVO	f
19	V-30123456	1	2026-10-21 00:00:00	ACTIVO	t
\.


--
-- TOC entry 4831 (class 0 OID 16493)
-- Dependencies: 248
-- Data for Name: materia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materia (idmateria, nombremateria, docente, activo) FROM stdin;
7	Dibujo Digital	\N	t
5	Patronaje 1	V-12345	t
4	Maquinaria II	V-12345	t
6	Corte y Confección 1	V-12345678	t
1	Maquinaria I	V-12345	t
\.


--
-- TOC entry 4834 (class 0 OID 16502)
-- Dependencies: 251
-- Data for Name: materias_modulo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materias_modulo (idmatemo, idmateria, idmodulo) FROM stdin;
15	5	1
16	4	4
17	6	1
18	1	1
19	7	4
\.


--
-- TOC entry 4837 (class 0 OID 16510)
-- Dependencies: 254
-- Data for Name: mensualidad; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mensualidad (idmensualidad, metodopago, monedapago, monto, verificacion, encargado, periodo, fecha_corte, fecha_creacion, estado, activo) FROM stdin;
\.


--
-- TOC entry 4838 (class 0 OID 16526)
-- Dependencies: 255
-- Data for Name: mensualidad_estu; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mensualidad_estu (idmensualidad_estu, estudiante, fechapago, factura, idmensualidad, monto_pagado, fecha_vencimiento, estado, periodo, activo) FROM stdin;
\.


--
-- TOC entry 4843 (class 0 OID 16537)
-- Dependencies: 260
-- Data for Name: metodopago; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.metodopago (idmetodopago, metodousado, registro) FROM stdin;
\.


--
-- TOC entry 4846 (class 0 OID 16545)
-- Dependencies: 263
-- Data for Name: modulo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modulo (idmodulo, nombremodulo, activo) FROM stdin;
1	Modulo 1	t
4	Modulo 2	t
2	Modulo 1	f
3	Modulo 1	f
\.


--
-- TOC entry 4849 (class 0 OID 16553)
-- Dependencies: 266
-- Data for Name: monedapago; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.monedapago (idmoneda, tipomoneda, montototal, registro) FROM stdin;
\.


--
-- TOC entry 4852 (class 0 OID 16562)
-- Dependencies: 269
-- Data for Name: nota; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nota (idnota, oferta, notas, fechanota, activo, idevaluacion) FROM stdin;
\.


--
-- TOC entry 4855 (class 0 OID 16573)
-- Dependencies: 272
-- Data for Name: oferta_seccion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.oferta_seccion (idseccmo, idcarrera, idsecc, estudiante, horario, idcarremo) FROM stdin;
5	1	1	\N	1	\N
6	1	1	\N	1	\N
7	1	1	\N	1	\N
8	1	1	\N	1	\N
\.


--
-- TOC entry 4880 (class 0 OID 17619)
-- Dependencies: 300
-- Data for Name: periodo_academico; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.periodo_academico (id, nombre, fecha_inicio, fecha_fin, activo) FROM stdin;
1	Periodo 2026	2026-10-11	2026-12-22	t
\.


--
-- TOC entry 4858 (class 0 OID 16581)
-- Dependencies: 275
-- Data for Name: plan_evaluacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plan_evaluacion (idevaluacion, idmateria, idsecc, titulo, porcentaje) FROM stdin;
\.


--
-- TOC entry 4860 (class 0 OID 16590)
-- Dependencies: 277
-- Data for Name: preguntas_seguridad; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.preguntas_seguridad (idpregunta, preguntas, activo) FROM stdin;
\.


--
-- TOC entry 4863 (class 0 OID 16598)
-- Dependencies: 280
-- Data for Name: preguntas_usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.preguntas_usuario (idpreuser, ciuser, idpregunta, respuesta) FROM stdin;
\.


--
-- TOC entry 4866 (class 0 OID 16607)
-- Dependencies: 283
-- Data for Name: refresh_token; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_token (id, token, usuario_log, expira, activo) FROM stdin;
1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzg4MDE4NjkyLCJ0eXBlIjoicmVmcmVzaCJ9.e6LXO-WPWuTyEetju_nhmI5hdng1GGciCEgK8IpcFUo	1	2026-08-29 11:51:32.169335	t
2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzg4MTAzMTg0LCJ0eXBlIjoicmVmcmVzaCJ9.7VEelVVUcCBPQZVz1kI3og5VK2G7FJaNV-Ij-LwkSGk	1	2026-08-30 11:19:44.146226	t
3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzg4MTAzNzIzLCJ0eXBlIjoicmVmcmVzaCJ9.iEYc8BTzJfhhs6R84-_yAG4Kbp9q8eri4zEd_Vl2R0U	1	2026-08-30 11:28:43.343464	t
4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzg4MTA0MzA3LCJ0eXBlIjoicmVmcmVzaCJ9.i4LkRF7mekUAylfu1WPbIsTS1q_n-HjZljp7KHlh1vo	1	2026-08-30 11:38:27.323756	t
5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzg4MTgzMDA3LCJ0eXBlIjoicmVmcmVzaCJ9.fT_9iOhkzrdzaylRe1XDHzrtHnRy4Pc3ZQG5igWW5AM	1	2026-08-31 09:30:07.653534	t
6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzg5OTI2OTk4LCJ0eXBlIjoicmVmcmVzaCJ9.PMzTifiDjaO2aXImOe1e5zGPonmc-oCG0MrEhkoohn8	1	2026-09-20 13:56:38.060438	t
7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzg5OTI5MzQyLCJ0eXBlIjoicmVmcmVzaCJ9.BXCCEbAnxUoE9U5d8Qi0tvdi5i_C3G4FWNqM_hTUyLg	1	2026-09-20 14:35:42.579755	t
8	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzg5OTk4MDEwLCJ0eXBlIjoicmVmcmVzaCJ9.KoxOGdeE7s6tg_9p_mYwhUBW4Yb-Fg_CYA6XkNh0CYw	1	2026-09-21 09:40:10.76492	t
9	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzg5OTk4OTgzLCJ0eXBlIjoicmVmcmVzaCJ9.CjXIucDgTLX7rrSs3Vte818JdaTQZWjdaYU0JqvYovk	1	2026-09-21 09:56:23.749838	t
15	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwMTc4NjMwLCJ0eXBlIjoicmVmcmVzaCJ9.h-1J_EtAOq0vlz5hwqH1fjLamhX0bApwYBEfqZbR2ok	1	2026-09-23 11:50:30.781835	t
16	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwMTc5NzA3LCJ0eXBlIjoicmVmcmVzaCJ9.Sg9bTn-hhajOpFti4vLibfDAdFJjh7hsTRWcr4Spz3E	1	2026-09-23 12:08:27.123414	t
17	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwMTc5NzA5LCJ0eXBlIjoicmVmcmVzaCJ9.n6br0P-JwqO5d2xDKZ3yChscwzxtajo_fJWyBZgeI74	1	2026-09-23 12:08:29.40464	t
18	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwMTc5ODcwLCJ0eXBlIjoicmVmcmVzaCJ9.ve2I_0uX180-ftY9y89I_63Afdb33NAXQuJTRis7zAA	1	2026-09-23 12:11:10.924486	t
19	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwMTc5OTgxLCJ0eXBlIjoicmVmcmVzaCJ9.ctbPtJxdzS_aUQK63-4odps0WNghRjYAZKrjJBxQenA	1	2026-09-23 12:13:01.385704	t
20	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwMTc5OTgyLCJ0eXBlIjoicmVmcmVzaCJ9.LfuJA4D_U-lB7MrqaKhtjthu0bRVjSRTr2a_LUkJmKk	1	2026-09-23 12:13:02.979487	t
21	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwMTgwMDYwLCJ0eXBlIjoicmVmcmVzaCJ9.jm6EqCdF-MeXms48YkNr08T9QeOhSOrySGfCmPa64eY	1	2026-09-23 12:14:20.60681	t
22	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwMjExNDAyLCJ0eXBlIjoicmVmcmVzaCJ9.isIxWNJa8xmJzpc2s6FpQhEMsHlCizF8oQE5-ph7zkc	1	2026-09-23 20:56:42.054475	t
23	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwNDU4MzIyLCJ0eXBlIjoicmVmcmVzaCJ9.F134AL8FeNQFXh79GFOnpHUCLUoNXLW1f2u19mUl5Vc	1	2026-09-26 17:32:02.883253	t
24	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwNDU4MzcwLCJ0eXBlIjoicmVmcmVzaCJ9.gz-yFWy1SB8Dz2pkgES012MLpYsHRob3Zl6AFZfmuiU	1	2026-09-26 17:32:50.926198	t
25	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwNDY2MTc1LCJ0eXBlIjoicmVmcmVzaCJ9.vykgjNvmZOVlb6IDHAJJQsjFtLrW2NIWbD4-I3F5PMQ	1	2026-09-26 19:42:55.112499	t
26	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQYXVsb0JhcmNhQGdtYWlsLmNvbSIsImV4cCI6MTc5MDQ2Njc1MSwidHlwZSI6InJlZnJlc2gifQ.p5vlbQeAbA-B8OTQZP_URAVe6ipZmH79GGTz1yxvfJU	3	2026-09-26 19:52:31.138553	t
27	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQZWRyaW42OUBnbWFpbC5jb20iLCJleHAiOjE3OTA0Njc0MTksInR5cGUiOiJyZWZyZXNoIn0.atnY9NkEtnKan2liV8-d62A5gCbF4qnDihqMxlDcNKU	4	2026-09-26 20:03:39.991199	t
28	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQZWRyaW42OUBnbWFpbC5jb20iLCJleHAiOjE3OTA0Njc1NTksInR5cGUiOiJyZWZyZXNoIn0.8Yi01J6J1LwGUprEaEY-0bk-SiJEaWbeJVbvWqQo7gQ	4	2026-09-26 20:05:59.469403	t
29	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQZWRyaW42OUBnbWFpbC5jb20iLCJleHAiOjE3OTA1MzM4OTYsInR5cGUiOiJyZWZyZXNoIn0.a46JwwF7KmQShvVpu9w7bOfRlqsPblsG-Xz6BW-dCiE	4	2026-09-27 14:31:36.755606	t
30	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwNTM0MDQ4LCJ0eXBlIjoicmVmcmVzaCJ9.kp9yxnw5HX1y1T1iXwxJfBwQBJ_y4I62fG6shs0Swtw	1	2026-09-27 14:34:08.705268	t
31	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwNTM0NTU4LCJ0eXBlIjoicmVmcmVzaCJ9.M_i-IMn19VR2W1moifIsg6bprhxgWWFrUW5ALe6by-A	1	2026-09-27 14:42:38.409382	t
32	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwNTM2NTI5LCJ0eXBlIjoicmVmcmVzaCJ9.WAyAKzx6ev1YQjaBIZwYlqoNFva9CdTQ6jVv1vcnuAg	1	2026-09-27 15:15:29.772622	t
33	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQZWRyaW42OUBnbWFpbC5jb20iLCJleHAiOjE3OTA1MzgzMDcsInR5cGUiOiJyZWZyZXNoIn0.qRps3ddo6yKoygvkGW9OvU6-IXSI80PwkBntbjmqmSI	4	2026-09-27 15:45:07.906784	t
34	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwNjMzNjM2LCJ0eXBlIjoicmVmcmVzaCJ9.9K7na9ICq41lZniobS6-0GiSrJavF51DKr6wAXNi6zE	1	2026-09-28 18:13:56.435909	t
35	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwNjM0Mjc2LCJ0eXBlIjoicmVmcmVzaCJ9.i7L2fhNy2NkAQCcEFMfiXAE21j67X8PuZPYEf4uIG6c	1	2026-09-28 18:24:36.630449	t
36	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwNzIwODY1LCJ0eXBlIjoicmVmcmVzaCJ9.EGT0UZyswpXcpvsVUSZypR1i2rOPd12E2gW7opxakQQ	1	2026-09-29 18:27:45.048555	t
37	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwNzIxOTU2LCJ0eXBlIjoicmVmcmVzaCJ9.ITP-MNSPxml5OlbNDio0h_z_bTMSBdGdctViW-ZYeNg	1	2026-09-29 18:45:56.512804	t
38	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwNzIyMjk5LCJ0eXBlIjoicmVmcmVzaCJ9.Fk5U9JZNGVUCQH2noQ0JjfU69Yq8Ga8LdRfxGd50tU0	1	2026-09-29 18:51:39.321743	t
39	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQZWRyaW42OUBnbWFpbC5jb20iLCJleHAiOjE3OTA3MjIzMzIsInR5cGUiOiJyZWZyZXNoIn0.Giuzm-fPjFWi_Ub2g1QgWFkExxal07Q4fLuS2CKGOJw	4	2026-09-29 18:52:12.238991	t
40	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwNzIyMzQ5LCJ0eXBlIjoicmVmcmVzaCJ9.XZArODZThjQrW4JkMC4iin90Ubl5Lx9cYT4PfA_c3J0	1	2026-09-29 18:52:29.723687	t
41	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwNzc4MDc1LCJ0eXBlIjoicmVmcmVzaCJ9.AlINgKQyKdzDyjfZreVdwsRCwkb8V_CC-I8ab1B1dyg	1	2026-09-30 10:21:15.742102	t
42	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwODA1NDMwLCJ0eXBlIjoicmVmcmVzaCJ9.tCoiOG-tqeEs6h2tgAUM0jHlncBPKHiQ20Rfw1UUt8E	1	2026-09-30 17:57:10.532753	t
43	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwOTc3NDk5LCJ0eXBlIjoicmVmcmVzaCJ9.OhV1BISruE1TEn5zz2y-GynXsgSQ-sn2JkSZ1-pkxQA	1	2026-10-02 17:44:59.004079	t
44	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwOTc4MTA1LCJ0eXBlIjoicmVmcmVzaCJ9.tOYUwylRftsQnycgRRedNwtC8Xzebh1vDDLEP9u8QT0	1	2026-10-02 17:55:05.965459	t
45	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwOTgxNzcwLCJ0eXBlIjoicmVmcmVzaCJ9.5b5sXmtK0yLrm7LNyiJGaOAVJoNmrBVBWDUBNlmIYjk	1	2026-10-02 18:56:10.789205	t
46	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwOTg1NDMyLCJ0eXBlIjoicmVmcmVzaCJ9.vow7jDgdmkYVzfbMWk_1HBejSx1092nJbN_39vgSwOQ	1	2026-10-02 19:57:12.32193	t
47	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwOTg2NjIyLCJ0eXBlIjoicmVmcmVzaCJ9.a0W2hsW0ioskQGu9YMvLKv11u_j00T4IIIb0fufzefY	1	2026-10-02 20:17:02.454376	t
48	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkwOTg2NjczLCJ0eXBlIjoicmVmcmVzaCJ9.gT_jHdSLguTAJOC7VOcWMtW-Owb9qXxthIRrz18H-nM	1	2026-10-02 20:17:53.338625	t
49	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkxMDYzNDUxLCJ0eXBlIjoicmVmcmVzaCJ9.PcehGWEEoOfSOx7uncGmMXsp6zDsi566l0YQpoH1AXw	1	2026-10-03 17:37:31.746868	t
50	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkxMDczMzczLCJ0eXBlIjoicmVmcmVzaCJ9.bYnMFQcS-LXdkEJqE-UdSwHMZjYhVb6BU08Nj18Ad4E	1	2026-10-03 20:22:53.024268	t
51	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkxMzkyNTk0LCJ0eXBlIjoicmVmcmVzaCJ9.3W-aQNt5cSurUeMNkw-8EDOxMfQC2fxoDBppZkbQOZo	1	2026-10-07 13:03:14.415215	t
52	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkxNDA5NTk5LCJ0eXBlIjoicmVmcmVzaCJ9.rXMtGlLW3g4kWsDNkJIa6nx8kQZfzVDFH7nmPVIBGpA	1	2026-10-07 17:46:39.554379	t
53	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkxNDExMDAyLCJ0eXBlIjoicmVmcmVzaCJ9.D8Qz5Oy6eRNwWnlMXNBI-QsLqR4UNrfbqkOzXjtuMyQ	1	2026-10-07 18:10:02.880834	t
54	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkxNDIwODUzLCJ0eXBlIjoicmVmcmVzaCJ9.78-Cilzpzsm4uyNSQWoJ8-nzQbQImLddZYpds2lZzss	1	2026-10-07 20:54:13.212024	t
55	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkxNDY1NzQ5LCJ0eXBlIjoicmVmcmVzaCJ9.tVhCneSXxnTN0-p7P4RKuKlM-uj6tF2mimeyrnGwry8	1	2026-10-08 09:22:29.107833	t
56	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkxNDY2MzEyLCJ0eXBlIjoicmVmcmVzaCJ9.Y1ROrvTRt0LbXznuPZal0iRrWJ0pJl9UWs63xD3nJ-4	1	2026-10-08 09:31:52.944053	t
57	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkxNDcyMDIxLCJ0eXBlIjoicmVmcmVzaCJ9.rQQxlY-vndX4YjPXieygnLnMEqOQD6BPdiQBUQWfhk0	1	2026-10-08 11:07:01.032276	t
58	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkxNDk4NTk1LCJ0eXBlIjoicmVmcmVzaCJ9.YVOjqC8j4T2YTnTb35MczwtoFtQ8NJ3JKjpTdD3s24Y	1	2026-10-08 18:29:55.143972	t
59	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkxNTYzMzQxLCJ0eXBlIjoicmVmcmVzaCJ9.XAiMVk7MfchU0bSJnah7yTh3IRxi-ETEWPD5_MaEdzs	1	2026-10-09 12:29:01.484788	t
60	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkxNTY0ODU3LCJ0eXBlIjoicmVmcmVzaCJ9.kJCI2CyMCkGFHw9vGhbVkSt_gbe6xczMB5TbatocS7I	1	2026-10-09 12:54:17.637307	t
61	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkxNTY1MzE3LCJ0eXBlIjoicmVmcmVzaCJ9.4cpAAaylf9iF4T5qbKFF7Z5FXqxlAuxpgnaLPc8utFo	1	2026-10-09 13:01:57.825947	t
62	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkxNTgzNDkyLCJ0eXBlIjoicmVmcmVzaCJ9.RfwZwgJlkobZIb-1o0QSEtdrhOAE5PseKrvEVNCHxeQ	1	2026-10-09 18:04:52.288879	t
63	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkxODk1OTY3LCJ0eXBlIjoicmVmcmVzaCJ9.OPNOMEhTjt8qEcuVsEUGYlyVH0-IjlcIxa4dK2QBqtw	1	2026-10-13 08:52:47.521083	t
64	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkxOTIyMDI2LCJ0eXBlIjoicmVmcmVzaCJ9.-yHXaloB-i5_HwGdy1PK6_Ebxuio9twvbg1THlzqTxk	1	2026-10-13 16:07:06.899323	t
65	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkxOTIyNTAyLCJ0eXBlIjoicmVmcmVzaCJ9.fddfytPOC_tECRZVjQC-h8R70Sp1tQq02aniJ2bdrAc	1	2026-10-13 16:15:02.314988	t
66	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkxOTIyODE4LCJ0eXBlIjoicmVmcmVzaCJ9.MqEXCbd2sa05gN6_6mnqwktnjTsVcUMZE4cz6XQw04E	1	2026-10-13 16:20:18.906202	t
67	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkxOTIyOTY0LCJ0eXBlIjoicmVmcmVzaCJ9.NiK-diHrZuJcrIkjffG0jWmkhomBUgSZpBUcauRBDl0	1	2026-10-13 16:22:44.899565	t
68	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkxOTI0MTE5LCJ0eXBlIjoicmVmcmVzaCJ9.w-QBRBAAyQCn9vhME0qk1px3M-GD_sfgk_lej17AkHM	1	2026-10-13 16:41:59.264664	t
69	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQZWRyaW42OUBnbWFpbC5jb20iLCJleHAiOjE3OTIwNzU5ODMsInR5cGUiOiJyZWZyZXNoIn0.s6O6lorFXIVBptvf2xM_JcHDwFuEpyoFKElZCLpT0ew	4	2026-10-15 10:53:03.114558	t
70	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkyMDc2MDE3LCJ0eXBlIjoicmVmcmVzaCJ9.Q72SqxyvLmnpojgonzmM1Wm9Ael8xW7TtAgBohKlVs4	1	2026-10-15 10:53:37.47452	t
71	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkyMDc5MTMyLCJ0eXBlIjoicmVmcmVzaCJ9.sSgkmjP6ODu5khxNyign163D-8-Rhx68BBjb9GblUew	1	2026-10-15 11:45:32.750621	t
72	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQZWRyaW42OUBnbWFpbC5jb20iLCJleHAiOjE3OTIwNzkxNTcsInR5cGUiOiJyZWZyZXNoIn0.TyA24MPaOWEL1ilmLfTcsZqvojMW0FSRP5OZBackIxI	4	2026-10-15 11:45:57.084884	t
73	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkyMDc5MjgyLCJ0eXBlIjoicmVmcmVzaCJ9.rnFns2r7qlbaFrstmPxMDGeqUWrb5lo7CWseCh2y8RU	1	2026-10-15 11:48:02.19576	t
74	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQZWRyaW42OUBnbWFpbC5jb20iLCJleHAiOjE3OTIwNzkzMjEsInR5cGUiOiJyZWZyZXNoIn0.A57NZAl_pEZuOdD2afu-oMnkDzbjCV7g8jDwVNvatnw	4	2026-10-15 11:48:41.360425	t
75	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQZWRyaW42OUBnbWFpbC5jb20iLCJleHAiOjE3OTIwODk4NjYsInR5cGUiOiJyZWZyZXNoIn0.pasozdJ31hPHJWN5YCzwrG2j6zqbyRWI-znyI_iF9r4	4	2026-10-15 14:44:26.799192	t
76	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkyMDkyMDgzLCJ0eXBlIjoicmVmcmVzaCJ9.MjLZYDbD50UUWvOR2Ea_N0bHRmjdu8Ia68XWamrMFjc	1	2026-10-15 15:21:23.250809	t
77	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQZWRyaW42OUBnbWFpbC5jb20iLCJleHAiOjE3OTIwOTIxMDMsInR5cGUiOiJyZWZyZXNoIn0.iTpDXy-yw7kT9_Cc_v71PrSAauPmVoQucFNAIkSr9ew	4	2026-10-15 15:21:43.553429	t
78	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQZWRyaW42OUBnbWFpbC5jb20iLCJleHAiOjE3OTIwOTIyMzcsInR5cGUiOiJyZWZyZXNoIn0.o9vi_xTITJUE9-ZPnbvyC-gtQ1hTSq5a5M5a9NHm3Ro	4	2026-10-15 15:23:57.489273	t
79	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQZWRyaW42OUBnbWFpbC5jb20iLCJleHAiOjE3OTIxMDY3NzMsInR5cGUiOiJyZWZyZXNoIn0.iWG6WqufEwDRCorWDpCokC_3NowH6ZyJXdKBq1AcE94	4	2026-10-15 19:26:13.88845	t
80	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQZWRyaW42OUBnbWFpbC5jb20iLCJleHAiOjE3OTIxMDgzODEsInR5cGUiOiJyZWZyZXNoIn0.48ewTtjiWA34PmZb5gYZsN3giVZeFohQpmv0B2VHIkM	4	2026-10-15 19:53:01.144497	t
81	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQZWRyaW42OUBnbWFpbC5jb20iLCJleHAiOjE3OTIxMDk2NzksInR5cGUiOiJyZWZyZXNoIn0.z-CKcCAffS-NaGAe31yd94HSd7IEAEoWcFRj0VJq1iE	4	2026-10-15 20:14:39.681943	t
82	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQZWRyaW42OUBnbWFpbC5jb20iLCJleHAiOjE3OTIxMDk5OTMsInR5cGUiOiJyZWZyZXNoIn0.iDhHJGnhSYWIka6CwsbUwEJlafn83XuIBVs3Pu4tgX0	4	2026-10-15 20:19:53.305351	t
83	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkyMTYzNzQ2LCJ0eXBlIjoicmVmcmVzaCJ9.4SkXk-uYFF2NLOFABM9aPJY5oTFDsTG6OLSeLJV6ma0	1	2026-10-16 11:15:46.541696	t
84	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkyMTY0NTc3LCJ0eXBlIjoicmVmcmVzaCJ9.FmspxDbXcxKpPta5BKVgj38m4S9nSQ9LeFKpmsOYcyI	1	2026-10-16 11:29:37.315534	t
85	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQZWRyaW42OUBnbWFpbC5jb20iLCJleHAiOjE3OTIxNjQ4NDMsInR5cGUiOiJyZWZyZXNoIn0.RAIDJnaS0egbBY4nFR8p8OCe07ybN60QHIvQkaU2qBY	4	2026-10-16 11:34:03.866753	t
86	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkyMTY5MjE1LCJ0eXBlIjoicmVmcmVzaCJ9.httrbyNufiatMh4rvXEmjvJ47adYU_06kqYyjcHCMNk	1	2026-10-16 12:46:55.620484	t
87	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQZWRyaW42OUBnbWFpbC5jb20iLCJleHAiOjE3OTIxNzA1NzYsInR5cGUiOiJyZWZyZXNoIn0.-frxQkzHgnyDOFI4HtdJUypeTpII17B7ea7dbEXdHWc	4	2026-10-16 13:09:36.358585	t
88	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkyMTc5OTczLCJ0eXBlIjoicmVmcmVzaCJ9.j38mbmM_yZSHp63JPmYNm_Wz31tbwZCgCvOTcGRqQuE	1	2026-10-16 15:46:13.94693	t
89	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJKdWFuUGlAZ21haWwuY29tIiwiZXhwIjoxNzkyMTgxMjMxLCJ0eXBlIjoicmVmcmVzaCJ9.dhUSfYn8kRs-oyMpfC7tiI7QxiaPXUcTZCi7HuS9d0o	5	2026-10-16 16:07:11.619803	t
90	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkyMTgxMjU0LCJ0eXBlIjoicmVmcmVzaCJ9.G_kdmDxknKZhg4SQZVigcLrPAnGs5HnAoeQ1DMy5fTU	1	2026-10-16 16:07:34.518477	t
91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkyMjQ2ODQzLCJ0eXBlIjoicmVmcmVzaCJ9.H4do6EygsN5ADDfhxrQahATQST86uNgc31ru7D21tlQ	1	2026-10-17 10:20:43.25915	t
92	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkyMjQ5NDE1LCJ0eXBlIjoicmVmcmVzaCJ9.FDp22OW8rAxLqYAFKAz3NY9qnicSnHLRF51pS-BkZhg	1	2026-10-17 11:03:35.363353	t
93	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQZWRyaW42OUBnbWFpbC5jb20iLCJleHAiOjE3OTIzMzk0ODQsInR5cGUiOiJyZWZyZXNoIn0.bJEmmDbWxiGFbCknbE2z-bRQxXaCjFyI38deEaRc-Sk	4	2026-10-18 12:04:44.58489	t
94	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkyMzQwNzc3LCJ0eXBlIjoicmVmcmVzaCJ9.hrzFEnkNiLIHtklqPbF9M6NV8NlLOiewP4LnRZDH31M	1	2026-10-18 12:26:17.465761	t
95	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkyMzQzNTIyLCJ0eXBlIjoicmVmcmVzaCJ9.jYuivGvS7Cydyth4jCyzweXYdIoEffhutuzCqt1FCWc	1	2026-10-18 13:12:02.703313	t
96	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQZWRyaW42OUBnbWFpbC5jb20iLCJleHAiOjE3OTIzNDQxODksInR5cGUiOiJyZWZyZXNoIn0.G_YZSIt5uyWZzlysBeH6uanbyMkkRP8jdf1a70SZ1S4	4	2026-10-18 13:23:09.244423	t
97	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkyMzY0MjYzLCJ0eXBlIjoicmVmcmVzaCJ9.fC0B86_C9MTyvQDC6tYKR6In3WLvYoxSYWcLQeDMXbY	1	2026-10-18 18:57:43.206707	t
98	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVYnVudHVAZ21haWwuY29tIiwiZXhwIjoxNzkyMzY0NTk0LCJ0eXBlIjoicmVmcmVzaCJ9.NiHv23HWCx6WHe6_183WiOnjWbyW8giuFUUjHqRMubE	6	2026-10-18 19:03:14.423374	t
99	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVYnVudHVAZ21haWwuY29tIiwiZXhwIjoxNzkyMzY1NDIxLCJ0eXBlIjoicmVmcmVzaCJ9._6DEkIjqDaoJgc_5Ktns_lo-jROH7Y0LcMYTj2HwEdE	6	2026-10-18 19:17:01.012376	t
100	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVYnVudHVAZ21haWwuY29tIiwiZXhwIjoxNzkyNDE4NDg0LCJ0eXBlIjoicmVmcmVzaCJ9.pd3S8vF-Duy5wVOvSGcIiJWF9s11VB1pqaH9DD77Qwo	6	2026-10-19 10:01:24.838312	t
101	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVYnVudHVAZ21haWwuY29tIiwiZXhwIjoxNzkyNDE5MDg0LCJ0eXBlIjoicmVmcmVzaCJ9.oIKWLg8GO7kJyhuX71JgbHfqO7_CT2eQpoeDqB6ht9Y	6	2026-10-19 10:11:24.30941	t
102	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVYnVudHVAZ21haWwuY29tIiwiZXhwIjoxNzkyNDE5NjY1LCJ0eXBlIjoicmVmcmVzaCJ9.T3fu6WWwWP24kettvH6xJ_o4Mt2i7VF8mn7yYoXSryI	6	2026-10-19 10:21:05.535971	t
103	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVYnVudHVAZ21haWwuY29tIiwiZXhwIjoxNzkyNDIwMDcyLCJ0eXBlIjoicmVmcmVzaCJ9.6v2bDb403ssm-_OCnPX9Q200Fm7Y51Z6fdwUugLZfrM	6	2026-10-19 10:27:52.809	t
104	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVYnVudHVAZ21haWwuY29tIiwiZXhwIjoxNzkyNDIwNjAzLCJ0eXBlIjoicmVmcmVzaCJ9.jsH2GY440x0XwU2j1BloZIkdM7NK8gfXiLz1BDn3EnQ	6	2026-10-19 10:36:43.391985	t
105	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVYnVudHVAZ21haWwuY29tIiwiZXhwIjoxNzkyNDIwNjUzLCJ0eXBlIjoicmVmcmVzaCJ9.lyvsnebjws64qlb9MqV9zJL7ECPH2DguaQNRucJSpAI	6	2026-10-19 10:37:33.392523	t
106	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkyNDIwNzE2LCJ0eXBlIjoicmVmcmVzaCJ9.23-HEwbnSGtFficIAE-d3vDCnR_RlbC9Yy5ftJjKbu4	1	2026-10-19 10:38:36.911724	t
107	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkyNDU2Njk5LCJ0eXBlIjoicmVmcmVzaCJ9.nH5tx3N5gaVgoj9yDlEd59Y7fpMAHLtlm7w55Q0Sbcg	1	2026-10-19 20:38:19.48991	t
108	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVYnVudHVAZ21haWwuY29tIiwiZXhwIjoxNzkyNDU2NzkwLCJ0eXBlIjoicmVmcmVzaCJ9.ImLYoRRV652E0aK4M7hANskrMhBlwq8UjPAQRsWaWMA	6	2026-10-19 20:39:50.573045	t
109	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkyNjc4NTQwLCJ0eXBlIjoicmVmcmVzaCJ9._yUAxWXjUClJVm_8RfmSJ9ndD0-eJIeIHOU5B1ed5rI	1	2026-10-22 10:15:40.307994	t
110	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkyODgwODA4LCJ0eXBlIjoicmVmcmVzaCJ9.uV-IctmgAqbnxQKLrR0G3pCalyjp3DOPVKYEHsETFhI	1	2026-10-24 18:26:48.953536	t
111	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkyODkxMDY0LCJ0eXBlIjoicmVmcmVzaCJ9.TMj9UhUqrBJoDw6teCXZuuZZPtWY22uT3bCm4lQTMWw	1	2026-10-24 21:17:44.742286	t
112	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQZWRyaW42OUBnbWFpbC5jb20iLCJleHAiOjE3OTI5Mzg3NTEsInR5cGUiOiJyZWZyZXNoIn0.jzi3Is1NW9FVR9I0odODzVTGFGcObZiNME9HtZc9o0Q	4	2026-10-25 10:32:31.657731	t
113	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkyOTM4ODEwLCJ0eXBlIjoicmVmcmVzaCJ9.GPH2FD_76QjuPYhgZA73yprRpT5xZ4ZdAxjM3M1Gfp0	1	2026-10-25 10:33:30.039579	t
114	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkzMDIyOTUxLCJ0eXBlIjoicmVmcmVzaCJ9.4qnYY2k5clETp9pdJQByzrEqUKxMLhpUGNf6vbbm2qI	1	2026-10-26 09:55:51.515713	t
115	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkzMDQ5MzU0LCJ0eXBlIjoicmVmcmVzaCJ9.z4SISVSEFJ_mN9kgnxzhN2nNPQN9CbgQO6t18Pp1vCI	1	2026-10-26 17:15:54.87161	t
116	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQZWRyaW42OUBnbWFpbC5jb20iLCJleHAiOjE3OTMwNDk0MDUsInR5cGUiOiJyZWZyZXNoIn0.mgeCcfcEk2QaAB8H2Ypm0ncCNrYZtfL71KqKCNU6WOE	4	2026-10-26 17:16:45.092813	t
117	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkzMTM0NDE1LCJ0eXBlIjoicmVmcmVzaCJ9._m2QkHAhBI60hlks11qq7GEzDJ-EZrRutdnqpDYZO3Q	1	2026-10-27 16:53:35.361993	t
118	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkzMTk3NDQ2LCJ0eXBlIjoicmVmcmVzaCJ9.AtR60AmPvqZnqYbjMYgYfwZZqczjvf-ex9fm-tGJjLE	1	2026-10-28 10:24:06.270627	t
119	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkzMTk3NTIzLCJ0eXBlIjoicmVmcmVzaCJ9.8moZ6Ie7yL42iE23ulDMI_SMU6uMmIRxZD6ZbAbsXJ0	1	2026-10-28 10:25:23.305298	t
120	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJTbWlja2NpdG9AZ21haWwuY29tIiwiZXhwIjoxNzkzMTk3Njk0LCJ0eXBlIjoicmVmcmVzaCJ9.2G5XZVOwoNbp4Bcu14EZpmrRRviSMz_H0kfgJilhYnE	8	2026-10-28 10:28:14.817081	t
121	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkzMjAwMzI4LCJ0eXBlIjoicmVmcmVzaCJ9.mIxn-riiuVDnOW4JqscO9mHmCQxCJpcqdSO66JnPrwA	1	2026-10-28 11:12:08.159439	t
122	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJTbWlja2NpdG9AZ21haWwuY29tIiwiZXhwIjoxNzkzMjAwMzY3LCJ0eXBlIjoicmVmcmVzaCJ9.IJDxhgv7fQN4UEwvCVnhlDbG3H53sM1FZP5M5wOV4nM	8	2026-10-28 11:12:47.250363	t
123	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkzMjAxMDUzLCJ0eXBlIjoicmVmcmVzaCJ9.io-AZfihXiS5HLP8jr0SzeOMCF4HPgSgoY7VRMsXwZE	1	2026-10-28 11:24:13.655005	t
124	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJTbWlja2NpdG9AZ21haWwuY29tIiwiZXhwIjoxNzkzMjAxNjkzLCJ0eXBlIjoicmVmcmVzaCJ9.nJDudt0p_viXOL9LQdmVSNvaUNnEtyDnf4a6mh-GNpE	8	2026-10-28 11:34:53.070957	t
125	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGZWRvcmExMjNAZ21haWwuY29tIiwiZXhwIjoxNzkzMjA5NDkzLCJ0eXBlIjoicmVmcmVzaCJ9.Ri18GwBSmgUgVKRM_7uU2kFDHElrUbhNvlHjzvgiF2A	1	2026-10-28 13:44:53.936033	t
\.


--
-- TOC entry 4869 (class 0 OID 16619)
-- Dependencies: 286
-- Data for Name: rol; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rol (idrol, nombrerol, descripcion, activo) FROM stdin;
1	Director	El director se encarga de supervisar todo sobre la academia, puede ingresar y regular usuarios dentro del sistema	t
2	Sub Director	El sub director sub directea	t
3	Coordinador	El coordinador supervisa docentes, estudiantes y aveces imparte clases	t
4	Docente	El docente imparte clases, sube notas y asistencias de los estudiantes, tambien puede dar varias materias	t
5	Estudiante	Es aquel el cual aprende dentro de la academia, el estudiante es aquel que puede ver sus notas, asistencias, tambien en que seccion y el horario que al mismo le toque	t
6	Conserje	El conserje se encarga de limpiar las inslataciones	t
\.


--
-- TOC entry 4872 (class 0 OID 16628)
-- Dependencies: 289
-- Data for Name: seccion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seccion (idsecc, nomsecc, cupo_maximo) FROM stdin;
1	B	30
\.


--
-- TOC entry 4875 (class 0 OID 16635)
-- Dependencies: 292
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario (ciuser, nombreusuario, apellusuario, estudiante, empleado, teleusuario, correousuario, contrase, activo) FROM stdin;
V-1112233	Fedora	Linux	\N	\N	+58 412-4531211	Fedora123@gmail.com	$2y$10$Ej5huhot.HmI/iZyh5F5vOxhWwM6rZb7xI2eFsalk380igkhMX3d2	t
V-23322123	Monica	Morales	\N	\N	+58 412-2214311	Monicam02@gmail.com	$2b$12$Uaip84sx8.GbfzNlXkLCm.VWLARLE1aaDycC8RBlcGRy/dGGUR162	f
E-21344565	Paulo	Sanchez	\N	\N	041245632211	PauloBarca@gmail.com	$2b$12$0UwS.bnsmyTKDEYHfTheSu/jJgDw6cqgrkPjddIZzCyvbZB631xzG	t
V-30122345	Mario	Luigi	\N	\N	+58 412-3456311	Rchavalin@gmail.com	$2b$12$fjUIRIqsBwLawb1Hw6HMWOc6AqqmDxQYYoE7mSFhhQfntp1nJT6Pi	t
V-30122453	Yoshi	Toad	\N	\N	04244564411	Pedrin69@gmail.com	$2b$12$PTEdFKOfxSRr2mRC1aQa2ud3cW4EQw5SY7yvq3m/zxZGYrFywRW.y	t
31122456	Juansito	Herrera	\N	\N	04123442312	JuanPi@gmail.com	$2b$12$CmuHWG9crCYeSnMg1GsmyOqkmAqDKy35UCNZ7GlNRH935S/xDJfiq	t
V-0234567	Linus	Ubuntu	\N	\N	04123451211	Ubuntu@gmail.com	$2b$12$o68r6Vzp0ZEaDuYXrD7qtOMNVPhkkm7ohjgTbxVfvwdlm.uTVLXza	t
E-29345122	Smick	Herrera	E-29345122	\N	04123451122	Smickcito@gmail.com	$2b$12$HtTLgyrl6WR4i4LCZGLg9eWHi9l/bi.lpUO8VHM5NZSzlzCTSF.m6	t
\.


--
-- TOC entry 4876 (class 0 OID 16645)
-- Dependencies: 293
-- Data for Name: usuario_login; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario_login (ciuser_log, ciuser, idrol, activo) FROM stdin;
1	V-1112233	1	t
4	V-30122453	5	t
3	E-21344565	1	f
5	31122456	4	t
6	V-0234567	4	t
7	V-0234567	5	t
8	E-29345122	5	t
\.


--
-- TOC entry 4917 (class 0 OID 0)
-- Dependencies: 220
-- Name: asignacion_docente_id_asignacion_docente_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asignacion_docente_id_asignacion_docente_seq', 1, true);


--
-- TOC entry 4918 (class 0 OID 0)
-- Dependencies: 221
-- Name: asignacion_docente_id_asignacion_docente_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asignacion_docente_id_asignacion_docente_seq1', 1, false);


--
-- TOC entry 4919 (class 0 OID 0)
-- Dependencies: 223
-- Name: asistencias_idasis_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asistencias_idasis_seq', 1, true);


--
-- TOC entry 4920 (class 0 OID 0)
-- Dependencies: 224
-- Name: asistencias_idasis_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asistencias_idasis_seq1', 1, false);


--
-- TOC entry 4921 (class 0 OID 0)
-- Dependencies: 226
-- Name: auditoria_idseria_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auditoria_idseria_seq', 1, true);


--
-- TOC entry 4922 (class 0 OID 0)
-- Dependencies: 227
-- Name: auditoria_idseria_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auditoria_idseria_seq1', 21, true);


--
-- TOC entry 4923 (class 0 OID 0)
-- Dependencies: 229
-- Name: bloque_idbloque_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bloque_idbloque_seq', 1, true);


--
-- TOC entry 4924 (class 0 OID 0)
-- Dependencies: 230
-- Name: bloque_idbloque_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bloque_idbloque_seq1', 2, true);


--
-- TOC entry 4925 (class 0 OID 0)
-- Dependencies: 232
-- Name: carrera_idcarrera_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carrera_idcarrera_seq', 1, true);


--
-- TOC entry 4926 (class 0 OID 0)
-- Dependencies: 233
-- Name: carrera_idcarrera_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carrera_idcarrera_seq1', 5, true);


--
-- TOC entry 4927 (class 0 OID 0)
-- Dependencies: 235
-- Name: carrera_modulo_idcarremo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carrera_modulo_idcarremo_seq', 1, true);


--
-- TOC entry 4928 (class 0 OID 0)
-- Dependencies: 236
-- Name: carrera_modulo_idcarremo_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carrera_modulo_idcarremo_seq1', 1, false);


--
-- TOC entry 4929 (class 0 OID 0)
-- Dependencies: 238
-- Name: curso_idcurso_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.curso_idcurso_seq', 1, true);


--
-- TOC entry 4930 (class 0 OID 0)
-- Dependencies: 239
-- Name: curso_idcurso_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.curso_idcurso_seq1', 9, true);


--
-- TOC entry 4931 (class 0 OID 0)
-- Dependencies: 241
-- Name: curso_modulo_idcurso_modulo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.curso_modulo_idcurso_modulo_seq', 1, true);


--
-- TOC entry 4932 (class 0 OID 0)
-- Dependencies: 242
-- Name: curso_modulo_idcurso_modulo_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.curso_modulo_idcurso_modulo_seq1', 1, false);


--
-- TOC entry 4933 (class 0 OID 0)
-- Dependencies: 303
-- Name: detalle_inscripcion_seccion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalle_inscripcion_seccion_id_seq', 19, true);


--
-- TOC entry 4934 (class 0 OID 0)
-- Dependencies: 246
-- Name: horario_idhorario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.horario_idhorario_seq', 1, true);


--
-- TOC entry 4935 (class 0 OID 0)
-- Dependencies: 247
-- Name: horario_idhorario_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.horario_idhorario_seq1', 2, true);


--
-- TOC entry 4936 (class 0 OID 0)
-- Dependencies: 301
-- Name: inscripcion_periodo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inscripcion_periodo_id_seq', 19, true);


--
-- TOC entry 4937 (class 0 OID 0)
-- Dependencies: 249
-- Name: materia_idmateria_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materia_idmateria_seq', 1, true);


--
-- TOC entry 4938 (class 0 OID 0)
-- Dependencies: 250
-- Name: materia_idmateria_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materia_idmateria_seq1', 7, true);


--
-- TOC entry 4939 (class 0 OID 0)
-- Dependencies: 252
-- Name: materias_modulo_idmatemo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materias_modulo_idmatemo_seq', 1, true);


--
-- TOC entry 4940 (class 0 OID 0)
-- Dependencies: 253
-- Name: materias_modulo_idmatemo_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materias_modulo_idmatemo_seq1', 19, true);


--
-- TOC entry 4941 (class 0 OID 0)
-- Dependencies: 256
-- Name: mensualidad_estu_idmensualidad_estu_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mensualidad_estu_idmensualidad_estu_seq', 1, true);


--
-- TOC entry 4942 (class 0 OID 0)
-- Dependencies: 257
-- Name: mensualidad_estu_idmensualidad_estu_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mensualidad_estu_idmensualidad_estu_seq1', 1, false);


--
-- TOC entry 4943 (class 0 OID 0)
-- Dependencies: 258
-- Name: mensualidad_idmensualidad_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mensualidad_idmensualidad_seq', 1, true);


--
-- TOC entry 4944 (class 0 OID 0)
-- Dependencies: 259
-- Name: mensualidad_idmensualidad_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mensualidad_idmensualidad_seq1', 1, false);


--
-- TOC entry 4945 (class 0 OID 0)
-- Dependencies: 261
-- Name: metodopago_idmetodopago_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.metodopago_idmetodopago_seq', 1, true);


--
-- TOC entry 4946 (class 0 OID 0)
-- Dependencies: 262
-- Name: metodopago_idmetodopago_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.metodopago_idmetodopago_seq1', 1, false);


--
-- TOC entry 4947 (class 0 OID 0)
-- Dependencies: 264
-- Name: modulo_idmodulo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.modulo_idmodulo_seq', 1, true);


--
-- TOC entry 4948 (class 0 OID 0)
-- Dependencies: 265
-- Name: modulo_idmodulo_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.modulo_idmodulo_seq1', 4, true);


--
-- TOC entry 4949 (class 0 OID 0)
-- Dependencies: 267
-- Name: monedapago_idmoneda_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.monedapago_idmoneda_seq', 1, true);


--
-- TOC entry 4950 (class 0 OID 0)
-- Dependencies: 268
-- Name: monedapago_idmoneda_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.monedapago_idmoneda_seq1', 1, false);


--
-- TOC entry 4951 (class 0 OID 0)
-- Dependencies: 270
-- Name: nota_idnota_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nota_idnota_seq', 1, true);


--
-- TOC entry 4952 (class 0 OID 0)
-- Dependencies: 271
-- Name: nota_idnota_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nota_idnota_seq1', 1, false);


--
-- TOC entry 4953 (class 0 OID 0)
-- Dependencies: 273
-- Name: oferta_seccion_idseccmo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.oferta_seccion_idseccmo_seq', 1, true);


--
-- TOC entry 4954 (class 0 OID 0)
-- Dependencies: 274
-- Name: oferta_seccion_idseccmo_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.oferta_seccion_idseccmo_seq1', 8, true);


--
-- TOC entry 4955 (class 0 OID 0)
-- Dependencies: 299
-- Name: periodo_academico_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.periodo_academico_id_seq', 1, true);


--
-- TOC entry 4956 (class 0 OID 0)
-- Dependencies: 276
-- Name: plan_evaluacion_idevaluacion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.plan_evaluacion_idevaluacion_seq', 1, false);


--
-- TOC entry 4957 (class 0 OID 0)
-- Dependencies: 278
-- Name: preguntas_seguridad_idpregunta_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.preguntas_seguridad_idpregunta_seq', 1, true);


--
-- TOC entry 4958 (class 0 OID 0)
-- Dependencies: 279
-- Name: preguntas_seguridad_idpregunta_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.preguntas_seguridad_idpregunta_seq1', 1, false);


--
-- TOC entry 4959 (class 0 OID 0)
-- Dependencies: 281
-- Name: preguntas_usuario_idpreuser_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.preguntas_usuario_idpreuser_seq', 1, true);


--
-- TOC entry 4960 (class 0 OID 0)
-- Dependencies: 282
-- Name: preguntas_usuario_idpreuser_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.preguntas_usuario_idpreuser_seq1', 1, false);


--
-- TOC entry 4961 (class 0 OID 0)
-- Dependencies: 284
-- Name: refresh_token_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refresh_token_id_seq', 1, true);


--
-- TOC entry 4962 (class 0 OID 0)
-- Dependencies: 285
-- Name: refresh_token_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refresh_token_id_seq1', 125, true);


--
-- TOC entry 4963 (class 0 OID 0)
-- Dependencies: 287
-- Name: rol_idrol_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rol_idrol_seq', 1, true);


--
-- TOC entry 4964 (class 0 OID 0)
-- Dependencies: 288
-- Name: rol_idrol_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rol_idrol_seq1', 5, true);


--
-- TOC entry 4965 (class 0 OID 0)
-- Dependencies: 290
-- Name: seccion_idsecc_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seccion_idsecc_seq', 1, true);


--
-- TOC entry 4966 (class 0 OID 0)
-- Dependencies: 291
-- Name: seccion_idsecc_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seccion_idsecc_seq1', 1, true);


--
-- TOC entry 4967 (class 0 OID 0)
-- Dependencies: 294
-- Name: usuario_login_ciuser_log_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_login_ciuser_log_seq', 1, true);


--
-- TOC entry 4968 (class 0 OID 0)
-- Dependencies: 295
-- Name: usuario_login_ciuser_log_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_login_ciuser_log_seq1', 8, true);


--
-- TOC entry 4532 (class 2606 OID 16666)
-- Name: asignacion_docente asignacion_docente_composite_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_docente
    ADD CONSTRAINT asignacion_docente_composite_key UNIQUE (empleado_id, materia_id, seccion_id);


--
-- TOC entry 4534 (class 2606 OID 16668)
-- Name: asignacion_docente asignacion_docente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_docente
    ADD CONSTRAINT asignacion_docente_pkey PRIMARY KEY (id_asignacion_docente);


--
-- TOC entry 4536 (class 2606 OID 16670)
-- Name: asistencias asistencias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias
    ADD CONSTRAINT asistencias_pkey PRIMARY KEY (idasis);


--
-- TOC entry 4538 (class 2606 OID 16672)
-- Name: auditoria auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_pkey PRIMARY KEY (idseria);


--
-- TOC entry 4540 (class 2606 OID 16674)
-- Name: bloque bloque_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bloque
    ADD CONSTRAINT bloque_pkey PRIMARY KEY (idbloque);


--
-- TOC entry 4544 (class 2606 OID 16676)
-- Name: carrera_modulo carrera_modulo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrera_modulo
    ADD CONSTRAINT carrera_modulo_pkey PRIMARY KEY (idcarremo);


--
-- TOC entry 4542 (class 2606 OID 16678)
-- Name: carrera carrera_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrera
    ADD CONSTRAINT carrera_pkey PRIMARY KEY (idcarrera);


--
-- TOC entry 4548 (class 2606 OID 16680)
-- Name: curso_modulo curso_modulo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curso_modulo
    ADD CONSTRAINT curso_modulo_pkey PRIMARY KEY (idcurso_modulo);


--
-- TOC entry 4546 (class 2606 OID 16682)
-- Name: curso curso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curso
    ADD CONSTRAINT curso_pkey PRIMARY KEY (idcurso);


--
-- TOC entry 4606 (class 2606 OID 17657)
-- Name: detalle_inscripcion_seccion detalle_inscripcion_seccion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_inscripcion_seccion
    ADD CONSTRAINT detalle_inscripcion_seccion_pkey PRIMARY KEY (id);


--
-- TOC entry 4550 (class 2606 OID 16684)
-- Name: empleado empleado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleado
    ADD CONSTRAINT empleado_pkey PRIMARY KEY (ciempleado);


--
-- TOC entry 4552 (class 2606 OID 16686)
-- Name: estudiante estudiante_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiante
    ADD CONSTRAINT estudiante_pkey PRIMARY KEY (ciestu);


--
-- TOC entry 4554 (class 2606 OID 16688)
-- Name: horario horario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horario
    ADD CONSTRAINT horario_pkey PRIMARY KEY (idhorario);


--
-- TOC entry 4604 (class 2606 OID 17639)
-- Name: inscripcion_periodo inscripcion_periodo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripcion_periodo
    ADD CONSTRAINT inscripcion_periodo_pkey PRIMARY KEY (id);


--
-- TOC entry 4556 (class 2606 OID 16690)
-- Name: materia materia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materia
    ADD CONSTRAINT materia_pkey PRIMARY KEY (idmateria);


--
-- TOC entry 4558 (class 2606 OID 16692)
-- Name: materias_modulo materias_modulo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materias_modulo
    ADD CONSTRAINT materias_modulo_pkey PRIMARY KEY (idmatemo);


--
-- TOC entry 4562 (class 2606 OID 16694)
-- Name: mensualidad_estu mensualidad_estu_factura_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensualidad_estu
    ADD CONSTRAINT mensualidad_estu_factura_key UNIQUE (factura);


--
-- TOC entry 4564 (class 2606 OID 16696)
-- Name: mensualidad_estu mensualidad_estu_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensualidad_estu
    ADD CONSTRAINT mensualidad_estu_pkey PRIMARY KEY (idmensualidad_estu);


--
-- TOC entry 4560 (class 2606 OID 16698)
-- Name: mensualidad mensualidad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensualidad
    ADD CONSTRAINT mensualidad_pkey PRIMARY KEY (idmensualidad);


--
-- TOC entry 4566 (class 2606 OID 16700)
-- Name: metodopago metodopago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metodopago
    ADD CONSTRAINT metodopago_pkey PRIMARY KEY (idmetodopago);


--
-- TOC entry 4568 (class 2606 OID 16702)
-- Name: modulo modulo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modulo
    ADD CONSTRAINT modulo_pkey PRIMARY KEY (idmodulo);


--
-- TOC entry 4570 (class 2606 OID 16704)
-- Name: monedapago monedapago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monedapago
    ADD CONSTRAINT monedapago_pkey PRIMARY KEY (idmoneda);


--
-- TOC entry 4572 (class 2606 OID 16706)
-- Name: nota nota_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota
    ADD CONSTRAINT nota_pkey PRIMARY KEY (idnota);


--
-- TOC entry 4574 (class 2606 OID 16708)
-- Name: oferta_seccion oferta_seccion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oferta_seccion
    ADD CONSTRAINT oferta_seccion_pkey PRIMARY KEY (idseccmo);


--
-- TOC entry 4602 (class 2606 OID 17629)
-- Name: periodo_academico periodo_academico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.periodo_academico
    ADD CONSTRAINT periodo_academico_pkey PRIMARY KEY (id);


--
-- TOC entry 4578 (class 2606 OID 16710)
-- Name: plan_evaluacion plan_evaluacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plan_evaluacion
    ADD CONSTRAINT plan_evaluacion_pkey PRIMARY KEY (idevaluacion);


--
-- TOC entry 4580 (class 2606 OID 16712)
-- Name: preguntas_seguridad preguntas_seguridad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preguntas_seguridad
    ADD CONSTRAINT preguntas_seguridad_pkey PRIMARY KEY (idpregunta);


--
-- TOC entry 4582 (class 2606 OID 16714)
-- Name: preguntas_usuario preguntas_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preguntas_usuario
    ADD CONSTRAINT preguntas_usuario_pkey PRIMARY KEY (idpreuser);


--
-- TOC entry 4584 (class 2606 OID 16716)
-- Name: refresh_token refresh_token_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_token
    ADD CONSTRAINT refresh_token_pkey PRIMARY KEY (id);


--
-- TOC entry 4586 (class 2606 OID 16718)
-- Name: refresh_token refresh_token_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_token
    ADD CONSTRAINT refresh_token_token_key UNIQUE (token);


--
-- TOC entry 4588 (class 2606 OID 16720)
-- Name: rol rol_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol
    ADD CONSTRAINT rol_pkey PRIMARY KEY (idrol);


--
-- TOC entry 4590 (class 2606 OID 16722)
-- Name: seccion seccion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seccion
    ADD CONSTRAINT seccion_pkey PRIMARY KEY (idsecc);


--
-- TOC entry 4608 (class 2606 OID 17659)
-- Name: detalle_inscripcion_seccion uk_estudiante_seccion_periodo; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_inscripcion_seccion
    ADD CONSTRAINT uk_estudiante_seccion_periodo UNIQUE (inscripcion_periodo_id, seccion_id);


--
-- TOC entry 4576 (class 2606 OID 16724)
-- Name: oferta_seccion unq_estudiante_seccion; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oferta_seccion
    ADD CONSTRAINT unq_estudiante_seccion UNIQUE (estudiante, idsecc);


--
-- TOC entry 4598 (class 2606 OID 17831)
-- Name: usuario_login uq_usuario_rol; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_login
    ADD CONSTRAINT uq_usuario_rol UNIQUE (ciuser, idrol);


--
-- TOC entry 4592 (class 2606 OID 16726)
-- Name: usuario usuario_empleado_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_empleado_key UNIQUE (empleado);


--
-- TOC entry 4594 (class 2606 OID 16728)
-- Name: usuario usuario_estudiante_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_estudiante_key UNIQUE (estudiante);


--
-- TOC entry 4600 (class 2606 OID 16730)
-- Name: usuario_login usuario_login_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_login
    ADD CONSTRAINT usuario_login_pkey PRIMARY KEY (ciuser_log);


--
-- TOC entry 4596 (class 2606 OID 16732)
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (ciuser);


--
-- TOC entry 4648 (class 2620 OID 16954)
-- Name: empleado trg_auditoria_empleado_automatica; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_auditoria_empleado_automatica AFTER INSERT OR DELETE OR UPDATE ON public.empleado FOR EACH ROW EXECUTE FUNCTION public.tf_registrar_auditoria_empleado();


--
-- TOC entry 4649 (class 2620 OID 16956)
-- Name: estudiante trg_auditoria_estudiante_automatica; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_auditoria_estudiante_automatica AFTER INSERT OR DELETE OR UPDATE ON public.estudiante FOR EACH ROW EXECUTE FUNCTION public.tf_registrar_auditoria_estudiante();


--
-- TOC entry 4651 (class 2620 OID 16952)
-- Name: usuario trg_auditoria_usuario_automatica; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_auditoria_usuario_automatica AFTER INSERT OR DELETE OR UPDATE ON public.usuario FOR EACH ROW EXECUTE FUNCTION public.tf_registrar_auditoria_usuario();


--
-- TOC entry 4650 (class 2620 OID 16733)
-- Name: plan_evaluacion trg_validar_porcentaje_plan; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_validar_porcentaje_plan BEFORE INSERT OR UPDATE ON public.plan_evaluacion FOR EACH ROW EXECUTE FUNCTION public.validar_porcentaje_plan();


--
-- TOC entry 4610 (class 2606 OID 16734)
-- Name: asistencias asistencias_asisestu_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias
    ADD CONSTRAINT asistencias_asisestu_fkey FOREIGN KEY (asisestu) REFERENCES public.estudiante(ciestu);


--
-- TOC entry 4612 (class 2606 OID 16739)
-- Name: auditoria auditoria_usuario_escritor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_usuario_escritor_id_fkey FOREIGN KEY (usuario_escritor_id) REFERENCES public.usuario(ciuser);


--
-- TOC entry 4613 (class 2606 OID 16749)
-- Name: carrera_modulo carrera_modulo_idcarrera_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrera_modulo
    ADD CONSTRAINT carrera_modulo_idcarrera_fkey FOREIGN KEY (idcarrera) REFERENCES public.carrera(idcarrera);


--
-- TOC entry 4614 (class 2606 OID 16754)
-- Name: carrera_modulo carrera_modulo_idmatemo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrera_modulo
    ADD CONSTRAINT carrera_modulo_idmatemo_fkey FOREIGN KEY (idmatemo) REFERENCES public.materias_modulo(idmatemo);


--
-- TOC entry 4615 (class 2606 OID 16759)
-- Name: curso curso_docenasig_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curso
    ADD CONSTRAINT curso_docenasig_fkey FOREIGN KEY (docenasig) REFERENCES public.empleado(ciempleado);


--
-- TOC entry 4616 (class 2606 OID 16764)
-- Name: curso_modulo curso_modulo_curso_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curso_modulo
    ADD CONSTRAINT curso_modulo_curso_fkey FOREIGN KEY (curso) REFERENCES public.curso(idcurso);


--
-- TOC entry 4617 (class 2606 OID 16769)
-- Name: curso_modulo curso_modulo_horario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curso_modulo
    ADD CONSTRAINT curso_modulo_horario_fkey FOREIGN KEY (horario) REFERENCES public.horario(idhorario);


--
-- TOC entry 4618 (class 2606 OID 16774)
-- Name: curso_modulo curso_modulo_modulo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curso_modulo
    ADD CONSTRAINT curso_modulo_modulo_fkey FOREIGN KEY (modulo) REFERENCES public.modulo(idmodulo);


--
-- TOC entry 4646 (class 2606 OID 17660)
-- Name: detalle_inscripcion_seccion detalle_inscripcion_seccion_inscripcion_periodo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_inscripcion_seccion
    ADD CONSTRAINT detalle_inscripcion_seccion_inscripcion_periodo_id_fkey FOREIGN KEY (inscripcion_periodo_id) REFERENCES public.inscripcion_periodo(id) ON DELETE CASCADE;


--
-- TOC entry 4647 (class 2606 OID 17665)
-- Name: detalle_inscripcion_seccion detalle_inscripcion_seccion_seccion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_inscripcion_seccion
    ADD CONSTRAINT detalle_inscripcion_seccion_seccion_id_fkey FOREIGN KEY (seccion_id) REFERENCES public.seccion(idsecc);


--
-- TOC entry 4609 (class 2606 OID 16779)
-- Name: asignacion_docente fk_asig_empleado; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_docente
    ADD CONSTRAINT fk_asig_empleado FOREIGN KEY (empleado_id) REFERENCES public.empleado(ciempleado);


--
-- TOC entry 4611 (class 2606 OID 16784)
-- Name: asistencias fk_asistencia_materia; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias
    ADD CONSTRAINT fk_asistencia_materia FOREIGN KEY (idmateria) REFERENCES public.materia(idmateria) ON DELETE CASCADE;


--
-- TOC entry 4625 (class 2606 OID 16789)
-- Name: mensualidad_estu fk_mensualidad_estu_mensualidad; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensualidad_estu
    ADD CONSTRAINT fk_mensualidad_estu_mensualidad FOREIGN KEY (idmensualidad) REFERENCES public.mensualidad(idmensualidad) ON DELETE CASCADE;


--
-- TOC entry 4627 (class 2606 OID 16941)
-- Name: nota fk_nota_evaluacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota
    ADD CONSTRAINT fk_nota_evaluacion FOREIGN KEY (idevaluacion) REFERENCES public.plan_evaluacion(idevaluacion) ON DELETE CASCADE;


--
-- TOC entry 4628 (class 2606 OID 16936)
-- Name: nota fk_nota_oferta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota
    ADD CONSTRAINT fk_nota_oferta FOREIGN KEY (oferta) REFERENCES public.oferta_seccion(idseccmo) ON DELETE CASCADE;


--
-- TOC entry 4630 (class 2606 OID 17825)
-- Name: oferta_seccion fk_oferta_carrera_modulo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oferta_seccion
    ADD CONSTRAINT fk_oferta_carrera_modulo FOREIGN KEY (idcarremo) REFERENCES public.carrera_modulo(idcarremo);


--
-- TOC entry 4635 (class 2606 OID 16799)
-- Name: plan_evaluacion fk_plan_materia; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plan_evaluacion
    ADD CONSTRAINT fk_plan_materia FOREIGN KEY (idmateria) REFERENCES public.materia(idmateria) ON DELETE CASCADE;


--
-- TOC entry 4636 (class 2606 OID 16804)
-- Name: plan_evaluacion fk_plan_seccion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plan_evaluacion
    ADD CONSTRAINT fk_plan_seccion FOREIGN KEY (idsecc) REFERENCES public.seccion(idsecc) ON DELETE CASCADE;


--
-- TOC entry 4619 (class 2606 OID 16809)
-- Name: horario horario_bloque_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horario
    ADD CONSTRAINT horario_bloque_fkey FOREIGN KEY (bloque) REFERENCES public.bloque(idbloque) ON DELETE SET NULL;


--
-- TOC entry 4644 (class 2606 OID 17640)
-- Name: inscripcion_periodo inscripcion_periodo_ciestu_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripcion_periodo
    ADD CONSTRAINT inscripcion_periodo_ciestu_fkey FOREIGN KEY (ciestu) REFERENCES public.estudiante(ciestu);


--
-- TOC entry 4645 (class 2606 OID 17645)
-- Name: inscripcion_periodo inscripcion_periodo_periodo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripcion_periodo
    ADD CONSTRAINT inscripcion_periodo_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.periodo_academico(id);


--
-- TOC entry 4620 (class 2606 OID 16814)
-- Name: materia materia_docente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materia
    ADD CONSTRAINT materia_docente_fkey FOREIGN KEY (docente) REFERENCES public.empleado(ciempleado) ON DELETE SET NULL;


--
-- TOC entry 4621 (class 2606 OID 16819)
-- Name: materias_modulo materias_modulo_idmateria_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materias_modulo
    ADD CONSTRAINT materias_modulo_idmateria_fkey FOREIGN KEY (idmateria) REFERENCES public.materia(idmateria);


--
-- TOC entry 4622 (class 2606 OID 16824)
-- Name: materias_modulo materias_modulo_idmodulo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materias_modulo
    ADD CONSTRAINT materias_modulo_idmodulo_fkey FOREIGN KEY (idmodulo) REFERENCES public.modulo(idmodulo);


--
-- TOC entry 4626 (class 2606 OID 16829)
-- Name: mensualidad_estu mensualidad_estu_estudiante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensualidad_estu
    ADD CONSTRAINT mensualidad_estu_estudiante_fkey FOREIGN KEY (estudiante) REFERENCES public.estudiante(ciestu);


--
-- TOC entry 4623 (class 2606 OID 16834)
-- Name: mensualidad mensualidad_metodopago_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensualidad
    ADD CONSTRAINT mensualidad_metodopago_fkey FOREIGN KEY (metodopago) REFERENCES public.metodopago(idmetodopago);


--
-- TOC entry 4624 (class 2606 OID 16839)
-- Name: mensualidad mensualidad_monedapago_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensualidad
    ADD CONSTRAINT mensualidad_monedapago_fkey FOREIGN KEY (monedapago) REFERENCES public.monedapago(idmoneda);


--
-- TOC entry 4629 (class 2606 OID 16844)
-- Name: nota nota_oferta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota
    ADD CONSTRAINT nota_oferta_fkey FOREIGN KEY (oferta) REFERENCES public.oferta_seccion(idseccmo);


--
-- TOC entry 4631 (class 2606 OID 16849)
-- Name: oferta_seccion oferta_seccion_estudiante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oferta_seccion
    ADD CONSTRAINT oferta_seccion_estudiante_fkey FOREIGN KEY (estudiante) REFERENCES public.estudiante(ciestu);


--
-- TOC entry 4632 (class 2606 OID 16854)
-- Name: oferta_seccion oferta_seccion_horario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oferta_seccion
    ADD CONSTRAINT oferta_seccion_horario_fkey FOREIGN KEY (horario) REFERENCES public.horario(idhorario);


--
-- TOC entry 4633 (class 2606 OID 16859)
-- Name: oferta_seccion oferta_seccion_idcarremo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oferta_seccion
    ADD CONSTRAINT oferta_seccion_idcarremo_fkey FOREIGN KEY (idcarrera) REFERENCES public.carrera(idcarrera);


--
-- TOC entry 4634 (class 2606 OID 16864)
-- Name: oferta_seccion oferta_seccion_idsecc_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oferta_seccion
    ADD CONSTRAINT oferta_seccion_idsecc_fkey FOREIGN KEY (idsecc) REFERENCES public.seccion(idsecc);


--
-- TOC entry 4637 (class 2606 OID 16869)
-- Name: preguntas_usuario preguntas_usuario_ciuser_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preguntas_usuario
    ADD CONSTRAINT preguntas_usuario_ciuser_fkey FOREIGN KEY (ciuser) REFERENCES public.usuario(ciuser);


--
-- TOC entry 4638 (class 2606 OID 16874)
-- Name: preguntas_usuario preguntas_usuario_idpregunta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preguntas_usuario
    ADD CONSTRAINT preguntas_usuario_idpregunta_fkey FOREIGN KEY (idpregunta) REFERENCES public.preguntas_seguridad(idpregunta);


--
-- TOC entry 4639 (class 2606 OID 17675)
-- Name: refresh_token refresh_token_usuario_log_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_token
    ADD CONSTRAINT refresh_token_usuario_log_fkey FOREIGN KEY (usuario_log) REFERENCES public.usuario_login(ciuser_log) ON DELETE CASCADE;


--
-- TOC entry 4640 (class 2606 OID 16884)
-- Name: usuario usuario_empleado_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_empleado_fkey FOREIGN KEY (empleado) REFERENCES public.empleado(ciempleado);


--
-- TOC entry 4641 (class 2606 OID 16889)
-- Name: usuario usuario_estudiante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_estudiante_fkey FOREIGN KEY (estudiante) REFERENCES public.estudiante(ciestu);


--
-- TOC entry 4642 (class 2606 OID 16894)
-- Name: usuario_login usuario_login_ciuser_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_login
    ADD CONSTRAINT usuario_login_ciuser_fkey FOREIGN KEY (ciuser) REFERENCES public.usuario(ciuser) ON DELETE SET NULL;


--
-- TOC entry 4643 (class 2606 OID 16899)
-- Name: usuario_login usuario_login_idrol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_login
    ADD CONSTRAINT usuario_login_idrol_fkey FOREIGN KEY (idrol) REFERENCES public.rol(idrol) ON DELETE SET NULL;


-- Completed on 2026-10-21 15:01:49 -04

--
-- PostgreSQL database dump complete
--


