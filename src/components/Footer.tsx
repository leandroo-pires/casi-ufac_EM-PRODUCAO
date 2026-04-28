import { Instagram, Github, Mail, MapPin, Twitch } from "lucide-react";
import logo from "@/assets/casi-logo.png";

export const Footer = () => (
  <footer className="mt-20 border-t border-primary/20 bg-card/40 backdrop-blur-sm">
    <div className="container py-12 grid gap-10 md:grid-cols-3">
      <div>
        <img src={logo} alt="CASI UFAC" className="h-20 w-auto mb-3" />
        <p className="text-sm text-muted-foreground max-w-xs">
          Centro Acadêmico de Sistemas de Informação — Universidade Federal do Acre.
        </p>
      </div>
      <div>
        <h4 className="font-display text-sm uppercase text-silver mb-4 tracking-widest">Contato</h4>
        <ul className="space-y-2 text-sm text-foreground/80">
          <li className="flex items-start gap-2"><MapPin className="h-4 w-4 text-primary mt-0.5" /> Centro de Ciências Exatas e Tecnológicas — UFAC, Rio Branco/AC</li>
          <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> casi@ufac.br</li>
        </ul>
      </div>
      <div>
        <h4 className="font-display text-sm uppercase text-silver mb-4 tracking-widest">Redes</h4>
        <div className="flex gap-3">
          {[Instagram, Github, Twitch, Mail].map((Icon, i) => (
            <a key={i} href="#" className="rounded-lg border border-primary/40 p-2.5 text-primary hover:bg-primary/10 hover:shadow-[var(--glow-primary)] transition-all">
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </div>
    <div className="border-t border-primary/10 py-5 text-center text-xs text-muted-foreground mono">
      &gt; Desenvolvido pela Equipe Dev do CASI UFAC, com carinho para todos os alunos de SI.
    </div>
  </footer>
);
