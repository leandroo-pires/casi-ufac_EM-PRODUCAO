import { Play, Pause, Volume2, Maximize2 } from "lucide-react";
import { useState, useRef } from "react";

const slides = [
  { type: "image", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80", title: "Hackathon 2025" },
  { type: "image", url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&q=80", title: "Equipe Dev CASI" },
  { type: "image", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80", title: "Workshop de Sistemas" },
];

export const MediaShowcase = () => {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const intervalRef = useRef<number>();

  return (
    <section className="panel-glow overflow-hidden animate-fade-up">
      <div className="relative aspect-video bg-black">
        <img src={slides[idx].url} alt={slides[idx].title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent" />

        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <span className="mono text-xs bg-background/80 border border-primary/40 text-primary px-2 py-1 rounded">
            ▶ {String(idx + 1).padStart(2, "0")}/{String(slides.length).padStart(2, "0")}
          </span>
          <span className="font-display text-xs text-silver tracking-widest">VITRINE DE MÍDIA</span>
        </div>

        <h3 className="absolute bottom-14 sm:bottom-16 left-3 right-3 sm:left-4 sm:right-4 font-display text-base sm:text-xl text-silver text-glow">{slides[idx].title}</h3>

        {/* Controles */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
          <button onClick={() => setPlaying(p => !p)} className="text-primary hover:scale-110 transition-transform shrink-0" aria-label={playing ? "Pausar" : "Reproduzir"}>
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden min-w-0">
            <div className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all" style={{ width: `${((idx + 1) / slides.length) * 100}%` }} />
          </div>
          <span className="mono text-[10px] sm:text-xs text-primary shrink-0">00:{String(idx * 12).padStart(2, "0")}</span>
          <Volume2 className="hidden sm:block h-4 w-4 text-primary/80" />
          <Maximize2 className="hidden sm:block h-4 w-4 text-primary/80" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 p-3">
        {slides.map((s, i) => (
          <button key={i} onClick={() => setIdx(i)} className={`aspect-video rounded overflow-hidden border-2 transition-all ${i === idx ? "border-primary shadow-[var(--glow-primary)]" : "border-transparent opacity-60 hover:opacity-100"}`}>
            <img src={s.url} alt={s.title} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </section>
  );
};
