DROP VIEW IF EXISTS public.profiles_public;

CREATE TABLE public.acervo_tccs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  autor TEXT NOT NULL,
  ano INTEGER NOT NULL,
  descricao TEXT,
  pdf_url TEXT NOT NULL,
  capa_url TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.acervo_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  imagem_url TEXT NOT NULL,
  evento TEXT,
  ano INTEGER,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.literaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  autores TEXT NOT NULL,
  area TEXT,
  disciplina TEXT,
  descricao TEXT,
  capa_url TEXT,
  link_url TEXT,
  professor TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.acervo_tccs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acervo_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.literaturas  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acervo TCC visivel" ON public.acervo_tccs FOR SELECT USING (ativo = true OR has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins inserem TCC" ON public.acervo_tccs FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins atualizam TCC" ON public.acervo_tccs FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins deletam TCC" ON public.acervo_tccs FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "Fotos visiveis" ON public.acervo_fotos FOR SELECT USING (ativo = true OR has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins inserem fotos" ON public.acervo_fotos FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins atualizam fotos" ON public.acervo_fotos FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins deletam fotos" ON public.acervo_fotos FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "Literaturas visiveis" ON public.literaturas FOR SELECT USING (ativo = true OR has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins inserem literatura" ON public.literaturas FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins atualizam literatura" ON public.literaturas FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins deletam literatura" ON public.literaturas FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_acervo_tccs_updated  BEFORE UPDATE ON public.acervo_tccs  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_acervo_fotos_updated BEFORE UPDATE ON public.acervo_fotos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_literaturas_updated  BEFORE UPDATE ON public.literaturas  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public) VALUES ('acervo','acervo',true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Acervo bucket leitura publica"
ON storage.objects FOR SELECT USING (bucket_id = 'acervo');
CREATE POLICY "Admins enviam acervo"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'acervo' AND has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins atualizam acervo storage"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'acervo' AND has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins deletam acervo storage"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'acervo' AND has_role(auth.uid(),'admin'::app_role));

-- Funções públicas para leitura de perfis (sem expor PII)
CREATE OR REPLACE FUNCTION public.get_public_profile(_user_id uuid)
RETURNS TABLE (
  user_id uuid, display_name text, nickname text, avatar_url text, bio text,
  curso text, periodo text, instagram text, github text, linkedin text, twitter text
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT user_id, display_name, nickname, avatar_url, bio, curso, periodo,
         instagram, github, linkedin, twitter
  FROM public.profiles WHERE user_id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.get_public_profiles(_user_ids uuid[])
RETURNS TABLE (
  user_id uuid, display_name text, nickname text, avatar_url text, bio text,
  curso text, periodo text, instagram text, github text, linkedin text, twitter text
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT user_id, display_name, nickname, avatar_url, bio, curso, periodo,
         instagram, github, linkedin, twitter
  FROM public.profiles WHERE user_id = ANY(_user_ids);
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_public_profiles(uuid[]) TO authenticated, anon;