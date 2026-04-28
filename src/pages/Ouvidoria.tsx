import { Layout } from "@/components/Layout";
import { OuvidoriaPanel } from "@/components/OuvidoriaPanel";

const Ouvidoria = () => (
  <Layout>
    <div className="container py-10 max-w-3xl">
      <header className="mb-8">
        <p className="mono text-xs text-primary mb-2">// /ouvidoria</p>
        <h1 className="font-display text-4xl text-silver text-glow tracking-widest">OUVIDORIA</h1>
        <p className="text-muted-foreground mt-2">Canal direto com o CASI. Sua voz é prioridade.</p>
      </header>
      <OuvidoriaPanel />
    </div>
  </Layout>
);

export default Ouvidoria;
