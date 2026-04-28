import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Download, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";

const Editais = () => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("editais").select("*").order("data_publicacao", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  }, []);

  return (
    <Layout>
      <div className="container py-10">
        <header className="mb-8">
          <p className="mono text-xs text-primary mb-2">// /editais_avisos</p>
          <h1 className="font-display text-4xl text-silver text-glow tracking-widest">EDITAIS & AVISOS</h1>
          <p className="text-muted-foreground mt-2">Documentos oficiais do CASI UFAC disponíveis para download.</p>
        </header>

        {items.length === 0 ? (
          <div className="panel-base p-16 text-center">
            <Folder className="h-16 w-16 text-primary/40 mx-auto mb-4" />
            <p className="mono text-sm text-muted-foreground">// nenhum edital publicado por enquanto</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {items.map(e => (
              <article key={e.id} className="panel-base p-5 flex items-center gap-4 hover:border-primary/50 transition-colors group">
                <div className="rounded-lg bg-primary/10 border border-primary/30 p-3 group-hover:shadow-[var(--glow-primary)] transition-shadow">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {e.categoria && <span className="mono text-[10px] uppercase text-primary border border-primary/30 px-1.5 rounded">{e.categoria}</span>}
                    <span className="mono text-xs text-muted-foreground">{new Date(e.data_publicacao).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <h3 className="font-display text-lg text-foreground">{e.titulo}</h3>
                  {e.descricao && <p className="text-sm text-muted-foreground line-clamp-1">{e.descricao}</p>}
                </div>
                <Button asChild className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-display uppercase text-xs tracking-widest hover:shadow-[var(--glow-strong)]">
                  <a href={e.pdf_url} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4 mr-2" /> Download PDF</a>
                </Button>
              </article>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Editais;
