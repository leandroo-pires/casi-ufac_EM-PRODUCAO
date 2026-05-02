import { Play, Pause, Volume2, Maximize2, ExternalLink } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

type Slide = {
  id: string;
  titulo: string;
  subtitulo: string | null;
  imagem_url: string;
  link_url: string | null;
};

const FALLBACK: Slide[] = [
  { id: "f1", titulo: "Vitrine em construção", subtitulo: "Em breve, novidades do CASI", imagem_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80", link_url: null },
];

export const MediaShowcase = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const intervalRef = useRef<number>();

  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from("midia_showcase" as any).select("id,titulo,subtitulo,imagem_url,link_url") as any)
        .eq("ativo", true)
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: false });
      const list = ((data as any[]) ?? []) as Slide[];
      setSlides(list.length ? list : FALLBACK);
    })();
  }, []);

  // Auto-advance quando playing
  useEffect(() => {
    if (!playing || slides.length <= 1) return;
    intervalRef.current = window.setInterval(() => {
      setIdx(i => (i + 1) % slides.length);
    }, 5000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [playing, slides.length]);

  if (slides.length === 0) {
    return (
      <section className="panel-glow p-6 animate-fade-up">
        <p className="mono text-xs text-muted-foreground text-center py-8">// carregando vitrine...</p>
      </section>
    );
  }

  const current = slides[idx];
  const Wrapper: any = current.link_url ? "a" : "div";
  const wrapperProps = current.link_url
    ? { href: current.link_url, target: "_blank", rel: "noopener noreferrer", className: "block group" }
    : { className: "block" };

  return (
    <section className="panel-glow overflow-hidden animate-fade-up">
      <Wrapper {...wrapperProps}>
        <div className="relative aspect-video bg-black">
          <img src={current.imagem_url} alt={current.titulo} className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent" />

          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <span className="mono text-xs bg-background/80 border border-primary/40 text-primary px-2 py-1 rounded">
              ▶ {String(idx + 1).padStart(2, "0")}/{String(slides.length).padStart(2, "0")}
            </span>
            <span className="font-display text-xs text-silver tracking-widest">VITRINE DE MÍDIA</span>
          </div>

          <div className="absolute bottom-14 sm:bottom-16 left-3 right-3 sm:left-4 sm:right-4">
            <h3 className="font-display text-base sm:text-xl text-silver text-glow inline-flex items-center gap-2">
              {current.titulo}
              {current.link_url && <ExternalLink className="h-4 w-4 text-primary opacity-80" />}
            </h3>
            {current.subtitulo && (
              <p className="text-xs sm:text-sm text-foreground/80 mt-1 line-clamp-2">{current.subtitulo}</p>
            )}
          </div>

          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
            <button
              onClick={(e) => { e.preventDefault(); setPlaying(p => !p); }}
              className="text-primary hover:scale-110 transition-transform shrink-0"
              aria-label={playing ? "Pausar" : "Reproduzir"}
            >
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden min-w-0">
              <div className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all" style={{ width: `${((idx + 1) / slides.length) * 100}%` }} />
            </div>
            <span className="mono text-[10px] sm:text-xs text-primary shrink-0">{String(idx + 1).padStart(2, "0")}/{String(slides.length).padStart(2, "0")}</span>
            <Volume2 className="hidden sm:block h-4 w-4 text-primary/80" />
            <Maximize2 className="hidden sm:block h-4 w-4 text-primary/80" />
          </div>
        </div>
      </Wrapper>

      {slides.length > 1 && (
        <div className="grid grid-cols-3 gap-2 p-3">
          {slides.slice(0, 6).map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIdx(i)}
              className={`aspect-video rounded overflow-hidden border-2 transition-all ${i === idx ? "border-primary shadow-[var(--glow-primary)]" : "border-transparent opacity-60 hover:opacity-100"}`}
            >
              <img src={s.imagem_url} alt={s.titulo} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
