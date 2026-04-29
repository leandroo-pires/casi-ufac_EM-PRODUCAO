import { useEffect, useState } from "react";
import { Megaphone, Send, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const schema = z.object({
  nome: z.string().trim().max(100).optional(),
  matricula: z.string().trim().max(30).optional(),
  categoria: z.string().min(1, "Selecione uma categoria"),
  mensagem: z.string().trim().min(10, "Mensagem muito curta").max(2000),
});

const categorias = ["Infraestrutura", "Disciplina", "Coordenação", "Eventos", "Equipamentos", "Outros"];

export const OuvidoriaPanel = () => {
  const [form, setForm] = useState({ nome: "", matricula: "", categoria: "", mensagem: "" });
  const [anonimo, setAnonimo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("ouvidorias").select("id, categoria, resposta_publica, created_at, status")
      .eq("is_public", true).order("created_at", { ascending: false }).limit(4)
      .then(({ data }) => setRecent(data ?? []));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("ouvidorias").insert({
      nome: anonimo ? null : (parsed.data.nome || null),
      matricula: anonimo ? null : (parsed.data.matricula || null),
      categoria: parsed.data.categoria,
      mensagem: parsed.data.mensagem,
    });
    setLoading(false);
    if (error) { toast.error("Erro ao enviar. Tente novamente."); return; }
    toast.success(anonimo ? "Ouvidoria anônima enviada!" : "Ouvidoria enviada com sucesso!");
    setForm({ nome: "", matricula: "", categoria: "", mensagem: "" });
  };

  return (
    <section className="panel-glow p-4 sm:p-6 animate-fade-up">
      <header className="flex items-center gap-3 mb-4 sm:mb-5">
        <div className="rounded-lg bg-primary/15 p-2 border border-primary/30 shrink-0">
          <Megaphone className="h-5 w-5 text-primary" />
        </div>
        <h2 className="font-display text-sm sm:text-lg text-silver tracking-widest">CANAL DE OUVIDORIA</h2>
      </header>

      <form onSubmit={submit} className="space-y-3">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-background/40 px-3 py-2">
          <Label htmlFor="anonimo" className="text-xs sm:text-sm cursor-pointer flex flex-col">
            <span className="font-display tracking-widest uppercase text-primary">Enviar Anonimamente</span>
            <span className="text-[10px] mono text-muted-foreground">// nome e matrícula serão descartados</span>
          </Label>
          <Switch id="anonimo" checked={anonimo} onCheckedChange={setAnonimo} />
        </div>
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 transition-opacity ${anonimo ? "opacity-40 pointer-events-none" : ""}`}>
          <Input placeholder="Nome (opcional)" value={form.nome} disabled={anonimo} onChange={e => setForm({ ...form, nome: e.target.value })} className="bg-input/60 border-primary/30 focus-visible:ring-primary" />
          <Input placeholder="Matrícula (opcional)" value={form.matricula} disabled={anonimo} onChange={e => setForm({ ...form, matricula: e.target.value })} className="bg-input/60 border-primary/30 focus-visible:ring-primary" />
        </div>
        <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v })}>
          <SelectTrigger className="bg-input/60 border-primary/30"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            {categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Textarea placeholder="Sua mensagem..." rows={5} value={form.mensagem} onChange={e => setForm({ ...form, mensagem: e.target.value })} className="bg-input/60 border-primary/30 focus-visible:ring-primary resize-none" />
        <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-display uppercase tracking-widest hover:shadow-[var(--glow-strong)] transition-shadow">
          <Send className="h-4 w-4 mr-2" /> {loading ? "Enviando..." : "Enviar Ouvidoria"}
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-primary/15">
        <h3 className="text-xs font-display uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Resolvidas Recentes
        </h3>
        {recent.length === 0 ? (
          <p className="text-xs text-muted-foreground mono">// nenhuma ouvidoria pública por enquanto</p>
        ) : (
          <ul className="space-y-2">
            {recent.map(r => (
              <li key={r.id} className="text-xs p-2 rounded border border-border bg-background/40">
                <span className="text-primary font-semibold">[{r.categoria}]</span> {r.resposta_publica ?? "Resolvida"}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
