-- Ejecutar una vez en la base de datos configurada por el backend.
ALTER TABLE carrera
    ADD COLUMN IF NOT EXISTS precio_usd NUMERIC(12, 2) NOT NULL DEFAULT 0;

ALTER TABLE mensualidad
    ADD COLUMN IF NOT EXISTS monto_carreras_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS monto_extra NUMERIC(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tasa_conversion NUMERIC(12, 6) NOT NULL DEFAULT 1;
