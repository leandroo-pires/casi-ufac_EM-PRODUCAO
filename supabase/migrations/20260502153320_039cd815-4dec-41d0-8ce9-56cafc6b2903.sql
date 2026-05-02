
-- Drop the permissive public SELECT policy on ouvidorias
DROP POLICY IF EXISTS "Public resolved ouvidorias visible" ON public.ouvidorias;

-- Restrict direct table SELECT to admins only
CREATE POLICY "Admins can view all ouvidorias"
ON public.ouvidorias
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Public-safe view (no nome / matricula columns)
DROP VIEW IF EXISTS public.ouvidorias_public;
CREATE VIEW public.ouvidorias_public
WITH (security_invoker = true) AS
SELECT id, categoria, mensagem, status, resposta_publica, created_at
FROM public.ouvidorias
WHERE is_public = true;

GRANT SELECT ON public.ouvidorias_public TO anon, authenticated;
