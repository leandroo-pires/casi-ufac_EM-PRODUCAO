import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { BackButton } from "@/components/BackButton";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2, ExternalLink } from "lucide-react";

type Doc = {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: string;
  pdf_url: string;
  ordem: number;
};

const CATEGORIAS: { key: string; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "requerimentos", label: "Requerimentos" },
  { key: "modelos_tcc", label: "Modelos de TCC" },
  { key: "horas_complementares", label: "Horas Complementares" },
  { key: "estagio", label: "Estágio" },
];

const labelOf = (k: string) =>
  CATEGORIAS.find((c) => c.key === k)?.label ?? k;

const Documentos = () => {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todos");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("documentos_academicos" as any)
        .select("id,titulo,descricao,categoria,pdf_url,ordem")
        .eq("ativo", true)
        .order("ordem", { ascending: true })
        .order("titulo", { ascending: true });
      setDocs((data as any) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(
    () => (filter === "todos" ? docs : docs.filter((d) => d.categoria === filter)),
    [docs, filter],
  );

  return (
    <Layout>
      <div className="container py-6 md:py-10">
        <BackButton to="/academico" label="Acadêmico" />
        <header className="mb-5 md:mb-7">
          <p className="mono text-[10px] sm:text-xs text-primary mb-2">// /academico/documentos</p>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-silver text-glow tracking-widest">
            DOCUMENTOS &amp; MODELOS
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Templates, formulários e materiais de apoio para o curso de Sistemas de Informação.
          </p>
        </header>

        <div className="flex flex-wrap gap-2 mb-5">
          {CATEGORIAS.map((c) => (
            <Button
              key={c.key}
              size="sm"
              variant={filter === c.key ? "default" : "outline"}
              onClick={() => setFilter(c.key)}
              className={
                filter === c.key
                  ? "bg-primary text-primary-foreground"
                  : "border-primary/40 text-primary hover:bg-primary/10"
              }
            >
              {c.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="panel-glow p-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="panel-glow p-10 text-center">
            <FileText className="h-10 w-10 text-primary/60 mx-auto mb-3" />
            <p className="text-foreground/80">Nenhum documento disponível nesta categoria.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((d) => (
              <article
                key={d.id}
                className="panel-glow p-5 flex flex-col gap-3 hover:scale-[1.01] transition-transform"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-lg bg-primary/15 border border-primary/30 p-2.5">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <span className="mono text-[10px] uppercase tracking-widest text-primary/80 px-2 py-0.5 rounded border border-primary/30">
                    {labelOf(d.categoria)}
                  </span>
                </div>
                <h2 className="font-display text-lg text-silver leading-snug">{d.titulo}</h2>
                {d.descricao && (
                  <p className="text-sm text-foreground/70 line-clamp-3 flex-1">{d.descricao}</p>
                )}
                <div className="flex gap-2 mt-2">
                  <Button asChild size="sm" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 flex-1">
                    <a href={d.pdf_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1.5" /> Abrir
                    </a>
                  </Button>
                  <Button asChild size="sm" className="bg-primary text-primary-foreground flex-1">
                    <a href={d.pdf_url} download>
                      <Download className="h-4 w-4 mr-1.5" /> Baixar
                    </a>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Documentos;
