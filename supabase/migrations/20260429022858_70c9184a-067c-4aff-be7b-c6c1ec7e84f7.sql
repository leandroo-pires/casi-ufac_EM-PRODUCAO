
-- Restringir SELECT na tabela profiles ao dono e admins
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;

CREATE POLICY "Profiles: dono ou admin podem ver"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- View pública sem campos sensíveis (sem data_nascimento, sem matricula)
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = true) AS
SELECT
  id,
  user_id,
  display_name,
  nickname,
  avatar_url,
  bio,
  curso,
  periodo,
  instagram,
  github,
  linkedin,
  twitter,
  created_at,
  updated_at
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO anon, authenticated;
