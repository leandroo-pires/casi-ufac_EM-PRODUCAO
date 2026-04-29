
-- 1) Proteger PII em profiles: somente autenticados podem ler
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- 2) Storage: impedir listagem de buckets públicos (acesso direto por path continua funcionando)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Fotos da diretoria são públicas" ON storage.objects;

CREATE POLICY "Avatars: leitura por path"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'avatars' AND (storage.filename(name) IS NOT NULL));

CREATE POLICY "Diretoria: leitura por path"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'diretoria' AND (storage.filename(name) IS NOT NULL));

-- 3) Revogar EXECUTE das funções internas SECURITY DEFINER
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
