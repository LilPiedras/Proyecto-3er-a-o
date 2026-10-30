--
-- PostgreSQL database dump
--

\restrict 4XCZJfZQhdEzybdPvKQ8EP7ryBaO27XF7tQnWeECzpl0HTdR6vtxHHIjI1ZfluI

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: aisgnacion_docente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aisgnacion_docente (
    id_asignacion_docente integer NOT NULL,
    empleado_id integer NOT NULL,
    materia_id integer NOT NULL,
    seccion_id integer NOT NULL,
    fecha_asignacion character varying(30) NOT NULL
);


ALTER TABLE public.aisgnacion_docente OWNER TO postgres;

--
-- Name: aisgnacion_docente_id_asignacion_docente_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.aisgnacion_docente_id_asignacion_docente_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aisgnacion_docente_id_asignacion_docente_seq OWNER TO postgres;

--
-- Name: aisgnacion_docente_id_asignacion_docente_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.aisgnacion_docente_id_asignacion_docente_seq OWNED BY public.aisgnacion_docente.id_asignacion_docente;


--
-- Name: asignacion_docente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asignacion_docente (
    id_asignacion_docente bigint NOT NULL,
    empleado_id integer,
    materia_id integer,
    seccion_id integer,
    fecha_asignacion date
);


ALTER TABLE public.asignacion_docente OWNER TO postgres;

--
-- Name: asignacion_docente_id_asignacion_docente_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.asignacion_docente ALTER COLUMN id_asignacion_docente ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.asignacion_docente_id_asignacion_docente_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: asistencias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asistencias (
    idasis integer NOT NULL,
    asisestu character varying(50),
    verificar boolean
);


ALTER TABLE public.asistencias OWNER TO postgres;

--
-- Name: bloque; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bloque (
    idbloque bigint NOT NULL,
    dia character varying(20),
    horainicio character varying(20),
    horafin character varying(20)
);


ALTER TABLE public.bloque OWNER TO postgres;

--
-- Name: bloque_idbloque_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.bloque ALTER COLUMN idbloque ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.bloque_idbloque_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: curso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.curso (
    idcurso integer NOT NULL,
    nomcurso character varying(20),
    preciocurso double precision,
    nivelcur character varying(20),
    docenasig integer
);


ALTER TABLE public.curso OWNER TO postgres;

--
-- Name: curso_modulo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.curso_modulo (
    idcurso_modulo integer NOT NULL,
    curso integer NOT NULL,
    modulo integer NOT NULL,
    horario integer NOT NULL,
    notas integer NOT NULL
);


ALTER TABLE public.curso_modulo OWNER TO postgres;

--
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
-- Name: curso_modulo_idcurso_modulo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.curso_modulo_idcurso_modulo_seq OWNED BY public.curso_modulo.idcurso_modulo;


--
-- Name: cursomodulo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cursomodulo (
    idcurso_modulo integer NOT NULL,
    curso integer,
    modulo integer,
    horario integer,
    notas integer
);


ALTER TABLE public.cursomodulo OWNER TO postgres;

--
-- Name: empleado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empleado (
    ciempleado character varying NOT NULL,
    nombreempleado character varying(100) NOT NULL,
    apellidoempleado character varying(20) NOT NULL,
    fechacontra date NOT NULL,
    telefempleado character varying(200),
    correoempleado character varying(200),
    activo boolean NOT NULL
);


ALTER TABLE public.empleado OWNER TO postgres;

--
-- Name: estudiante; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estudiante (
    ciestu character varying(30) NOT NULL,
    idusuario character varying NOT NULL,
    nombreestu character varying(100) NOT NULL,
    apelliestu character varying(20) NOT NULL,
    modulo integer NOT NULL,
    teleestu character varying(200),
    correoestu character varying(200),
    activo boolean NOT NULL
);


ALTER TABLE public.estudiante OWNER TO postgres;

--
-- Name: horario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.horario (
    idhorario integer NOT NULL,
    dias character varying(20),
    materia integer,
    bloque character varying(40)
);


ALTER TABLE public.horario OWNER TO postgres;

--
-- Name: materia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materia (
    idmateria integer NOT NULL,
    nombremateria character varying(20) NOT NULL,
    modulo integer NOT NULL,
    salon character varying(100) NOT NULL,
    docente integer NOT NULL,
    horario integer NOT NULL
);


ALTER TABLE public.materia OWNER TO postgres;

--
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
-- Name: materia_idmateria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.materia_idmateria_seq OWNED BY public.materia.idmateria;


