import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { BackButton } from "@/components/BackButton";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Loader2, FileWarning } from "lucide-react";

type Calendario = {
  id: string;
  ano: number;
  titulo: string;
  pdf_url: string;
};

const CalendarioAcademico = () => {
  const [cal, setCal] = useState<Calendario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("calendario_academico" as any)
        .select("id,ano,titulo,pdf_url")
        .eq("ativo", true)
        .order("ano", { ascending: false })
        .limit(1)
        .maybeSingle();
      setCal((data as any) ?? null);
      setLoading(false);
    })();
  }, []);

  return (
    <Layout>
      <div className="container py-6 md:py-10">
        <BackButton to="/academico" label="Acadêmico" />
        <header className="mb-5 md:mb-7">
          <p className="mono text-[10px] sm:text-xs text-primary mb-2">// /academico/calendario</p>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-silver text-glow tracking-widest">
            CALENDÁRIO ACADÊMICO
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Datas oficiais do semestre vigente da UFAC.
          </p>
        </header>

        {loading ? (
          <div className="panel-glow p-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !cal ? (
          <div className="panel-glow p-10 text-center">
            <FileWarning className="h-10 w-10 text-amber-400 mx-auto mb-3" />
            <p className="text-foreground/80">Nenhum calendário publicado no momento.</p>
            <p className="mono text-xs text-muted-foreground mt-2">// aguarde a próxima publicação da diretoria</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 panel-base p-4">
              <div>
                <h2 className="font-display text-lg text-silver">{cal.titulo}</h2>
                <p className="mono text-xs text-primary">// ano {cal.ano}</p>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                  <a href={cal.pdf_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1.5" /> Abrir em nova aba
                  </a>
                </Button>
                <Button asChild size="sm" className="bg-primary text-primary-foreground">
                  <a href={cal.pdf_url} download>
                    <Download className="h-4 w-4 mr-1.5" /> Baixar PDF
                  </a>
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-primary/30 overflow-hidden bg-card/40">
              <object
                data={`${cal.pdf_url}#toolbar=1&navpanes=0`}
                type="application/pdf"
                className="w-full h-[75vh] min-h-[500px]"
              >
                <iframe
                  src={`${cal.pdf_url}#toolbar=1`}
                  className="w-full h-[75vh] min-h-[500px]"
                  title={cal.titulo}
                />
              </object>
            </div>
            <p className="mono text-[10px] text-primary/50 text-center">
              // o visualizador pode não funcionar em alguns navegadores móveis — use "Abrir em nova aba"
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CalendarioAcademico;
