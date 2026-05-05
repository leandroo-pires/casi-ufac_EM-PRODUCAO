import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpRight } from "lucide-react";

type Card = {
  id: string;
  titulo: string;
  descricao: string | null;
  imagem_url: string;
  link_url: string | null;
};

export const HomeCardsGrid = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from("home_cards" as any).select("*") as any)
        .eq("ativo", true)
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: false });
      setCards((data as Card[]) ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading || cards.length === 0) return null;

  return (
    <section className="container pb-12 md:pb-16">
      <div className="mb-4">
        <p className="mono text-[10px] sm:text-xs text-primary tracking-widest">// /home :: destaques</p>
        <h2 className="font-display text-lg sm:text-2xl text-silver tracking-widest">DESTAQUES DO CASI</h2>
      </div>
      <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const inner = (
            <article className="group panel-base overflow-hidden h-full flex flex-col transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_24px_-6px_hsl(var(--primary)/0.45)]">
              <div className="relative aspect-video overflow-hidden bg-background/40">
                <img
                  src={c.imagem_url}
                  alt={c.titulo}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent pointer-events-none" />
                {c.link_url && (
                  <span className="absolute top-3 right-3 rounded-md bg-background/70 backdrop-blur p-1.5 border border-primary/40 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                )}
              </div>
              <div className="p-4 sm:p-5 flex-1 flex flex-col">
                <h3 className="font-display text-base sm:text-lg text-silver tracking-wide mb-2 group-hover:text-primary transition-colors">
                  {c.titulo}
                </h3>
                {c.descricao && (
                  <p className="text-sm text-foreground/75 leading-relaxed line-clamp-3">{c.descricao}</p>
                )}
              </div>
            </article>
          );

          return c.link_url ? (
            <a
              key={c.id}
              href={c.link_url}
              target={c.link_url.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="block focus:outline-none focus:ring-2 focus:ring-primary/60 rounded-lg"
            >
              {inner}
            </a>
          ) : (
            <div key={c.id}>{inner}</div>
          );
        })}
      </div>
    </section>
  );
};
