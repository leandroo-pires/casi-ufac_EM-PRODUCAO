DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'diretoria', 'aluno');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  matricula TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'aluno');
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.ouvidorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT,
  matricula TEXT,
  categoria TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  resposta_publica TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ouvidorias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit ouvidoria" ON public.ouvidorias;
CREATE POLICY "Anyone can submit ouvidoria" ON public.ouvidorias FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public resolved ouvidorias visible" ON public.ouvidorias;
CREATE POLICY "Public resolved ouvidorias visible" ON public.ouvidorias FOR SELECT
  USING (is_public = true OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins update ouvidorias" ON public.ouvidorias;
CREATE POLICY "Admins update ouvidorias" ON public.ouvidorias FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins delete ouvidorias" ON public.ouvidorias;
CREATE POLICY "Admins delete ouvidorias" ON public.ouvidorias FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_ouvidorias_updated_at ON public.ouvidorias;
CREATE TRIGGER update_ouvidorias_updated_at BEFORE UPDATE ON public.ouvidorias
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_evento TIMESTAMPTZ NOT NULL,
  local TEXT,
  imagem_url TEXT,
  inscricao_url TEXT,
  resumo_url TEXT,
  is_novo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Eventos visible to all" ON public.eventos;
CREATE POLICY "Eventos visible to all" ON public.eventos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage eventos" ON public.eventos;
CREATE POLICY "Admins manage eventos" ON public.eventos FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_eventos_updated_at ON public.eventos;
CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON public.eventos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.editais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_publicacao DATE NOT NULL DEFAULT CURRENT_DATE,
  pdf_url TEXT NOT NULL,
  categoria TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.editais ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Editais visible to all" ON public.editais;
CREATE POLICY "Editais visible to all" ON public.editais FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage editais" ON public.editais;
CREATE POLICY "Admins manage editais" ON public.editais FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_editais_updated_at ON public.editais;
CREATE TRIGGER update_editais_updated_at BEFORE UPDATE ON public.editais
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();