--
-- Name: materias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materias (
    idmateria integer NOT NULL,
    nombremateria character varying(20),
    modulo integer,
    salon character varying,
    horario integer,
    docente integer
);


ALTER TABLE public.materias OWNER TO postgres;

--
-- Name: mensualidad; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mensualidad (
    idmensualidad bigint NOT NULL,
    metodopago character varying(10),
    monedapago character varying(20),
    monto double precision,
    verificacion boolean,
    encargado bigint
);


ALTER TABLE public.mensualidad OWNER TO postgres;

--
-- Name: mensualidad_estu; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mensualidad_estu (
    idmensualidadestu bigint NOT NULL,
    mensualidad bigint,
    estudiante character varying(20),
    registropago character varying(40),
    fechapago date,
    factura character varying(40)
);


ALTER TABLE public.mensualidad_estu OWNER TO postgres;

--
-- Name: mensualidad_estu_idmensualidadestu_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.mensualidad_estu ALTER COLUMN idmensualidadestu ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.mensualidad_estu_idmensualidadestu_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mensualidad_idmensualidad_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.mensualidad ALTER COLUMN idmensualidad ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.mensualidad_idmensualidad_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: metodopago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.metodopago (
    idmetodopago bigint NOT NULL,
    metodousado character varying(40),
    registro character varying
);


ALTER TABLE public.metodopago OWNER TO postgres;

--
-- Name: metodopago_idmetodopago_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.metodopago ALTER COLUMN idmetodopago ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.metodopago_idmetodopago_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: modulo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modulo (
    idmodulo integer NOT NULL,
    nombremodulo character varying(10) NOT NULL,
    materias character varying(20) NOT NULL,
    seccion character varying(20) NOT NULL
);


ALTER TABLE public.modulo OWNER TO postgres;

--
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
-- Name: modulo_idmodulo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.modulo_idmodulo_seq OWNED BY public.modulo.idmodulo;


--
-- Name: modulos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modulos (
    idmodulo integer NOT NULL,
    nommodulo character varying(10),
    materias character varying(20),
    seccion character varying(20)
);


ALTER TABLE public.modulos OWNER TO postgres;

--
-- Name: monedapago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.monedapago (
    idmoneda bigint NOT NULL,
    tipomoneda character varying(40),
    montototal double precision,
    registro character varying
);


ALTER TABLE public.monedapago OWNER TO postgres;

--
-- Name: monedapago_idmoneda_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.monedapago ALTER COLUMN idmoneda ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.monedapago_idmoneda_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: nota; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nota (
    idnota integer NOT NULL,
    materia integer NOT NULL,
    notas integer NOT NULL,
    fechanota date NOT NULL,
    activo boolean NOT NULL
);


ALTER TABLE public.nota OWNER TO postgres;

--
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
-- Name: nota_idnota_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nota_idnota_seq OWNED BY public.nota.idnota;


--
-- Name: notas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notas (
    idnota integer NOT NULL,
    materia integer,
    notas double precision,
    fechanota date,
    activo boolean
);


ALTER TABLE public.notas OWNER TO postgres;

--
-- Name: preguntas_seguridad; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.preguntas_seguridad (
    idpregunta integer NOT NULL,
    preguntas character varying(20),
    respuesta character varying(20),
    iduser character varying
);


ALTER TABLE public.preguntas_seguridad OWNER TO postgres;

--
-- Name: rol; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rol (
    idrol bigint NOT NULL,
    nombrerol character varying(40),
    idempleado integer,
    descripcion text,
    activo boolean
);


ALTER TABLE public.rol OWNER TO postgres;

--
-- Name: rol_idrol_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.rol ALTER COLUMN idrol ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.rol_idrol_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: salon; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salon (
    idsecc integer NOT NULL,
    nomsecc character varying(10) NOT NULL,
    horarios integer NOT NULL,
    modulo integer NOT NULL
);


ALTER TABLE public.salon OWNER TO postgres;

--
-- Name: salon_idsecc_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.salon_idsecc_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.salon_idsecc_seq OWNER TO postgres;

--
-- Name: salon_idsecc_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.salon_idsecc_seq OWNED BY public.salon.idsecc;


--
-- Name: seccion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seccion (
    idsecc integer NOT NULL,
    nomsecc character varying(10),
    horarios integer,
    modulo integer
);


ALTER TABLE public.seccion OWNER TO postgres;

