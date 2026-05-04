import { useEffect, useMemo, useRef, useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Send, Trash2, Shield, LogIn, Users, Crown } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Msg {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface ProfileLite {
  user_id: string;
  nickname: string | null;
  display_name: string | null;
  avatar_url: string | null;
  isAdmin: boolean;
}

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
};

const Comunidade = () => {
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Carrega papel do user atual
  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  // Carrega perfis necessários
  const loadProfiles = async (userIds: string[]) => {
    const missing = userIds.filter((id) => !profiles[id]);
    if (missing.length === 0) return;
    const [{ data: profs }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("user_id,nickname,display_name,avatar_url").in("user_id", missing),
      supabase.from("user_roles").select("user_id").eq("role", "admin").in("user_id", missing),
    ]);
    const adminSet = new Set((roles ?? []).map((r: any) => r.user_id));
    setProfiles((prev) => {
      const next = { ...prev };
      (profs ?? []).forEach((p: any) => {
        next[p.user_id] = { ...p, isAdmin: adminSet.has(p.user_id) };
      });
      // Garante registro mínimo mesmo sem profile
      missing.forEach((id) => {
        if (!next[id]) next[id] = { user_id: id, nickname: null, display_name: null, avatar_url: null, isAdmin: adminSet.has(id) };
      });
      return next;
    });
  };

  // Carrega mensagens iniciais + realtime
  useEffect(() => {
    if (!user) return;
    let active = true;

    (async () => {
      const { data, error } = await supabase
        .from("community_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(200);
      if (!active) return;
      if (error) {
        toast({ title: "Erro ao carregar chat", description: error.message, variant: "destructive" });
        return;
      }
      setMessages(data as Msg[]);
      await loadProfiles(Array.from(new Set((data ?? []).map((m: any) => m.user_id))));
    })();

    const channel = supabase
      .channel("community_messages_rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_messages" }, async (payload) => {
        const msg = payload.new as Msg;
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
        await loadProfiles([msg.user_id]);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "community_messages" }, (payload) => {
        const old = payload.old as { id: string };
        setMessages((prev) => prev.filter((m) => m.id !== old.id));
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !user || sending) return;
    setSending(true);
    const { error } = await supabase.from("community_messages").insert({ user_id: user.id, content: text });
    setSending(false);
    if (error) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
      return;
    }
    setInput("");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("community_messages").delete().eq("id", id);
    if (error) toast({ title: "Não foi possível apagar", description: error.message, variant: "destructive" });
  };

  const grouped = useMemo(() => {
    // agrupa mensagens consecutivas do mesmo autor (estilo Discord)
    const out: { author: string; items: Msg[] }[] = [];
    for (const m of messages) {
      const last = out[out.length - 1];
      if (last && last.author === m.user_id && new Date(m.created_at).getTime() - new Date(last.items[last.items.length - 1].created_at).getTime() < 5 * 60 * 1000) {
        last.items.push(m);
      } else {
        out.push({ author: m.user_id, items: [m] });
      }
    }
    return out;
  }, [messages]);

  if (loading) {
    return <Layout><div className="container py-20 text-center text-muted-foreground mono">// carregando sessão...</div></Layout>;
  }

  if (!user) {
    return (
      <Layout>
        <section className="container py-16 md:py-24">
          <div className="panel-base max-w-xl mx-auto p-8 text-center animate-fade-up">
            <Users className="h-12 w-12 mx-auto text-primary mb-4" />
            <h1 className="font-display text-2xl md:text-3xl text-silver mb-2">Lounge CASI</h1>
            <p className="text-foreground/80 mb-6">
              O chat da comunidade é exclusivo para alunos com login ativo. Entre para participar.
            </p>
            <Button asChild className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-display uppercase tracking-widest">
              <Link to="/auth"><LogIn className="h-4 w-4 mr-2" /> Entrar / Cadastrar</Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container py-6 md:py-10">
        <div className="panel-base flex flex-col h-[calc(100vh-180px)] min-h-[500px] overflow-hidden animate-boot-sweep">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-primary/20 bg-background/40">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-[var(--glow-primary)]">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-base md:text-lg text-silver leading-tight">LOUNGE CASI</h1>
                <p className="mono text-[10px] text-muted-foreground">// chat global • Sistemas de Informação</p>
              </div>
            </div>
            <span className="hidden sm:inline mono text-[10px] text-primary tracking-widest">REALTIME ● ON</span>
          </div>

          {/* Mensagens */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-4">
            {messages.length === 0 && (
              <p className="text-center mono text-xs text-muted-foreground mt-10">// nenhuma mensagem ainda — seja o primeiro a quebrar o silêncio.</p>
            )}
            {grouped.map((group) => {
              const p = profiles[group.author];
              const name = p?.nickname || p?.display_name || "aluno";
              const adminAuthor = p?.isAdmin;
              return (
                <div key={group.items[0].id} className="flex gap-3 animate-fade-up">
                  <div className="shrink-0 relative">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary-glow p-0.5">
                      <div className="h-full w-full rounded-full bg-background overflow-hidden flex items-center justify-center">
                        {p?.avatar_url ? (
                          <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="font-display text-xs text-primary">{name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                    {adminAuthor && (
                      <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-gold to-yellow-500 p-0.5 border border-background">
                        <Crown className="h-2.5 w-2.5 text-background" fill="currentColor" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className={`font-display text-sm tracking-wide ${adminAuthor ? "text-[hsl(var(--gold))] text-glow" : "text-primary"}`}>
                        {name}
                      </span>
                      {adminAuthor && (
                        <span className="inline-flex items-center gap-1 rounded px-1.5 py-px bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold))] mono text-[9px] uppercase tracking-widest border border-[hsl(var(--gold)/0.4)]">
                          <Shield className="h-2.5 w-2.5" /> Admin
                        </span>
                      )}
                      <span className="mono text-[10px] text-muted-foreground">{formatTime(group.items[0].created_at)}</span>
                    </div>
                    <div className="mt-0.5 space-y-1">
                      {group.items.map((m) => {
                        const canDelete = m.user_id === user.id || isAdmin;
                        return (
                          <div key={m.id} className="group flex items-start gap-2">
                            <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words flex-1">{m.content}</p>
                            {canDelete && (
                              <button
                                onClick={() => remove(m.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1 rounded"
                                title="Apagar mensagem"
                                aria-label="Apagar mensagem"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <form onSubmit={send} className="border-t border-primary/20 bg-background/60 p-3 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Mensagem para o Lounge CASI..."
              maxLength={2000}
              className="bg-background/60 border-primary/30 focus-visible:ring-primary"
            />
            <Button type="submit" disabled={!input.trim() || sending} className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-display uppercase tracking-wider">
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Enviar</span>
            </Button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Comunidade;
