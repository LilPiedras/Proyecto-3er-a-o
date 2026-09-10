SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_spanish_ci';

CREATE DATABASE IF NOT EXISTS bd_usuarios
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_spanish_ci;

USE bd_usuarios;

CREATE TABLE IF NOT EXISTS usuarios (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombres        VARCHAR(100)       NOT NULL,
  apellidos      VARCHAR(100)       NOT NULL,
  telefono       VARCHAR(20),
  correo         VARCHAR(150)       NOT NULL UNIQUE,
  cedula         VARCHAR(25)        NOT NULL UNIQUE,
  direccion      VARCHAR(200),
  foto_usuario   VARCHAR(255),
  password_hash  VARCHAR(255)       NOT NULL,
  creado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_spanish_ci;

CREATE TABLE IF NOT EXISTS Asignatura (
  IdAsignatura VARCHAR(255) PRIMARY KEY,
  NomAsig      VARCHAR(20),
  Salon        VARCHAR(10),
  NomDocente   VARCHAR(20),
  ApeDocente   VARCHAR(20),
  CIDocen      INT
);

CREATE TABLE IF NOT EXISTS Notas (
  Nota1    INT,
  Nota2    INT,
  Nota3    INT,
  Nota4    INT,
  NotaDefi FLOAT
);

CREATE TABLE IF NOT EXISTS Asistencias (
  Asistencia     BOOL,
  PorcentajeAsis FLOAT
);

CREATE TABLE IF NOT EXISTS Horarios (
  NumHorario INT PRIMARY KEY,
  HoraIncio  VARCHAR(10),
  HoraFin    VARCHAR(10),
  Dias       VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS Director (
  CIDirecto   INT PRIMARY KEY,
  NomDirector VARCHAR(20),
  ApeDirector VARCHAR(10),
  Telefono    VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS Modulo (
  IdModulo      VARCHAR(255) PRIMARY KEY,
  NomModulo     VARCHAR(10),
  NumEstudiantes INT
);

CREATE TABLE IF NOT EXISTS docentes (
  ciDocente   VARCHAR(20) PRIMARY KEY,
  PriNombre   VARCHAR(20),
  SegNombre   VARCHAR(20),
  PriApellido VARCHAR(20),
  SegApellido VARCHAR(20),
  Asignatura  VARCHAR(20),
  Telefono    INT
);

