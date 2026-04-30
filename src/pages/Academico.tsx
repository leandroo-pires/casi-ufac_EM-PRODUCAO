import { Layout } from "@/components/Layout";
import { BackButton } from "@/components/BackButton";
import { BookOpen, GraduationCap, Calendar, FileText, ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

type CardItem = {
  icon: typeof BookOpen;
  title: string;
  desc: string;
  to?: string;
  href?: string;
};

const COORDENACAO_URL =
  "https://www.ufac.br/site/ufac/prograd/cursos/rio-branco/bacharelado/sistemas-de-informacao";

const cards: CardItem[] = [
  {
    icon: BookOpen,
    title: "Matriz Curricular",
    desc: "Fluxograma interativo das disciplinas e pré-requisitos do curso de SI.",
    to: "/academico/matriz",
  },
  {
    icon: GraduationCap,
    title: "Coordenação",
    desc: "Acesse o site oficial da Coordenação de Sistemas de Informação da UFAC.",
    href: COORDENACAO_URL,
  },
  {
    icon: Calendar,
    title: "Calendário Acadêmico",
    desc: "Visualize o PDF oficial do calendário vigente diretamente no portal.",
    to: "/academico/calendario",
  },
  {
    icon: FileText,
    title: "Documentos & Modelos",
    desc: "Templates de TCC, requerimentos, horas complementares e estágio.",
    to: "/academico/documentos",
  },
];

const Academico = () => (
  <Layout>
    <div className="container py-6 md:py-10">
      <BackButton to="/" label="Início" />
      <header className="mb-6 md:mb-8">
        <p className="mono text-[10px] sm:text-xs text-primary mb-2">// /academico</p>
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-silver text-glow tracking-widest">ACADÊMICO</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Recursos e informações para a vida acadêmica em Sistemas de Informação.
        </p>
      </header>

      <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
        {cards.map(({ icon: Icon, title, desc, to, href }) => {
          const inner = (
            <article className="panel-glow p-5 sm:p-6 hover:scale-[1.01] transition-transform h-full">
              <div className="rounded-lg bg-primary/15 border border-primary/30 p-3 w-fit mb-3">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-display text-xl text-silver mb-2">{title}</h2>
              <p className="text-sm text-foreground/80">{desc}</p>
              <p className="mono text-xs text-primary mt-3 inline-flex items-center gap-1.5">
                {href ? (
                  <>// site oficial <ExternalLink className="h-3 w-3" /></>
                ) : (
                  <>// acessar <ArrowRight className="h-3 w-3" /></>
                )}
              </p>
            </article>
          );
          if (href) {
            return (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {inner}
              </a>
            );
          }
          return (
            <Link key={title} to={to!} className="block">
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  </Layout>
);

export default Academico;
