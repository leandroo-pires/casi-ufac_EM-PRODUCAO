import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Search, FileText, Calendar, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Hit = {
  id: string;
  type: "edital" | "evento" | "aviso";
  titulo: string;
  subtitulo?: string;
  url?: string;
  to: string;
};

export const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Debounced search across editais (incl. avisos) and eventos
  useEffect(() => {
    if (!open) return;
    const term = query.trim();
    if (term.length < 2) {
      setHits([]);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      const ilike = `%${term}%`;
      const [edRes, evRes] = await Promise.all([
        supabase
          .from("editais")
          .select("id,titulo,categoria,descricao,pdf_url,data_publicacao")
          .or(`titulo.ilike.${ilike},descricao.ilike.${ilike}`)
          .limit(15),
        supabase
          .from("eventos")
          .select("id,titulo,descricao,data_evento,local,inscricao_url")
          .or(`titulo.ilike.${ilike},descricao.ilike.${ilike}`)
          .limit(15),
      ]);

      const out: Hit[] = [];
      (edRes.data ?? []).forEach((r: any) => {
        const isAviso = (r.categoria || "").toLowerCase() === "aviso";
        out.push({
          id: r.id,
          type: isAviso ? "aviso" : "edital",
          titulo: r.titulo,
          subtitulo: r.descricao || (r.data_publicacao ? new Date(r.data_publicacao).toLocaleDateString("pt-BR") : undefined),
          url: r.pdf_url,
          to: "/editais",
        });
      });
      (evRes.data ?? []).forEach((r: any) => {
        out.push({
          id: r.id,
          type: "evento",
          titulo: r.titulo,
          subtitulo: r.local || (r.data_evento ? new Date(r.data_evento).toLocaleString("pt-BR") : undefined),
          url: r.inscricao_url,
          to: "/eventos",
        });
      });
      setHits(out);
      setLoading(false);
    }, 250);
    return () => clearTimeout(handle);
  }, [query, open]);

  const go = (h: Hit) => {
    setOpen(false);
    if (h.url) window.open(h.url, "_blank", "noopener");
    else navigate(h.to);
  };

  const grouped = {
    editais: hits.filter((h) => h.type === "edital"),
    avisos: hits.filter((h) => h.type === "aviso"),
    eventos: hits.filter((h) => h.type === "evento"),
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        title="Buscar (Ctrl+K)"
        aria-label="Buscar"
        className="rounded-full border border-primary/40 hover:bg-primary/10 h-9 w-9"
      >
        <Search className="h-4 w-4 text-primary" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="bg-background border border-primary/30 rounded-md overflow-hidden">
          <CommandInput
            placeholder="Buscar editais, avisos e eventos..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList className="max-h-[400px]">
            {!loading && hits.length === 0 && query.trim().length >= 2 && (
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            )}
            {query.trim().length < 2 && (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                <p className="mono text-xs">// digite ao menos 2 caracteres</p>
                <p className="mt-2 text-xs">
                  Pesquisa global em <span className="text-primary">editais</span>,{" "}
                  <span className="text-primary">avisos</span> e{" "}
                  <span className="text-primary">eventos</span>.
                </p>
              </div>
            )}

            {grouped.editais.length > 0 && (
              <CommandGroup heading="Editais">
                {grouped.editais.map((h) => (
                  <CommandItem key={h.id} onSelect={() => go(h)} className="gap-2">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm truncate">{h.titulo}</div>
                      {h.subtitulo && (
                        <div className="text-xs text-muted-foreground truncate">{h.subtitulo}</div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {grouped.avisos.length > 0 && (
              <CommandGroup heading="Avisos">
                {grouped.avisos.map((h) => (
                  <CommandItem key={h.id} onSelect={() => go(h)} className="gap-2">
                    <Megaphone className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm truncate">{h.titulo}</div>
                      {h.subtitulo && (
                        <div className="text-xs text-muted-foreground truncate">{h.subtitulo}</div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {grouped.eventos.length > 0 && (
              <CommandGroup heading="Eventos">
                {grouped.eventos.map((h) => (
                  <CommandItem key={h.id} onSelect={() => go(h)} className="gap-2">
                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm truncate">{h.titulo}</div>
                      {h.subtitulo && (
                        <div className="text-xs text-muted-foreground truncate">{h.subtitulo}</div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
          <div className="border-t border-primary/20 px-3 py-2 mono text-[10px] text-muted-foreground flex justify-between">
            <span>↵ abrir</span>
            <span>Esc fechar</span>
            <span>⌘/Ctrl K alternar</span>
          </div>
        </div>
      </CommandDialog>
    </>
  );
};
