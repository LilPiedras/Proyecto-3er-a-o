
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_spanish_ci';

-- 
CREATE DATABASE IF NOT EXISTS bd_usuarios
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_spanish_ci;

USE bd_usuarios;

-- Crear tabla usuarios
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
    id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombres         VARCHAR(100)       NOT NULL,
    apellidos       VARCHAR(100)       NOT NULL,
    telefono        VARCHAR(20),
    correo          VARCHAR(150)       NOT NULL UNIQUE,
    cedula          VARCHAR(25)        NOT NULL UNIQUE,
    direccion       VARCHAR(200),
    foto_usuario    VARCHAR(255),              --

    creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_spanish_ci;

-- INSERT (CREATE)
INSERT INTO usuarios (
    nombres,
    apellidos,
    telefono,
    correo,
    cedula,
    direccion,
    foto_usuario
) VALUES (
    'Juan',
    'Pérez',
    '555-123456',
    'juan.perez@example.com',
    '1234567890',
    'Calle Falsa 123',
    NULL
);

-- SELECT (READ)
-- Todos los usuarios
SELECT * FROM usuarios;

-- Un usuario por id
SELECT * FROM usuarios WHERE id = 1;

-- UPDATE (UPDATE)
UPDATE usuarios
SET
    nombres  = 'Juan Carlos',
    telefono = '555-987654',
    direccion = 'Av. Siempre Viva 742'
WHERE id = 1;

-- DELETE (DELETE)
DELETE FROM usuarios
WHERE id = 1;