import { Layout } from "@/components/Layout";
import { OuvidoriaPanel } from "@/components/OuvidoriaPanel";
import { EventosPanel } from "@/components/EventosPanel";
import { MediaShowcase } from "@/components/MediaShowcase";
import { SobreCASI } from "@/components/SobreCASI";
import { HomeCardsGrid } from "@/components/HomeCardsGrid";
import logo from "@/assets/casi-logo.png";

const Index = () => (
  <Layout>
    {/* Hero */}
    <section className="container pt-6 md:pt-10 pb-6 md:pb-8">
      <div className="relative panel-base p-5 sm:p-8 md:p-12 overflow-hidden animate-boot-sweep">
        <div className="absolute -right-16 -top-8 opacity-10 pointer-events-none">
          <img src={logo} alt="" className="h-56 sm:h-72 md:h-96 w-auto animate-logo-boot" />
        </div>
        <div className="relative max-w-2xl">
          <p className="reveal mono text-[10px] sm:text-xs text-primary mb-2 sm:mb-3 tracking-widest" style={{ animationDelay: "120ms" }}>
            // SYS_INFO :: CASI.UFAC.BR
          </p>
          <h1 className="reveal font-display text-2xl sm:text-4xl md:text-6xl font-black text-silver text-glow mb-3 sm:mb-4 leading-tight" style={{ animationDelay: "260ms" }}>
            CENTRO ACADÊMICO
            <br />
            <span className="text-primary">SISTEMAS DE INFORMAÇÃO</span>
          </h1>
          <p className="reveal text-sm sm:text-base md:text-lg text-foreground/80 max-w-xl" style={{ animationDelay: "420ms" }}>
            Portal oficial do CASI — voz dos alunos, hub de eventos, ouvidoria e mídia da comunidade de S.I da
            Universidade Federal do Acre.
          </p>
        </div>
      </div>
    </section>

    {/* Two-column main */}
    <section className="container grid gap-5 md:gap-6 lg:grid-cols-2 pb-12 md:pb-16">
      <div className="space-y-6">
        <div className="reveal" style={{ animationDelay: "560ms" }}><OuvidoriaPanel /></div>
        <div className="reveal" style={{ animationDelay: "680ms" }}><EventosPanel /></div>
      </div>
      <div className="space-y-6">
        <div className="reveal" style={{ animationDelay: "620ms" }}><MediaShowcase /></div>
        <div className="reveal" style={{ animationDelay: "740ms" }}><SobreCASI /></div>
      </div>
    </section>
  </Layout>
);

export default Index;
