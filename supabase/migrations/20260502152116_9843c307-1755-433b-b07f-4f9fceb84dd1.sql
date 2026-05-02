-- Tabela de mensagens da comunidade
CREATE TABLE public.community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 2000),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_messages_created_at ON public.community_messages (created_at DESC);
CREATE INDEX idx_community_messages_user_id ON public.community_messages (user_id);

ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- SELECT: somente autenticados
CREATE POLICY "Autenticados podem ver mensagens"
ON public.community_messages
FOR SELECT
TO authenticated
USING (true);

-- INSERT: autenticados, apenas como eles mesmos
CREATE POLICY "Autenticados podem enviar mensagens"
ON public.community_messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- DELETE: autor ou admin
CREATE POLICY "Autor ou admin podem deletar"
ON public.community_messages
FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Realtime
ALTER TABLE public.community_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;