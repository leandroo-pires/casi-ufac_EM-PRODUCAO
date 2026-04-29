import { Instagram, Mail, MapPin, ExternalLink } from "lucide-react";
import logo from "@/assets/casi-logo.png";
import ufacLogo from "@/assets/ufac-logo.png";

export const Footer = () => (
  <footer className="mt-12 md:mt-20 border-t border-primary/20 bg-card/40 backdrop-blur-sm">
    <div className="container py-8 md:py-12 grid gap-8 md:gap-10 sm:grid-cols-2 md:grid-cols-3">
      <div className="sm:col-span-2 md:col-span-1 flex flex-col items-center sm:items-start text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 mb-4">
          <img src={logo} alt="CASI UFAC" className="h-16 sm:h-20 w-auto" />
          <span className="h-12 w-px bg-primary/30 self-center" aria-hidden />
          <img src={ufacLogo} alt="Universidade Federal do Acre" className="h-12 sm:h-14 w-auto opacity-90" />
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">
          Centro Acadêmico de Sistemas de Informação — Universidade Federal do Acre.
        </p>
      </div>
      <div>
        <h4 className="font-display text-sm uppercase text-silver mb-4 tracking-widest">Contato</h4>
        <ul className="space-y-2 text-sm text-foreground/80">
          <li className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-primary mt-0.5" /> Bloco K2 (Segundo andar) — UFAC, Campus Rio Branco/AC
          </li>
          <li className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" /> ufac.casi@gmail.com
          </li>
        </ul>
      </div>
      <div>
        <h4 className="font-display text-sm uppercase text-silver mb-4 tracking-widest">Redes</h4>
        <div className="flex gap-3 flex-wrap">
          <a
            href="https://www.instagram.com/casi.ufac/"
            aria-label="Instagram"
            className="rounded-lg border border-primary/40 p-2.5 text-primary hover:bg-primary/10 hover:shadow-[var(--glow-primary)] transition-all"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a
            href="ufac.casi@gmail.com"
            aria-label="Email CASI"
            className="rounded-lg border border-primary/40 p-2.5 text-primary hover:bg-primary/10 hover:shadow-[var(--glow-primary)] transition-all"
          >
            <Mail className="h-4 w-4" />
          </a>
          <a
            href="https://www.ufac.br"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Site oficial da UFAC"
            title="Site oficial da UFAC"
            className="rounded-lg border border-primary/40 px-3 py-2.5 text-primary hover:bg-primary/10 hover:shadow-[var(--glow-primary)] transition-all flex items-center gap-1.5 mono text-[11px] uppercase tracking-widest"
          >
            <ExternalLink className="h-4 w-4" /> UFAC
          </a>
        </div>
      </div>
    </div>
    <div className="border-t border-primary/10 py-5 text-center text-xs text-muted-foreground mono">
      &gt; Desenvolvido pela Equipe Dev do CASI UFAC, com carinho para todos os alunos de SI.
    </div>
  </footer>
);
