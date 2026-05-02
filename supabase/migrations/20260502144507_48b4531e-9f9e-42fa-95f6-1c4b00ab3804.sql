-- Tabela para slides da Vitrine de Mídia (gerenciável pelo admin)
CREATE TABLE public.midia_showcase (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  imagem_url TEXT NOT NULL,
  link_url TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.midia_showcase ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Slides ativos visíveis para todos"
  ON public.midia_showcase FOR SELECT
  USING ((ativo = true) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins inserem midia"
  ON public.midia_showcase FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins atualizam midia"
  ON public.midia_showcase FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins deletam midia"
  ON public.midia_showcase FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_midia_showcase_updated_at
  BEFORE UPDATE ON public.midia_showcase
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bucket para imagens da vitrine
INSERT INTO storage.buckets (id, name, public)
  VALUES ('midia', 'midia', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Midia publicamente acessível"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'midia');

CREATE POLICY "Admins fazem upload em midia"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'midia' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins atualizam midia bucket"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'midia' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins deletam midia bucket"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'midia' AND has_role(auth.uid(), 'admin'::app_role));

-- Seed estatuto no site_content (linha vazia editável pelo admin)
INSERT INTO public.site_content (chave, titulo, conteudo)
  VALUES ('estatuto', 'Estatuto Oficial do CASI', '')
  ON CONFLICT DO NOTHING;