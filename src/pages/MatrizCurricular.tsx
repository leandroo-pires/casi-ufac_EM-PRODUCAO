import { Layout } from "@/components/Layout";
import { BackButton } from "@/components/BackButton";
import { MatrizCurricularFlow } from "@/components/MatrizCurricularFlow";

const MatrizCurricular = () => (
  <Layout>
    <div className="container py-6 md:py-10">
      <BackButton to="/academico" label="Acadêmico" />
      <header className="mb-5 md:mb-7">
        <p className="mono text-[10px] sm:text-xs text-primary mb-2">// /academico/matriz</p>
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-silver text-glow tracking-widest">
          MATRIZ CURRICULAR
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Fluxograma interativo do curso de Sistemas de Informação — UFAC. Passe o mouse sobre uma
          disciplina para destacar pré-requisitos e disciplinas liberadas.
        </p>
      </header>


      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2 w-4 rounded-sm bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
          Conexão ativa
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2 w-4 rounded-sm bg-secondary/40" />
          Pré-requisito
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm border border-gold/60 bg-gold/20" />
          Atividades Complementares
        </span>
      </div>

      <MatrizCurricularFlow />

      <p className="mono text-[10px] text-primary/50 mt-3 text-center">
        // arraste para navegar · scroll para zoom · pinch no mobile
      </p>
    </div>
  </Layout>
);

export default MatrizCurricular;
