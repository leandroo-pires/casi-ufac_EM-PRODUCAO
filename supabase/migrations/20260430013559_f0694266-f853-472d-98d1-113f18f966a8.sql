-- Tabela: documentos_academicos
CREATE TABLE public.documentos_academicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL DEFAULT 'requerimentos',
  pdf_url TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.documentos_academicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Documentos visíveis para todos"
  ON public.documentos_academicos FOR SELECT
  USING (ativo = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins inserem documentos"
  ON public.documentos_academicos FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins atualizam documentos"
  ON public.documentos_academicos FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins deletam documentos"
  ON public.documentos_academicos FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_documentos_updated_at
  BEFORE UPDATE ON public.documentos_academicos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela: calendario_academico
CREATE TABLE public.calendario_academico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ano INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.calendario_academico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Calendarios visíveis para todos"
  ON public.calendario_academico FOR SELECT
  USING (true);

CREATE POLICY "Admins inserem calendario"
  ON public.calendario_academico FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins atualizam calendario"
  ON public.calendario_academico FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins deletam calendario"
  ON public.calendario_academico FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_calendario_updated_at
  BEFORE UPDATE ON public.calendario_academico
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Garante apenas 1 calendário ativo por vez
CREATE OR REPLACE FUNCTION public.ensure_single_active_calendar()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.ativo = true THEN
    UPDATE public.calendario_academico
       SET ativo = false
     WHERE id <> NEW.id AND ativo = true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_calendario_single_active
  AFTER INSERT OR UPDATE OF ativo ON public.calendario_academico
  FOR EACH ROW WHEN (NEW.ativo = true)
  EXECUTE FUNCTION public.ensure_single_active_calendar();

-- Bucket público "documentos"
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Documentos públicos para leitura"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documentos');

CREATE POLICY "Admins fazem upload em documentos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documentos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins atualizam documentos no bucket"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'documentos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins deletam documentos no bucket"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documentos' AND has_role(auth.uid(), 'admin'::app_role));