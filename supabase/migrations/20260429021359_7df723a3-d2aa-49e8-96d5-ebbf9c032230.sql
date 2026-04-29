
-- Tabela: diretoria
CREATE TABLE public.diretoria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cargo TEXT NOT NULL,
  bio TEXT,
  foto_url TEXT,
  email TEXT,
  instagram TEXT,
  github TEXT,
  linkedin TEXT,
  whatsapp TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.diretoria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Diretoria ativa visível para todos"
ON public.diretoria FOR SELECT
USING (ativo = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem inserir diretoria"
ON public.diretoria FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar diretoria"
ON public.diretoria FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar diretoria"
ON public.diretoria FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_diretoria_updated_at
BEFORE UPDATE ON public.diretoria
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela: site_content (conteúdo editável do site)
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT NOT NULL UNIQUE,
  titulo TEXT,
  conteudo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conteúdo do site visível para todos"
ON public.site_content FOR SELECT USING (true);

CREATE POLICY "Admins podem inserir conteúdo"
ON public.site_content FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar conteúdo"
ON public.site_content FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar conteúdo"
ON public.site_content FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seeds iniciais
INSERT INTO public.site_content (chave, titulo, conteudo) VALUES
  ('sobre_casi', 'Sobre o CASI', 'O Centro Acadêmico de Sistemas de Informação (CASI) representa os estudantes do curso de Sistemas de Informação da UFAC, atuando na defesa dos direitos acadêmicos, organização de eventos e fortalecimento da comunidade discente.'),
  ('hero_titulo', 'CASI UFAC', 'Centro Acadêmico de Sistemas de Informação'),
  ('hero_subtitulo', NULL, 'Representando os estudantes de SI da Universidade Federal do Acre.');

-- Storage bucket para fotos da diretoria
INSERT INTO storage.buckets (id, name, public)
VALUES ('diretoria', 'diretoria', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Fotos da diretoria são públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'diretoria');

CREATE POLICY "Admins podem enviar fotos da diretoria"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'diretoria' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar fotos da diretoria"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'diretoria' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem remover fotos da diretoria"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'diretoria' AND public.has_role(auth.uid(), 'admin'));