--
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    iduser character varying NOT NULL,
    nombreusuario character varying(30),
    apellusuario character varying(30),
    teleestu character varying(12),
    correoestu character varying(40),
    contrase character varying(20),
    rol character varying(40),
    preguntas integer,
    activo boolean
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- Name: aisgnacion_docente id_asignacion_docente; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aisgnacion_docente ALTER COLUMN id_asignacion_docente SET DEFAULT nextval('public.aisgnacion_docente_id_asignacion_docente_seq'::regclass);


--
-- Name: curso_modulo idcurso_modulo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curso_modulo ALTER COLUMN idcurso_modulo SET DEFAULT nextval('public.curso_modulo_idcurso_modulo_seq'::regclass);


--
-- Name: materia idmateria; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materia ALTER COLUMN idmateria SET DEFAULT nextval('public.materia_idmateria_seq'::regclass);


--
-- Name: modulo idmodulo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modulo ALTER COLUMN idmodulo SET DEFAULT nextval('public.modulo_idmodulo_seq'::regclass);


--
-- Name: nota idnota; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota ALTER COLUMN idnota SET DEFAULT nextval('public.nota_idnota_seq'::regclass);


--
-- Name: salon idsecc; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salon ALTER COLUMN idsecc SET DEFAULT nextval('public.salon_idsecc_seq'::regclass);


--
-- Data for Name: aisgnacion_docente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aisgnacion_docente (id_asignacion_docente, empleado_id, materia_id, seccion_id, fecha_asignacion) FROM stdin;
\.


--
-- Data for Name: asignacion_docente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asignacion_docente (id_asignacion_docente, empleado_id, materia_id, seccion_id, fecha_asignacion) FROM stdin;
\.


--
-- Data for Name: asistencias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asistencias (idasis, asisestu, verificar) FROM stdin;
\.


--
-- Data for Name: bloque; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bloque (idbloque, dia, horainicio, horafin) FROM stdin;
\.


--
-- Data for Name: curso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.curso (idcurso, nomcurso, preciocurso, nivelcur, docenasig) FROM stdin;
\.


--
-- Data for Name: curso_modulo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.curso_modulo (idcurso_modulo, curso, modulo, horario, notas) FROM stdin;
\.


--
-- Data for Name: cursomodulo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cursomodulo (idcurso_modulo, curso, modulo, horario, notas) FROM stdin;
\.


--
-- Data for Name: empleado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empleado (ciempleado, nombreempleado, apellidoempleado, fechacontra, telefempleado, correoempleado, activo) FROM stdin;
V-12.324.122	Juan	Roa	2023-05-12	0412-54343324	JuanRoar@hotmail.com	t
\.


--
-- Data for Name: estudiante; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estudiante (ciestu, idusuario, nombreestu, apelliestu, modulo, teleestu, correoestu, activo) FROM stdin;
V-31122642	1	David	Moncada	1	0412-4107215	lordriczer1105@gmail.com	t
V-31800328	1	Juan Smick	Herrera Morales	2	0424-7183997	smickminecraft@gmail.com	f
\.


--
-- Data for Name: horario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.horario (idhorario, dias, materia, bloque) FROM stdin;
\.


--
-- Data for Name: materia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materia (idmateria, nombremateria, modulo, salon, docente, horario) FROM stdin;
\.


--
-- Data for Name: materias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materias (idmateria, nombremateria, modulo, salon, horario, docente) FROM stdin;
\.


--
-- Data for Name: mensualidad; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mensualidad (idmensualidad, metodopago, monedapago, monto, verificacion, encargado) FROM stdin;
\.


--
-- Data for Name: mensualidad_estu; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mensualidad_estu (idmensualidadestu, mensualidad, estudiante, registropago, fechapago, factura) FROM stdin;
\.


--
-- Data for Name: metodopago; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.metodopago (idmetodopago, metodousado, registro) FROM stdin;
\.


--
-- Data for Name: modulo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modulo (idmodulo, nombremodulo, materias, seccion) FROM stdin;
\.


--
-- Data for Name: modulos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modulos (idmodulo, nommodulo, materias, seccion) FROM stdin;
1	moduloN1	Diseño	AA001
2	moduloN2	Patronaje	AA001
3	moduloN3	Patronaje2	AA002
\.


--
-- Data for Name: monedapago; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.monedapago (idmoneda, tipomoneda, montototal, registro) FROM stdin;
\.


--
-- Data for Name: nota; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nota (idnota, materia, notas, fechanota, activo) FROM stdin;
\.


--
-- Data for Name: notas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notas (idnota, materia, notas, fechanota, activo) FROM stdin;
\.


