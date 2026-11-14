ALTER TABLE public.auditoria
    ADD COLUMN IF NOT EXISTS hora TIME WITHOUT TIME ZONE;

ALTER TABLE public.auditoria
    ALTER COLUMN hora SET DEFAULT LOCALTIME;

COMMENT ON COLUMN public.auditoria.hora IS
    'Hora local del registro; NULL indica que no se conservaba la hora al migrar.';
