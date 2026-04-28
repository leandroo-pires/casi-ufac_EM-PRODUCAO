import { useEffect, useState } from "react";
import { Calendar, MapPin, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface Evento {
  id: string; titulo: string; descricao: string | null; data_evento: string;
  local: string | null; imagem_url: string | null; inscricao_url: string | null;
  resumo_url: string | null; is_novo: boolean;
}

export const EventosPanel = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);

  useEffect(() => {
    supabase.from("eventos").select("*").order("data_evento", { ascending: false }).limit(4)
      .then(({ data }) => setEventos((data as Evento[]) ?? []));
  }, []);

  return (
    <section className="panel-glow p-4 sm:p-6 animate-fade-up">
      <header className="flex items-center gap-3 mb-4 sm:mb-5">
        <div className="rounded-lg bg-primary/15 p-2 border border-primary/30 shrink-0">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <h2 className="font-display text-sm sm:text-lg text-silver tracking-widest">EVENTOS E NOVIDADES</h2>
      </header>

      {eventos.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p className="mono text-sm">// nenhum evento cadastrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {eventos.map(ev => {
            const future = new Date(ev.data_evento) > new Date();
            return (
              <article key={ev.id} className="group rounded-lg border border-border bg-background/40 p-3 flex gap-3 hover:border-primary/50 transition-colors">
                <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-md overflow-hidden bg-muted border border-primary/20">
                  {ev.imagem_url ? <img src={ev.imagem_url} alt={ev.titulo} className="h-full w-full object-cover group-hover:scale-110 transition-transform" /> : <div className="h-full w-full flex items-center justify-center"><ImageIcon className="h-6 w-6 text-primary/50" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <h3 className="font-display text-sm text-foreground truncate">{ev.titulo}</h3>
                    {ev.is_novo && <span className="tag-novo">NOVO</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mono mb-1">
                    {new Date(ev.data_evento).toLocaleDateString("pt-BR")} {ev.local && <>· <MapPin className="inline h-3 w-3" /> {ev.local}</>}
                  </p>
                  <p className="text-xs text-foreground/80 line-clamp-2">{ev.descricao}</p>
                  <div className="mt-2">
                    {future ? (
                      <Button asChild size="sm" className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary-glow font-display uppercase tracking-wider">
                        <a href={ev.inscricao_url ?? "#"}>Inscrição</a>
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="outline" className="h-7 text-xs border-primary/40 text-primary hover:bg-primary/10 font-display uppercase tracking-wider">
                        <a href={ev.resumo_url ?? "#"}>Fotos e Resumo</a>
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