--
-- Data for Name: preguntas_seguridad; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.preguntas_seguridad (idpregunta, preguntas, respuesta, iduser) FROM stdin;
1	Color Favorito	Rojo	1
\.


--
-- Data for Name: rol; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rol (idrol, nombrerol, idempleado, descripcion, activo) FROM stdin;
\.


--
-- Data for Name: salon; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salon (idsecc, nomsecc, horarios, modulo) FROM stdin;
\.


--
-- Data for Name: seccion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seccion (idsecc, nomsecc, horarios, modulo) FROM stdin;
\.


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario (iduser, nombreusuario, apellusuario, teleestu, correoestu, contrase, rol, preguntas, activo) FROM stdin;
1	Erick	Moncada	0412-4107215	\N	CPAndres01	1	1	\N
\.


--
-- Name: aisgnacion_docente_id_asignacion_docente_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aisgnacion_docente_id_asignacion_docente_seq', 1, false);


--
-- Name: asignacion_docente_id_asignacion_docente_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asignacion_docente_id_asignacion_docente_seq', 1, false);


--
-- Name: bloque_idbloque_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bloque_idbloque_seq', 1, false);


--
-- Name: curso_modulo_idcurso_modulo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.curso_modulo_idcurso_modulo_seq', 1, false);


--
-- Name: materia_idmateria_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materia_idmateria_seq', 1, false);


--
-- Name: mensualidad_estu_idmensualidadestu_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mensualidad_estu_idmensualidadestu_seq', 1, false);


--
-- Name: mensualidad_idmensualidad_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mensualidad_idmensualidad_seq', 1, false);


--
-- Name: metodopago_idmetodopago_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.metodopago_idmetodopago_seq', 1, false);


--
-- Name: modulo_idmodulo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.modulo_idmodulo_seq', 1, false);


--
-- Name: monedapago_idmoneda_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.monedapago_idmoneda_seq', 1, false);


--
-- Name: nota_idnota_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nota_idnota_seq', 1, false);


--
-- Name: rol_idrol_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rol_idrol_seq', 1, false);


--
-- Name: salon_idsecc_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.salon_idsecc_seq', 1, false);


--
-- Name: aisgnacion_docente aisgnacion_docente_empleado_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aisgnacion_docente
    ADD CONSTRAINT aisgnacion_docente_empleado_id_key UNIQUE (empleado_id);


--
-- Name: aisgnacion_docente aisgnacion_docente_materia_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aisgnacion_docente
    ADD CONSTRAINT aisgnacion_docente_materia_id_key UNIQUE (materia_id);


--
-- Name: aisgnacion_docente aisgnacion_docente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aisgnacion_docente
    ADD CONSTRAINT aisgnacion_docente_pkey PRIMARY KEY (id_asignacion_docente);


--
-- Name: aisgnacion_docente aisgnacion_docente_seccion_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aisgnacion_docente
    ADD CONSTRAINT aisgnacion_docente_seccion_id_key UNIQUE (seccion_id);


--
-- Name: asignacion_docente asignacion_docente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_docente
    ADD CONSTRAINT asignacion_docente_pkey PRIMARY KEY (id_asignacion_docente);


--
-- Name: asistencias asistencias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias
    ADD CONSTRAINT asistencias_pkey PRIMARY KEY (idasis);


--
-- Name: bloque bloque_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bloque
    ADD CONSTRAINT bloque_pkey PRIMARY KEY (idbloque);


--
-- Name: curso_modulo curso_modulo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curso_modulo
    ADD CONSTRAINT curso_modulo_pkey PRIMARY KEY (idcurso_modulo);


--
-- Name: curso curso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curso
    ADD CONSTRAINT curso_pkey PRIMARY KEY (idcurso);


--
-- Name: cursomodulo cursomodulo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cursomodulo
    ADD CONSTRAINT cursomodulo_pkey PRIMARY KEY (idcurso_modulo);


--
-- Name: empleado empleado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleado
    ADD CONSTRAINT empleado_pkey PRIMARY KEY (ciempleado);


--
-- Name: estudiante estudiante_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiante
    ADD CONSTRAINT estudiante_pkey PRIMARY KEY (ciestu);


--
-- Name: horario horario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horario
    ADD CONSTRAINT horario_pkey PRIMARY KEY (idhorario);


--
-- Name: materia materia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materia
    ADD CONSTRAINT materia_pkey PRIMARY KEY (idmateria);


--
-- Name: materias materias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materias
    ADD CONSTRAINT materias_pkey PRIMARY KEY (idmateria);


