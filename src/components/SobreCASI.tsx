import { Code2, Users, Zap } from "lucide-react";

const diretoria = [
  { nome: "Em breve", cargo: "Presidência", emoji: "🐉" },
  { nome: "Em breve", cargo: "Vice-Presidência", emoji: "⚡" },
  { nome: "Em breve", cargo: "Coord. Eventos", emoji: "🎯" },
  { nome: "Em breve", cargo: "Coord. Tech", emoji: "💻" },
];

export const SobreCASI = () => (
  <section className="panel-glow p-6 animate-fade-up">
    <header className="flex items-center gap-3 mb-5">
      <div className="rounded-lg bg-primary/15 p-2 border border-primary/30">
        <Code2 className="h-5 w-5 text-primary" />
      </div>
      <h2 className="font-display text-lg text-silver tracking-widest">SOBRE O CASI</h2>
    </header>

    <div className="space-y-4 text-sm leading-relaxed border-l-2 border-primary/40 pl-4">
      <p className="text-foreground/90">
        O <span className="text-primary font-semibold">CASI</span> é o Centro Acadêmico do curso de Sistemas de Informação da UFAC, atuando como porta-voz dos discentes e instância colaborativa nos processos deliberativos do colegiado.
      </p>
      <p className="text-foreground/80">
        Promovemos integração entre alunos, professores e comunidade tech do Acre através de hackathons, workshops, mentorias e projetos open source desenvolvidos pela nossa Equipe Dev.
      </p>
    </div>

    <div className="grid grid-cols-3 gap-3 mt-6">
      {[
        { icon: Users, label: "ALUNOS", value: "+200" },
        { icon: Zap, label: "EVENTOS/ANO", value: "12" },
        { icon: Code2, label: "PROJETOS DEV", value: "8" },
      ].map(({ icon: Icon, label, value }) => (
        <div key={label} className="rounded-lg border border-primary/30 bg-background/40 p-3 text-center">
          <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
          <div className="font-display text-xl text-silver">{value}</div>
          <div className="mono text-[10px] text-muted-foreground tracking-widest">{label}</div>
        </div>
      ))}
    </div>

    <div className="mt-6">
      <h3 className="font-display text-xs uppercase tracking-widest text-muted-foreground mb-3">Diretoria Atual</h3>
      <div className="grid grid-cols-2 gap-2">
        {diretoria.map(d => (
          <div key={d.cargo} className="flex items-center gap-2 rounded border border-border bg-background/40 p-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-base">{d.emoji}</div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">{d.nome}</div>
              <div className="text-[10px] mono text-primary truncate">{d.cargo}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
