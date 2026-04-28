import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const Eventos = () => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("eventos").select("*").order("data_evento", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  }, []);

  return (
    <Layout>
      <div className="container py-6 md:py-10">
        <header className="mb-6 md:mb-8">
          <p className="mono text-[10px] sm:text-xs text-primary mb-2">// /eventos</p>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-silver text-glow tracking-widest">EVENTOS</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">Hackathons, workshops, palestras e encontros da comunidade.</p>
        </header>

        {items.length === 0 ? (
          <div className="panel-base p-16 text-center">
            <Calendar className="h-16 w-16 text-primary/40 mx-auto mb-4" />
            <p className="mono text-sm text-muted-foreground">// nenhum evento cadastrado</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(ev => {
              const future = new Date(ev.data_evento) > new Date();
              return (
                <article key={ev.id} className="panel-base overflow-hidden hover:border-primary/50 transition-all group">
                  <div className="aspect-video bg-muted overflow-hidden relative">
                    {ev.imagem_url ? <img src={ev.imagem_url} alt={ev.titulo} className="h-full w-full object-cover group-hover:scale-105 transition-transform" /> : <div className="h-full w-full flex items-center justify-center"><ImageIcon className="h-10 w-10 text-primary/40" /></div>}
                    {ev.is_novo && <span className="tag-novo absolute top-3 right-3">NOVO</span>}
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg text-silver mb-2">{ev.titulo}</h3>
                    <p className="mono text-xs text-primary mb-2">{new Date(ev.data_evento).toLocaleDateString("pt-BR")} {ev.local && <>· <MapPin className="inline h-3 w-3" /> {ev.local}</>}</p>
                    <p className="text-sm text-foreground/80 line-clamp-3 mb-3">{ev.descricao}</p>
                    <Button asChild size="sm" className={`w-full font-display uppercase tracking-widest text-xs ${future ? "bg-primary text-primary-foreground hover:bg-primary-glow" : "bg-transparent border border-primary/40 text-primary hover:bg-primary/10"}`}>
                      <a href={(future ? ev.inscricao_url : ev.resumo_url) ?? "#"}>{future ? "Inscrição" : "Fotos e Resumo"}</a>
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Eventos;
