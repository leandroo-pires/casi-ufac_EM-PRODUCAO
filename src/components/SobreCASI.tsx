import { useEffect, useState } from "react";
import { Code2, Users, Zap, Instagram, Github, Linkedin, Mail, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Membro = {
  id: string;
  nome: string;
  cargo: string;
  bio: string | null;
  foto_url: string | null;
  email: string | null;
  instagram: string | null;
  github: string | null;
  linkedin: string | null;
  whatsapp: string | null;
};

export const SobreCASI = () => {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [sobre, setSobre] = useState<{ titulo: string | null; conteudo: string | null }>({
    titulo: "Sobre o CASI",
    conteudo: null,
  });

  useEffect(() => {
    (async () => {
      const [{ data: dir }, { data: sc }] = await Promise.all([
        supabase.from("diretoria" as any).select("*").eq("ativo", true).order("ordem", { ascending: true }),
        supabase.from("site_content" as any).select("titulo,conteudo").eq("chave", "sobre_casi").maybeSingle(),
      ]);
      setMembros((dir as any) ?? []);
      if (sc) setSobre(sc as any);
    })();
  }, []);

  return (
    <section className="panel-glow p-4 sm:p-6 animate-fade-up">
      <header className="flex items-center gap-3 mb-4 sm:mb-5">
        <div className="rounded-lg bg-primary/15 p-2 border border-primary/30 shrink-0">
          <Code2 className="h-5 w-5 text-primary" />
        </div>
        <h2 className="font-display text-sm sm:text-lg text-silver tracking-widest uppercase">
          {sobre.titulo || "SOBRE O CASI"}
        </h2>
      </header>

      <div className="space-y-4 text-sm leading-relaxed border-l-2 border-primary/40 pl-4">
        {(sobre.conteudo ?? "").split("\n").filter(Boolean).map((p, i) => (
          <p key={i} className={i === 0 ? "text-foreground/90" : "text-foreground/80"}>{p}</p>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-5 sm:mt-6">
        {[
          { icon: Users, label: "ALUNOS", value: "+200" },
          { icon: Zap, label: "EVENTOS/ANO", value: "12" },
          { icon: Code2, label: "PROJETOS DEV", value: "8" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-lg border border-primary/30 bg-background/40 p-3 text-center">
            <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
            <div className="font-display text-xl text-silver">{value}</div>
            <div className="mono text-[10px] text-muted-foreground tracking-widest">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="font-display text-xs uppercase tracking-widest text-muted-foreground mb-3">Diretoria Atual</h3>
        {membros.length === 0 ? (
          <p className="mono text-xs text-muted-foreground">// diretoria em atualização</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {membros.map(m => (
              <article key={m.id} className="esports-card rounded-lg border border-primary/20 bg-background/40 p-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary-glow p-0.5 shrink-0">
                    <div className="h-full w-full rounded-full bg-background overflow-hidden flex items-center justify-center">
                      {m.foto_url ? (
                        <img src={m.foto_url} alt={m.nome} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <span className="text-base">👤</span>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-foreground truncate">{m.nome}</div>
                    <div className="text-[10px] mono text-primary truncate uppercase tracking-wider">{m.cargo}</div>
                  </div>
                </div>
                {m.bio && <p className="text-xs text-foreground/70 mt-2 line-clamp-2">{m.bio}</p>}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {m.instagram && <a href={`https://instagram.com/${m.instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="rounded border border-primary/30 p-1 text-primary hover:bg-primary/10"><Instagram className="h-3 w-3" /></a>}
                  {m.github && <a href={`https://github.com/${m.github.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="rounded border border-primary/30 p-1 text-primary hover:bg-primary/10"><Github className="h-3 w-3" /></a>}
                  {m.linkedin && <a href={m.linkedin.startsWith("http") ? m.linkedin : `https://linkedin.com/in/${m.linkedin}`} target="_blank" rel="noopener noreferrer" className="rounded border border-primary/30 p-1 text-primary hover:bg-primary/10"><Linkedin className="h-3 w-3" /></a>}
                  {m.whatsapp && <a href={`https://wa.me/${m.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="rounded border border-primary/30 p-1 text-primary hover:bg-primary/10"><MessageCircle className="h-3 w-3" /></a>}
                  {m.email && <a href={`mailto:${m.email}`} className="rounded border border-primary/30 p-1 text-primary hover:bg-primary/10"><Mail className="h-3 w-3" /></a>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
