import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { BackButton } from "@/components/BackButton";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, GraduationCap, Camera, Download, ExternalLink, Loader2, Search, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type AnyRow = Record<string, any>;

const Acervo = () => {
  return (
    <Layout>
      <div className="container py-6 md:py-10">
        <BackButton to="/" label="Início" />
        <header className="mb-6 mt-2">
          <p className="mono text-[10px] sm:text-xs text-primary mb-1">// /acervo :: repositório do curso</p>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-silver text-glow tracking-widest">ACERVO</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Repositório de conhecimento e memórias do curso de Sistemas de Informação — literaturas recomendadas, TCCs aprovados e galeria de eventos.
          </p>
        </header>

        <Tabs defaultValue="literaturas" className="w-full">
          <TabsList className="bg-card/60 border border-primary/30 grid grid-cols-3 h-auto p-1 mb-6 max-w-2xl">
            <TabsTrigger value="literaturas" className="font-display text-[11px] sm:text-xs uppercase tracking-widest gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Literaturas</span><span className="sm:hidden">Livros</span>
            </TabsTrigger>
            <TabsTrigger value="tccs" className="font-display text-[11px] sm:text-xs uppercase tracking-widest gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" /> TCCs
            </TabsTrigger>
            <TabsTrigger value="memorias" className="font-display text-[11px] sm:text-xs uppercase tracking-widest gap-1.5">
              <Camera className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Memórias</span><span className="sm:hidden">Fotos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="literaturas"><LiteraturasGrid /></TabsContent>
          <TabsContent value="tccs"><TccsGrid /></TabsContent>
          <TabsContent value="memorias"><FotosGrid /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

const LiteraturasGrid = () => {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from("literaturas" as any).select("*") as any).eq("ativo", true).order("ordem");
      setRows((data as any) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = rows.filter(r => {
    if (!q) return true;
    const s = q.toLowerCase();
    return [r.titulo, r.autores, r.area, r.disciplina, r.professor].some(v => (v ?? "").toLowerCase().includes(s));
  });

  return (
    <section>
      <div className="flex items-center gap-2 mb-4 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar título, autor, disciplina..." className="pl-9 bg-card/60 border-primary/30" />
        </div>
      </div>
      {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto my-12" /> : filtered.length === 0 ? (
        <p className="text-center mono text-sm text-muted-foreground py-12">// nenhuma literatura cadastrada ainda.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(b => (
            <li key={b.id} className="panel-base p-4 flex gap-3 hover:border-primary/60 hover:shadow-[var(--glow-primary)] transition-all">
              <div className="h-24 w-16 shrink-0 rounded bg-gradient-to-br from-primary/20 to-background border border-primary/30 overflow-hidden flex items-center justify-center">
                {b.capa_url ? <img src={b.capa_url} alt="" className="h-full w-full object-cover" /> : <BookOpen className="h-6 w-6 text-primary/60" />}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-sm text-silver leading-tight line-clamp-2">{b.titulo}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{b.autores}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {b.area && <span className="mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">{b.area}</span>}
                  {b.disciplina && <span className="mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-card text-foreground/70 border border-border">{b.disciplina}</span>}
                </div>
                {b.professor && <p className="text-[10px] mono text-muted-foreground mt-2">// rec. por {b.professor}</p>}
                {b.descricao && <p className="text-xs text-foreground/80 mt-2 line-clamp-2">{b.descricao}</p>}
                {b.link_url && (
                  <a href={b.link_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2">
                    <ExternalLink className="h-3 w-3" /> Acessar
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const TccsGrid = () => {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from("acervo_tccs" as any).select("*") as any).eq("ativo", true).order("ano", { ascending: false });
      setRows((data as any) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = rows.filter(r => {
    if (!q) return true;
    const s = q.toLowerCase();
    return [r.titulo, r.autor, String(r.ano)].some(v => (v ?? "").toLowerCase().includes(s));
  });

  return (
    <section>
      <div className="flex items-center gap-2 mb-4 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar título, autor ou ano..." className="pl-9 bg-card/60 border-primary/30" />
        </div>
      </div>
      {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto my-12" /> : filtered.length === 0 ? (
        <p className="text-center mono text-sm text-muted-foreground py-12">// nenhum TCC cadastrado ainda.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => (
            <li key={t.id} className="panel-base p-4 flex flex-col hover:border-primary/60 hover:shadow-[var(--glow-primary)] transition-all">
              <div className="h-32 w-full rounded bg-gradient-to-br from-primary/20 to-background border border-primary/30 mb-3 overflow-hidden flex items-center justify-center">
                {t.capa_url ? <img src={t.capa_url} alt="" className="h-full w-full object-cover" /> : <GraduationCap className="h-10 w-10 text-primary/50" />}
              </div>
              <span className="mono text-[10px] text-primary uppercase tracking-widest">// {t.ano}</span>
              <h3 className="font-display text-base text-silver leading-tight mt-1 line-clamp-2">{t.titulo}</h3>
              <p className="text-xs text-muted-foreground mt-1">por {t.autor}</p>
              {t.descricao && <p className="text-xs text-foreground/80 mt-2 line-clamp-3 flex-1">{t.descricao}</p>}
              <Button asChild size="sm" className="mt-3 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-display uppercase text-[11px] tracking-widest">
                <a href={t.pdf_url} target="_blank" rel="noopener noreferrer"><Download className="h-3.5 w-3.5 mr-1" /> Baixar PDF</a>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const FotosGrid = () => {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState<AnyRow | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from("acervo_fotos" as any).select("*") as any).eq("ativo", true).order("ano", { ascending: false }).order("ordem");
      setRows((data as any) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <section>
      {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto my-12" /> : rows.length === 0 ? (
        <p className="text-center mono text-sm text-muted-foreground py-12">// nenhuma foto cadastrada ainda.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {rows.map(f => (
            <button
              key={f.id}
              onClick={() => setZoom(f)}
              className="group relative aspect-square overflow-hidden rounded-lg border border-primary/20 hover:border-primary hover:shadow-[var(--glow-primary)] transition-all"
            >
              <img src={f.imagem_url} alt={f.titulo} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-left">
                <p className="font-display text-xs text-silver line-clamp-1">{f.titulo}</p>
                {f.evento && <p className="mono text-[9px] text-primary uppercase tracking-widest">{f.evento}{f.ano ? ` · ${f.ano}` : ""}</p>}
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!zoom} onOpenChange={(o) => !o && setZoom(null)}>
        <DialogContent className="max-w-4xl bg-background/95 border-primary/40 p-0 overflow-hidden">
          {zoom && (
            <div>
              <button onClick={() => setZoom(null)} className="absolute top-3 right-3 z-10 rounded-full bg-background/80 p-2 text-foreground hover:bg-primary/20" aria-label="Fechar">
                <X className="h-4 w-4" />
              </button>
              <img src={zoom.imagem_url} alt={zoom.titulo} className="w-full max-h-[75vh] object-contain bg-black" />
              <div className="p-4">
                <h3 className="font-display text-lg text-silver">{zoom.titulo}</h3>
                {zoom.evento && <p className="mono text-xs text-primary uppercase tracking-widest mt-1">{zoom.evento}{zoom.ano ? ` · ${zoom.ano}` : ""}</p>}
                {zoom.descricao && <p className="text-sm text-foreground/80 mt-2">{zoom.descricao}</p>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Acervo;
