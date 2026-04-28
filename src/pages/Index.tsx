import { Layout } from "@/components/Layout";
import { OuvidoriaPanel } from "@/components/OuvidoriaPanel";
import { EventosPanel } from "@/components/EventosPanel";
import { MediaShowcase } from "@/components/MediaShowcase";
import { SobreCASI } from "@/components/SobreCASI";
import logo from "@/assets/casi-logo.png";

const Index = () => (
  <Layout>
    {/* Hero */}
    <section className="container pt-10 pb-8">
      <div className="relative panel-base p-8 md:p-12 overflow-hidden">
        <div className="absolute -right-20 -top-10 opacity-10 pointer-events-none">
          <img src={logo} alt="" className="h-96 w-auto" />
        </div>
        <div className="relative max-w-2xl">
          <p className="mono text-xs text-primary mb-3 tracking-widest">// SYS_INFO :: CASI.UFAC.BR</p>
          <h1 className="font-display text-4xl md:text-6xl font-black text-silver text-glow mb-4 leading-tight">
            CENTRO ACADÊMICO<br /><span className="text-primary">SISTEMAS DE INFORMAÇÃO</span>
          </h1>
          <p className="text-lg text-foreground/80 max-w-xl">
            Portal oficial do CASI — voz dos alunos, hub de eventos, ouvidoria e mídia da comunidade tech UFAC.
          </p>
        </div>
      </div>
    </section>

    {/* Two-column main */}
    <section className="container grid gap-6 lg:grid-cols-2 pb-16">
      <div className="space-y-6">
        <OuvidoriaPanel />
        <EventosPanel />
      </div>
      <div className="space-y-6">
        <MediaShowcase />
        <SobreCASI />
      </div>
    </section>
  </Layout>
);

export default Index;
