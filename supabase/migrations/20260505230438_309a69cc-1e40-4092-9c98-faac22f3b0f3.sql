CREATE TABLE public.home_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  imagem_url TEXT NOT NULL,
  link_url TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.home_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Home cards visiveis"
ON public.home_cards FOR SELECT TO public
USING (ativo = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins inserem home cards"
ON public.home_cards FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins atualizam home cards"
ON public.home_cards FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins deletam home cards"
ON public.home_cards FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_home_cards_updated_at
BEFORE UPDATE ON public.home_cards
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bucket para imagens dos quadros (reutiliza padrão público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('home-cards', 'home-cards', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Home cards imagens publicas"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'home-cards');

CREATE POLICY "Admins fazem upload home cards"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'home-cards' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins atualizam imagens home cards"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'home-cards' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins deletam imagens home cards"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'home-cards' AND has_role(auth.uid(), 'admin'::app_role));