--
-- Name: mensualidad_estu mensualidad_estu_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensualidad_estu
    ADD CONSTRAINT mensualidad_estu_pkey PRIMARY KEY (idmensualidadestu);


--
-- Name: mensualidad mensualidad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensualidad
    ADD CONSTRAINT mensualidad_pkey PRIMARY KEY (idmensualidad);


--
-- Name: metodopago metodopago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metodopago
    ADD CONSTRAINT metodopago_pkey PRIMARY KEY (idmetodopago);


--
-- Name: modulo modulo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modulo
    ADD CONSTRAINT modulo_pkey PRIMARY KEY (idmodulo);


--
-- Name: modulos modulos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modulos
    ADD CONSTRAINT modulos_pkey PRIMARY KEY (idmodulo);


--
-- Name: monedapago monedapago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monedapago
    ADD CONSTRAINT monedapago_pkey PRIMARY KEY (idmoneda);


--
-- Name: nota nota_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota
    ADD CONSTRAINT nota_pkey PRIMARY KEY (idnota);


--
-- Name: notas notas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas
    ADD CONSTRAINT notas_pkey PRIMARY KEY (idnota);


--
-- Name: preguntas_seguridad preguntas_seguridad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preguntas_seguridad
    ADD CONSTRAINT preguntas_seguridad_pkey PRIMARY KEY (idpregunta);


--
-- Name: rol rol_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol
    ADD CONSTRAINT rol_pkey PRIMARY KEY (idrol);


--
-- Name: salon salon_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salon
    ADD CONSTRAINT salon_pkey PRIMARY KEY (idsecc);


--
-- Name: seccion seccion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seccion
    ADD CONSTRAINT seccion_pkey PRIMARY KEY (idsecc);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (iduser);


--
-- Name: estudiante estudiante_idusuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiante
    ADD CONSTRAINT estudiante_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES public.usuario(iduser) ON DELETE SET NULL;


--
-- Name: cursomodulo fk_curso_cursomodulo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cursomodulo
    ADD CONSTRAINT fk_curso_cursomodulo FOREIGN KEY (curso) REFERENCES public.curso(idcurso);


--
-- Name: cursomodulo fk_cursomodulo_curso; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cursomodulo
    ADD CONSTRAINT fk_cursomodulo_curso FOREIGN KEY (curso) REFERENCES public.curso(idcurso);


--
-- Name: cursomodulo fk_cursomodulo_modulo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cursomodulo
    ADD CONSTRAINT fk_cursomodulo_modulo FOREIGN KEY (modulo) REFERENCES public.modulos(idmodulo);


--
-- Name: cursomodulo fk_cursomodulo_nota; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cursomodulo
    ADD CONSTRAINT fk_cursomodulo_nota FOREIGN KEY (notas) REFERENCES public.notas(idnota);


--
-- Name: mensualidad_estu fk_mensualidad_mensualidad_estu; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensualidad_estu
    ADD CONSTRAINT fk_mensualidad_mensualidad_estu FOREIGN KEY (mensualidad) REFERENCES public.mensualidad(idmensualidad);


--
-- Name: mensualidad fk_mensualidad_rol; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensualidad
    ADD CONSTRAINT fk_mensualidad_rol FOREIGN KEY (encargado) REFERENCES public.rol(idrol);


--
-- Name: notas fk_notas_materia; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas
    ADD CONSTRAINT fk_notas_materia FOREIGN KEY (materia) REFERENCES public.materias(idmateria);


--
-- Name: preguntas_seguridad fk_preguntas_empleado; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preguntas_seguridad
    ADD CONSTRAINT fk_preguntas_empleado FOREIGN KEY (iduser) REFERENCES public.usuario(iduser);


--
-- Name: seccion fk_seccion_horario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seccion
    ADD CONSTRAINT fk_seccion_horario FOREIGN KEY (horarios) REFERENCES public.horario(idhorario);


--
-- Name: seccion fk_seccion_modulo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seccion
    ADD CONSTRAINT fk_seccion_modulo FOREIGN KEY (modulo) REFERENCES public.modulos(idmodulo);


--
-- Name: usuario fk_usuarios_preguntas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT fk_usuarios_preguntas FOREIGN KEY (preguntas) REFERENCES public.preguntas_seguridad(idpregunta);


--
-- PostgreSQL database dump complete
--

\unrestrict 4XCZJfZQhdEzybdPvKQ8EP7ryBaO27XF7tQnWeECzpl0HTdR6vtxHHIjI1ZfluI

